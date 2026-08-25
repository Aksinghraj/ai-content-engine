import type { AutomationSchedule } from "../../drizzle/schema";
import { logAutomationExecution, saveContentHistory } from "../db";
import { getSocialConnectionByPlatform } from "../db/social";
import { generateContentPackage } from "./contentGenerator";
import { postToMultiplePlatforms } from "./socialMediaPosting";

const PUBLISHABLE_PLATFORMS = new Set([
  "instagram",
  "facebook",
  "twitter",
  "linkedin",
  "youtube",
  "tiktok",
]);

/**
 * The platform-managed Heartbeat callback invokes this executor. No in-process
 * timers are used, so schedules survive autoscaling and sandbox restarts.
 */
export async function executeAutomation(schedule: AutomationSchedule) {
  try {
    if (schedule.platform === "twitter") {
      throw new Error("Twitter/X execution is locked until an owner-approved API usage budget is configured");
    }

    const generatedContent = await generateContentPackage({
      niche: schedule.niche,
      targetAudience: schedule.targetAudience,
      platform: schedule.platform,
      goal: schedule.goal,
      contentStyle: schedule.contentStyle,
    });

    await saveContentHistory({
      userId: schedule.userId,
      niche: schedule.niche,
      targetAudience: schedule.targetAudience,
      platform: schedule.platform,
      goal: schedule.goal,
      contentStyle: schedule.contentStyle,
      generatedContent: generatedContent as any,
    });

    if (!PUBLISHABLE_PLATFORMS.has(schedule.platform)) {
      throw new Error(`Unsupported scheduled publishing platform: ${schedule.platform}`);
    }

    const connection = await getSocialConnectionByPlatform(schedule.userId, schedule.platform);
    if (!connection?.isConnected) {
      throw new Error(`${schedule.platform} account is not connected`);
    }
    if (!connection.isValidated) {
      throw new Error(`${schedule.platform} account needs to be reconnected before automation can run`);
    }
    if (connection.tokenExpiresAt && connection.tokenExpiresAt.getTime() <= Date.now()) {
      throw new Error(`${schedule.platform} access token has expired; reconnect the account before automation can run`);
    }
    if (!connection.autoPost) {
      throw new Error(`Auto-Post is disabled for the connected ${schedule.platform} account`);
    }

    const [publishResult] = await postToMultiplePlatforms(
      schedule.userId,
      [schedule.platform],
      {
        text: generatedContent.caption,
        hashtags: generatedContent.hashtags,
      },
    );

    if (!publishResult?.success) {
      throw new Error(publishResult?.error || `Failed to publish to ${schedule.platform}`);
    }

    const execution = {
      generatedContent,
      published: {
        platform: schedule.platform,
        postId: publishResult.postId,
      },
    };

    await logAutomationExecution(schedule.userId, schedule.id, "success", execution);
    return { success: true, scheduleId: schedule.id, postId: publishResult.postId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown automation error";
    await logAutomationExecution(schedule.userId, schedule.id, "failed", undefined, message);
    throw error;
  }
}

/** Kept only for server startup compatibility; Heartbeat owns all actual schedules. */
export async function initializeAutomationEngine() {
  console.log("[Automation] Heartbeat-managed scheduling enabled; no in-process jobs started.");
}
