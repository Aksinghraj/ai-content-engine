import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { saveContentHistory, getContentHistoryByUserId, getContentHistoryById, getTodayTokenUsage, trackTokenUsage } from "./db";
import { generateContentPackage } from "./_core/contentGenerator";
import { subscriptionRouter } from "./routers/subscription";
import { automationRouter } from "./routers/automation";
import { eq, desc, and, gte } from "drizzle-orm";

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
  automation: automationRouter,

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
        
        // Save to history
        await saveContentHistory({
          userId: user.id,
          niche: input.niche,
          targetAudience: input.targetAudience,
          platform: input.platform,
          goal: input.goal,
          contentStyle: input.contentStyle,
          generatedContent: JSON.stringify(generatedContent),
        });
        
        // Track token usage
        await trackTokenUsage(user.id, 1);
        
        return generatedContent;
      }),

    history: protectedProcedure.query(async ({ ctx }) => {
      const history = await getContentHistoryByUserId(ctx.user.id);
      return history.map((item: any) => ({
        ...item,
        generatedContent: JSON.parse(item.generatedContent as string),
      }));
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const content = await getContentHistoryById(input.id);
        if (!content || content.userId !== ctx.user.id) {
          throw new Error("Content not found");
        }
        return {
          ...content,
          generatedContent: JSON.parse(content.generatedContent as string),
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
