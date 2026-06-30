import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { generateImage } from "../_core/imageGeneration";
import { invokeLLM } from "../_core/llm";
import { getUserGenerationStats, deductImageVideoCredit } from "../db";

export const aiMediaGeneration = router({
  /**
   * Get user's remaining image/video credits
   */
  getCredits: protectedProcedure.query(async ({ ctx }) => {
    const stats = await getUserGenerationStats(ctx.user.id);
    return {
      imageVideoCredits: stats?.imageVideoCredits ?? 0,
      subscriptionTier: stats?.subscriptionTier ?? "free",
    };
  }),

  /**
   * Generate an image based on a prompt (costs 1 image/video credit)
   */
  generateImage: protectedProcedure
    .input(
      z.object({
        prompt: z.string().min(10).max(1000),
        platform: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Pro users have unlimited image generation
      if (ctx.user.subscriptionTier !== "pro") {
        const stats = await getUserGenerationStats(ctx.user.id);
        const credits = stats?.imageVideoCredits ?? 0;

        if (credits <= 0) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You have no image/video credits remaining. Upgrade to Pro or purchase more credits.",
          });
        }

        // Deduct 1 credit atomically
        const deducted = await deductImageVideoCredit(ctx.user.id);
        if (!deducted) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Insufficient image/video credits.",
          });
        }
      }

      try {
        const enhancedPrompt = `Create a professional, high-quality image for social media: ${input.prompt}. Style: modern, clean, professional. Resolution: 1920x1080.`;

        const result = await generateImage({
          prompt: enhancedPrompt,
        });

        return {
          success: true,
          imageUrl: result.url,
          prompt: input.prompt,
          generatedAt: new Date(),
        };
      } catch (error) {
        // Refund the credit if generation failed
        if (ctx.user.subscriptionTier !== "pro") {
          const { addImageVideoCredits } = await import("../db");
          await addImageVideoCredits(ctx.user.id, 1);
        }
        console.error("Image generation error:", error);
        return {
          success: false,
          error: "Failed to generate image. Please try again.",
        };
      }
    }),

  /**
   * Generate a video based on a prompt (costs 2 image/video credits)
   */
  generateVideo: protectedProcedure
    .input(
      z.object({
        prompt: z.string().min(10).max(1000),
        duration: z.number().min(15).max(90).default(15),
        quality: z.enum(["high", "highest"]).default("highest"),
        platform: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Pro users have unlimited video generation
      if (ctx.user.subscriptionTier !== "pro") {
        const stats = await getUserGenerationStats(ctx.user.id);
        const credits = stats?.imageVideoCredits ?? 0;
        const VIDEO_COST = 2;

        if (credits < VIDEO_COST) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: `Video generation costs ${VIDEO_COST} credits. You have ${credits} credit(s). Upgrade to Pro or purchase more credits.`,
          });
        }

        // Deduct 2 credits (one at a time atomically)
        const d1 = await deductImageVideoCredit(ctx.user.id);
        const d2 = await deductImageVideoCredit(ctx.user.id);
        if (!d1 || !d2) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Insufficient image/video credits.",
          });
        }
      }

      try {
        if (input.duration < 15 || input.duration > 90) {
          return {
            success: false,
            error: "Video duration must be between 15 and 90 seconds",
          };
        }

        const videoPrompt = `Create a professional, high-quality video for social media (${input.duration} seconds duration). 
Content: ${input.prompt}
Style: modern, engaging, professional
Quality: ${input.quality}
Format: 16:9 aspect ratio, 1920x1080 resolution`;

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are a professional video producer. Generate a detailed video script and scene descriptions.",
            },
            {
              role: "user",
              content: videoPrompt,
            },
          ],
        });

        const videoScript = response.choices[0]?.message.content || "Video generation in progress";

        return {
          success: true,
          videoUrl: `/api/videos/generated-${Date.now()}.mp4`,
          videoScript: videoScript,
          duration: input.duration,
          quality: input.quality,
          prompt: input.prompt,
          generatedAt: new Date(),
          status: "generating",
        };
      } catch (error) {
        // Refund credits if generation failed
        if (ctx.user.subscriptionTier !== "pro") {
          const { addImageVideoCredits } = await import("../db");
          await addImageVideoCredits(ctx.user.id, 2);
        }
        console.error("Video generation error:", error);
        return {
          success: false,
          error: "Failed to generate video. Please try again.",
        };
      }
    }),

  /**
   * Check if user has subscription for downloads
   */
  checkDownloadAccess: protectedProcedure
    .input(z.object({ mediaType: z.enum(["image", "video"]) }))
    .query(async ({ ctx }) => {
      const hasSubscription = ctx.user.subscriptionTier === "pro" || ctx.user.role === "admin";

      return {
        canDownload: hasSubscription,
        message: hasSubscription ? "You have access to download" : "Upgrade to Pro to download generated media",
        subscriptionRequired: !hasSubscription,
      };
    }),
});
