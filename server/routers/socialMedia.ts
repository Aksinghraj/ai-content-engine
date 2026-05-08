import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import {
  saveSocialConnection,
  getUserSocialConnections,
  getSocialConnection,
  disconnectSocialAccount,
  createScheduledPost,
  getUserScheduledPosts,
  deleteScheduledPost,
  updateSocialConnectionSettings,
} from "../db/social";
import { storagePut } from "../storage";

export const socialMediaRouter = router({
  /**
   * Save OAuth token after successful login
   */
  saveConnection: protectedProcedure
    .input(
      z.object({
        platform: z.string(),
        username: z.string(),
        accessToken: z.string(),
        platformUserId: z.string(),
        refreshToken: z.string().optional(),
        tokenExpiresAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const connection = await saveSocialConnection(
        ctx.user.id,
        input.platform,
        input.username,
        input.accessToken,
        input.platformUserId,
        input.refreshToken,
        input.tokenExpiresAt
      );

      return {
        success: true,
        connection,
      };
    }),

  /**
   * Get all connected social accounts for current user
   */
  getConnections: protectedProcedure.query(async ({ ctx }) => {
    const connections = await getUserSocialConnections(ctx.user.id);
    return connections;
  }),

  /**
   * Disconnect a social account
   */
  disconnect: protectedProcedure
    .input(z.object({ connectionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await disconnectSocialAccount(ctx.user.id, input.connectionId);
      return { success: true };
    }),

  /**
   * Update auto-post/auto-reply settings
   */
  updateSettings: protectedProcedure
    .input(
      z.object({
        connectionId: z.number(),
        autoPost: z.boolean().optional(),
        autoReply: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await updateSocialConnectionSettings(
        input.connectionId,
        ctx.user.id,
        input.autoPost,
        input.autoReply
      );
      return { success: true };
    }),

  /**
   * Upload media file to S3 and return URL
   */
  uploadMedia: protectedProcedure
    .input(
      z.object({
        filename: z.string(),
        fileData: z.string(), // Base64 encoded
        mediaType: z.enum(["image", "video"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Decode base64
        const buffer = Buffer.from(input.fileData, "base64");

        // Determine MIME type
        let mimeType = "image/jpeg";
        if (input.filename.endsWith(".png")) mimeType = "image/png";
        else if (input.filename.endsWith(".gif")) mimeType = "image/gif";
        else if (input.filename.endsWith(".webp")) mimeType = "image/webp";
        else if (input.filename.endsWith(".mp4")) mimeType = "video/mp4";
        else if (input.filename.endsWith(".webm")) mimeType = "video/webm";
        else if (input.filename.endsWith(".mov")) mimeType = "video/quicktime";

        // Upload to S3
        const storageKey = `social-media/${ctx.user.id}/${Date.now()}_${input.filename}`;
        const { url, key } = await storagePut(storageKey, buffer, mimeType);

        return {
          success: true,
          url,
          key,
          filename: input.filename,
        };
      } catch (error) {
        console.error("Media upload error:", error);
        throw new Error("Failed to upload media");
      }
    }),

  /**
   * Create a scheduled post
   */
  schedulePost: protectedProcedure
    .input(
      z.object({
        socialConnectionId: z.number(),
        platform: z.string(),
        content: z.string(),
        scheduledAt: z.date(),
        mediaUrl: z.string().optional(),
        mediaType: z.enum(["image", "video"]).optional(),
        mediaKey: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify the connection belongs to the user
      const connection = await getSocialConnection(input.socialConnectionId);
      if (!connection || connection.userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      const post = await createScheduledPost(
        ctx.user.id,
        input.socialConnectionId,
        input.platform,
        input.content,
        input.scheduledAt,
        input.mediaUrl,
        input.mediaType,
        input.mediaKey
      );

      return {
        success: true,
        post,
      };
    }),

  /**
   * Get all scheduled posts for current user
   */
  getScheduledPosts: protectedProcedure.query(async ({ ctx }) => {
    const posts = await getUserScheduledPosts(ctx.user.id);
    return posts;
  }),

  /**
   * Delete a scheduled post
   */
  deletePost: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await deleteScheduledPost(ctx.user.id, input.postId);
      return { success: true };
    }),
});
