import { getDb } from "../db";
import { socialConnections, scheduledPosts } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * Save or update a social media connection
 */
export async function saveSocialConnection(
  userId: number,
  platform: string,
  username: string,
  accessToken: string,
  platformUserId: string,
  refreshToken?: string,
  tokenExpiresAt?: Date
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(socialConnections)
    .where(
      and(
        eq(socialConnections.userId, userId),
        eq(socialConnections.platform, platform)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Update existing connection
    await db
      .update(socialConnections)
      .set({
        username,
        accessToken,
        refreshToken,
        tokenExpiresAt,
        platformUserId,
        isConnected: true,
        updatedAt: new Date(),
      })
      .where(eq(socialConnections.id, existing[0].id));

    return existing[0];
  } else {
    // Create new connection
    const result = await db.insert(socialConnections).values({
      userId,
      platform,
      username,
      accessToken,
      refreshToken,
      tokenExpiresAt,
      platformUserId,
      isConnected: true,
    });

    return {
      id: (result as any).insertId as number,
      userId,
      platform,
      username,
      accessToken,
      refreshToken,
      tokenExpiresAt,
      platformUserId,
      isConnected: true,
      autoPost: false,
      autoReply: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

/**
 * Get all connected social accounts for a user
 */
export async function getUserSocialConnections(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .select()
    .from(socialConnections)
    .where(
      and(
        eq(socialConnections.userId, userId),
        eq(socialConnections.isConnected, true)
      )
    );
}

/**
 * Get a specific social connection
 */
export async function getSocialConnection(connectionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db
    .select()
    .from(socialConnections)
    .where(eq(socialConnections.id, connectionId))
    .limit(1);

  return result[0] || null;
}

/**
 * Disconnect a social account
 */
export async function disconnectSocialAccount(userId: number, connectionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(socialConnections)
    .set({
      isConnected: false,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(socialConnections.id, connectionId),
        eq(socialConnections.userId, userId)
      )
    );
}

/**
 * Create a scheduled post
 */
export async function createScheduledPost(
  userId: number,
  socialConnectionId: number,
  platform: string,
  content: string,
  scheduledAt: Date,
  mediaUrl?: string,
  mediaType?: "image" | "video",
  mediaKey?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(scheduledPosts).values({
    userId,
    socialConnectionId,
    platform,
    content,
    scheduledAt,
    mediaUrl,
    mediaType,
    mediaKey,
    status: "pending",
  });

  return {
    id: (result as any).insertId as number,
    userId,
    socialConnectionId,
    platform,
    content,
    scheduledAt,
    mediaUrl,
    mediaType,
    mediaKey,
    status: "pending" as const,
    publishedAt: null,
    errorMessage: null,
    platformPostId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Get scheduled posts for a user
 */
export async function getUserScheduledPosts(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .select()
    .from(scheduledPosts)
    .where(eq(scheduledPosts.userId, userId))
    .orderBy(scheduledPosts.scheduledAt);
}

/**
 * Get pending scheduled posts (ready to be published)
 */
export async function getPendingScheduledPosts() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .select()
    .from(scheduledPosts)
    .where(
      and(
        eq(scheduledPosts.status, "pending"),
        // scheduledAt is in the past or now
        // This is handled by the automation engine
      )
    );
}

/**
 * Update scheduled post status after publishing
 */
export async function updateScheduledPostStatus(
  postId: number,
  status: "published" | "failed",
  platformPostId?: string,
  errorMessage?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(scheduledPosts)
    .set({
      status,
      platformPostId,
      errorMessage,
      publishedAt: status === "published" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(scheduledPosts.id, postId));
}

/**
 * Delete a scheduled post
 */
export async function deleteScheduledPost(userId: number, postId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .delete(scheduledPosts)
    .where(
      and(
        eq(scheduledPosts.id, postId),
        eq(scheduledPosts.userId, userId)
      )
    );
}

/**
 * Update auto-post/auto-reply settings
 */
export async function updateSocialConnectionSettings(
  connectionId: number,
  userId: number,
  autoPost?: boolean,
  autoReply?: boolean
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updates: any = { updatedAt: new Date() };
  if (autoPost !== undefined) updates.autoPost = autoPost;
  if (autoReply !== undefined) updates.autoReply = autoReply;

  await db
    .update(socialConnections)
    .set(updates)
    .where(
      and(
        eq(socialConnections.id, connectionId),
        eq(socialConnections.userId, userId)
      )
    );
}
