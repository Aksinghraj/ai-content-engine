import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "../_core/llm";

export const trendsDiscoveryRouter = router({
  // Save a trend for later reference
  saveTrend: protectedProcedure
    .input(
      z.object({
        trendTitle: z.string(),
        trendScore: z.number(),
        growthPercentage: z.number(),
        category: z.string(),
        estimatedReach: z.string(),
        platforms: z.array(z.string()),
        summary: z.string(),
        relatedKeywords: z.array(z.string()),
        suggestedHooks: z.array(z.string()),
        bestPostingTime: z.string().optional(),
        externalTrendId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await db.saveTrend(ctx.user.id, input);
        return { success: true };
      } catch (error) {
        console.error("Error saving trend:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to save trend",
        });
      }
    }),

  // Get all saved trends for the user
  getSavedTrends: protectedProcedure.query(async ({ ctx }) => {
    try {
      const trends = await db.getSavedTrends(ctx.user.id);
      return trends;
    } catch (error) {
      console.error("Error fetching saved trends:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch saved trends",
      });
    }
  }),

  // Remove a saved trend
  removeSavedTrend: protectedProcedure
    .input(z.object({ trendId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await db.removeSavedTrend(ctx.user.id, input.trendId);
        return { success: true };
      } catch (error) {
        console.error("Error removing saved trend:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to remove saved trend",
        });
      }
    }),

  // Generate content ideas for a trend using AI
  generateContentIdeas: protectedProcedure
    .input(
      z.object({
        savedTrendId: z.number(),
        trendTitle: z.string(),
        platforms: z.array(z.enum(["instagram", "youtube", "tiktok", "twitter", "linkedin"])),
        contentTypes: z.array(z.enum(["reel", "post", "story", "tweet", "video"])).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if user has free AI generations left
        if (ctx.user.freeAiGenerationsUsed >= 3 && ctx.user.subscriptionTier === "free") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You've used all 3 free AI generations. Upgrade to Pro for unlimited generations.",
          });
        }

        const contentTypes = input.contentTypes || ["reel", "post", "tweet"];
        const ideas = [];

        for (const platform of input.platforms) {
          for (const contentType of contentTypes) {
            const prompt = `Generate 2 viral content ideas for a ${contentType} on ${platform} about "${input.trendTitle}". 
            
For each idea, provide:
1. A catchy hook (first line that stops scrolling)
2. A full caption (max 300 chars for Twitter, 2200 for Instagram)
3. 5 relevant hashtags
4. An estimated engagement score (0-100)

Format as JSON array with objects: { hook, caption, hashtags: [], estimatedEngagement }`;

            const response = await invokeLLM({
              messages: [
                {
                  role: "system",
                  content:
                    "You are a viral content expert. Generate engaging content ideas that will maximize reach and engagement.",
                },
                {
                  role: "user",
                  content: prompt,
                },
              ],
              response_format: {
                type: "json_schema",
                json_schema: {
                  name: "content_ideas",
                  strict: true,
                  schema: {
                    type: "object",
                    properties: {
                      ideas: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            hook: { type: "string" },
                            caption: { type: "string" },
                            hashtags: { type: "array", items: { type: "string" } },
                            estimatedEngagement: { type: "number" },
                          },
                          required: ["hook", "caption", "hashtags", "estimatedEngagement"],
                        },
                      },
                    },
                    required: ["ideas"],
                  },
                },
              },
            });

            const content = response.choices[0].message.content;
            if (!content || typeof content !== "string") continue;

            const parsed = JSON.parse(content);
            for (const idea of parsed.ideas) {
              await db.generateContentIdea(ctx.user.id, input.savedTrendId, {
                platform,
                hook: idea.hook,
                caption: idea.caption,
                hashtags: idea.hashtags,
                contentType,
                estimatedEngagement: idea.estimatedEngagement,
              });

              ideas.push({
                platform,
                contentType,
                ...idea,
              });
            }
          }
        }

        // Increment free AI generations counter for free tier users
        if (ctx.user.subscriptionTier === "free") {
          const { users } = await import("../../drizzle/schema");
          const { eq } = await import("drizzle-orm");
          const db_instance = await db.getDb();
          if (db_instance) {
            await db_instance
              .update(users)
              .set({
                freeAiGenerationsUsed: ctx.user.freeAiGenerationsUsed + 1,
              })
              .where(eq(users.id, ctx.user.id));
          }
        }

        return {
          success: true,
          ideas,
          remainingGenerations:
            ctx.user.subscriptionTier === "free"
              ? 3 - (ctx.user.freeAiGenerationsUsed + 1)
              : null,
        };
      } catch (error) {
        console.error("Error generating content ideas:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate content ideas",
        });
      }
    }),

  // Get all content ideas for a saved trend
  getContentIdeasForTrend: protectedProcedure
    .input(z.object({ savedTrendId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const ideas = await db.getContentIdeasForTrend(ctx.user.id, input.savedTrendId);
        return ideas;
      } catch (error) {
        console.error("Error fetching content ideas:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch content ideas",
        });
      }
    }),

  // Get all content ideas for the user
  getAllContentIdeas: protectedProcedure.query(async ({ ctx }) => {
    try {
      const ideas = await db.getAllContentIdeas(ctx.user.id);
      return ideas;
    } catch (error) {
      console.error("Error fetching all content ideas:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch content ideas",
      });
    }
  }),
});
