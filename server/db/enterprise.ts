import { eq, and, desc } from "drizzle-orm";
import {
  engagementEvents,
  knowledgeBase,
  autoReplyRules,
  repurposedContent,
  platformAnalytics,
  neulinkIntegration,
  type InsertEngagementEvent,
  type InsertKnowledgeBase,
  type InsertAutoReplyRule,
  type InsertRepurposedContent,
  type InsertPlatformAnalytics,
  type InsertNeulinkIntegration,
} from "../../drizzle/schema";
import { getDb } from "../db";

/**
 * Engagement Events
 */
export async function createEngagementEvent(data: InsertEngagementEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(engagementEvents).values(data);
  return result;
}

export async function getEngagementEvents(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .select()
    .from(engagementEvents)
    .where(eq(engagementEvents.userId, userId))
    .orderBy(desc(engagementEvents.createdAt))
    .limit(limit);
}

export async function getEscalatedEvents(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .select()
    .from(engagementEvents)
    .where(
      and(
        eq(engagementEvents.userId, userId),
        eq(engagementEvents.isEscalated, true)
      )
    )
    .orderBy(desc(engagementEvents.createdAt));
}

export async function updateEngagementEvent(
  eventId: number,
  data: Partial<InsertEngagementEvent>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(engagementEvents)
    .set(data)
    .where(eq(engagementEvents.id, eventId));
}

/**
 * Knowledge Base
 */
export async function createKnowledgeBase(data: InsertKnowledgeBase) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(knowledgeBase).values(data);
}

export async function getKnowledgeBase(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .select()
    .from(knowledgeBase)
    .where(
      and(
        eq(knowledgeBase.userId, userId),
        eq(knowledgeBase.isActive, true)
      )
    );
}

export async function updateKnowledgeBase(
  id: number,
  data: Partial<InsertKnowledgeBase>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(knowledgeBase).set(data).where(eq(knowledgeBase.id, id));
}

export async function deleteKnowledgeBase(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(knowledgeBase).where(eq(knowledgeBase.id, id));
}

/**
 * Auto-Reply Rules
 */
export async function createAutoReplyRule(data: InsertAutoReplyRule) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(autoReplyRules).values(data);
}

export async function getAutoReplyRules(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .select()
    .from(autoReplyRules)
    .where(
      and(
        eq(autoReplyRules.userId, userId),
        eq(autoReplyRules.isActive, true)
      )
    );
}

export async function updateAutoReplyRule(
  id: number,
  data: Partial<InsertAutoReplyRule>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(autoReplyRules)
    .set(data)
    .where(eq(autoReplyRules.id, id));
}

/**
 * Repurposed Content
 */
export async function createRepurposedContent(data: InsertRepurposedContent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(repurposedContent).values(data);
}

export async function getRepurposedContent(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .select()
    .from(repurposedContent)
    .where(eq(repurposedContent.userId, userId))
    .orderBy(desc(repurposedContent.createdAt));
}

export async function getRepurposedContentById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db
    .select()
    .from(repurposedContent)
    .where(eq(repurposedContent.id, id));
  return result[0];
}

/**
 * Platform Analytics
 */
export async function createPlatformAnalytics(data: InsertPlatformAnalytics) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(platformAnalytics).values(data);
}

export async function getPlatformAnalytics(userId: number, days = 30) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .select()
    .from(platformAnalytics)
    .where(
      and(
        eq(platformAnalytics.userId, userId)
      )
    )
    .orderBy(desc(platformAnalytics.date));
}

export async function updatePlatformAnalytics(
  id: number,
  data: Partial<InsertPlatformAnalytics>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(platformAnalytics)
    .set(data)
    .where(eq(platformAnalytics.id, id));
}

/**
 * Nuelink Integration
 */
export async function createNeulinkIntegration(data: InsertNeulinkIntegration) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(neulinkIntegration).values(data);
}

export async function getNeulinkIntegration(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db
    .select()
    .from(neulinkIntegration)
    .where(
      and(
        eq(neulinkIntegration.userId, userId),
        eq(neulinkIntegration.isActive, true)
      )
    );
  return result[0];
}

export async function updateNeulinkIntegration(
  id: number,
  data: Partial<InsertNeulinkIntegration>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(neulinkIntegration)
    .set(data)
    .where(eq(neulinkIntegration.id, id));
}

export async function deleteNeulinkIntegration(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(neulinkIntegration).where(eq(neulinkIntegration.id, id));
}
