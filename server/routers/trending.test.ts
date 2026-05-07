import { describe, it, expect, vi, beforeEach } from "vitest";
import { trendingRouter } from "./trending";
import { callDataApi } from "../_core/dataApi";

// Mock the data API
vi.mock("../_core/dataApi", () => ({
  callDataApi: vi.fn(),
}));

describe("Trending Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getTrendingTopics", () => {
    it("should fetch trending topics successfully", async () => {
      const mockData = {
        data: [
          {
            aweme_id: "1",
            desc: "AI Technology",
            statistics: {
              like_count: 50000,
              comment_count: 5000,
              share_count: 2000,
              play_count: 500000,
            },
          },
          {
            aweme_id: "2",
            desc: "Social Media Marketing",
            statistics: {
              like_count: 45000,
              comment_count: 4500,
              share_count: 1800,
              play_count: 450000,
            },
          },
        ],
      };

      vi.mocked(callDataApi).mockResolvedValue(mockData);

      const caller = trendingRouter.createCaller({
        user: { id: "test-user" },
      } as any);

      const result = await caller.getTrendingTopics({ limit: 2 });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data[0].title).toBe("AI Technology");
      expect(result.data[0].engagement.views).toBe(500000);
      expect(result.data[0].engagement.likes).toBe(50000);
    });

    it("should return fallback data on API error", async () => {
      vi.mocked(callDataApi).mockRejectedValue(new Error("API Error"));

      const caller = trendingRouter.createCaller({
        user: { id: "test-user" },
      } as any);

      const result = await caller.getTrendingTopics({ limit: 3 });

      expect(result.success).toBe(false);
      expect(result.data).toHaveLength(3);
      expect(result.data[0].title).toBe("AI Technology");
      expect(result.message).toBe("Using fallback trending topics");
    });

    it("should respect limit parameter", async () => {
      const mockData = {
        data: Array.from({ length: 20 }, (_, i) => ({
          aweme_id: `${i}`,
          desc: `Topic ${i}`,
          statistics: {
            like_count: 10000 * (i + 1),
            comment_count: 1000 * (i + 1),
            share_count: 500 * (i + 1),
            play_count: 100000 * (i + 1),
          },
        })),
      };

      vi.mocked(callDataApi).mockResolvedValue(mockData);

      const caller = trendingRouter.createCaller({
        user: { id: "test-user" },
      } as any);

      const result = await caller.getTrendingTopics({ limit: 5 });

      expect(result.data).toHaveLength(5);
      expect(result.count).toBe(5);
    });

    it("should have correct engagement metrics", async () => {
      const mockData = {
        data: [
          {
            aweme_id: "1",
            desc: "Test Topic",
            statistics: {
              like_count: 12345,
              comment_count: 2345,
              share_count: 1234,
              play_count: 123456,
            },
          },
        ],
      };

      vi.mocked(callDataApi).mockResolvedValue(mockData);

      const caller = trendingRouter.createCaller({
        user: { id: "test-user" },
      } as any);

      const result = await caller.getTrendingTopics({ limit: 1 });

      expect(result.data[0].engagement).toEqual({
        likes: 12345,
        comments: 2345,
        shares: 1234,
        views: 123456,
      });
    });
  });

  describe("getTrendingByPlatform", () => {
    it("should fetch TikTok trending topics", async () => {
      const mockData = {
        data: [
          {
            aweme_id: "1",
            desc: "TikTok Trend",
            statistics: {
              like_count: 30000,
              comment_count: 3000,
              share_count: 1000,
              play_count: 300000,
            },
          },
        ],
      };

      vi.mocked(callDataApi).mockResolvedValue(mockData);

      const caller = trendingRouter.createCaller({
        user: { id: "test-user" },
      } as any);

      const result = await caller.getTrendingByPlatform({
        platform: "tiktok",
        limit: 1,
      });

      expect(result.success).toBe(true);
      expect(result.platform).toBe("tiktok");
      expect(result.data).toHaveLength(1);
      expect(result.data[0].platform).toBe("tiktok");
    });

    it("should handle non-TikTok platforms gracefully", async () => {
      vi.mocked(callDataApi).mockResolvedValue({ data: [] });

      const caller = trendingRouter.createCaller({
        user: { id: "test-user" },
      } as any);

      const result = await caller.getTrendingByPlatform({
        platform: "twitter",
        limit: 5,
      });

      expect(result.success).toBe(true);
      expect(result.platform).toBe("twitter");
      expect(result.data).toHaveLength(0);
    });

    it("should return error on API failure", async () => {
      vi.mocked(callDataApi).mockRejectedValue(new Error("API Error"));

      const caller = trendingRouter.createCaller({
        user: { id: "test-user" },
      } as any);

      const result = await caller.getTrendingByPlatform({
        platform: "tiktok",
        limit: 5,
      });

      expect(result.success).toBe(false);
      expect(result.data).toHaveLength(0);
      expect(result.message).toBe("Failed to fetch trending topics");
    });

    it("should include timestamp in response", async () => {
      const mockData = {
        data: [
          {
            aweme_id: "1",
            desc: "Trending",
            statistics: {
              like_count: 10000,
              comment_count: 1000,
              share_count: 500,
              play_count: 100000,
            },
          },
        ],
      };

      vi.mocked(callDataApi).mockResolvedValue(mockData);

      const caller = trendingRouter.createCaller({
        user: { id: "test-user" },
      } as any);

      const result = await caller.getTrendingByPlatform({
        platform: "tiktok",
        limit: 1,
      });

      expect(result.data[0].timestamp).toBeDefined();
      expect(new Date(result.data[0].timestamp)).toBeInstanceOf(Date);
    });
  });
});
