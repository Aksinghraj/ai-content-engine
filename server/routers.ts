import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { saveContentHistory, getContentHistoryByUserId, getContentHistoryById, getTodayTokenUsage, trackTokenUsage } from "./db";
import { generateContentPackage } from "./_core/contentGenerator";
import { subscriptionRouter } from "./routers/subscription";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  subscription: subscriptionRouter,

  content: router({
    generate: protectedProcedure
      .input(
        z.object({
          niche: z.string().min(1),
          targetAudience: z.string().min(1),
          platform: z.string().min(1),
          goal: z.string().min(1),
          contentStyle: z.string().min(1),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const user = ctx.user;
        
        // Check if user can generate content (free tier limit)
        if (user.subscriptionTier === "free") {
          const todayUsage = await getTodayTokenUsage(user.id);
          if (todayUsage >= 5) {
            throw new Error("Daily limit of 5 generations reached. Upgrade to Pro for unlimited access.");
          }
        }
        
        // Generate content
        const generatedContent = await generateContentPackage(input);

        // Save history
        await saveContentHistory({
          userId: ctx.user.id,
          niche: input.niche,
          targetAudience: input.targetAudience,
          platform: input.platform,
          goal: input.goal,
          contentStyle: input.contentStyle,
          generatedContent: generatedContent as any,
        });
        
        // Track token usage for free tier
        if (user.subscriptionTier === "free") {
          await trackTokenUsage(user.id, 1);
        }

        return generatedContent;
      }),

    getHistory: protectedProcedure.query(async ({ ctx }) => {
      return await getContentHistoryByUserId(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getContentHistoryById(input.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
