import crypto from "crypto";
import { and, eq } from "drizzle-orm";
import { localAuthCredentials, users } from "../../drizzle/schema";
import { getDb } from "../db";

const SCRYPT_COST = 16_384;

function deriveScrypt(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, { N: SCRYPT_COST, r: 8, p: 1 }, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashVerificationToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("base64url");
  const derived = await deriveScrypt(password, salt);
  return `scrypt$${SCRYPT_COST}$${salt}$${derived.toString("base64url")}`;
}

export async function verifyPassword(password: string, encoded: string) {
  const [algorithm, cost, salt, expected] = encoded.split("$");
  if (algorithm !== "scrypt" || Number(cost) !== SCRYPT_COST || !salt || !expected) return false;
  const derived = await deriveScrypt(password, salt);
  const expectedBuffer = Buffer.from(expected, "base64url");
  return expectedBuffer.length === derived.length && crypto.timingSafeEqual(expectedBuffer, derived);
}

export async function getUserByNormalizedEmail(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const rows = await db.select().from(users).where(eq(users.email, normalizeEmail(email))).limit(1);
  return rows[0] ?? null;
}

export async function createLocalAccount(input: { name: string; email: string; passwordHash: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const email = normalizeEmail(input.email);
  const existing = await getUserByNormalizedEmail(email);
  if (existing) return null;
  const openId = `local:${crypto.randomUUID()}`;
  const inserted = await db.insert(users).values({ openId, name: input.name, email, loginMethod: "email", emailVerified: false, lastSignedIn: new Date() });
  const userId = Number(inserted[0].insertId);
  const token = crypto.randomBytes(32).toString("base64url");
  await db.insert(localAuthCredentials).values({
    userId,
    passwordHash: input.passwordHash,
    verificationTokenHash: hashVerificationToken(token),
    verificationExpiresAt: new Date(Date.now() + 1000 * 60 * 30),
  });
  return { userId, openId, email, name: input.name, verificationToken: token };
}

export async function verifyLocalAccountEmail(token: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const rows = await db.select().from(localAuthCredentials).where(eq(localAuthCredentials.verificationTokenHash, hashVerificationToken(token))).limit(1);
  const credential = rows[0];
  if (!credential || !credential.verificationExpiresAt || credential.verificationExpiresAt < new Date()) return null;
  await db.update(localAuthCredentials).set({ verificationTokenHash: null, verificationExpiresAt: null, verifiedAt: new Date() }).where(eq(localAuthCredentials.id, credential.id));
  await db.update(users).set({ emailVerified: true }).where(eq(users.id, credential.userId));
  const user = await db.select().from(users).where(eq(users.id, credential.userId)).limit(1);
  return user[0] ?? null;
}

export async function getLocalAccountByEmail(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const user = await getUserByNormalizedEmail(email);
  if (!user) return null;
  const credentials = await db.select().from(localAuthCredentials).where(eq(localAuthCredentials.userId, user.id)).limit(1);
  return credentials[0] ? { user, credential: credentials[0] } : null;
}

export async function createLocalVerificationToken(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const token = crypto.randomBytes(32).toString("base64url");
  await db.update(localAuthCredentials).set({ verificationTokenHash: hashVerificationToken(token), verificationExpiresAt: new Date(Date.now() + 1000 * 60 * 30) }).where(eq(localAuthCredentials.userId, userId));
  return token;
}
