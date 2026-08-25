import { and, desc, eq } from "drizzle-orm";
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

export async function getFeedbackForOwner(status?: "new" | "reviewed" | "resolved") {
  const database = await getDb();
  if (!database) return [];
  const query = database
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
    .orderBy(desc(userFeedback.createdAt));
  return status ? query.where(eq(userFeedback.status, status)).limit(100) : query.limit(100);
}

export async function updateFeedbackStatus(id: number, status: "new" | "reviewed" | "resolved") {
  const database = await getDb();
  if (!database) throw new Error("Feedback review is temporarily unavailable.");
  await database.update(userFeedback).set({ status }).where(eq(userFeedback.id, id));
}
