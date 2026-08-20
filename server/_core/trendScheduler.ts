import { createHeartbeatJob, listHeartbeatJobs } from "./heartbeat";

const JOB_NAME = "global-unified-trend-refresh";

/** Registers one owner-scoped durable refresh job; safe to call on server restarts. */
export async function ensureTrendRefreshJob(): Promise<void> {
  const existing = await listHeartbeatJobs("");
  if (existing.jobs.some((job) => job.name === JOB_NAME)) return;
  await createHeartbeatJob({
    name: JOB_NAME,
    cron: "0 0 */3 * * *",
    path: "/api/scheduled/trends/refresh",
    method: "POST",
    description: "Refreshes the shared cached YouTube Live and AI-estimated social trend feed every three hours.",
  }, "");
}
