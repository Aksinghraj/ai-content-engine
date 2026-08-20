import type { Request, Response } from "express";
import { getAutomationScheduleByTaskUid } from "../db";
import { executeAutomation } from "../_core/automationEngine";
import { sdk } from "../_core/sdk";

export async function runScheduledAutomation(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) {
      return res.status(403).json({ error: "cron-only" });
    }

    const schedule = await getAutomationScheduleByTaskUid(user.taskUid);
    if (!schedule || !schedule.isActive) {
      return res.json({ ok: true, skipped: "orphan-or-paused" });
    }

    const result = await executeAutomation(schedule);
    return res.json({ ok: true, scheduleId: schedule.id, postId: result.postId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown scheduled automation error";
    console.error("[Scheduled Automation] Execution failed", error);
    return res.status(500).json({
      error: "scheduled-automation-failed",
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
