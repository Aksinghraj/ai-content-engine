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

  it("stores only public WebAuthn credential data and consumes short-lived ceremony challenges", () => {
    const schema = read("drizzle/schema.ts");
    const db = read("server/db/passkeys.ts");
    const router = read("server/routers/twoFactor.ts");

    expect(schema).toContain('export const webAuthnPasskeys');
    expect(schema).toContain('publicKey: text("publicKey").notNull()');
    expect(schema).not.toContain("privateKey");
    expect(schema).toContain('export const webAuthnCeremonies');
    expect(db).toContain("5 * 60 * 1000");
    expect(db).toContain("Consume challenge before response verification");
    expect(db).toContain("await db.delete(webAuthnCeremonies)");
    expect(router).toContain("generateRegistrationOptions");
    expect(router).toContain("verifyRegistrationResponse");
    expect(router).toContain("generateAuthenticationOptions");
    expect(router).toContain("verifyAuthenticationResponse");
    expect(router).toContain("requireUserVerification: true");
    expect(router).toContain("updatePasskeyUsage");
  });

  it("requires a current authenticator code to rotate recovery codes and offers passkeys in both security interfaces", () => {
    const router = read("server/routers/twoFactor.ts");
    const panel = read("client/src/components/TwoFactorSecurityPanel.tsx");
    const login = read("client/src/pages/TwoFactorLogin.tsx");

    expect(router).toContain("regenerateRecoveryCodes");
    expect(router).toContain("Enter a current authenticator code to regenerate recovery codes.");
    expect(router).toContain("replaceRecoveryCodeHashes");
    expect(panel).toContain("Regenerate recovery codes");
    expect(panel).toContain("Previous recovery codes are no longer valid.");
    expect(panel).toContain("startRegistration");
    expect(login).toContain("Use a passkey");
    expect(login).toContain("startAuthentication");
  });

  it("uses opt-in, hashed, expiring trusted-device tokens without email or temporary-login flows", () => {
    const schema = read("drizzle/schema.ts");
    const trustedDevices = read("server/db/trustedDevices.ts");
    const oauth = read("server/_core/oauth.ts");
    const router = read("server/routers/twoFactor.ts");
    const login = read("client/src/pages/TwoFactorLogin.tsx");
    const panel = read("client/src/components/TwoFactorSecurityPanel.tsx");

    expect(schema).toContain('export const trustedDevices');
    expect(schema).toContain('tokenHash: varchar("tokenHash", { length: 128 }).notNull()');
    expect(trustedDevices).toContain("crypto.randomBytes(32)");
    expect(trustedDevices).toContain("createHMAC(token)");
    expect(trustedDevices).toContain("device.expiresAt <= new Date()");
    expect(oauth).toContain("validateTrustedDevice(account.id, trustedDeviceToken)");
    expect(router).toContain("trustedDeviceDays: trustedDeviceDays.optional()");
    expect(router).toContain("revokeAllTrustedDevices(ctx.user.id)");
    expect(router).toContain("issueTrustedDeviceIfRequested");
    expect(router).not.toContain("sendTrustedDeviceEmail");
    expect(router).not.toContain("magicLink");
    expect(login).toContain("Trust this private device");
    expect(login).toContain("Do not use this on shared or test devices.");
    expect(panel).toContain("Trusted devices");
    expect(panel).toContain("They do not use emails or temporary-login links.");
  });
});
