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

  /**
   * Send a test post to verify that the social media connection works.
   * Calls real platform APIs to validate credentials.
   */
  sendTestPost: protectedProcedure
    .input(
      z.object({
        connectionId: z.number(),
        platform: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify the connection belongs to the user
      const connection = await getSocialConnection(input.connectionId);
      if (!connection || connection.userId !== ctx.user.id) {
        throw new Error("Connection not found or unauthorized");
      }

      if (!connection.isConnected) {
        return {
          success: false,
          message: `Account is not connected. Please reconnect your ${input.platform} account.`,
          status: 'disconnected' as const,
          reconnectRequired: true,
        };
      }

      const hasCredentials = !!connection.accessToken;
      const hasUsername = !!connection.username;

      if (!hasCredentials || !hasUsername) {
        return {
          success: false,
          message: `Connection verification failed: Missing ${!hasCredentials ? 'credentials' : 'username'}. Please reconnect your ${input.platform} account.`,
          status: 'missing_credentials' as const,
          reconnectRequired: true,
        };
      }

      // Verify token is not expired
      if (connection.tokenExpiresAt && new Date(connection.tokenExpiresAt) < new Date()) {
        return {
          success: false,
          message: `Your ${input.platform} token has expired. Please reconnect your account to refresh credentials.`,
          status: 'expired' as const,
          reconnectRequired: true,
        };
      }

      // Call real platform API to verify credentials
      try {
        const verificationResult = await verifyPlatformCredentials(
          input.platform,
          connection.accessToken,
          connection.platformUserId
        );

        if (!verificationResult.valid) {
          return {
            success: false,
            message: verificationResult.error || `Failed to verify ${input.platform} credentials. Please reconnect your account.`,
            status: 'invalid_credentials' as const,
            reconnectRequired: true,
            providerError: verificationResult.providerError,
          };
        }

        return {
          success: true,
          message: `✅ Verified! Your ${input.platform} account (@${connection.username}) is connected and ready to post.`,
          status: 'verified' as const,
          details: {
            platform: input.platform,
            username: connection.username,
            connectedAt: connection.createdAt,
            autoPost: connection.autoPost,
            autoReply: connection.autoReply,
            profileVerified: verificationResult.profileName || connection.username,
          },
        };
      } catch (error) {
        return {
          success: false,
          message: `Verification request failed: ${(error as Error).message}. The platform may be temporarily unavailable.`,
          status: 'network_error' as const,
          reconnectRequired: false,
        };
      }
    }),
});

/**
 * Verify credentials by calling the real platform API.
 * Each platform has a lightweight "me" or "profile" endpoint
 * that validates the token without posting anything.
 */
async function verifyPlatformCredentials(
  platform: string,
  accessToken: string,
  platformUserId: string
): Promise<{ valid: boolean; profileName?: string; error?: string; providerError?: string }> {
  const platformEndpoints: Record<string, string> = {
    instagram: `https://graph.instagram.com/v18.0/me?fields=id,username&access_token=${accessToken}`,
    facebook: `https://graph.facebook.com/v18.0/me?fields=id,name&access_token=${accessToken}`,
    twitter: `https://api.twitter.com/2/users/me`,
    linkedin: `https://api.linkedin.com/v2/userinfo`,
    youtube: `https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true&access_token=${accessToken}`,
    tiktok: `https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name`,
  };

  const endpoint = platformEndpoints[platform];
  if (!endpoint) {
    return { valid: false, error: `Unknown platform: ${platform}` };
  }

  try {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };

    // Some platforms need Authorization header instead of query param
    if (platform === 'twitter') {
      headers['Authorization'] = `Bearer ${accessToken}`;
    } else if (platform === 'linkedin') {
      headers['Authorization'] = `Bearer ${accessToken}`;
    } else if (platform === 'tiktok') {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(endpoint, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let providerError = `HTTP ${response.status}`;
      try {
        const parsed = JSON.parse(errorBody);
        providerError = parsed.error?.message || parsed.detail || parsed.error_description || providerError;
      } catch {}

      if (response.status === 401 || response.status === 403) {
        return {
          valid: false,
          error: `Invalid or expired credentials for ${platform}. Please reconnect.`,
          providerError,
        };
      }

      return {
        valid: false,
        error: `Platform returned error (${response.status}). Credentials may be invalid.`,
        providerError,
      };
    }

    const data = await response.json();

    // Extract profile name based on platform response format
    let profileName = '';
    if (platform === 'instagram') profileName = data.username || '';
    else if (platform === 'facebook') profileName = data.name || '';
    else if (platform === 'twitter') profileName = data.data?.username || '';
    else if (platform === 'linkedin') profileName = data.name || '';
    else if (platform === 'youtube') profileName = data.items?.[0]?.snippet?.title || '';
    else if (platform === 'tiktok') profileName = data.data?.user?.display_name || '';

    return { valid: true, profileName };
  } catch (error) {
    return {
      valid: false,
      error: `Network error while verifying ${platform}: ${(error as Error).message}`,
    };
  }
}
