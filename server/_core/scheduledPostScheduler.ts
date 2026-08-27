import type { Request, Response } from "express";
import { getSocialConnectionByPlatform, claimDueScheduledPosts, updateScheduledPostStatus } from "../db/social";
import { postToMultiplePlatforms } from "./socialMediaPosting";
import { createHeartbeatJob, listHeartbeatJobs } from "./heartbeat";
import { sdk } from "./sdk";

const JOB_NAME = "global-scheduled-social-post-dispatcher";
const JOB_PATH = "/api/scheduled/social-posts";

/** Registers one idempotent project-level dispatcher for due user posts. */
export async function ensureScheduledPostDispatcher(): Promise<void> {
  const existing = await listHeartbeatJobs("");
  if (existing.jobs.some((job) => job.name === JOB_NAME)) return;
  await createHeartbeatJob({
    name: JOB_NAME,
    cron: "0 * * * * *",
    path: JOB_PATH,
    method: "POST",
    description: "Dispatches due Lumae user-owned social posts every minute.",
  }, "");
}

function readinessError(connection: Awaited<ReturnType<typeof getSocialConnectionByPlatform>>, platform: string) {
  if (!connection?.isConnected || !connection.isValidated) return `The ${platform} connection is no longer validated.`;
  if (connection.tokenExpiresAt && connection.tokenExpiresAt.getTime() <= Date.now()) return `The ${platform} access token has expired.`;
  if (!connection.autoPost) return `Auto-Post is disabled for ${platform}.`;
  return null;
}

/**
 * Durable Heartbeat callback. It returns 2xx after recording each individual
 * provider outcome to avoid retries that could duplicate a social post.
 */
export async function runScheduledPosts(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });

    const posts = await claimDueScheduledPosts();
    let published = 0;
    let failed = 0;
    for (const post of posts) {
      try {
        const connection = await getSocialConnectionByPlatform(post.userId, post.platform);
        const notReady = readinessError(connection, post.platform);
        if (notReady) {
          await updateScheduledPostStatus(post.id, "failed", undefined, notReady);
          failed += 1;
          continue;
        }

        const [result] = await postToMultiplePlatforms(post.userId, [post.platform], {
          text: post.content,
          imageUrl: post.mediaType === "image" ? post.mediaUrl || undefined : undefined,
          videoUrl: post.mediaType === "video" ? post.mediaUrl || undefined : undefined,
        });
        if (!result?.success) {
          await updateScheduledPostStatus(post.id, "failed", undefined, result?.error || `Unable to publish to ${post.platform}.`);
          failed += 1;
          continue;
        }
        await updateScheduledPostStatus(post.id, "published", result.postId);
        published += 1;
      } catch (error) {
        await updateScheduledPostStatus(post.id, "failed", undefined, error instanceof Error ? error.message : "Unknown publishing error");
        failed += 1;
      }
    }
    return res.json({ ok: true, claimed: posts.length, published, failed });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown scheduled post dispatcher error";
    console.error("[Scheduled Posts] Dispatcher failed", error);
    return res.status(500).json({ error: "scheduled-post-dispatch-failed", message, timestamp: new Date().toISOString() });
  }
}
