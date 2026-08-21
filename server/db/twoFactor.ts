import { and, eq } from "drizzle-orm";
import { twoFactorAuthenticators } from "../../drizzle/schema";
import { getDb } from "../db";

export async function getTwoFactorAuthenticator(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const rows = await db.select().from(twoFactorAuthenticators).where(eq(twoFactorAuthenticators.userId, userId)).limit(1);
  return rows[0] ?? null;
}

export async function isTwoFactorEnabled(userId: number): Promise<boolean> {
  const authenticator = await getTwoFactorAuthenticator(userId);
  return authenticator?.isEnabled === true;
}

export async function savePendingTwoFactorSecret(userId: number, encryptedSecret: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(twoFactorAuthenticators).values({
    userId,
    encryptedSecret,
    recoveryCodeHashes: null,
    isEnabled: false,
  }).onDuplicateKeyUpdate({
    set: {
      encryptedSecret,
      recoveryCodeHashes: null,
      isEnabled: false,
      enabledAt: null,
    },
  });
}

export async function enableTwoFactorAuthenticator(userId: number, recoveryCodeHashes: string[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(twoFactorAuthenticators).set({
    recoveryCodeHashes,
    isEnabled: true,
    enabledAt: new Date(),
  }).where(and(eq(twoFactorAuthenticators.userId, userId), eq(twoFactorAuthenticators.isEnabled, false)));
}

export async function consumeRecoveryCode(userId: number, remainingRecoveryCodeHashes: string[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(twoFactorAuthenticators).set({ recoveryCodeHashes: remainingRecoveryCodeHashes })
    .where(and(eq(twoFactorAuthenticators.userId, userId), eq(twoFactorAuthenticators.isEnabled, true)));
}

export async function replaceRecoveryCodeHashes(userId: number, recoveryCodeHashes: string[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(twoFactorAuthenticators).set({ recoveryCodeHashes })
    .where(and(eq(twoFactorAuthenticators.userId, userId), eq(twoFactorAuthenticators.isEnabled, true)));
}

export async function deleteTwoFactorAuthenticator(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(twoFactorAuthenticators).where(eq(twoFactorAuthenticators.userId, userId));
}
