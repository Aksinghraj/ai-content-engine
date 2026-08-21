import { and, eq } from "drizzle-orm";
import { businessConsentEvents, businessContacts, whatsappBusinessConnections } from "../../drizzle/schema";
import { getDb } from "../db";

export type ContactInput = {
  name?: string;
  email?: string;
  phone?: string;
  emailConsent: boolean;
  whatsappConsent: boolean;
  source: string;
};

export async function listBusinessContacts(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(businessContacts).where(eq(businessContacts.userId, userId));
}

export async function createBusinessContact(userId: number, input: ContactInput) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const now = new Date();
  const values = {
    userId,
    name: input.name || null,
    email: input.email || null,
    phone: input.phone || null,
    source: input.source,
    emailConsent: input.emailConsent,
    emailConsentAt: input.emailConsent ? now : null,
    whatsappConsent: input.whatsappConsent,
    whatsappConsentAt: input.whatsappConsent ? now : null,
  };
  const result = await db.insert(businessContacts).values(values);
  const contactId = Number(result[0].insertId);
  const events = [
    ...(input.emailConsent ? [{ userId, contactId, channel: "email" as const, action: "granted" as const, source: input.source }] : []),
    ...(input.whatsappConsent ? [{ userId, contactId, channel: "whatsapp" as const, action: "granted" as const, source: input.source }] : []),
  ];
  if (events.length) await db.insert(businessConsentEvents).values(events);
  return contactId;
}

export async function withdrawBusinessContactConsent(userId: number, contactId: number, channel: "email" | "whatsapp") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const contact = await db.select().from(businessContacts).where(and(eq(businessContacts.id, contactId), eq(businessContacts.userId, userId))).limit(1);
  if (!contact[0]) return false;
  const now = new Date();
  if (channel === "email") await db.update(businessContacts).set({ emailConsent: false, unsubscribedAt: now }).where(eq(businessContacts.id, contactId));
  else await db.update(businessContacts).set({ whatsappConsent: false, unsubscribedAt: now }).where(eq(businessContacts.id, contactId));
  await db.insert(businessConsentEvents).values({ userId, contactId, channel, action: "withdrawn", source: "owner_action" });
  return true;
}

export async function getWhatsAppBusinessConnection(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const rows = await db.select().from(whatsappBusinessConnections).where(eq(whatsappBusinessConnections.userId, userId)).limit(1);
  return rows[0] ?? null;
}

export async function setWhatsAppBusinessConnectionState(userId: number, status: "not_configured" | "ready_to_link" | "linking" | "connected" | "needs_reconnect" | "error", lastError: string | null = null) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(whatsappBusinessConnections).values({ userId, status, lastError }).onDuplicateKeyUpdate({ set: { status, lastError } });
}
