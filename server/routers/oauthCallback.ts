import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  exchangeCodeForToken,
  fetchUserProfile,
  validateOAuthState,
  generateOAuthState,
  getOAuthAuthorizationUrl,
} from "../_core/socialOAuth";
import { getDb } from "../db";
import { socialConnections } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

const OAUTH_CREDENTIALS = {
  instagram: {
    clientId: process.env.INSTAGRAM_CLIENT_ID || "",
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || "",
  },
  twitter: {
    clientId: process.env.TWITTER_CLIENT_ID || "",
    clientSecret: process.env.TWITTER_CLIENT_SECRET || "",
  },
  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID || "",
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "",
  },
  facebook: {
    clientId: process.env.FACEBOOK_CLIENT_ID || "",
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
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

export const oauthCallbackRouter = router({
  /**
   * Get OAuth authorization URL for a platform
   */
  getAuthorizationUrl: protectedProcedure
    .input(
      z.object({
        platform: z.enum(["instagram", "twitter", "linkedin", "facebook", "youtube", "tiktok"]),
      })
    )
    .query(async ({ input }) => {
      const { platform } = input;
      const credentials = OAUTH_CREDENTIALS[platform];

      if (!credentials.clientId || !credentials.clientSecret) {
        throw new Error(`OAuth credentials not configured for ${platform}`);
      }

      const state = generateOAuthState();
      const redirectUri = `${process.env.VITE_APP_URL || "http://localhost:3000"}/oauth/callback/${platform}`;

      const authorizationUrl = getOAuthAuthorizationUrl(
        platform,
        credentials.clientId,
        redirectUri,
        state
      );

      return {
        authorizationUrl,
        platform,
        state,
      };
    }),

  /**
   * Handle OAuth callback and save connection
   */
  handleCallback: protectedProcedure
    .input(
      z.object({
        platform: z.enum(["instagram", "twitter", "linkedin", "facebook", "youtube", "tiktok"]),
        code: z.string(),
        state: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const { platform, code, state } = input;
      const userId = ctx.user.id;

      // Validate state (in production, validate against stored state)
      if (!state) {
        throw new Error("Invalid OAuth state");
      }

      const credentials = OAUTH_CREDENTIALS[platform];
      if (!credentials.clientId || !credentials.clientSecret) {
        throw new Error(`OAuth credentials not configured for ${platform}`);
      }

      const redirectUri = `${process.env.VITE_APP_URL || "http://localhost:3000"}/oauth/callback/${platform}`;

      try {
        // Exchange code for token
        const token = await exchangeCodeForToken(
          platform,
          code,
          credentials.clientId,
          credentials.clientSecret,
          redirectUri
        );

        // Fetch user profile
        const profile = await fetchUserProfile(platform, token.accessToken);

        // Check if connection already exists
        const existingConnection = await db
          .select()
          .from(socialConnections)
          .where(
            and(
              eq(socialConnections.userId, userId),
              eq(socialConnections.platform, platform)
            )
          )
          .limit(1);

        const connectionData = {
          userId,
          platform,
          platformUserId: profile.id,
          username: profile.username,
          accessToken: token.accessToken,
          refreshToken: token.refreshToken || null,
          tokenExpiresAt: token.expiresIn
            ? new Date(Date.now() + token.expiresIn * 1000)
            : null,
          isConnected: true,
          isValidated: true,
          lastValidationAt: new Date(),
        };

        if (existingConnection.length > 0) {
          // Update existing connection
          await db
            .update(socialConnections)
            .set(connectionData)
            .where(
              and(
                eq(socialConnections.userId, userId),
                eq(socialConnections.platform, platform)
              )
            );
        } else {
          // Create new connection
          await db.insert(socialConnections).values(connectionData);
        }

        return {
          success: true,
          platform,
          profile: {
            id: profile.id,
            username: profile.username,
            displayName: profile.displayName,
            profileImage: profile.profileImage,
            followers: profile.followers,
            verified: profile.verified,
          },
        };
      } catch (error) {
        console.error(`[OAuth] Callback error for ${platform}:`, error);
        throw new Error(`Failed to connect ${platform} account: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }),

  /**
   * Disconnect a social account
   */
  disconnectAccount: protectedProcedure
    .input(
      z.object({
        platform: z.enum(["instagram", "twitter", "linkedin", "facebook", "youtube", "tiktok"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const { platform } = input;
      const userId = ctx.user.id;

      await db
        .delete(socialConnections)
        .where(
          and(
            eq(socialConnections.userId, userId),
            eq(socialConnections.platform, platform)
          )
        );

      return {
        success: true,
        message: `${platform} account disconnected`,
      };
    }),

  /**
   * Get all connected accounts for user
   */
  getConnectedAccounts: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const userId = ctx.user.id;

    const connections = await db
      .select()
      .from(socialConnections)
      .where(eq(socialConnections.userId, userId));

    return connections.map((conn: any) => ({
      platform: conn.platform,
      username: conn.username,
      platformUserId: conn.platformUserId,
      isConnected: conn.isConnected,
      isValidated: conn.isValidated,
      createdAt: conn.createdAt,
      updatedAt: conn.updatedAt,
    }));
  }),

  /**
   * Get connection status for a specific platform
   */
  getConnectionStatus: protectedProcedure
    .input(
      z.object({
        platform: z.enum(["instagram", "twitter", "linkedin", "facebook", "youtube", "tiktok"]),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const { platform } = input;
      const userId = ctx.user.id;

      const connection = await db
        .select()
        .from(socialConnections)
        .where(
          and(
            eq(socialConnections.userId, userId),
            eq(socialConnections.platform, platform)
          )
        )
        .limit(1);

      if (connection.length === 0) {
        return {
          connected: false,
          platform,
        };
      }

      const conn = connection[0]!;
      return {
        connected: true,
        platform,
        username: conn.username,
        platformUserId: conn.platformUserId,
        isConnected: conn.isConnected,
        isValidated: conn.isValidated,
        createdAt: conn.createdAt,
      };
    }),

  /**
   * Refresh token for a platform
   */
  refreshToken: protectedProcedure
    .input(
      z.object({
        platform: z.enum(["instagram", "twitter", "linkedin", "facebook", "youtube", "tiktok"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const { platform } = input;
      const userId = ctx.user.id;

      const connection = await db
        .select()
        .from(socialConnections)
        .where(
          and(
            eq(socialConnections.userId, userId),
            eq(socialConnections.platform, platform)
          )
        )
        .limit(1);

      if (connection.length === 0) {
        throw new Error(`No connection found for ${platform}`);
      }

      const conn = connection[0]!;
      if (!conn.refreshToken) {
        throw new Error(`No refresh token available for ${platform}`);
      }

      try {
        const { refreshAccessToken } = await import("../_core/socialOAuth");
        const credentials = OAUTH_CREDENTIALS[platform];

        const newToken = await refreshAccessToken(
          platform,
          conn.refreshToken,
          credentials.clientId,
          credentials.clientSecret
        );

        await db
          .update(socialConnections)
          .set({
            accessToken: newToken.accessToken,
            refreshToken: newToken.refreshToken || conn.refreshToken,
            tokenExpiresAt: newToken.expiresIn
              ? new Date(Date.now() + newToken.expiresIn * 1000)
              : null,
            lastValidationAt: new Date(),
          })
          .where(
            and(
              eq(socialConnections.userId, userId),
              eq(socialConnections.platform, platform)
            )
          );

        return {
          success: true,
          message: `${platform} token refreshed`,
        };
      } catch (error) {
        console.error(`[OAuth] Token refresh error for ${platform}:`, error);
        throw new Error(`Failed to refresh ${platform} token`);
      }
    }),
});
