import { desc, eq } from "drizzle-orm";
import { userFeedback } from "../../drizzle/schema";
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
}) {
  const database = await getDb();
  if (!database) throw new Error("Feedback is temporarily unavailable. Please try again shortly.");
  const [created] = await database.insert(userFeedback).values({
    ...input,
    pagePath: input.pagePath || null,
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
      createdAt: userFeedback.createdAt,
    })
    .from(userFeedback)
    .where(eq(userFeedback.userId, userId))
    .orderBy(desc(userFeedback.createdAt))
    .limit(5);
}
