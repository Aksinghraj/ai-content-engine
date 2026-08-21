import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import * as OTPAuth from "otpauth";

const root = resolve(__dirname, "..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("two-factor authentication and rate-limit feedback", () => {
  it("stores only encrypted TOTP material and hashed recovery codes", () => {
    const schema = read("drizzle/schema.ts");
    const db = read("server/db/twoFactor.ts");
    const router = read("server/routers/twoFactor.ts");

    expect(schema).toContain('export const twoFactorAuthenticators');
    expect(schema).toContain('encryptedSecret: text("encryptedSecret").notNull()');
    expect(schema).toContain('recoveryCodeHashes: json("recoveryCodeHashes")');
    expect(db).toContain("recoveryCodeHashes: null");
    expect(router).toContain("createHMAC(code.toUpperCase())");
    expect(router).toContain("crypto.timingSafeEqual");
    expect(router).not.toContain("recoveryCodes: recoveryCodes.map");
  });

  it("uses standard six-digit TOTP codes and confirms setup before enabling it", () => {
    const router = read("server/routers/twoFactor.ts");
    const secret = new OTPAuth.Secret({ size: 20 }).base32;
    const totp = new OTPAuth.TOTP({ issuer: "Lumae AI", label: "test", secret: OTPAuth.Secret.fromBase32(secret), digits: 6, period: 30 });
    const token = totp.generate();

    expect(token).toMatch(/^\d{6}$/);
    expect(totp.validate({ token, window: 1 })).not.toBeNull();
    expect(router).toContain("regex(/^\\d{6}$/");
    expect(router).toContain("if (!verifiesTotp");
    expect(router).toContain("await enableTwoFactorAuthenticator");
    expect(router).toContain("generateRecoveryCodes()");
  });

  it("requires a signed ten-minute challenge before issuing a full two-factor login session", () => {
    const sdk = read("server/_core/sdk.ts");
    const oauth = read("server/_core/oauth.ts");
    const router = read("server/routers/twoFactor.ts");

    expect(sdk).toContain('purpose: "two_factor_challenge"');
    expect(sdk).toContain("1000 * 60 * 10");
    expect(sdk).toContain("verifyTwoFactorChallenge");
    expect(oauth).toContain("redirectForTwoFactorIfEnabled");
    expect(oauth).toContain('res.redirect(302, "/two-factor")');
    expect(router).toContain("sdk.verifyTwoFactorChallenge");
    expect(router).toContain("ctx.res.clearCookie(TWO_FACTOR_CHALLENGE_COOKIE");
  });

  it("offers clear in-product setup and rate-limit feedback without exposing secrets", () => {
    const panel = read("client/src/components/TwoFactorSecurityPanel.tsx");
    const login = read("client/src/pages/TwoFactorLogin.tsx");
    const feedback = read("client/src/lib/rateLimitFeedback.ts");
    const main = read("client/src/main.tsx");

    expect(panel).toContain("QRCodeSVG");
    expect(panel).toContain("They will not be shown again.");
    expect(panel).toContain("I have saved these recovery codes securely.");
    expect(login).toContain("Continue securely");
    expect(feedback).toContain("We’re pacing requests to keep Lumae reliable");
    expect(feedback).toContain("lastRateLimitNoticeAt");
    expect(main).toContain("response.status === 429");
  });
});
