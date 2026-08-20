import { beforeEach, describe, expect, it, vi } from "vitest";
import { trendingRouter } from "./trending";
import { getUnifiedTrends, refreshUnifiedTrends } from "../_core/trendService";

vi.mock("../_core/trendService", () => ({
  getUnifiedTrends: vi.fn(),
  refreshUnifiedTrends: vi.fn(),
}));

const caller = () => trendingRouter.createCaller({ user: { id: "test-user" } } as any);
const cachedPayload = {
  generatedAt: "2026-08-20T00:00:00.000Z",
  topics: [
    {
      id: "youtube-1", title: "Creator workflows", source: "youtube", dataKind: "live",
      category: "creator", suggestedStyle: "Bold", suggestedGoal: "Growth", observedAt: "2026-08-20T00:00:00.000Z",
    },
    {
      id: "instagram-estimated-1", title: "Behind the scenes ideas", source: "instagram", dataKind: "ai_estimated",
      category: "lifestyle", suggestedStyle: "Storytelling", suggestedGoal: "Engagement", observedAt: "2026-08-20T00:00:00.000Z",
    },
  ],
};

describe("Trending Router", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns source-labelled unified cached topics and honors the limit", async () => {
    vi.mocked(getUnifiedTrends).mockResolvedValue({ ...cachedPayload, topics: cachedPayload.topics.slice(0, 1) });
    const result = await caller().getTrendingTopics({ limit: 1 });
    expect(result.success).toBe(true);
    expect(result.count).toBe(1);
    expect(result.data[0]).toMatchObject({ source: "youtube", dataKind: "live" });
    expect(getUnifiedTrends).toHaveBeenCalledWith(1);
  });

  it("keeps estimated signals explicitly marked rather than claiming a live API feed", async () => {
    vi.mocked(getUnifiedTrends).mockResolvedValue(cachedPayload);
    const result = await caller().getTrendingTopics({ limit: 8 });
    expect(result.data.some((topic) => topic.source === "instagram" && topic.dataKind === "ai_estimated")).toBe(true);
  });

  it("allows a manual cache refresh without exposing provider credentials", async () => {
    vi.mocked(refreshUnifiedTrends).mockResolvedValue(cachedPayload);
    const result = await caller().refreshUnifiedTrends();
    expect(result).toEqual(cachedPayload);
    expect(refreshUnifiedTrends).toHaveBeenCalledWith(true);
  });
});
