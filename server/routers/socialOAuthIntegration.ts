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

      if (!credentials.clientId || !credentials.clientSecret) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `OAuth not configured for ${input.platform}. Please contact support.`,
        });
      }

      // Use the same redirect URI pattern as oauthConfig.ts and the registered developer app URIs
      const BASE_URL = process.env.FRONTEND_URL || "https://lumae.co.in";
      const redirectUri = `${BASE_URL}/api/oauth/callback/${input.platform}/callback`;

      const authUrl = getAuthorizationUrl(
        input.platform,
        ctx.user.id,
        credentials.clientId,
        redirectUri
      );

      return {
        url: authUrl,
        platform: input.platform,
      };
    }),

  // Get connected accounts for user
  getConnectedAccounts: protectedProcedure.query(async ({ ctx }) => {
    try {
      const connections = await db.getConnectedSocialAccounts(ctx.user.id);


      return connections.map((conn: any) => ({
        id: conn.id,
        platform: conn.platform,
        username: conn.username,
        followers: conn.followers || 0,
        isValidated: conn.isValidated,
        connectedAt: conn.createdAt,
      }));
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch connected accounts",
      });
    }
  }),

  // Handle OAuth callback (called from backend)
  handleCallback: protectedProcedure
    .input(
      z.object({
        platform: z.enum(["instagram", "facebook", "twitter", "linkedin", "youtube", "tiktok"]),
        code: z.string(),
        state: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Verify state token
        if (!verifyStateToken(input.state, ctx.user.id, input.platform)) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid or expired state token",
          });
        }

        const credentials = OAUTH_CREDENTIALS[input.platform];
        const redirectUri = `${process.env.VITE_APP_URL || "http://localhost:3000"}/api/oauth/${input.platform}/callback`;

        // Exchange code for token
        const tokenData = await exchangeCodeForToken(
          input.platform,
          input.code,
          credentials.clientId,
          credentials.clientSecret,
          redirectUri
        );

        // Get user info
        const userInfo = await getUserInfo(input.platform, tokenData.accessToken);

        // Check if connection already exists
        const existingConnection = await db.getSocialConnection(ctx.user.id, input.platform);

        // Encrypt tokens before storing
        const encryptedAccessToken = encryptToken(tokenData.accessToken);
        const encryptedRefreshToken = tokenData.refreshToken ? encryptToken(tokenData.refreshToken) : null;

        if (existingConnection) {
          // Update existing connection
          await db.updateSocialConnectionToken(
            existingConnection.id,
            encryptedAccessToken,
            tokenData.expiresIn ? new Date(Date.now() + tokenData.expiresIn * 1000) : undefined
          );
        } else {
          // Create new connection - use raw insert
          const { getDb } = await import("../db");
          const database = await getDb();
          if (database) {
            await database.insert(socialConnections).values({
              userId: ctx.user.id,
              platform: input.platform,
              username: userInfo.username,
              accessToken: encryptedAccessToken,
              refreshToken: encryptedRefreshToken,
              tokenExpiresAt: tokenData.expiresIn
                ? new Date(Date.now() + tokenData.expiresIn * 1000)
                : null,
              platformUserId: userInfo.id,
              isConnected: true,
              isValidated: true,
              autoPost: false,
              autoReply: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
        }

        return {
          success: true,
          platform: input.platform,
          username: userInfo.username,
          message: `Successfully connected ${input.platform}`,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `OAuth callback failed: ${(error as Error).message}`,
        });
      }
    }),

  // Disconnect account
  disconnectAccount: protectedProcedure
    .input(z.object({ platform: z.enum(["instagram", "facebook", "twitter", "linkedin", "youtube", "tiktok"]) }))
    .mutation(async ({ input, ctx }) => {
      try {
      const { getDb } = await import("../db");
      const database = await getDb();
      if (database) {
        await database.update(socialConnections)
          .set({
            isConnected: false,
            isValidated: false,
            validationError: "Account disconnected by user",
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(socialConnections.userId, ctx.user.id),
              eq(socialConnections.platform, input.platform)
            )
          );
      }

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
        const connection = await db.getSocialConnection(ctx.user.id, input.platform);

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
        await db.updateSocialConnectionToken(
          connection.id,
          encryptedAccessToken,
          newTokenData.expiresIn ? new Date(Date.now() + newTokenData.expiresIn * 1000) : undefined
        );

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
        const connection = await db.getSocialConnection(ctx.user.id, input.platform);
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
});
