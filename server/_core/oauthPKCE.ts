import crypto from "crypto";

/**
 * OAuth 2.0 PKCE (Proof Key for Public Clients) Implementation
 * RFC 7636: https://tools.ietf.org/html/rfc7636
 */

/**
 * Generate a cryptographically secure random string for code_verifier
 * Must be between 43-128 characters
 */
export function generateCodeVerifier(): string {
  const length = 128;
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  let verifier = "";
  const randomValues = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    verifier += charset[randomValues[i] % charset.length];
  }
  return verifier;
}

/**
 * Generate code_challenge from code_verifier using S256 method
 * code_challenge = BASE64URL(SHA256(code_verifier))
 */
export function generateCodeChallenge(codeVerifier: string): string {
  const hash = crypto.createHash("sha256").update(codeVerifier).digest();
  return base64UrlEncode(hash);
}

/**
 * Base64 URL encode (RFC 4648 Section 5)
 */
function base64UrlEncode(buffer: Buffer): string {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/**
 * Generate a random state parameter to prevent CSRF attacks
 */
export function generateState(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Encrypt sensitive data (tokens) using AES-256-GCM
 */
export function encryptToken(token: string, encryptionKey: string): string {
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(encryptionKey, "salt", 32);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  let encrypted = cipher.update(token, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();
  const combined = iv.toString("hex") + ":" + authTag.toString("hex") + ":" + encrypted;

  return combined;
}

/**
 * Decrypt tokens
 */
export function decryptToken(encryptedToken: string, encryptionKey: string): string {
  const parts = encryptedToken.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted token format");
  }

  const iv = Buffer.from(parts[0], "hex");
  const authTag = Buffer.from(parts[1], "hex");
  const encrypted = parts[2];

  const key = crypto.scryptSync(encryptionKey, "salt", 32);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * OAuth 2.0 State Management
 */
export interface OAuthState {
  state: string;
  codeVerifier: string;
  platform: string;
  userId: number;
  createdAt: number;
  expiresAt: number;
}

/**
 * Store state in memory (in production, use Redis or database)
 */
const stateStore = new Map<string, OAuthState>();

export function storeOAuthState(state: OAuthState): void {
  // Auto-cleanup after 10 minutes
  setTimeout(() => {
    stateStore.delete(state.state);
  }, 10 * 60 * 1000);

  stateStore.set(state.state, state);
}

export function getOAuthState(state: string): OAuthState | null {
  const oauthState = stateStore.get(state);
  if (!oauthState) return null;

  // Check if expired
  if (Date.now() > oauthState.expiresAt) {
    stateStore.delete(state);
    return null;
  }

  return oauthState;
}

export function deleteOAuthState(state: string): void {
  stateStore.delete(state);
}
