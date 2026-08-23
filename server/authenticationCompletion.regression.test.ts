import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("authentication completion and recovery", () => {
  it("keeps sign-out local to Lumae and clears local cached identity", () => {
    const authHook = read("client/src/_core/hooks/useAuth.ts");
    const header = read("client/src/components/Header.tsx");
    const dashboard = read("client/src/components/DashboardLayout.tsx");

    expect(authHook).toContain('localStorage.removeItem("manus-runtime-user-info")');
    expect(header).toContain('window.location.assign("/login")');
    expect(dashboard).toContain('window.location.assign("/login")');
    expect(header).not.toContain("accounts.google.com");
    expect(dashboard).not.toContain("accounts.google.com");
  });

  it("uses hashed single-use reset records and increments local session versions after a reset", () => {
    const schema = read("drizzle/schema.ts");
    const storage = read("server/db/localAuth.ts");
    const sdk = read("server/_core/sdk.ts");

    expect(schema).toContain("localPasswordResetTokens");
    expect(schema).toContain("tokenHash");
    expect(schema).toContain("usedAt");
    expect(schema).toContain("localAuthSessionVersions");
    expect(storage).toContain("crypto.randomBytes(32)");
    expect(storage).toContain("hashVerificationToken(token)");
    expect(storage).toContain("isNull(localPasswordResetTokens.usedAt)");
    expect(storage).toContain("localAuthSessionVersions.version} + 1");
    expect(storage).toContain("RESET_REQUEST_COOLDOWN_MS");
    expect(storage).toContain("lastResetRequestedAt");
    expect(storage).toContain("revokeLocalPasswordResetToken");
    expect(sdk).toContain("Session has been invalidated");
    expect(sdk).toContain("localSessionVersion");
  });

  it("provides recovery guidance and does not pretend unconfigured providers are active", () => {
    const login = read("client/src/pages/LoginEnhanced.tsx");
    const forgot = read("client/src/pages/ForgotPassword.tsx");
    const router = read("server/routers/localAuth.ts");

    expect(login).toContain("Forgot password?");
    expect(login).toContain("GitHub soon");
    expect(login).toContain("Phone OTP coming soon");
    expect(login).toContain("Remember me for 30 days");
    expect(forgot).toContain("single-use link that expires in 30 minutes");
    expect(router).toContain('status: "oauth_only"');
    expect(router).toContain("requestPasswordReset");
    expect(router).toContain("resetPassword");
    expect(router).toContain('status: "throttled"');
    expect(router).toContain("if (!delivered) await revokeLocalPasswordResetToken");
    expect(router).toContain("original sign-in method instead of creating a second account");
  });

  it("accepts trusted Google email evidence but never treats a password as email ownership proof", () => {
    const oauth = read("server/_core/oauth.ts");
    const database = read("server/db.ts");
    const localRouter = read("server/routers/localAuth.ts");
    const dashboard = read("client/src/pages/SimpleDashboard.tsx");

    expect(oauth).toContain("profile.verified_email === true");
    expect(oauth).toContain("emailVerified: true");
    expect(database).toContain("if (user.emailVerified !== undefined)");
    expect(localRouter).toContain("Confirm your email before signing in");
    expect(dashboard).toContain("Signing in cannot confirm email ownership by itself");
    expect(dashboard).toContain("Send 6-digit code");
  });

  it("offers a rate-limited authenticated OTP fallback when provider confirmation remains pending", () => {
    const router = read("server/routers.ts");
    const dashboard = read("client/src/pages/SimpleDashboard.tsx");

    expect(router).toContain("EMAIL_CONFIRMATION_RESEND_WINDOW_MS");
    expect(router).toContain("emailConfirmationResendAt");
    expect(router).toContain("retryAfterSeconds");
    expect(dashboard).toContain("Send 6-digit code");
    expect(dashboard).toContain('navigate("/verify-email")');
    expect(dashboard).toContain("Signing in cannot confirm email ownership by itself");
  });
});
