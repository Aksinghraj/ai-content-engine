import { z } from "zod";
import {
  createAutomationSchedule,
  getAutomationSchedulesByUserId,
  updateAutomationSchedule,
  deleteAutomationSchedule,
  deductUserCredits,
  getUserCredits,
} from "../db";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";

export const automationRouter = router({
  // Create a new automation schedule (Pro only)
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        niche: z.string().min(1),
        targetAudience: z.string().min(1),
        platform: z.string().min(1),
        goal: z.string().min(1),
        contentStyle: z.string().min(1),
        cronExpression: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is Pro
      if (ctx.user.subscriptionTier !== "pro") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Automation is only available for Pro users",
        });
      }

      // Check if user has enough credits (10 credits per automation)
      const hasCredits = await deductUserCredits(ctx.user.id, 10, `Automation created: ${input.name}`);
      if (!hasCredits) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Insufficient credits. You need at least 10 credits to create an automation.",
        });
      }

      try {
        const result = await createAutomationSchedule(ctx.user.id, input);
        const remainingCredits = await getUserCredits(ctx.user.id);
        return {
          success: true,
          message: "Automation schedule created (10 credits deducted)",
          data: result,
          creditsRemaining: remainingCredits,
        };
      } catch (error) {
        console.error("Error creating automation schedule:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create automation schedule",
        });
      }
    }),

  // Get all automation schedules for the user
  list: protectedProcedure.query(async ({ ctx }) => {
    // Check if user is Pro
    if (ctx.user.subscriptionTier !== "pro") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Automation is only available for Pro users",
      });
    }

    try {
      const schedules = await getAutomationSchedulesByUserId(ctx.user.id);
      const credits = await getUserCredits(ctx.user.id);
      return {
        success: true,
        data: schedules,
        credits,
      };
    } catch (error) {
      console.error("Error fetching automation schedules:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch automation schedules",
      });
    }
  }),

  // Update an automation schedule
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is Pro
      if (ctx.user.subscriptionTier !== "pro") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Automation is only available for Pro users",
        });
      }

      try {
        const result = await updateAutomationSchedule(input.id, { isActive: input.isActive });
        return {
          success: true,
          message: "Automation schedule updated",
          data: result,
        };
      } catch (error) {
        console.error("Error updating automation schedule:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update automation schedule",
        });
      }
    }),

  // Delete an automation schedule
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is Pro
      if (ctx.user.subscriptionTier !== "pro") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Automation is only available for Pro users",
        });
      }

      try {
        const result = await deleteAutomationSchedule(input.id);
        return {
          success: true,
          message: "Automation schedule deleted",
          data: result,
        };
      } catch (error) {
        console.error("Error deleting automation schedule:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete automation schedule",
        });
      }
    }),
});
