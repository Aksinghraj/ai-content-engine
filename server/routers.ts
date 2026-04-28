import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { saveContentHistory, getContentHistoryByUserId, getContentHistoryById } from "./db";
import { generateContentPackage } from "./_core/contentGenerator";

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
        const generatedContent = await generateContentPackage(input);

        await saveContentHistory({
          userId: ctx.user.id,
          niche: input.niche,
          targetAudience: input.targetAudience,
          platform: input.platform,
          goal: input.goal,
          contentStyle: input.contentStyle,
          generatedContent: generatedContent as any,
        });

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
