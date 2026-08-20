import { beforeEach, describe, expect, it, vi } from "vitest";
import { TrpcContext } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { freeTierRouter } from "./freeTier";
import * as freeUsage from "../freeTierUsage";

vi.mock("../_core/llm", () => ({ invokeLLM: vi.fn() }));
vi.mock("../freeTierUsage", () => ({
  BASIC_SCRIPT_DAILY_LIMIT: 3,
  getBasicScriptUsage: vi.fn(),
  reserveBasicScriptGeneration: vi.fn(),
  releaseBasicScriptGeneration: vi.fn(),
}));

const context = (): TrpcContext => ({
  user: { id: 42, openId: "free-tier-test", role: "user", subscriptionTier: "free" } as any,
  req: { headers: {} } as any,
  res: {} as any,
});

const availableUsage = {
  available: true,
  count: 1,
  limit: 3,
  remaining: 2,
  resetAt: new Date("2026-08-21T00:00:00.000Z"),
};

describe("Basic Script Generation free tier", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(freeUsage.getBasicScriptUsage).mockResolvedValue(availableUsage);
    vi.mocked(freeUsage.reserveBasicScriptGeneration).mockResolvedValue(availableUsage);
  });

  it("returns rolling-window usage without reading or deducting credits", async () => {
    const caller = freeTierRouter.createCaller(context());
    const result = await caller.basicScriptUsage();
    expect(result).toMatchObject({ remaining: 2, limit: 3, resetPolicy: "rolling_24_hours" });
  });

  it("generates generic constrained output and marks it as free tier", async () => {
    vi.mocked(invokeLLM).mockResolvedValue({
      choices: [{ message: { content: "A short script that explains how repeatable content systems help small businesses work with clarity and consistency." } }],
    } as any);

    const caller = freeTierRouter.createCaller(context());
    const result = await caller.generateBasicScript({ idea: "Why small teams need a repeatable content system" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.script).toContain("Generated with Lumae AI free tier.");
      expect(result.constraints).toMatchObject({ maxWords: 120, genericOnly: true, brandVoiceEnabled: false, platformFormattingEnabled: false });
    }
    expect(invokeLLM).toHaveBeenCalledWith(expect.objectContaining({
      messages: expect.arrayContaining([expect.objectContaining({ content: expect.stringContaining("Do not add social-platform formatting") })]),
    }));
  });

  it("returns a specific upgrade path at the cap without invoking the model", async () => {
    vi.mocked(freeUsage.reserveBasicScriptGeneration).mockResolvedValue({
      available: false,
      count: 3,
      limit: 3,
      remaining: 0,
      resetAt: new Date("2026-08-21T00:00:00.000Z"),
    });

    const result = await freeTierRouter.createCaller(context()).generateBasicScript({ idea: "A basic free idea" });
    expect(result).toMatchObject({ success: false, code: "DAILY_LIMIT_REACHED", fullGeneratorPath: "/content-studio/ai-generator", upgradePath: "/billing/buy-credits" });
    expect(invokeLLM).not.toHaveBeenCalled();
  });

  it("releases the free reservation when model generation fails", async () => {
    vi.mocked(invokeLLM).mockRejectedValue(new Error("LLM unavailable"));
    await expect(freeTierRouter.createCaller(context()).generateBasicScript({ idea: "A retry-safe idea" })).rejects.toThrow("free use was not consumed");
    expect(freeUsage.releaseBasicScriptGeneration).toHaveBeenCalledWith(42);
  });
});
