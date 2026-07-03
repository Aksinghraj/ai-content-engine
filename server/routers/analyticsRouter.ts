import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import {
  fetchPlatformMetrics,
  analyzeContentPerformance,
  calculateROI,
  getTrendingInsights,
  type PlatformMetrics,
  type ContentPerformance,
  type ROIMetrics,
} from "../_core/analyticsService";

export const analyticsRouter = router({
  /**
   * Get platform metrics for all connected accounts
   */
  getPlatformMetrics: protectedProcedure.query(async ({ ctx }) => {
    try {
      const metrics = await fetchPlatformMetrics(ctx.user.id.toString());
      return {
        success: true,
        data: metrics,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        data: [],
      };
    }
  }),

  /**
   * Get content performance analysis and recommendations
   */
  getContentPerformance: protectedProcedure.query(async ({ ctx }) => {
    try {
      const result = await analyzeContentPerformance(ctx.user.id.toString());
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        data: {
          performance: [],
          recommendations: [],
        },
      };
    }
  }),

  /**
   * Calculate ROI metrics
   */
  calculateROI: protectedProcedure
    .input(
      z.object({
        timeframeMonths: z.number().min(1).max(24).default(3),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const roi = await calculateROI(ctx.user.id.toString(), input.timeframeMonths);
        return {
          success: true,
          data: roi,
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
          data: {
            total_revenue: 0,
            total_costs: 0,
            roi_percentage: 0,
            revenue_per_post: 0,
            cost_per_post: 0,
            payback_period_days: 0,
            platform_roi: {},
          },
        };
      }
    }),

  /**
   * Get trending topics and hashtags for a platform
   */
  getTrendingInsights: protectedProcedure
    .input(
      z.object({
        platform: z.enum(["instagram", "twitter", "linkedin", "facebook", "youtube", "tiktok"]),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const insights = await getTrendingInsights(ctx.user.id.toString(), input.platform);
        return {
          success: true,
          data: insights,
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
          data: {
            trending_topics: [],
            recommended_hashtags: [],
            best_posting_times: [],
          },
        };
      }
    }),

  /**
   * Get comprehensive analytics dashboard data
   */
  getDashboardData: protectedProcedure.query(async ({ ctx }) => {
    try {
      const [metrics, performance, roi, insights] = await Promise.all([
        fetchPlatformMetrics(ctx.user.id.toString()),
        analyzeContentPerformance(ctx.user.id.toString()),
        calculateROI(ctx.user.id.toString(), 3),
        getTrendingInsights(ctx.user.id.toString(), "instagram"),
      ]);

      return {
        success: true,
        data: {
          platformMetrics: metrics,
          contentPerformance: performance,
          roi,
          trendingInsights: insights,
          summary: {
            totalPlatforms: metrics.length,
            totalContent: performance.performance.length,
            avgEngagementRate: metrics.length > 0 ? (metrics.reduce((sum, m) => sum + m.engagement_rate, 0) / metrics.length).toFixed(2) : "0",
            totalFollowers: metrics.reduce((sum, m) => sum + m.followers, 0),
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        data: null,
      };
    }
  }),
});
