import crypto from "crypto";
import { TRPCError } from "@trpc/server";
import * as OTPAuth from "otpauth";
import { z } from "zod";
import { getUserByOpenId } from "../db";
import {
  consumeRecoveryCode,
  deleteTwoFactorAuthenticator,
  enableTwoFactorAuthenticator,
  getTwoFactorAuthenticator,
  savePendingTwoFactorSecret,
} from "../db/twoFactor";
import { createHMAC, decrypt, encrypt } from "../_core/encryption";
import { sdk, TWO_FACTOR_CHALLENGE_COOKIE } from "../_core/sdk";
import { getSessionCookieOptions } from "../_core/cookies";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { COOKIE_NAME } from "../../shared/const";
import { parse as parseCookie } from "cookie";

const otpCode = z.string().trim().regex(/^\d{6}$/, "Enter the six-digit code from your authenticator app.");
const recoveryCode = z.string().trim().regex(/^[A-Fa-f0-9]{10}$/, "Enter a valid recovery code.");
const APP_NAME = "Lumae AI";

function getTotp(secret: string, label: string) {
  return new OTPAuth.TOTP({
    issuer: APP_NAME,
    label,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  });
}

function verifiesTotp(secret: string, label: string, token: string) {
  return getTotp(secret, label).validate({ token, window: 1 }) !== null;
}

function generateRecoveryCodes() {
  return Array.from({ length: 8 }, () => crypto.randomBytes(5).toString("hex").toUpperCase());
}

function recoveryHash(code: string) {
  return createHMAC(code.toUpperCase());
}

function verifyAuthenticatorCode(authenticator: NonNullable<Awaited<ReturnType<typeof getTwoFactorAuthenticator>>>, label: string, code: string) {
  const secret = decrypt(authenticator.encryptedSecret);
  if (verifiesTotp(secret, label, code)) return { accepted: true, remainingCodes: null as string[] | null };
  const hashes = Array.isArray(authenticator.recoveryCodeHashes) ? authenticator.recoveryCodeHashes.filter((hash): hash is string => typeof hash === "string") : [];
  const candidate = recoveryHash(code);
  const codeIndex = hashes.findIndex((hash) => crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(candidate, "hex")));
  if (codeIndex < 0) return { accepted: false, remainingCodes: null as string[] | null };
  return { accepted: true, remainingCodes: hashes.filter((_, index) => index !== codeIndex) };
}

export const twoFactorRouter = router({
  status: protectedProcedure.query(async ({ ctx }) => {
    const authenticator = await getTwoFactorAuthenticator(ctx.user.id);
    return {
      enabled: authenticator?.isEnabled === true,
      recoveryCodesRemaining: authenticator?.isEnabled && Array.isArray(authenticator.recoveryCodeHashes)
        ? authenticator.recoveryCodeHashes.length
        : 0,
    };
  }),

  beginSetup: protectedProcedure.mutation(async ({ ctx }) => {
    const existing = await getTwoFactorAuthenticator(ctx.user.id);
    if (existing?.isEnabled) {
      throw new TRPCError({ code: "CONFLICT", message: "Two-factor authentication is already enabled." });
    }
    const secret = new OTPAuth.Secret({ size: 20 }).base32;
    await savePendingTwoFactorSecret(ctx.user.id, encrypt(secret));
    const label = ctx.user.email || ctx.user.name || `user-${ctx.user.id}`;
    return { otpauthUri: getTotp(secret, label).toString(), manualKey: secret };
  }),

  confirmSetup: protectedProcedure.input(z.object({ code: otpCode })).mutation(async ({ ctx, input }) => {
    const authenticator = await getTwoFactorAuthenticator(ctx.user.id);
    if (!authenticator || authenticator.isEnabled) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Start a new two-factor setup before confirming it." });
    }
    const label = ctx.user.email || ctx.user.name || `user-${ctx.user.id}`;
    if (!verifiesTotp(decrypt(authenticator.encryptedSecret), label, input.code)) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "That code was not accepted. Check your authenticator and try again." });
    }
    const recoveryCodes = generateRecoveryCodes();
    await enableTwoFactorAuthenticator(ctx.user.id, recoveryCodes.map(recoveryHash));
    return { recoveryCodes };
  }),

  disable: protectedProcedure.input(z.object({ code: z.union([otpCode, recoveryCode]) })).mutation(async ({ ctx, input }) => {
    const authenticator = await getTwoFactorAuthenticator(ctx.user.id);
    if (!authenticator?.isEnabled) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Two-factor authentication is not enabled." });
    }
    const label = ctx.user.email || ctx.user.name || `user-${ctx.user.id}`;
    const result = verifyAuthenticatorCode(authenticator, label, input.code);
    if (!result.accepted) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Enter a current authenticator or recovery code to disable two-factor authentication." });
    }
    await deleteTwoFactorAuthenticator(ctx.user.id);
    return { success: true };
  }),

  verifyLogin: publicProcedure.input(z.object({ code: z.union([otpCode, recoveryCode]) })).mutation(async ({ ctx, input }) => {
    const challenge = await sdk.verifyTwoFactorChallenge(parseCookie(ctx.req.headers.cookie ?? "")[TWO_FACTOR_CHALLENGE_COOKIE]);
    if (!challenge) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Your security check expired. Please sign in again." });
    }
    const user = await getUserByOpenId(challenge.openId);
    if (!user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Your security check is no longer available." });
    const authenticator = await getTwoFactorAuthenticator(user.id);
    if (!authenticator?.isEnabled) throw new TRPCError({ code: "UNAUTHORIZED", message: "Your security check is no longer available." });
    const label = user.email || user.name || `user-${user.id}`;
    const result = verifyAuthenticatorCode(authenticator, label, input.code);
    if (!result.accepted) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "That code was not accepted. Try again or use a recovery code." });
    }
    if (result.remainingCodes) await consumeRecoveryCode(user.id, result.remainingCodes);
    const sessionToken = await sdk.createSessionToken(challenge.openId, { name: challenge.name, expiresInMs: 1000 * 60 * 60 * 24 * 30 });
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(TWO_FACTOR_CHALLENGE_COOKIE, { ...cookieOptions, maxAge: -1 });
    ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: 1000 * 60 * 60 * 24 * 30 });
    return { returnPath: challenge.returnPath };
  }),
});
