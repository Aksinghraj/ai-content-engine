import { eq } from "drizzle-orm";
import { accountLanguagePreferences } from "../../drizzle/schema";
import { getDb } from "../db";

export async function getAccountLanguage(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [preference] = await db.select().from(accountLanguagePreferences).where(eq(accountLanguagePreferences.userId, userId));
  return preference?.language ?? "en";
}

export async function saveAccountLanguage(userId: number, language: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(accountLanguagePreferences).values({ userId, language }).onDuplicateKeyUpdate({ set: { language } });
  return language;
}
