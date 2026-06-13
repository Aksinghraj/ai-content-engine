import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "../_core/llm";

const PLATFORM_RULES: Record<string, { maxChars: number; style: string; hashtags: number }> = {
  twitter: { maxChars: 280, style: "concise, punchy, conversational, trending hashtags", hashtags: 2 },
  instagram: { maxChars: 2200, style: "visual-first, story-driven, lifestyle, emojis welcome", hashtags: 10 },
  linkedin: { maxChars: 3000, style: "professional, thought-leadership, data-driven, no emojis", hashtags: 3 },
  facebook: { maxChars: 63206, style: "community-focused, engaging questions, conversational", hashtags: 2 },
  youtube: { maxChars: 5000, style: "detailed description, keywords for SEO, timestamps if applicable", hashtags: 5 },
  tiktok: { maxChars: 2200, style: "trendy, Gen-Z friendly, challenge-oriented, viral hooks", hashtags: 8 },
};

export const aiPostGenerationRouter = router({
  /**
   * Generate AI content for a single platform
   */
  generateForPlatform: protectedProcedure
    .input(
      z.object({
        topic: z.string().min(1).max(500),
        platform: z.enum(["twitter", "instagram", "linkedin", "facebook", "youtube", "tiktok"]),
        tone: z.enum(["professional", "casual", "humorous", "inspirational", "educational"]).default("casual"),
        niche: z.string().optional(),
        includeHashtags: z.boolean().default(true),
        includeEmoji: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      const rules = PLATFORM_RULES[input.platform];
      if (!rules) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Unknown platform" });
      }

      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are an expert social media content creator specializing in ${input.platform}.
Platform rules: ${rules.style}. Max characters: ${rules.maxChars}.
${input.includeHashtags ? `Include ${rules.hashtags} relevant hashtags.` : "No hashtags."}
${input.includeEmoji ? "Use appropriate emojis." : "No emojis."}
Tone: ${input.tone}.
${input.niche ? `Niche/industry: ${input.niche}.` : ""}
Return ONLY the post content, nothing else.`,
            },
            {
              role: "user",
              content: `Create a ${input.platform} post about: ${input.topic}`,
            },
          ],
        });

        const content = response.choices[0].message.content || "";
        const trimmed = typeof content === "string" ? content.trim() : String(content).trim();

        return {
          success: true,
          content: trimmed,
          platform: input.platform,
          charCount: trimmed.length,
          maxChars: rules.maxChars,
          isWithinLimit: trimmed.length <= rules.maxChars,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to generate content for ${input.platform}: ${(error as Error).message}`,
        });
      }
    }),

  /**
   * Generate content for ALL platforms at once
   */
  generateForAllPlatforms: protectedProcedure
    .input(
      z.object({
        topic: z.string().min(1).max(500),
        tone: z.enum(["professional", "casual", "humorous", "inspirational", "educational"]).default("casual"),
        niche: z.string().optional(),
        includeHashtags: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are an expert social media content creator. Generate platform-optimized posts for all major social media platforms.
Tone: ${input.tone}. ${input.niche ? `Niche: ${input.niche}.` : ""}
Return a JSON object with keys: twitter, instagram, linkedin, facebook, youtube, tiktok.
Each value is the post content string optimized for that platform.
Twitter: max 280 chars, punchy, 2 hashtags.
Instagram: visual-first, story-driven, 10 hashtags, emojis.
LinkedIn: professional, thought-leadership, 3 hashtags, no emojis.
Facebook: community-focused, engaging, 2 hashtags.
YouTube: SEO-optimized description, 5 hashtags, keywords.
TikTok: trendy, viral hook, 8 hashtags, Gen-Z friendly.`,
            },
            {
              role: "user",
              content: `Create posts for all platforms about: ${input.topic}`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "platform_posts",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  twitter: { type: "string" },
                  instagram: { type: "string" },
                  linkedin: { type: "string" },
                  facebook: { type: "string" },
                  youtube: { type: "string" },
                  tiktok: { type: "string" },
                },
                required: ["twitter", "instagram", "linkedin", "facebook", "youtube", "tiktok"],
                additionalProperties: false,
              },
            },
          },
        });

        const contentRaw = response.choices[0].message.content;
        const posts = typeof contentRaw === "string" ? JSON.parse(contentRaw) : contentRaw;

        return {
          success: true,
          posts: posts as Record<string, string>,
          topic: input.topic,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to generate multi-platform content: ${(error as Error).message}`,
        });
      }
    }),

  /**
   * Improve / rewrite existing post content for a platform
   */
  improvePost: protectedProcedure
    .input(
      z.object({
        content: z.string().min(1),
        platform: z.enum(["twitter", "instagram", "linkedin", "facebook", "youtube", "tiktok"]),
        improvementType: z.enum(["more_engaging", "more_professional", "shorter", "add_hashtags", "add_cta", "viral"]).default("more_engaging"),
      })
    )
    .mutation(async ({ input }) => {
      const rules = PLATFORM_RULES[input.platform];

      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are an expert social media editor. Improve the given ${input.platform} post.
Improvement goal: ${input.improvementType.replace(/_/g, " ")}.
Platform rules: ${rules.style}. Max characters: ${rules.maxChars}.
Return ONLY the improved post content, nothing else.`,
            },
            {
              role: "user",
              content: `Improve this ${input.platform} post:\n\n${input.content}`,
            },
          ],
        });

        const improved = response.choices[0].message.content || "";
        const trimmed = typeof improved === "string" ? improved.trim() : String(improved).trim();

        return {
          success: true,
          originalContent: input.content,
          improvedContent: trimmed,
          platform: input.platform,
          charCount: trimmed.length,
          maxChars: rules.maxChars,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to improve post: ${(error as Error).message}`,
        });
      }
    }),

  /**
   * Get best posting times for a platform
   */
  getBestPostingTimes: protectedProcedure
    .input(
      z.object({
        platform: z.enum(["twitter", "instagram", "linkedin", "facebook", "youtube", "tiktok"]),
        timezone: z.string().default("UTC"),
        niche: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const bestTimes: Record<string, { days: string[]; times: string[]; reason: string }> = {
        twitter: {
          days: ["Tuesday", "Wednesday", "Thursday"],
          times: ["9:00 AM", "12:00 PM", "3:00 PM", "6:00 PM"],
          reason: "Peak engagement during work breaks and commute times",
        },
        instagram: {
          days: ["Monday", "Wednesday", "Friday"],
          times: ["6:00 AM", "12:00 PM", "7:00 PM", "9:00 PM"],
          reason: "Users browse during morning routines and evening wind-down",
        },
        linkedin: {
          days: ["Tuesday", "Wednesday", "Thursday"],
          times: ["7:30 AM", "12:00 PM", "5:00 PM"],
          reason: "Professionals check LinkedIn before work and during lunch",
        },
        facebook: {
          days: ["Wednesday", "Thursday", "Friday"],
          times: ["9:00 AM", "1:00 PM", "3:00 PM"],
          reason: "Mid-week afternoon engagement peaks",
        },
        youtube: {
          days: ["Thursday", "Friday", "Saturday"],
          times: ["12:00 PM", "3:00 PM", "8:00 PM"],
          reason: "Weekend viewing peaks, Thursday uploads catch Friday traffic",
        },
        tiktok: {
          days: ["Tuesday", "Thursday", "Friday"],
          times: ["6:00 AM", "10:00 AM", "7:00 PM", "9:00 PM"],
          reason: "Morning and evening scrolling sessions dominate TikTok usage",
        },
      };

      return {
        success: true,
        platform: input.platform,
        timezone: input.timezone,
        bestTimes: bestTimes[input.platform],
      };
    }),
});
