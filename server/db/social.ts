import { getDb } from "../db";
import { socialConnections, scheduledPosts, socialPostDrafts } from "../../drizzle/schema";
import { eq, and, desc, lte, or } from "drizzle-orm";
import { encrypt } from "../_core/encryption";

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

  const encryptedAccessToken = encrypt(accessToken);
  const encryptedRefreshToken = refreshToken ? encrypt(refreshToken) : undefined;

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
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenExpiresAt,
        platformUserId,
        isConnected: true,
        updatedAt: new Date(),
      })
      .where(eq(socialConnections.id, existing[0].id));

    return { ...existing[0], accessToken: "", refreshToken: null };
  } else {
    // Create new connection
    const result = await db.insert(socialConnections).values({
      userId,
      platform,
      username,
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
      tokenExpiresAt,
      platformUserId,
      isConnected: true,
    });

    return {
      id: (result as any).insertId as number,
      userId,
      platform,
      username,
      accessToken: "",
      refreshToken: undefined,
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
 * Get connection by userId and platform
 */
export async function getSocialConnectionByPlatform(userId: number, platform: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db
    .select()
    .from(socialConnections)
    .where(
      and(
        eq(socialConnections.userId, userId),
        eq(socialConnections.platform, platform)
      )
    )
    .limit(1);

  return result[0] || null;
}

/**
 * Update social connection
 */
export async function updateSocialConnection(connectionId: number, data: Partial<any>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(socialConnections)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(socialConnections.id, connectionId));
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
      isValidated: false,
      accessToken: "",
      refreshToken: null,
      tokenExpiresAt: null,
      autoPost: false,
      autoReply: false,
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
 * Claims due work atomically so a retrying Heartbeat callback cannot publish
 * the same social post twice. A stale claim may be reclaimed after five
 * minutes, which handles process termination during provider calls.
 */
export async function claimDueScheduledPosts(limit = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const now = new Date();
  const staleThreshold = new Date(now.getTime() - 5 * 60 * 1000);
  const candidates = await db
    .select()
    .from(scheduledPosts)
    .where(and(
      lte(scheduledPosts.scheduledAt, now),
      or(
        eq(scheduledPosts.status, "pending"),
        and(eq(scheduledPosts.status, "processing"), lte(scheduledPosts.updatedAt, staleThreshold)),
      ),
    ))
    .orderBy(scheduledPosts.scheduledAt)
    .limit(limit);

  const claimed = [] as typeof candidates;
  for (const candidate of candidates) {
    const result = await db
      .update(scheduledPosts)
      .set({ status: "processing", updatedAt: now, errorMessage: null })
      .where(and(
        eq(scheduledPosts.id, candidate.id),
        or(
          eq(scheduledPosts.status, "pending"),
          and(eq(scheduledPosts.status, "processing"), lte(scheduledPosts.updatedAt, staleThreshold)),
        ),
      ));
    if ((result as any).rowsAffected === 1 || (result as any).affectedRows === 1) {
      claimed.push({ ...candidate, status: "processing" as const, updatedAt: now });
    }
  }
  return claimed;
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

export async function createSocialPostDraft(
  userId: number,
  draft: {
    title?: string;
    content: string;
    platforms: string[];
    hashtags: string[];
    mentions: string[];
    mediaUrl?: string;
    mediaType?: "image" | "video";
    mediaKey?: string;
  },
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(socialPostDrafts).values({ userId, ...draft });
  return {
    id: (result as any).insertId as number,
    userId,
    ...draft,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function getSocialPostDrafts(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .select()
    .from(socialPostDrafts)
    .where(eq(socialPostDrafts.userId, userId))
    .orderBy(desc(socialPostDrafts.updatedAt));
}

export async function deleteSocialPostDraft(userId: number, draftId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .delete(socialPostDrafts)
    .where(and(eq(socialPostDrafts.id, draftId), eq(socialPostDrafts.userId, userId)));
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
