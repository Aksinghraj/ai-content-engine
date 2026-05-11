import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  postToInstagram,
  postToTwitter,
  postToLinkedIn,
  postToFacebook,
  postToYouTube,
  postToTikTok,
  postToMultiplePlatforms,
} from "../_core/socialMediaPosting";

export const socialPostingRouter = router({
  /**
   * Post to a single platform
   */
  postToSinglePlatform: protectedProcedure
    .input(
      z.object({
        platform: z.enum(["instagram", "twitter", "linkedin", "facebook", "youtube", "tiktok"]),
        text: z.string().min(1).max(5000),
        imageUrl: z.string().optional(),
        videoUrl: z.string().optional(),
        hashtags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        let result;

        switch (input.platform) {
          case "instagram":
            result = await postToInstagram(ctx.user.id, {
              text: input.text,
              imageUrl: input.imageUrl,
              hashtags: input.hashtags,
            });
            break;
          case "twitter":
            result = await postToTwitter(ctx.user.id, {
              text: input.text,
              hashtags: input.hashtags,
            });
            break;
          case "linkedin":
            result = await postToLinkedIn(ctx.user.id, {
              text: input.text,
              imageUrl: input.imageUrl,
            });
            break;
          case "facebook":
            result = await postToFacebook(ctx.user.id, {
              text: input.text,
              imageUrl: input.imageUrl,
            });
            break;
          case "youtube":
            result = await postToYouTube(ctx.user.id, {
              text: input.text,
              videoUrl: input.videoUrl,
            });
            break;
          case "tiktok":
            result = await postToTikTok(ctx.user.id, {
              text: input.text,
              videoUrl: input.videoUrl,
            });
            break;
          default:
            throw new Error("Unknown platform");
        }

        if (!result.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: result.error || "Failed to post",
          });
        }

        return {
          success: true,
          postId: result.postId,
          platform: input.platform,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to post to ${input.platform}: ${(error as Error).message}`,
        });
      }
    }),

  /**
   * Post to multiple platforms at once
   */
  postToMultiplePlatforms: protectedProcedure
    .input(
      z.object({
        platforms: z.array(z.enum(["instagram", "twitter", "linkedin", "facebook", "youtube", "tiktok"])),
        text: z.string().min(1).max(5000),
        imageUrl: z.string().optional(),
        videoUrl: z.string().optional(),
        hashtags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const results = await postToMultiplePlatforms(ctx.user.id, input.platforms, {
          text: input.text,
          imageUrl: input.imageUrl,
          videoUrl: input.videoUrl,
          hashtags: input.hashtags,
        });

        const successful = results.filter((r) => r.success);
        const failed = results.filter((r) => !r.success);

        if (failed.length === results.length) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to post to all platforms: ${failed.map((f) => f.error).join(", ")}`,
          });
        }

        return {
          success: true,
          successful: successful.map((s) => ({
            platform: s.platform,
            postId: s.postId,
          })),
          failed: failed.map((f) => ({
            platform: f.platform,
            error: f.error,
          })),
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to post to multiple platforms: ${(error as Error).message}`,
        });
      }
    }),
});
