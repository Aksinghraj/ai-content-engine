import crypto from "crypto";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { socialOAuthStates } from "../../drizzle/schema";
import { decrypt, encrypt } from "./encryption";

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
  returnPath?: string;
}

/** Persist state so provider callbacks survive restarts and route to the initiating user. */
export async function storeOAuthState(state: OAuthState): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("OAuth state storage is temporarily unavailable");
  await db.insert(socialOAuthStates).values({
    state: state.state,
    userId: state.userId,
    platform: state.platform,
    encryptedCodeVerifier: encrypt(state.codeVerifier),
    returnPath: state.returnPath || "/connected-accounts",
    expiresAt: new Date(state.expiresAt),
  }).onDuplicateKeyUpdate({
    set: {
      userId: state.userId,
      platform: state.platform,
      encryptedCodeVerifier: encrypt(state.codeVerifier),
      returnPath: state.returnPath || "/connected-accounts",
      expiresAt: new Date(state.expiresAt),
    },
  });
}

export async function getOAuthState(state: string): Promise<OAuthState | null> {
  const db = await getDb();
  if (!db) return null;
  const [oauthState] = await db.select().from(socialOAuthStates).where(eq(socialOAuthStates.state, state)).limit(1);
  if (!oauthState) return null;
  if (Date.now() > oauthState.expiresAt.getTime()) {
    await db.delete(socialOAuthStates).where(eq(socialOAuthStates.state, state));
    return null;
  }
  return {
    state: oauthState.state,
    codeVerifier: decrypt(oauthState.encryptedCodeVerifier),
    platform: oauthState.platform,
    userId: oauthState.userId,
    createdAt: oauthState.createdAt.getTime(),
    expiresAt: oauthState.expiresAt.getTime(),
    returnPath: oauthState.returnPath,
  };
}

export async function deleteOAuthState(state: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(socialOAuthStates).where(eq(socialOAuthStates.state, state));
}
