import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createLocalAccount, createLocalPasswordResetToken, createLocalVerificationToken, getLocalAccountByEmail, getLocalSessionVersion, getUserByNormalizedEmail, hashPassword, resetLocalPassword, revokeLocalPasswordResetToken, verifyLocalAccountEmail, verifyPassword } from "../db/localAuth";
import { isTwoFactorEnabled } from "../db/twoFactor";
import { isTransactionalEmailConfigured, sendEmail } from "../_core/emailService";
import { getSessionCookieOptions } from "../_core/cookies";
import { sdk, TWO_FACTOR_CHALLENGE_COOKIE } from "../_core/sdk";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { COOKIE_NAME } from "../../shared/const";

const STANDARD_SESSION_TTL_MS = 1000 * 60 * 60 * 12;
const REMEMBER_ME_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const VERIFY_TTL_MS = 1000 * 60 * 30;
const emailInput = z.string().trim().email("Enter a valid email address.").max(320).transform((value) => value.toLowerCase());
const passwordInput = z.string().min(12, "Use at least 12 characters.").max(128).refine((value) => /[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value) && /[^A-Za-z0-9]/.test(value), "Use upper- and lowercase letters, a number, and a symbol.");

function verificationUrl(token: string) {
  const origin = (process.env.FRONTEND_URL || "https://lumae.co.in").replace(/\/$/, "");
  return `${origin}/verify-local-email?token=${encodeURIComponent(token)}`;
}

async function sendLocalVerificationEmail(email: string, token: string) {
  const url = verificationUrl(token);
  return sendEmail({
    to: email,
    subject: "Verify your Lumae AI email address",
    htmlContent: `<p>Confirm your Lumae AI email address to activate email/password sign-in.</p><p><a href="${url}">Verify email address</a></p><p>This link expires in 30 minutes. If you did not create this account, you can safely ignore this email.</p>`,
  });
}

function passwordResetUrl(token: string) {
  const origin = (process.env.FRONTEND_URL || "https://lumae.co.in").replace(/\/$/, "");
  return `${origin}/reset-password?token=${encodeURIComponent(token)}`;
}

async function sendPasswordResetEmail(email: string, token: string) {
  return sendEmail({
    to: email,
    subject: "Reset your Lumae AI password",
    htmlContent: `<p>Use the secure link below to reset your Lumae AI password.</p><p><a href="${passwordResetUrl(token)}">Reset password</a></p><p>This single-use link expires in 30 minutes. If you did not request it, you can safely ignore this email.</p>`,
  });
}

async function establishLocalSession(ctx: { req: Parameters<typeof getSessionCookieOptions>[0]; res: { cookie: (name: string, value: string, options: Record<string, unknown>) => unknown } }, user: { id: number; openId: string; name: string | null; email: string | null }, rememberMe: boolean) {
  const name = user.name || user.email?.split("@")[0] || "User";
  const cookieOptions = getSessionCookieOptions(ctx.req);
  const localSessionVersion = await getLocalSessionVersion(user.id);
  if (await isTwoFactorEnabled(user.id)) {
    const challenge = await sdk.createTwoFactorChallenge(user.openId, name, "/dashboard", rememberMe, localSessionVersion);
    ctx.res.cookie(TWO_FACTOR_CHALLENGE_COOKIE, challenge, { ...cookieOptions, sameSite: "lax", maxAge: 1000 * 60 * 10 });
    return { requiresTwoFactor: true, returnPath: "/two-factor" };
  }
  const expiresInMs = rememberMe ? REMEMBER_ME_SESSION_TTL_MS : STANDARD_SESSION_TTL_MS;
  const sessionToken = await sdk.createSessionToken(user.openId, { name, expiresInMs, localSessionVersion });
  ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, ...(rememberMe ? { maxAge: REMEMBER_ME_SESSION_TTL_MS } : {}) });
  return { requiresTwoFactor: false, returnPath: "/dashboard" };
}

export const localAuthRouter = router({
  register: publicProcedure.input(z.object({ name: z.string().trim().min(1).max(120), email: emailInput, password: passwordInput })).mutation(async ({ input }) => {
    const account = await createLocalAccount({ name: input.name, email: input.email, passwordHash: await hashPassword(input.password) });
    if (!account) throw new TRPCError({ code: "CONFLICT", message: "This email is already registered. Sign in using its original sign-in method instead of creating a second account." });
    const emailDeliveryConfigured = isTransactionalEmailConfigured();
    const delivered = emailDeliveryConfigured && await sendLocalVerificationEmail(account.email, account.verificationToken);
    return { verificationRequired: true, emailDeliveryAvailable: delivered, emailDeliveryConfigured, expiresInMs: VERIFY_TTL_MS };
  }),

  login: publicProcedure.input(z.object({ email: emailInput, password: z.string().min(1).max(128), rememberMe: z.boolean().default(false) })).mutation(async ({ ctx, input }) => {
    const account = await getLocalAccountByEmail(input.email);
    if (!account || !(await verifyPassword(input.password, account.credential.passwordHash))) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Email or password is incorrect." });
    }
    if (!account.user.emailVerified || !account.credential.verifiedAt) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Confirm your email before signing in. You can request a new verification link below." });
    }
    return establishLocalSession(ctx, account.user, input.rememberMe);
  }),

  verifyEmail: publicProcedure.input(z.object({ token: z.string().min(20).max(255) })).mutation(async ({ input }) => {
    const user = await verifyLocalAccountEmail(input.token);
    if (!user) throw new TRPCError({ code: "BAD_REQUEST", message: "That verification link is invalid or expired." });
    return { verified: true, email: user.email };
  }),

  resendVerification: publicProcedure.input(z.object({ email: emailInput })).mutation(async ({ input }) => {
    const emailDeliveryAvailable = isTransactionalEmailConfigured();
    const user = await getUserByNormalizedEmail(input.email);
    if (emailDeliveryAvailable && user && !user.emailVerified && user.loginMethod === "email") {
      const token = await createLocalVerificationToken(user.id);
      await sendLocalVerificationEmail(input.email, token);
    }
    return { accepted: true, emailDeliveryAvailable };
  }),

  requestPasswordReset: publicProcedure.input(z.object({ email: emailInput })).mutation(async ({ input }) => {
    const result = await createLocalPasswordResetToken(input.email);
    if (result.kind === "local") {
      const delivered = await sendPasswordResetEmail(result.user.email!, result.token);
      if (!delivered) await revokeLocalPasswordResetToken(result.token);
      return { status: delivered ? "sent" as const : "delivery_unavailable" as const };
    }
    if (result.kind === "oauth_only") return { status: "oauth_only" as const };
    if (result.kind === "throttled") return { status: "throttled" as const, retryAfterSeconds: result.retryAfterSeconds };
    return { status: "sent" as const };
  }),

  resetPassword: publicProcedure.input(z.object({ token: z.string().min(20).max(255), password: passwordInput })).mutation(async ({ input }) => {
    const userId = await resetLocalPassword(input.token, await hashPassword(input.password));
    if (!userId) throw new TRPCError({ code: "BAD_REQUEST", message: "This reset link is invalid, expired, or already used." });
    return { success: true };
  }),

  status: protectedProcedure.query(({ ctx }) => ({
    phoneOtpConfigured: Boolean(process.env.SMS_OTP_PROVIDER && process.env.SMS_OTP_API_KEY),
    emailPasswordAvailable: true,
  })),
});
