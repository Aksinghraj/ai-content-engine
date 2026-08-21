import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHMAC, decrypt, encrypt, verifyHMAC } from "./_core/encryption";

const projectRoot = resolve(__dirname, "..");
const readServer = (relativePath: string) => readFileSync(resolve(projectRoot, "server", relativePath), "utf8");

describe("defensive security hardening", () => {
  it("keeps encryption server-side, rejects fallback keys, and verifies HMACs safely", () => {
    const encryption = readServer("_core/encryption.ts");
    const router = readServer("routers.ts");
    const key = "security-regression-key-32-characters-minimum";
    const ciphertext = encrypt("customer-secret", key);
    const signature = createHMAC("protected-payload", key);

    expect(decrypt(ciphertext, key)).toBe("customer-secret");
    expect(verifyHMAC("protected-payload", signature, key)).toBe(true);
    expect(verifyHMAC("protected-payload", "00", key)).toBe(false);
    expect(encryption).not.toContain("default-encryption-key-change-in-production");
    expect(encryption).not.toContain("default-hmac-key");
    expect(router).not.toContain("encryption: encryptionRouter");
  });

  it("prevents cross-application sessions and avoids logging session material", () => {
    const sdk = readServer("_core/sdk.ts");

    expect(sdk).toContain("appId !== ENV.appId");
    expect(sdk).not.toContain("cookiePreview");
    expect(sdk).toContain('console.warn("[Auth] Session verification failed")');
  });

  it("uses bounded requests, origin checks, CSP, and targeted abuse limits", () => {
    const server = readServer("_core/index.ts");

    expect(server).toContain("contentSecurityPolicy: process.env.NODE_ENV === \"production\"");
    expect(server).toContain("frameAncestors: [\"'self'\"]");
    expect(server).toContain("const contactLimiter");
    expect(server).toContain("const paymentLimiter");
    expect(server).toContain("const twoFactorLimiter");
    expect(server).toContain('app.use("/api/trpc/system.sendContactMessage", contactLimiter)');
    expect(server).toContain('app.use("/api/trpc/credits", paymentLimiter)');
    expect(server).toContain('app.use("/api/trpc/twoFactor", twoFactorLimiter)');
    expect(server).toContain('return res.status(403).json({ error: "untrusted-origin" })');
    expect(server).toContain('express.json({ limit: "1mb" })');
    expect(server).toContain('express.raw({ type: "application/json", limit: "256kb" })');
    expect(server).not.toContain("Key ID loaded:");
  });

  it("keeps OAuth tokens server-side, validates ownership, and deletes tokens on disconnect", () => {
    const appRouter = readServer("routers.ts");
    const oauthManagement = readServer("routers/oauthManagement.ts");
    const socialDb = readServer("db/social.ts");
    const oauth = readServer("_core/oauth.ts");

    expect(appRouter).not.toContain("oauth: oauthCallbackRouter");
    expect(appRouter).not.toContain("oauthFlow: oauthFlowRouter");
    expect(appRouter).not.toContain("multilingualAI: multilingualAIRouter");
    expect(oauthManagement).not.toContain("getAccessToken:");
    expect(oauthManagement).not.toContain("refreshToken:");
    expect(oauthManagement).toContain("getSocialConnection(input.connectionId)");
    expect(oauthManagement).toContain("connection.userId !== ctx.user.id");
    expect(socialDb).toContain('accessToken: ""');
    expect(socialDb).toContain("refreshToken: null");
    expect(oauth).toContain("const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30");
    expect(oauth).not.toContain("ONE_YEAR_MS");
  });

  it("binds Google OAuth callbacks to a short-lived HttpOnly state cookie", () => {
    const oauth = readServer("_core/oauth.ts");

    expect(oauth).toContain('const GOOGLE_OAUTH_STATE_COOKIE = "lumae_google_oauth_state"');
    expect(oauth).toContain("crypto.randomBytes(32).toString(\"base64url\")");
    expect(oauth).toContain("GOOGLE_OAUTH_STATE_TTL_MS = 1000 * 60 * 10");
    expect(oauth).toContain('sameSite: "lax"');
    expect(oauth).toContain("statesMatch(storedState.nonce, stateRaw)");
    expect(oauth).toContain('return res.redirect("/login?error=invalid_state")');
    expect(oauth).toContain("form-action https://accounts.google.com");
    expect(oauth).not.toContain("JSON.parse(Buffer.from(stateRaw");
  });

  it("rejects browser-supplied social tokens and bounds social-media uploads", () => {
    const socialMedia = readServer("routers/socialMedia.ts");

    expect(socialMedia).toContain("Client-supplied OAuth tokens are intentionally rejected");
    expect(socialMedia).toContain('code: "FORBIDDEN"');
    expect(socialMedia).toContain("accessToken, refreshToken, ...connection");
    expect(socialMedia).toContain("max(900_000)");
    expect(socialMedia).toContain("buffer.length > 650 * 1024");
    expect(socialMedia).toContain("crypto.randomUUID()");
    expect(socialMedia).toContain("File extension does not match the selected media type");
  });
});
