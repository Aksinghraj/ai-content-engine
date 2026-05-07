import { z } from "zod";
import {
  createAutomationSchedule,
  getAutomationSchedulesByUserId,
  updateAutomationSchedule,
  deleteAutomationSchedule,
  deductCredits,
  getUserCredits,
} from "../db";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";

export const automationRouter = router({
  // Create a new automation schedule (3 free for free tier, unlimited for Pro)
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
      // Check automation limit for free tier (3 max)
      if (ctx.user.subscriptionTier === "free") {
        const existingSchedules = await getAutomationSchedulesByUserId(ctx.user.id);
        if (existingSchedules.length >= 3) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Free tier limited to 3 automations. Upgrade to Pro for unlimited automations.",
          });
        }
      } else if (ctx.user.subscriptionTier !== "pro") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Invalid subscription tier",
        });
      }

      // Pro users need credits (10 credits per automation)
      if (ctx.user.subscriptionTier === "pro") {
        const hasCredits = await deductCredits(ctx.user.id, 10, `Automation created: ${input.name}`);
        if (!hasCredits) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Insufficient credits. You need at least 10 credits to create an automation.",
          });
        }
      }

      try {
        const result = await createAutomationSchedule(ctx.user.id, input);
        const remainingCredits = ctx.user.subscriptionTier === "pro" ? await getUserCredits(ctx.user.id) : null;
        return {
          success: true,
          message: ctx.user.subscriptionTier === "pro" 
            ? "Automation schedule created (10 credits deducted)" 
            : "Automation schedule created",
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
    // Allow both free and pro users to access automations
    try {
      const schedules = await getAutomationSchedulesByUserId(ctx.user.id);
      const credits = ctx.user.subscriptionTier === "pro" ? await getUserCredits(ctx.user.id) : null;
      const limit = ctx.user.subscriptionTier === "free" ? 3 : null;
      
      return {
        success: true,
        data: schedules,
        credits,
        limit,
        count: schedules.length,
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
