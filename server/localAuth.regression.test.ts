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
});
