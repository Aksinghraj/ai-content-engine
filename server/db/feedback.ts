import { and, asc, desc, eq, gte, lte } from "drizzle-orm";
import { userFeedback, users } from "../../drizzle/schema";
import { getDb } from "../db";

export type FeedbackCategory = "glitch" | "problem" | "suggestion" | "feature_request" | "other";

export async function getLatestFeedbackForUser(userId: number) {
  const database = await getDb();
  if (!database) return null;
  const [latest] = await database
    .select({ id: userFeedback.id, createdAt: userFeedback.createdAt })
    .from(userFeedback)
    .where(eq(userFeedback.userId, userId))
    .orderBy(desc(userFeedback.createdAt))
    .limit(1);
  return latest ?? null;
}

export async function createUserFeedback(input: {
  userId: number;
  rating: number;
  category: FeedbackCategory;
  message: string;
  pagePath?: string;
  attachmentKey?: string;
  attachmentMimeType?: string;
  attachmentName?: string;
}) {
  const database = await getDb();
  if (!database) throw new Error("Feedback is temporarily unavailable. Please try again shortly.");
  const [created] = await database.insert(userFeedback).values({
    ...input,
    pagePath: input.pagePath || null,
    attachmentKey: input.attachmentKey || null,
    attachmentMimeType: input.attachmentMimeType || null,
    attachmentName: input.attachmentName || null,
  }).$returningId();
  return created;
}

export async function getRecentFeedbackForUser(userId: number) {
  const database = await getDb();
  if (!database) return [];
  return database
    .select({
      id: userFeedback.id,
      rating: userFeedback.rating,
      category: userFeedback.category,
      status: userFeedback.status,
      hasAttachment: userFeedback.attachmentKey,
      createdAt: userFeedback.createdAt,
    })
    .from(userFeedback)
    .where(eq(userFeedback.userId, userId))
    .orderBy(desc(userFeedback.createdAt))
    .limit(5);
}

export type OwnerFeedbackFilters = {
  status?: "new" | "reviewed" | "resolved";
  category?: FeedbackCategory;
  rating?: number;
  from?: string;
  to?: string;
  sortBy?: "createdAt" | "rating";
  sortDirection?: "asc" | "desc";
};

export async function getFeedbackForOwner(filters: OwnerFeedbackFilters = {}) {
  const database = await getDb();
  if (!database) return [];
  const conditions = [
    filters.status ? eq(userFeedback.status, filters.status) : undefined,
    filters.category ? eq(userFeedback.category, filters.category) : undefined,
    filters.rating ? eq(userFeedback.rating, filters.rating) : undefined,
    filters.from ? gte(userFeedback.createdAt, new Date(`${filters.from}T00:00:00.000Z`)) : undefined,
    filters.to ? lte(userFeedback.createdAt, new Date(`${filters.to}T23:59:59.999Z`)) : undefined,
  ].filter(Boolean);
  const orderColumn = filters.sortBy === "rating" ? userFeedback.rating : userFeedback.createdAt;
  const orderDirection = filters.sortDirection === "asc" ? asc(orderColumn) : desc(orderColumn);
  return database
    .select({
      id: userFeedback.id,
      rating: userFeedback.rating,
      category: userFeedback.category,
      message: userFeedback.message,
      pagePath: userFeedback.pagePath,
      status: userFeedback.status,
      attachmentKey: userFeedback.attachmentKey,
      attachmentMimeType: userFeedback.attachmentMimeType,
      attachmentName: userFeedback.attachmentName,
      createdAt: userFeedback.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(userFeedback)
    .leftJoin(users, eq(userFeedback.userId, users.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(orderDirection)
    .limit(100);
}

export async function updateFeedbackStatus(id: number, status: "new" | "reviewed" | "resolved") {
  const database = await getDb();
  if (!database) throw new Error("Feedback review is temporarily unavailable.");
  const [existing] = await database
    .select({ status: userFeedback.status, category: userFeedback.category, userName: users.name, userEmail: users.email })
    .from(userFeedback)
    .leftJoin(users, eq(userFeedback.userId, users.id))
    .where(eq(userFeedback.id, id))
    .limit(1);
  if (!existing) return null;
  await database.update(userFeedback).set({ status }).where(eq(userFeedback.id, id));
  return existing;
}
