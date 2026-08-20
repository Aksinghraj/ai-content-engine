import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import {
  BASIC_SCRIPT_DAILY_LIMIT,
  getBasicScriptUsage,
  releaseBasicScriptGeneration,
  reserveBasicScriptGeneration,
} from "../freeTierUsage";

const FREE_TIER_TAG = "Generated with Lumae AI free tier.";

function constrainScript(content: string): string {
  const withoutExistingTag = content.replace(/Generated with Lumae AI free tier\.?/gi, "").trim();
  const words = withoutExistingTag.split(/\s+/).filter(Boolean).slice(0, 120);
  return `${words.join(" ").trim()}\n\n${FREE_TIER_TAG}`;
}

export const freeTierRouter = router({
  basicScriptUsage: protectedProcedure.query(async ({ ctx }) => {
    const usage = await getBasicScriptUsage(ctx.user.id);
    return { ...usage, resetPolicy: "rolling_24_hours" as const };
  }),

  generateBasicScript: protectedProcedure
    .input(z.object({
      idea: z.string().trim().min(3).max(600),
    }))
    .mutation(async ({ ctx, input }) => {
      const reservation = await reserveBasicScriptGeneration(ctx.user.id);

      if (!reservation.available) {
        return {
          success: false as const,
          code: "DAILY_LIMIT_REACHED" as const,
          message: "You have used all 3 free Basic Script Generations in your rolling 24-hour window. Use credits for the full AI Generator or upgrade your plan for advanced controls.",
          usage: { ...reservation, limit: BASIC_SCRIPT_DAILY_LIMIT },
          upgradePath: "/billing/buy-credits",
          fullGeneratorPath: "/content-studio/ai-generator",
        };
      }

      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You generate concise generic scripts. Return plain text only. Keep the response under 120 words. Do not add social-platform formatting, hashtags, emojis, brand-voice personalization, headings, or explanations.",
            },
            {
              role: "user",
              content: `Write a clear, useful generic script based only on this idea:\n\n${input.idea}`,
            },
          ],
        });

        const content = response.choices[0]?.message?.content;
        if (typeof content !== "string" || !content.trim()) throw new Error("Invalid script response");

        return {
          success: true as const,
          script: constrainScript(content),
          usage: { ...reservation, limit: BASIC_SCRIPT_DAILY_LIMIT },
          constraints: {
            maxWords: 120,
            genericOnly: true,
            brandVoiceEnabled: false,
            platformFormattingEnabled: false,
          },
        };
      } catch (error) {
        await releaseBasicScriptGeneration(ctx.user.id);
        console.error("[Basic Script Generation] Upstream generation failed", { userId: ctx.user.id });
        throw new Error("Basic Script Generation could not be completed. Your free use was not consumed—please try again.");
      }
    }),
});
