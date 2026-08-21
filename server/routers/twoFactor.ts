import crypto from "crypto";
import { TRPCError } from "@trpc/server";
import * as OTPAuth from "otpauth";
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type AuthenticationResponseJSON,
  type RegistrationResponseJSON,
} from "@simplewebauthn/server";
import { z } from "zod";
import { getUserByOpenId } from "../db";
import {
  consumeRecoveryCode,
  deleteTwoFactorAuthenticator,
  enableTwoFactorAuthenticator,
  getTwoFactorAuthenticator,
  replaceRecoveryCodeHashes,
  savePendingTwoFactorSecret,
} from "../db/twoFactor";
import {
  consumeWebAuthnCeremony,
  getUserPasskeyByCredentialId,
  getUserPasskeys,
  savePasskey,
  saveWebAuthnCeremony,
  updatePasskeyUsage,
} from "../db/passkeys";
import {
  createTrustedDevice,
  getTrustedDevices,
  revokeAllTrustedDevices,
  revokeTrustedDevice,
  TRUSTED_DEVICE_COOKIE,
  type TrustedDeviceDays,
} from "../db/trustedDevices";
import { createHMAC, decrypt, encrypt } from "../_core/encryption";
import { sdk, TWO_FACTOR_CHALLENGE_COOKIE } from "../_core/sdk";
import { getSessionCookieOptions } from "../_core/cookies";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { COOKIE_NAME } from "../../shared/const";
import { parse as parseCookie } from "cookie";

const otpCode = z.string().trim().regex(/^\d{6}$/, "Enter the six-digit code from your authenticator app.");
const recoveryCode = z.string().trim().regex(/^[A-Fa-f0-9]{10}$/, "Enter a valid recovery code.");
const APP_NAME = "Lumae AI";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const STANDARD_SESSION_TTL_MS = 1000 * 60 * 60 * 12;
const trustedDeviceDays = z.union([z.literal(1), z.literal(7), z.literal(30)]);

function getWebAuthnConfig(req: { protocol: string; get(name: string): string | undefined }) {
  const configuredOrigin = process.env.FRONTEND_URL;
  const requestOrigin = `${req.protocol}://${req.get("host")}`;
  const origin = process.env.NODE_ENV === "production" ? (configuredOrigin || "https://lumae.co.in") : requestOrigin;
  return { origin, rpID: new URL(origin).hostname };
}

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

function ensureEnabledAuthenticator(authenticator: Awaited<ReturnType<typeof getTwoFactorAuthenticator>>) {
  if (!authenticator?.isEnabled) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Enable authenticator-based two-factor authentication before adding a passkey." });
  }
  return authenticator;
}

async function issueTrustedDeviceIfRequested(
  ctx: { req: Parameters<typeof getSessionCookieOptions>[0]; res: { cookie: (name: string, value: string, options: Record<string, unknown>) => unknown } },
  userId: number,
  days: TrustedDeviceDays | undefined,
) {
  if (!days) return;
  const trustedDevice = await createTrustedDevice(userId, days);
  const cookieOptions = getSessionCookieOptions(ctx.req);
  ctx.res.cookie(TRUSTED_DEVICE_COOKIE, trustedDevice.token, {
    ...cookieOptions,
    maxAge: trustedDevice.expiresAt.getTime() - Date.now(),
  });
}

