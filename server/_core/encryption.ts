/**
 * End-to-End Encryption Service
 * AES-256-GCM encryption for all sensitive data
 * Used across all features: social credentials, chat messages, scheduled posts, etc.
 */
import crypto from "crypto";
import { ENV } from "./env";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const SALT = "ai-content-engine-e2e-salt-v1";

/**
 * Derive encryption key from a configured server-side secret. A deploy without
 * a real secret must fail rather than silently encrypting customer data with a
 * predictable fallback value.
 */
function getEncryptionKey(customKey?: string): Buffer {
  const secret = customKey || ENV.dataEncryptionKey || ENV.cookieSecret;
  if (!secret || secret.length < 32) {
    throw new Error("A 32-character DATA_ENCRYPTION_KEY or JWT_SECRET is required for encryption");
  }
  return crypto.scryptSync(secret, SALT, KEY_LENGTH);
}

/**
 * Encrypt any string data using AES-256-GCM
 * Returns base64 encoded string: iv:authTag:encryptedData
 */
export function encrypt(plaintext: string, customKey?: string): string {
  const key = getEncryptionKey(customKey);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();
  
  // Format: iv:authTag:encryptedData (all in hex)
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

/**
 * Decrypt AES-256-GCM encrypted string
 * Input format: iv:authTag:encryptedData (hex encoded)
 */
export function decrypt(encryptedText: string, customKey?: string): string {
  const key = getEncryptionKey(customKey);
  const parts = encryptedText.split(":");
  
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted text format");
  }
  
  const iv = Buffer.from(parts[0], "hex");
  const authTag = Buffer.from(parts[1], "hex");
  const encrypted = parts[2];
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
}

/**
 * Encrypt an object (JSON serializable)
 */
export function encryptObject(obj: Record<string, unknown>, customKey?: string): string {
  return encrypt(JSON.stringify(obj), customKey);
}

/**
 * Decrypt to an object
 */
export function decryptObject<T = Record<string, unknown>>(encryptedText: string, customKey?: string): T {
  const decrypted = decrypt(encryptedText, customKey);
  return JSON.parse(decrypted) as T;
}

/**
 * Hash sensitive data (one-way, for comparison only)
 */
export function hashData(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Verify data integrity using HMAC
 */
export function createHMAC(data: string, key?: string): string {
  const secret = key || ENV.dataEncryptionKey || ENV.cookieSecret;
  if (!secret || secret.length < 32) {
    throw new Error("A 32-character DATA_ENCRYPTION_KEY or JWT_SECRET is required for HMAC operations");
  }
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

/**
 * Verify HMAC signature
 */
export function verifyHMAC(data: string, signature: string, key?: string): boolean {
  const computed = createHMAC(data, key);
  const expected = Buffer.from(computed, "hex");
  const received = Buffer.from(signature, "hex");
  return received.length === expected.length && crypto.timingSafeEqual(expected, received);
}

/**
 * Encryption status info for UI display
 */
export const ENCRYPTION_INFO = {
  algorithm: "AES-256-GCM",
  keyDerivation: "scrypt",
  ivLength: IV_LENGTH,
  authTagLength: AUTH_TAG_LENGTH,
  standard: "NIST SP 800-38D",
  description: "Military-grade end-to-end encryption. Your data is encrypted before storage and can only be decrypted with your unique key.",
};
