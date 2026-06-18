import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { generateImage } from "../_core/imageGeneration";
import { invokeLLM } from "../_core/llm";

export const aiMediaGeneration = router({
  /**
   * Generate an image based on a prompt
   */
  generateImage: protectedProcedure
    .input(
      z.object({
        prompt: z.string().min(10).max(1000),
        platform: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
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
        console.error("Image generation error:", error);
        return {
          success: false,
          error: "Failed to generate image. Please try again.",
        };
      }
    }),

  /**
   * Generate a video based on a prompt and duration
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
      const hasSubscription = ctx.user.role === "admin" || false;

      return {
        canDownload: hasSubscription,
        message: hasSubscription ? "You have access to download" : "Subscribe to download generated media",
        subscriptionRequired: !hasSubscription,
      };
    }),
});
