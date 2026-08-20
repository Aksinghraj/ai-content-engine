import type { Request, Response } from "express";
import { sdk } from "../_core/sdk";
import { refreshUnifiedTrends } from "../_core/trendService";

export async function refreshScheduledTrends(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron) return res.status(403).json({ error: "cron-only" });
    const payload = await refreshUnifiedTrends(true);
    return res.json({ ok: true, count: payload.topics.length, generatedAt: payload.generatedAt });
  } catch (error) {
    console.error("[Trend Refresh] Scheduled refresh failed", error);
    return res.status(500).json({ error: "trend-refresh-failed" });
  }
}
