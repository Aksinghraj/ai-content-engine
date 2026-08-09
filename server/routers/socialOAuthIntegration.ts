import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { eq, and } from "drizzle-orm";
import * as db from "../db";
import { socialConnections } from "../../drizzle/schema";
import {
  getAuthorizationUrl,
  exchangeCodeForToken,
  getUserInfo,
  refreshAccessToken,
  encryptToken,
  decryptToken,
  verifyStateToken,
} from "../_core/oauthService";
import { revokeOAuthToken } from "../_core/oauthRevocation";
import { deleteSocialConnection } from "../db/social";

// OAuth credentials stored in environment variables (Lumae's developer apps)
const OAUTH_CREDENTIALS = {
  instagram: {
    clientId: process.env.INSTAGRAM_CLIENT_ID || "",
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || "",
  },
  facebook: {
    clientId: process.env.FACEBOOK_CLIENT_ID || "",
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
  },
  twitter: {
    clientId: process.env.TWITTER_CLIENT_ID || "",
    clientSecret: process.env.TWITTER_CLIENT_SECRET || "",
  },
  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID || "",
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "",
  },
  youtube: {
    clientId: process.env.YOUTUBE_CLIENT_ID || "",
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET || "",
  },
  tiktok: {
    clientId: process.env.TIKTOK_CLIENT_ID || "",
    clientSecret: process.env.TIKTOK_CLIENT_SECRET || "",
  },
};

export const socialOAuthIntegrationRouter = router({
  // Get authorization URL for a platform
  getAuthorizationUrl: protectedProcedure
    .input(z.object({ platform: z.enum(["instagram", "facebook", "twitter", "linkedin", "youtube", "tiktok"]) }))
    .query(({ input, ctx }) => {
      const credentials = OAUTH_CREDENTIALS[input.platform];
      if (!credentials.clientId) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: `OAuth not configured for ${input.platform}`,
        });
      }
      const url = getAuthorizationUrl(input.platform, ctx.user.id.toString());
      return { url };
    }),

  // Get list of connected accounts for current user
  getConnectedAccounts: protectedProcedure.query(async ({ ctx }) => {
    try {
      const connections = await db.getUserSocialConnections(ctx.user.id);
      return connections.map((conn) => ({
        id: conn.id,
        platform: conn.platform,
        username: conn.username,
        isConnected: conn.isConnected,
        createdAt: conn.createdAt,
        platformUserId: conn.platformUserId,
      }));
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch connected accounts",
      });
    }
  }),

  // Disconnect account (old method - kept for compatibility)
  disconnect: protectedProcedure
    .input(z.object({ platform: z.enum(["instagram", "facebook", "twitter", "linkedin", "youtube", "tiktok"]) }))
    .mutation(async ({ input, ctx }) => {
      try {
        const connection = await db.getSocialConnectionByPlatform(ctx.user.id, input.platform);
        if (!connection) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `No ${input.platform} connection found`,
          });
        }
        await db.disconnectSocialAccount(ctx.user.id, connection.id);
        return {
          success: true,
          message: `${input.platform} account disconnected`,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to disconnect account",
        });
      }
    }),

  // Refresh token
  refreshToken: protectedProcedure
    .input(z.object({ platform: z.enum(["instagram", "facebook", "twitter", "linkedin", "youtube", "tiktok"]) }))
    .mutation(async ({ input, ctx }) => {
      try {
        const connection = await db.getSocialConnectionByPlatform(ctx.user.id, input.platform);
        if (!connection || !connection.refreshToken) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Connection not found or refresh token not available",
          });
        }
        const credentials = OAUTH_CREDENTIALS[input.platform];
        const decryptedRefreshToken = decryptToken(connection.refreshToken);
        // Refresh the token
        const newTokenData = await refreshAccessToken(
          input.platform,
          decryptedRefreshToken,
          credentials.clientId,
          credentials.clientSecret
        );
        // Update with new token
        const encryptedAccessToken = encryptToken(newTokenData.accessToken);
        await db.updateSocialConnection(connection.id, {
          accessToken: encryptedAccessToken,
          tokenExpiresAt: newTokenData.expiresIn ? new Date(Date.now() + newTokenData.expiresIn * 1000) : undefined,
        });
        return {
          success: true,
          message: `${input.platform} token refreshed successfully`,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to refresh token: ${(error as Error).message}`,
        });
      }
    }),

  // Get decrypted token for API calls (internal use only)
  getDecryptedToken: protectedProcedure
    .input(z.object({ platform: z.enum(["instagram", "facebook", "twitter", "linkedin", "youtube", "tiktok"]) }))
    .query(async ({ input, ctx }) => {
      try {
        const connection = await db.getSocialConnectionByPlatform(ctx.user.id, input.platform);
        if (connection && !connection.isConnected) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `No active ${input.platform} connection found`,
          });
        }
        if (!connection) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `No active ${input.platform} connection found`,
          });
        }
        const decryptedToken = decryptToken(connection.accessToken);
        return {
          accessToken: decryptedToken,
          platform: input.platform,
          username: connection.username,
          platformUserId: connection.platformUserId,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve token",
        });
      }
    }),

  // Secure disconnect: revoke token and delete from database
  secureDisconnect: protectedProcedure
    .input(z.object({ platform: z.enum(["instagram", "facebook", "twitter", "linkedin", "youtube", "tiktok"]) }))
    .mutation(async ({ input, ctx }) => {
      try {
        const connection = await db.getSocialConnectionByPlatform(ctx.user.id, input.platform);

        if (!connection || !connection.isConnected) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `No active ${input.platform} connection found`,
          });
        }

        // Step 1: Attempt to revoke the token on the provider's servers
        console.log(`[Disconnect] Revoking ${input.platform} token for user ${ctx.user.id}...`);
        const revocationResult = await revokeOAuthToken(input.platform, connection.accessToken);

        if (!revocationResult.success) {
          console.warn(
            `[Disconnect] Token revocation failed for ${input.platform}: ${revocationResult.error}. Proceeding with local deletion.`
          );
        }

        // Step 2: Delete the connection from database (including all tokens)
        await deleteSocialConnection(ctx.user.id, connection.id);
        console.log(`[Disconnect] ${input.platform} connection deleted for user ${ctx.user.id}`);

        return {
          success: true,
          platform: input.platform,
          message: `${input.platform} account successfully disconnected and tokens revoked`,
          revocationStatus: revocationResult.success ? "revoked" : "revocation_failed_but_deleted",
        };
      } catch (error) {
        console.error(`[Disconnect] Error disconnecting ${input.platform}:`, error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to disconnect ${input.platform} account: ${(error as Error).message}`,
        });
      }
    }),
});
