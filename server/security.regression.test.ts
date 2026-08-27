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
    expect(server).toContain('frameSrc: ["\'self\'", "https://checkout.razorpay.com", "https://api.razorpay.com"]');
    expect(server).toContain("const contactLimiter");
    expect(server).toContain("const paymentLimiter");
    expect(server).toContain("const twoFactorLimiter");
    expect(server).toContain("const localAuthLimiter");
    expect(server).toContain('app.use("/api/trpc/system.sendContactMessage", contactLimiter)');
    expect(server).toContain('app.use("/api/trpc/credits", paymentLimiter)');
    expect(server).toContain('app.use("/api/trpc/twoFactor", twoFactorLimiter)');
    expect(server).toContain('app.use("/api/trpc/localAuth", localAuthLimiter)');
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
    const sdk = readServer("_core/sdk.ts");

    expect(appRouter).not.toContain("oauth: oauthCallbackRouter");
    expect(appRouter).not.toContain("oauthFlow: oauthFlowRouter");
    expect(appRouter).not.toContain("multilingualAI: multilingualAIRouter");
    expect(oauthManagement).not.toContain("getAccessToken:");
    expect(oauthManagement).not.toContain("refreshToken:");
    expect(oauthManagement).toContain("getSocialConnection(input.connectionId)");
    expect(oauthManagement).toContain("connection.userId !== ctx.user.id");
    expect(socialDb).toContain('accessToken: ""');
    expect(socialDb).toContain("refreshToken: null");
    expect(oauth).toContain("const SESSION_TTL_MS = 1000 * 60 * 60 * 12");
    expect(oauth).not.toContain("ONE_YEAR_MS");
    expect(sdk).not.toContain("ONE_YEAR_MS");
    expect(sdk).toContain("options.expiresInMs ?? 1000 * 60 * 60 * 8");
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

  it("binds crediting to server-owned payment data and prevents duplicate provider references", () => {
    const schema = readFileSync(resolve(projectRoot, "drizzle/schema.ts"), "utf8");
    const credits = readServer("routers/credits.ts");
    const db = readFileSync(resolve(projectRoot, "server/db.ts"), "utf8");
    const router = readServer("routers.ts");

    expect(schema).toContain('export const razorpayCreditOrders');
    expect(schema).toContain('credit_transactions_provider_payment_unique');
    expect(credits).toContain('createRazorpayCreditOrder');
    expect(credits).toContain('getRazorpayCreditOrderForUser(ctx.user.id, input.orderId)');
    expect(credits).toContain('payment.order_id !== order.razorpayOrderId');
    expect(credits).toContain('Number(payment.amount) !== order.amountPaise');
    expect(credits).toContain('metadata.userId !== ctx.user.id.toString()');
    expect(db).toContain('creditRazorpayOrder');
    expect(db).toContain('alreadyCredited: true');
    expect(router).not.toContain('monetization: monetizationRouter');
  });

  it("denies guessed private files, arbitrary transcription URLs, missing-origin writes, and reset-account enumeration", () => {
    const storageProxy = readServer("_core/storageProxy.ts");
    const transcription = readServer("_core/voiceTranscription.ts");
    const server = readServer("_core/index.ts");
    const localAuth = readServer("routers/localAuth.ts");

    expect(storageProxy).toContain('ownerIdForPrivateKey');
    expect(storageProxy).toContain('sdk.authenticateRequest(req)');
    expect(storageProxy).toContain('res.status(404).send("Not found")');
    expect(transcription).toContain('function managedAudioKey');
    expect(transcription).toContain('storageGetSignedUrl(key)');
    expect(transcription).not.toContain('fetch(options.audioUrl)');
    expect(server).toContain('const hasTrustedRequestOrigin');
    expect(server).toContain('unsafeMethod && !hasTrustedRequestOrigin(req)');
    expect(localAuth).toContain('return { accepted: true, emailDeliveryAvailable: true }');
    expect(localAuth).not.toContain('status: "oauth_only"');
  });

  it("verifies Razorpay signatures from raw bytes and avoids logging customer email from webhook payloads", () => {
    const server = readServer("_core/index.ts");
    const webhook = readServer("_core/razorpayWebhook.ts");

    expect(server).toContain('handleRazorpayWebhook(req, res, req.body as Buffer)');
    expect(webhook).toContain('verifyWebhookSignature(rawBody.toString("utf8"), signature)');
    expect(webhook).not.toContain('JSON.stringify(req.body)');
    expect(webhook).not.toContain('userEmail');
    expect(webhook).not.toContain('addCredits(');
  });
});
