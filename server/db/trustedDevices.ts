import crypto from "crypto";
import { and, eq, lt } from "drizzle-orm";
import { trustedDevices } from "../../drizzle/schema";
import { createHMAC } from "../_core/encryption";
import { getDb } from "../db";

export const TRUSTED_DEVICE_DAYS = [1, 7, 30] as const;
export type TrustedDeviceDays = typeof TRUSTED_DEVICE_DAYS[number];
export const TRUSTED_DEVICE_COOKIE = "lumae_trusted_device";

export async function createTrustedDevice(userId: number, days: TrustedDeviceDays) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  await db.insert(trustedDevices).values({ userId, tokenHash: createHMAC(token), expiresAt });
  return { token, expiresAt };
}

export async function validateTrustedDevice(userId: number, token: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(trustedDevices)
    .where(and(eq(trustedDevices.userId, userId), eq(trustedDevices.tokenHash, createHMAC(token)))).limit(1);
  const device = rows[0];
  if (!device) return null;
  if (device.expiresAt <= new Date()) {
    await db.delete(trustedDevices).where(eq(trustedDevices.id, device.id));
    return null;
  }
  await db.update(trustedDevices).set({ lastUsedAt: new Date() }).where(eq(trustedDevices.id, device.id));
  return device;
}

export async function getTrustedDevices(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(trustedDevices).where(and(eq(trustedDevices.userId, userId), lt(trustedDevices.expiresAt, new Date())));
  return db.select({ id: trustedDevices.id, expiresAt: trustedDevices.expiresAt, lastUsedAt: trustedDevices.lastUsedAt, createdAt: trustedDevices.createdAt })
    .from(trustedDevices).where(eq(trustedDevices.userId, userId));
}

export async function revokeTrustedDevice(userId: number, deviceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(trustedDevices).where(and(eq(trustedDevices.userId, userId), eq(trustedDevices.id, deviceId)));
}

export async function revokeAllTrustedDevices(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(trustedDevices).where(eq(trustedDevices.userId, userId));
}
