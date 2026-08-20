import { describe, expect, it, beforeEach, vi } from "vitest";
import { appRouter } from "../routers";
import * as db from "../db";
import * as heartbeat from "../_core/heartbeat";
import * as socialDb from "../db/social";

vi.mock("../db", () => ({
  createAutomationSchedule: vi.fn(),
  getAutomationSchedulesByUserId: vi.fn(),
  getAutomationScheduleByIdForUser: vi.fn(),
  updateAutomationScheduleForUser: vi.fn(),
  deleteAutomationScheduleForUser: vi.fn(),
}));

vi.mock("../_core/heartbeat", () => ({
  createHeartbeatJob: vi.fn(),
  updateHeartbeatJob: vi.fn(),
  deleteHeartbeatJob: vi.fn(),
}));

vi.mock("../db/social", () => ({
  getSocialConnectionByPlatform: vi.fn(),
}));

const context = () => ({
  user: { id: 7, openId: "user-7", name: "Test User", email: "test@example.com", role: "user" },
  req: { headers: { cookie: "app_session_id=test-session" } },
  res: {},
}) as any;

const createdSchedule = {
  id: 42,
  userId: 7,
  name: "Daily X post",
  niche: "Technology",
  targetAudience: "Founders",
  platform: "twitter",
  goal: "Engagement",
  contentStyle: "Professional",
  cronExpression: "0 0 9 * * *",
  scheduleCronTaskUid: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("Heartbeat-backed automation router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(socialDb.getSocialConnectionByPlatform).mockResolvedValue({
      isConnected: true,
      isValidated: true,
      autoPost: true,
    } as any);
  });

  it("creates a six-field Heartbeat job and persists its task UID", async () => {
    vi.mocked(db.createAutomationSchedule).mockResolvedValue(createdSchedule as any);
    vi.mocked(heartbeat.createHeartbeatJob).mockResolvedValue({ taskUid: "task-42", nextExecutionAt: null });
    vi.mocked(db.updateAutomationScheduleForUser).mockResolvedValue({ ...createdSchedule, scheduleCronTaskUid: "task-42" } as any);
    vi.mocked(db.getAutomationSchedulesByUserId).mockResolvedValue([{ ...createdSchedule, scheduleCronTaskUid: "task-42" }] as any);

    const result = await appRouter.createCaller(context()).automation.create({
      name: "Daily X post",
      niche: "Technology",
      targetAudience: "Founders",
      platform: "twitter",
      goal: "Engagement",
      contentStyle: "Professional",
      cronExpression: "0 9 * * *",
    });

    expect(heartbeat.createHeartbeatJob).toHaveBeenCalledWith(
      expect.objectContaining({ cron: "0 0 9 * * *", path: "/api/scheduled/social-automation" }),
      "test-session",
    );
    expect(db.updateAutomationScheduleForUser).toHaveBeenCalledWith(42, 7, { scheduleCronTaskUid: "task-42" });
    expect(result.success).toBe(true);
    expect(result.data?.scheduleCronTaskUid).toBe("task-42");
  });

  it("updates an owned durable job before updating its schedule row", async () => {
    vi.mocked(db.getAutomationScheduleByIdForUser).mockResolvedValue({ ...createdSchedule, scheduleCronTaskUid: "task-42" } as any);
    vi.mocked(heartbeat.updateHeartbeatJob).mockResolvedValue({ nextExecutionAt: null });
    vi.mocked(db.updateAutomationScheduleForUser).mockResolvedValue({ ...createdSchedule, cronExpression: "0 0 10 * * *" } as any);

    const result = await appRouter.createCaller(context()).automation.update({
      id: "42",
      cronExpression: "0 10 * * *",
      isActive: false,
    });

    expect(heartbeat.updateHeartbeatJob).toHaveBeenCalledWith(
      "task-42",
      expect.objectContaining({ cron: "0 0 10 * * *", enable: false }),
      "test-session",
    );
    expect(result.success).toBe(true);
  });

  it("deletes the owned Heartbeat job before deleting its schedule row", async () => {
    vi.mocked(db.getAutomationScheduleByIdForUser).mockResolvedValue({ ...createdSchedule, scheduleCronTaskUid: "task-42" } as any);
    vi.mocked(heartbeat.deleteHeartbeatJob).mockResolvedValue(undefined);
    vi.mocked(db.deleteAutomationScheduleForUser).mockResolvedValue({} as any);

    const result = await appRouter.createCaller(context()).automation.delete({ id: "42" });

    expect(heartbeat.deleteHeartbeatJob).toHaveBeenCalledWith("task-42", "test-session");
    expect(db.deleteAutomationScheduleForUser).toHaveBeenCalledWith(42, 7);
    expect(result.success).toBe(true);
  });

  it("rejects a schedule before creating a durable job when Auto-Post is disabled", async () => {
    vi.mocked(socialDb.getSocialConnectionByPlatform).mockResolvedValue({
      isConnected: true,
      isValidated: true,
      autoPost: false,
    } as any);

    await expect(appRouter.createCaller(context()).automation.create({
      name: "Daily X post",
      niche: "Technology",
      targetAudience: "Founders",
      platform: "twitter",
      goal: "Engagement",
      contentStyle: "Professional",
      cronExpression: "0 9 * * *",
    })).rejects.toThrow("Enable Auto-Post");
    expect(heartbeat.createHeartbeatJob).not.toHaveBeenCalled();
  });
});
