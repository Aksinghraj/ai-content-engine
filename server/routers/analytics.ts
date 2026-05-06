import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import {
  getContentAnalyticsByUserId,
  getAnalyticsByPlatform,
  getAutomationExecutionStats,
  getAutomationExecutionLogs,
} from "../db";
import { TRPCError } from "@trpc/server";

export const analyticsRouter = router({
  // Get content analytics for a user
  getContentAnalytics: protectedProcedure
    .input(
      z.object({
        days: z.number().min(1).max(90).default(7),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if user is Pro
      if (ctx.user.subscriptionTier !== "pro") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Analytics is only available for Pro users",
        });
      }

      try {
        const analytics = await getContentAnalyticsByUserId(ctx.user.id, input.days);
        return {
          success: true,
          data: analytics,
        };
      } catch (error) {
        console.error("Error fetching content analytics:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch content analytics",
        });
      }
    }),

  // Get analytics aggregated by platform
  getPlatformAnalytics: protectedProcedure
    .input(
      z.object({
        days: z.number().min(1).max(90).default(7),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if user is Pro
      if (ctx.user.subscriptionTier !== "pro") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Analytics is only available for Pro users",
        });
      }

      try {
        const platformAnalytics = await getAnalyticsByPlatform(ctx.user.id, input.days);
        return {
          success: true,
          data: platformAnalytics,
        };
      } catch (error) {
        console.error("Error fetching platform analytics:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch platform analytics",
        });
      }
    }),

  // Get automation execution statistics
  getExecutionStats: protectedProcedure
    .input(
      z.object({
        days: z.number().min(1).max(90).default(7),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if user is Pro
      if (ctx.user.subscriptionTier !== "pro") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Analytics is only available for Pro users",
        });
      }

      try {
        const stats = await getAutomationExecutionStats(ctx.user.id, input.days);
        return {
          success: true,
          data: stats || {
            totalExecutions: 0,
            successfulExecutions: 0,
            failedExecutions: 0,
          },
        };
      } catch (error) {
        console.error("Error fetching execution stats:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch execution stats",
        });
      }
    }),

  // Get automation execution logs
  getExecutionLogs: protectedProcedure
    .input(
      z.object({
        scheduleId: z.number().optional(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if user is Pro
      if (ctx.user.subscriptionTier !== "pro") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Analytics is only available for Pro users",
        });
      }

      try {
        const logs = await getAutomationExecutionLogs(
          ctx.user.id,
          input.scheduleId,
          input.limit
        );
        return {
          success: true,
          data: logs,
        };
      } catch (error) {
        console.error("Error fetching execution logs:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch execution logs",
        });
      }
    }),
});
