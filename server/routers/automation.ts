import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { parse as parseCookie } from "cookie";
import { COOKIE_NAME } from "@shared/const";
import { protectedProcedure, router } from "../_core/trpc";
import { createHeartbeatJob, deleteHeartbeatJob, updateHeartbeatJob } from "../_core/heartbeat";
import {
  createAutomationSchedule,
  deleteAutomationScheduleForUser,
  getAutomationScheduleByIdForUser,
  getAutomationSchedulesByUserId,
  updateAutomationScheduleForUser,
} from "../db";
import { getSocialConnectionByPlatform } from "../db/social";

const platformSchema = z
  .string()
  .min(1)
  .refine(
    (value) => ["instagram", "facebook", "twitter", "linkedin", "youtube", "tiktok"].includes(value),
    "Unsupported publishing platform",
  );

const automationInput = z.object({
  name: z.string().min(1).max(255),
  niche: z.string().min(1).max(255),
  targetAudience: z.string().min(1).max(255),
  platform: platformSchema,
  goal: z.string().min(1).max(100),
  contentStyle: z.string().min(1).max(100),
  cronExpression: z.string().min(1).max(100),
});

function normalizeCron(expression: string) {
  const parts = expression.trim().split(/\s+/);
  if (parts.length === 5) return `0 ${parts.join(" ")}`;
  if (parts.length === 6) return parts.join(" ");
  throw new TRPCError({ code: "BAD_REQUEST", message: "Schedule must use a 5- or 6-field cron expression." });
}

function getUserSession(cookieHeader: string | undefined) {
  return parseCookie(cookieHeader ?? "")[COOKIE_NAME] ?? "";
}

async function assertAutomationReadiness(userId: number, platform: string) {
  const connection = await getSocialConnectionByPlatform(userId, platform);
  if (!connection?.isConnected) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Connect your ${platform} account before creating an automation.`,
    });
  }
  if (!connection.autoPost) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Enable Auto-Post for your connected ${platform} account before activating an automation.`,
    });
  }
}

export const automationRouter = router({
  create: protectedProcedure.input(automationInput).mutation(async ({ ctx, input }) => {
    await assertAutomationReadiness(ctx.user.id, input.platform);
    const schedule = await createAutomationSchedule(ctx.user.id, {
      ...input,
      cronExpression: normalizeCron(input.cronExpression),
    });
    if (!schedule) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Unable to create automation." });

    try {
      const job = await createHeartbeatJob(
        {
          name: `social-automation-${ctx.user.id}-${schedule.id}`,
          cron: schedule.cronExpression,
          path: "/api/scheduled/social-automation",
          description: `Lumae scheduled ${schedule.platform} publishing for ${schedule.name}`,
        },
        getUserSession(ctx.req.headers.cookie),
      );
      const persisted = await updateAutomationScheduleForUser(schedule.id, ctx.user.id, {
        scheduleCronTaskUid: job.taskUid,
      });
      const schedules = await getAutomationSchedulesByUserId(ctx.user.id);
      return {
        success: true,
        data: persisted,
        nextExecutionAt: job.nextExecutionAt,
        automationCount: schedules.length,
        freeAutomationsRemaining: null,
        creditsRemaining: null,
      };
    } catch (error) {
      await deleteAutomationScheduleForUser(schedule.id, ctx.user.id);
      throw error;
    }
  }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const schedules = await getAutomationSchedulesByUserId(ctx.user.id);
    return {
      success: true,
      data: schedules,
      automationCount: schedules.length,
      freeAutomationsRemaining: null,
      creditsRemaining: null,
      subscriptionTier: null,
    };
  }),

  update: protectedProcedure
    .input(automationInput.partial().extend({ id: z.string().min(1), isActive: z.boolean().optional() }))
    .mutation(async ({ ctx, input }) => {
      const scheduleId = Number(input.id);
      const existing = await getAutomationScheduleByIdForUser(scheduleId, ctx.user.id);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Automation not found." });
      if (!existing.scheduleCronTaskUid) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "This legacy automation must be recreated to enable durable scheduling." });
      }

      const cronExpression = input.cronExpression ? normalizeCron(input.cronExpression) : undefined;
      const targetPlatform = input.platform ?? existing.platform;
      if (input.isActive !== false) {
        await assertAutomationReadiness(ctx.user.id, targetPlatform);
      }
      await updateHeartbeatJob(
        existing.scheduleCronTaskUid,
        {
          cron: cronExpression,
          enable: input.isActive,
          description: input.name ? `Lumae scheduled ${input.platform ?? existing.platform} publishing for ${input.name}` : undefined,
        },
        getUserSession(ctx.req.headers.cookie),
      );

      const { id: _id, ...updates } = input;
      const persisted = await updateAutomationScheduleForUser(scheduleId, ctx.user.id, {
        ...updates,
        ...(cronExpression ? { cronExpression } : {}),
      });
      return { success: true, data: persisted };
    }),

  delete: protectedProcedure.input(z.object({ id: z.string().min(1) })).mutation(async ({ ctx, input }) => {
    const schedule = await getAutomationScheduleByIdForUser(Number(input.id), ctx.user.id);
    if (!schedule) throw new TRPCError({ code: "NOT_FOUND", message: "Automation not found." });
    if (schedule.scheduleCronTaskUid) {
      await deleteHeartbeatJob(schedule.scheduleCronTaskUid, getUserSession(ctx.req.headers.cookie));
    }
    await deleteAutomationScheduleForUser(schedule.id, ctx.user.id);
    return { success: true };
  }),
});
