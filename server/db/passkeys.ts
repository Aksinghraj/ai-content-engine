import { and, eq } from "drizzle-orm";
import { webAuthnCeremonies, webAuthnPasskeys } from "../../drizzle/schema";
import { getDb } from "../db";

export type PasskeyCeremonyType = "registration" | "authentication";

export async function getUserPasskeys(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(webAuthnPasskeys).where(eq(webAuthnPasskeys.userId, userId));
}

export async function getUserPasskeyByCredentialId(userId: number, credentialId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const rows = await db.select().from(webAuthnPasskeys)
    .where(and(eq(webAuthnPasskeys.userId, userId), eq(webAuthnPasskeys.credentialId, credentialId))).limit(1);
  return rows[0] ?? null;
}

export async function savePasskey(userId: number, values: {
  credentialId: string; publicKey: string; counter: number; deviceType: string;
  backedUp: boolean; transports: string[]; name: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(webAuthnPasskeys).values({ userId, ...values });
}

export async function updatePasskeyUsage(id: number, counter: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(webAuthnPasskeys).set({ counter, lastUsedAt: new Date() }).where(eq(webAuthnPasskeys.id, id));
}

export async function saveWebAuthnCeremony(userId: number, type: PasskeyCeremonyType, challenge: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(webAuthnCeremonies).values({ userId, type, challenge, expiresAt: new Date(Date.now() + 5 * 60 * 1000) })
    .onDuplicateKeyUpdate({ set: { challenge, expiresAt: new Date(Date.now() + 5 * 60 * 1000) } });
}

/** Consume challenge before response verification to make every ceremony one-time. */
export async function consumeWebAuthnCeremony(userId: number, type: PasskeyCeremonyType) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const rows = await db.select().from(webAuthnCeremonies)
    .where(and(eq(webAuthnCeremonies.userId, userId), eq(webAuthnCeremonies.type, type))).limit(1);
  await db.delete(webAuthnCeremonies)
    .where(and(eq(webAuthnCeremonies.userId, userId), eq(webAuthnCeremonies.type, type)));
  const ceremony = rows[0];
  return ceremony && ceremony.expiresAt > new Date() ? ceremony.challenge : null;
}