export const twoFactorRouter = router({
  status: protectedProcedure.query(async ({ ctx }) => {
    const authenticator = await getTwoFactorAuthenticator(ctx.user.id);
    const passkeys = await getUserPasskeys(ctx.user.id);
    const trustedDevices = await getTrustedDevices(ctx.user.id);
    return {
      enabled: authenticator?.isEnabled === true,
      recoveryCodesRemaining: authenticator?.isEnabled && Array.isArray(authenticator.recoveryCodeHashes)
        ? authenticator.recoveryCodeHashes.length
        : 0,
      passkeys: passkeys.map((passkey) => ({ id: passkey.id, name: passkey.name, createdAt: passkey.createdAt, lastUsedAt: passkey.lastUsedAt })),
      trustedDevices,
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

  regenerateRecoveryCodes: protectedProcedure.input(z.object({ code: otpCode })).mutation(async ({ ctx, input }) => {
    const authenticator = ensureEnabledAuthenticator(await getTwoFactorAuthenticator(ctx.user.id));
    const label = ctx.user.email || ctx.user.name || `user-${ctx.user.id}`;
    if (!verifiesTotp(decrypt(authenticator.encryptedSecret), label, input.code)) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Enter a current authenticator code to regenerate recovery codes." });
    }
    const recoveryCodes = generateRecoveryCodes();
    await replaceRecoveryCodeHashes(ctx.user.id, recoveryCodes.map(recoveryHash));
    return { recoveryCodes };
  }),

  beginPasskeyRegistration: protectedProcedure.mutation(async ({ ctx }) => {
    ensureEnabledAuthenticator(await getTwoFactorAuthenticator(ctx.user.id));
    const { rpID } = getWebAuthnConfig(ctx.req);
    const existingPasskeys = await getUserPasskeys(ctx.user.id);
    const options = await generateRegistrationOptions({
      rpName: APP_NAME,
      rpID,
      userID: new TextEncoder().encode(String(ctx.user.id)),
      userName: ctx.user.email || `lumae-user-${ctx.user.id}`,
      userDisplayName: ctx.user.name || ctx.user.email || "Lumae user",
      attestationType: "none",
      excludeCredentials: existingPasskeys.map((passkey) => ({ id: passkey.credentialId, transports: Array.isArray(passkey.transports) ? passkey.transports as never[] : [] })),
      authenticatorSelection: { residentKey: "required", userVerification: "required" },
    });
    await saveWebAuthnCeremony(ctx.user.id, "registration", options.challenge);
    return options;
  }),

  finishPasskeyRegistration: protectedProcedure.input(z.object({ response: z.custom<RegistrationResponseJSON>() })).mutation(async ({ ctx, input }) => {
    ensureEnabledAuthenticator(await getTwoFactorAuthenticator(ctx.user.id));
    const expectedChallenge = await consumeWebAuthnCeremony(ctx.user.id, "registration");
    if (!expectedChallenge) throw new TRPCError({ code: "BAD_REQUEST", message: "Your passkey setup expired. Start again to continue." });
    const { origin, rpID } = getWebAuthnConfig(ctx.req);
    try {
      const verification = await verifyRegistrationResponse({
        response: input.response,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        requireUserVerification: true,
      });
      if (!verification.verified || !verification.registrationInfo) throw new Error("Passkey registration was not verified");
      const { credential, credentialBackedUp, credentialDeviceType } = verification.registrationInfo;
      await savePasskey(ctx.user.id, {
        credentialId: credential.id,
        publicKey: Buffer.from(credential.publicKey).toString("base64url"),
        counter: credential.counter,
        deviceType: credentialDeviceType,
        backedUp: credentialBackedUp,
        transports: credential.transports ?? [],
        name: "Passkey",
      });
      return { verified: true };
    } catch (error) {
      console.warn("[WebAuthn] Registration verification failed");
      throw new TRPCError({ code: "BAD_REQUEST", message: "We could not verify that passkey. Please try again." });
    }
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
    await revokeAllTrustedDevices(ctx.user.id);
    return { success: true };
  }),

  revokeTrustedDevice: protectedProcedure.input(z.object({ deviceId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    await revokeTrustedDevice(ctx.user.id, input.deviceId);
    return { success: true };
  }),

  revokeAllTrustedDevices: protectedProcedure.mutation(async ({ ctx }) => {
    await revokeAllTrustedDevices(ctx.user.id);
    return { success: true };
  }),

  verifyLogin: publicProcedure.input(z.object({ code: z.union([otpCode, recoveryCode]), trustedDeviceDays: trustedDeviceDays.optional() })).mutation(async ({ ctx, input }) => {
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
    const expiresInMs = challenge.rememberMe ? SESSION_TTL_MS : STANDARD_SESSION_TTL_MS;
    const sessionToken = await sdk.createSessionToken(challenge.openId, { name: challenge.name, expiresInMs });
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(TWO_FACTOR_CHALLENGE_COOKIE, { ...cookieOptions, maxAge: -1 });
    ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, ...(challenge.rememberMe ? { maxAge: SESSION_TTL_MS } : {}) });
    await issueTrustedDeviceIfRequested(ctx, user.id, input.trustedDeviceDays);
    return { returnPath: challenge.returnPath };
  }),

  beginPasskeyLogin: publicProcedure.mutation(async ({ ctx }) => {
    const challenge = await sdk.verifyTwoFactorChallenge(parseCookie(ctx.req.headers.cookie ?? "")[TWO_FACTOR_CHALLENGE_COOKIE]);
    if (!challenge) throw new TRPCError({ code: "UNAUTHORIZED", message: "Your security check expired. Please sign in again." });
    const user = await getUserByOpenId(challenge.openId);
    if (!user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Your security check is no longer available." });
    const passkeys = await getUserPasskeys(user.id);
    if (passkeys.length === 0) throw new TRPCError({ code: "BAD_REQUEST", message: "No passkey is available for this account yet." });
    const { rpID } = getWebAuthnConfig(ctx.req);
    const options = await generateAuthenticationOptions({
      rpID,
      userVerification: "required",
      allowCredentials: passkeys.map((passkey) => ({ id: passkey.credentialId, transports: Array.isArray(passkey.transports) ? passkey.transports as never[] : [] })),
    });
    await saveWebAuthnCeremony(user.id, "authentication", options.challenge);
    return options;
  }),

  finishPasskeyLogin: publicProcedure.input(z.object({ response: z.custom<AuthenticationResponseJSON>(), trustedDeviceDays: trustedDeviceDays.optional() })).mutation(async ({ ctx, input }) => {
    const challenge = await sdk.verifyTwoFactorChallenge(parseCookie(ctx.req.headers.cookie ?? "")[TWO_FACTOR_CHALLENGE_COOKIE]);
    if (!challenge) throw new TRPCError({ code: "UNAUTHORIZED", message: "Your security check expired. Please sign in again." });
    const user = await getUserByOpenId(challenge.openId);
    if (!user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Your security check is no longer available." });
    const expectedChallenge = await consumeWebAuthnCeremony(user.id, "authentication");
    if (!expectedChallenge) throw new TRPCError({ code: "BAD_REQUEST", message: "Your passkey prompt expired. Try again." });
    const passkey = await getUserPasskeyByCredentialId(user.id, input.response.id);
    if (!passkey) throw new TRPCError({ code: "BAD_REQUEST", message: "This passkey is not recognized for this account." });
    const { origin, rpID } = getWebAuthnConfig(ctx.req);
    try {
      const verification = await verifyAuthenticationResponse({
        response: input.response,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        requireUserVerification: true,
        credential: {
          id: passkey.credentialId,
          publicKey: Buffer.from(passkey.publicKey, "base64url"),
          counter: passkey.counter,
          transports: Array.isArray(passkey.transports) ? passkey.transports as never[] : [],
        },
      });
      if (!verification.verified) throw new Error("Passkey authentication was not verified");
      await updatePasskeyUsage(passkey.id, verification.authenticationInfo.newCounter);
      const expiresInMs = challenge.rememberMe ? SESSION_TTL_MS : STANDARD_SESSION_TTL_MS;
      const sessionToken = await sdk.createSessionToken(challenge.openId, { name: challenge.name, expiresInMs });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(TWO_FACTOR_CHALLENGE_COOKIE, { ...cookieOptions, maxAge: -1 });
      ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, ...(challenge.rememberMe ? { maxAge: SESSION_TTL_MS } : {}) });
      await issueTrustedDeviceIfRequested(ctx, user.id, input.trustedDeviceDays);
      return { returnPath: challenge.returnPath };
    } catch {
      console.warn("[WebAuthn] Authentication verification failed");
      throw new TRPCError({ code: "BAD_REQUEST", message: "We could not verify that passkey. Try again or use your authenticator code." });
    }
  }),
});
