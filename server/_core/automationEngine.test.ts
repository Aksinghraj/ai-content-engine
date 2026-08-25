import { beforeEach, describe, expect, it, vi } from "vitest";
import { executeAutomation } from "./automationEngine";
import * as db from "../db";
import * as socialDb from "../db/social";
import * as generator from "./contentGenerator";
import * as publisher from "./socialMediaPosting";

vi.mock("../db", () => ({
  saveContentHistory: vi.fn(),
  logAutomationExecution: vi.fn(),
}));
vi.mock("../db/social", () => ({ getSocialConnectionByPlatform: vi.fn() }));
vi.mock("./contentGenerator", () => ({ generateContentPackage: vi.fn() }));
vi.mock("./socialMediaPosting", () => ({ postToMultiplePlatforms: vi.fn() }));

const schedule = {
  id: 5,
  userId: 7,
  name: "Daily Instagram post",
  niche: "Technology",
  targetAudience: "Founders",
  platform: "instagram",
  goal: "Engagement",
  contentStyle: "Professional",
  cronExpression: "0 0 9 * * *",
  scheduleCronTaskUid: "task-5",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
} as any;

const generatedContent = { caption: "A useful update", hashtags: ["lumae"] } as any;

describe("scheduled social automation execution", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(generator.generateContentPackage).mockResolvedValue(generatedContent);
    vi.mocked(db.saveContentHistory).mockResolvedValue(undefined as any);
    vi.mocked(db.logAutomationExecution).mockResolvedValue(undefined as any);
  });

  it("refuses to publish when Auto-Post is disabled", async () => {
    vi.mocked(socialDb.getSocialConnectionByPlatform).mockResolvedValue({ isConnected: true, isValidated: true, autoPost: false } as any);

    await expect(executeAutomation(schedule)).rejects.toThrow("Auto-Post is disabled");
    expect(publisher.postToMultiplePlatforms).not.toHaveBeenCalled();
    expect(db.logAutomationExecution).toHaveBeenCalledWith(7, 5, "failed", undefined, expect.stringContaining("Auto-Post"));
  });

  it("publishes and logs the provider post ID for a connected Auto-Post account", async () => {
    vi.mocked(socialDb.getSocialConnectionByPlatform).mockResolvedValue({ isConnected: true, isValidated: true, autoPost: true } as any);
    vi.mocked(publisher.postToMultiplePlatforms).mockResolvedValue([{ platform: "instagram", success: true, postId: "post-1" }]);

    await expect(executeAutomation(schedule)).resolves.toMatchObject({ success: true, postId: "post-1" });
    expect(publisher.postToMultiplePlatforms).toHaveBeenCalledWith(7, ["instagram"], expect.objectContaining({ text: "A useful update" }));
    expect(db.logAutomationExecution).toHaveBeenCalledWith(7, 5, "success", expect.objectContaining({ published: { platform: "instagram", postId: "post-1" } }));
  });

  it("refuses scheduled X execution before generating content", async () => {
    await expect(executeAutomation({ ...schedule, platform: "twitter" })).rejects.toThrow("Twitter/X execution is locked");
    expect(generator.generateContentPackage).not.toHaveBeenCalled();
  });
});
