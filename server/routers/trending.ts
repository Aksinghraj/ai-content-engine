import { router, protectedProcedure } from "../_core/trpc";
import { callDataApi } from "../_core/dataApi";
import { z } from "zod";

export const trendingRouter = router({
  // Get trending topics from TikTok
  getTrendingTopics: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ input }) => {
      try {
        // Search for trending content on TikTok
        const result = await callDataApi("Tiktok/search_tiktok_video_general", {
          query: {
            keyword: "trending",
            cursor: 0,
          },
        });

        // Extract trending topics from the result
        const videos = (result as any)?.data || [];
        const trendingTopics = videos.slice(0, input.limit).map((video: any) => ({
          id: video.aweme_id || Math.random().toString(36).substr(2, 9),
          title: video.desc || "Trending Content",
          engagement: {
            likes: video.statistics?.like_count || 0,
            comments: video.statistics?.comment_count || 0,
            shares: video.statistics?.share_count || 0,
            views: video.statistics?.play_count || 0,
          },
          source: "tiktok",
          timestamp: new Date().toISOString(),
        }));

        return {
          success: true,
          data: trendingTopics,
          count: trendingTopics.length,
        };
      } catch (error) {
        console.error("Error fetching trending topics:", error);
        // Return mock trending topics as fallback
        const mockTopics = [
          {
            id: "1",
            title: "AI Technology",
            engagement: { likes: 50000, comments: 5000, shares: 2000, views: 500000 },
            source: "trending",
            timestamp: new Date().toISOString(),
          },
          {
            id: "2",
            title: "Social Media Marketing",
            engagement: { likes: 45000, comments: 4500, shares: 1800, views: 450000 },
            source: "trending",
            timestamp: new Date().toISOString(),
          },
          {
            id: "3",
            title: "Content Creation",
            engagement: { likes: 40000, comments: 4000, shares: 1600, views: 400000 },
            source: "trending",
            timestamp: new Date().toISOString(),
          },
          {
            id: "4",
            title: "Digital Marketing",
            engagement: { likes: 35000, comments: 3500, shares: 1400, views: 350000 },
            source: "trending",
            timestamp: new Date().toISOString(),
          },
          {
            id: "5",
            title: "Business Growth",
            engagement: { likes: 30000, comments: 3000, shares: 1200, views: 300000 },
            source: "trending",
            timestamp: new Date().toISOString(),
          },
        ];

        return {
          success: false,
          data: mockTopics.slice(0, input.limit),
          count: mockTopics.slice(0, input.limit).length,
          message: "Using fallback trending topics",
        };
      }
    }),

  // Get trending topics for a specific platform
  getTrendingByPlatform: protectedProcedure
    .input(
      z.object({
        platform: z.enum(["tiktok", "twitter", "instagram", "youtube"]),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ input }) => {
      try {
        let result: any = {};

        if (input.platform === "tiktok") {
          result = await callDataApi("Tiktok/search_tiktok_video_general", {
            query: {
              keyword: "trending",
              cursor: 0,
            },
          });
        } else {
          // For other platforms, return mock data
          result = { data: [] };
        }

        const videos = result?.data || [];
        const trendingTopics = videos.slice(0, input.limit).map((video: any) => ({
          id: video.aweme_id || Math.random().toString(36).substr(2, 9),
          title: video.desc || "Trending Content",
          platform: input.platform,
          engagement: {
            likes: video.statistics?.like_count || 0,
            comments: video.statistics?.comment_count || 0,
            shares: video.statistics?.share_count || 0,
            views: video.statistics?.play_count || 0,
          },
          timestamp: new Date().toISOString(),
        }));

        return {
          success: true,
          platform: input.platform,
          data: trendingTopics,
          count: trendingTopics.length,
        };
      } catch (error) {
        console.error(`Error fetching trending topics for ${input.platform}:`, error);
        return {
          success: false,
          platform: input.platform,
          data: [],
          count: 0,
          message: "Failed to fetch trending topics",
        };
      }
    }),
});
