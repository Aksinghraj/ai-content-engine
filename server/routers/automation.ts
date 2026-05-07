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
import { z } from "zod";

export const automationRouter = router({
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
      const existingSchedules = await getAutomationSchedulesByUserId(ctx.user.id);
      const automationCount = existingSchedules.length;

      if (ctx.user.subscriptionTier === "free") {
        if (automationCount >= 3) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Free tier limited to 3 automations. Upgrade to Pro for unlimited.",
          });
        }
      } else if (ctx.user.subscriptionTier === "pro") {
        if (automationCount >= 3) {
          const hasCredits = await deductCredits(ctx.user.id, 10, `Automation: ${input.name}`);
          if (!hasCredits) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Insufficient credits for additional automations.",
            });
          }
        }
      } else {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Invalid subscription tier",
        });
      }

      try {
        const result = await createAutomationSchedule(ctx.user.id, input);
        const remainingCredits = ctx.user.subscriptionTier === "pro" && automationCount >= 3 ? await getUserCredits(ctx.user.id) : null;
        return {
          success: true,
          message: ctx.user.subscriptionTier === "pro" && automationCount >= 3
            ? "Automation created (10 credits deducted)"
            : "Automation created (free)",
          data: result,
          creditsRemaining: remainingCredits,
          automationCount: automationCount + 1,
          freeAutomationsRemaining: Math.max(0, 3 - (automationCount + 1)),
        };
      } catch (error) {
        console.error("Error creating automation:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create automation",
        });
      }
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      const schedules = await getAutomationSchedulesByUserId(ctx.user.id);
      const credits = ctx.user.subscriptionTier === "pro" ? await getUserCredits(ctx.user.id) : null;
      return {
        success: true,
        data: schedules,
        creditsRemaining: credits,
        automationCount: schedules.length,
        freeAutomationsRemaining: Math.max(0, 3 - schedules.length),
        subscriptionTier: ctx.user.subscriptionTier,
      };
    } catch (error) {
      console.error("Error fetching automations:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch automations",
      });
    }
  }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1).optional(),
        niche: z.string().min(1).optional(),
        targetAudience: z.string().min(1).optional(),
        platform: z.string().min(1).optional(),
        goal: z.string().min(1).optional(),
        contentStyle: z.string().min(1).optional(),
        cronExpression: z.string().min(1).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await updateAutomationSchedule(parseInt(input.id), input);
        return {
          success: true,
          message: "Automation updated",
          data: result,
        };
      } catch (error) {
        console.error("Error updating automation:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update automation",
        });
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        await deleteAutomationSchedule(parseInt(input.id));
        return {
          success: true,
          message: "Automation deleted",
        };
      } catch (error) {
        console.error("Error deleting automation:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete automation",
        });
      }
    }),
});
