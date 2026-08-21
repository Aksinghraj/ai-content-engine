import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("local email/password authentication", () => {
  it("stores only scrypt password hashes and hashed verification tokens", () => {
    const schema = read("drizzle/schema.ts");
    const storage = read("server/db/localAuth.ts");

    expect(schema).toContain("export const localAuthCredentials");
    expect(schema).toContain('passwordHash: varchar("passwordHash", { length: 255 }).notNull()');
    expect(schema).toContain('verificationTokenHash: varchar("verificationTokenHash", { length: 128 })');
    expect(storage).toContain("crypto.scrypt");
    expect(storage).toContain("crypto.timingSafeEqual");
    expect(storage).toContain('crypto.createHash("sha256")');
    expect(storage).not.toContain("passwordPlaintext");
  });

  it("requires verification before local sessions and preserves the existing second-factor challenge", () => {
    const router = read("server/routers/localAuth.ts");

    expect(router).toContain("Confirm your email before signing in");
    expect(router).toContain("isTwoFactorEnabled(user.id)");
    expect(router).toContain("sdk.createTwoFactorChallenge");
    expect(router).toContain("createSessionToken");
    expect(router).toContain("Use at least 12 characters.");
    expect(read("server/db/localAuth.ts")).toContain("verificationTokenHash");
  });

  it("keeps phone OTP visibly unavailable until an SMS provider is configured", () => {
    const page = read("client/src/pages/LoginEnhanced.tsx");
    const router = read("server/routers/localAuth.ts");

    expect(page).toContain("Phone OTP coming soon");
    expect(page).toContain("Phone OTP will activate after an SMS provider is configured.");
    expect(router).toContain("SMS_OTP_PROVIDER");
    expect(router).toContain("SMS_OTP_API_KEY");
  });

  it("uses an explicit bounded Remember Me choice without bypassing two-factor verification", () => {
    const localRouter = read("server/routers/localAuth.ts");
    const twoFactorRouter = read("server/routers/twoFactor.ts");
    const sdk = read("server/_core/sdk.ts");
    const page = read("client/src/pages/LoginEnhanced.tsx");

    expect(localRouter).toContain("STANDARD_SESSION_TTL_MS = 1000 * 60 * 60 * 12");
    expect(localRouter).toContain("REMEMBER_ME_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30");
    expect(localRouter).toContain("rememberMe: z.boolean().default(false)");
    expect(sdk).toContain("rememberMe: boolean");
    expect(twoFactorRouter).toContain("challenge.rememberMe ? SESSION_TTL_MS : STANDARD_SESSION_TTL_MS");
    expect(page).toContain("Remember me for 30 days");
    expect(page).toContain("Leave unchecked on shared devices.");
  });

  it("renders an accessible visual password-strength indicator during registration", () => {
    const page = read("client/src/pages/LoginEnhanced.tsx");

    expect(page).toContain("function passwordStrength");
    expect(page).toContain("Password strength");
    expect(page).toContain('aria-live="polite"');
    expect(page).toContain("Add a password");
  });
});
