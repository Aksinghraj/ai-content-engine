import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  generateAuthorizationUrl,
} from "../_core/oauthFlow";
import {
  getUserSocialConnections,
  disconnectSocialAccount,
  getSocialConnection,
  getSocialConnectionByPlatform,
} from "../db/social";

/**
 * OAuth Management Router
 * Handles OAuth flow initiation, token management, and account management
 */

export const oauthManagementRouter = router({
  /**
   * Get authorization URL for a platform
   * User clicks this link to start OAuth flow
   */
  getAuthorizationUrl: protectedProcedure
    .input(
      z.object({
        platform: z.enum(["instagram", "twitter", "linkedin", "facebook", "youtube", "tiktok"]),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const baseUrl = process.env.FRONTEND_URL;
        if (!baseUrl) throw new Error("FRONTEND_URL is required for OAuth redirects");
        const { authorizationUrl, state } = await generateAuthorizationUrl(
          baseUrl,
          input.platform,
          ctx.user.id
        );

        return {
          success: true,
          authorizationUrl,
          state,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to generate authorization URL: ${(error as Error).message}`,
        });
      }
    }),

  /**
   * Get all connected social accounts for current user
   */
  getConnectedAccounts: protectedProcedure.query(async ({ ctx }) => {
    try {
      const connections = await getUserSocialConnections(ctx.user.id);
      return {
        success: true,
        accounts: connections.map((conn: any) => ({
          id: conn.id,
          platform: conn.platform,
          username: conn.username,
          platformUserId: conn.platformUserId,
          isConnected: conn.isConnected,
          autoPost: conn.autoPost,
          autoReply: conn.autoReply,
          createdAt: conn.createdAt,
          updatedAt: conn.updatedAt,
          tokenExpiresAt: conn.tokenExpiresAt,
        })),
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch connected accounts",
      });
    }
  }),

  /**
   * Get specific connected account
   */
  getAccount: protectedProcedure
    .input(
      z.object({
        platform: z.enum(["instagram", "twitter", "linkedin", "facebook", "youtube", "tiktok"]),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const connection = await getSocialConnectionByPlatform(ctx.user.id, input.platform);

        if (!connection) {
          return {
            success: false,
            account: null,
            message: "Account not connected",
          };
        }

        return {
          success: true,
          account: {
            id: connection.id,
            platform: connection.platform,
            username: connection.username,
            platformUserId: connection.platformUserId,
            isConnected: connection.isConnected,
            autoPost: connection.autoPost,
            autoReply: connection.autoReply,
            createdAt: connection.createdAt,
            updatedAt: connection.updatedAt,
            tokenExpiresAt: connection.tokenExpiresAt,
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch account",
        });
      }
    }),

  /**
   * Disconnect a social account
   */
  disconnectAccount: protectedProcedure
    .input(
      z.object({
        connectionId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify ownership
        const connection = await getSocialConnection(input.connectionId);
        if (!connection || connection.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to disconnect this account",
          });
        }

        await disconnectSocialAccount(ctx.user.id, input.connectionId);

        return {
          success: true,
          message: "Account disconnected successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to disconnect account",
        });
      }
    }),

  /**
   * Check if token is expired
   */
  isTokenExpired: protectedProcedure
    .input(
      z.object({
        platform: z.enum(["instagram", "twitter", "linkedin", "facebook", "youtube", "tiktok"]),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const connection = await getSocialConnectionByPlatform(ctx.user.id, input.platform);

        if (!connection) {
          return {
            success: false,
            isExpired: true,
            message: "Account not connected",
          };
        }

        const isExpired =
          connection.tokenExpiresAt && new Date() > new Date(connection.tokenExpiresAt);

        return {
          success: true,
          isExpired,
          expiresAt: connection.tokenExpiresAt,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to check token expiration",
        });
      }
    }),
});
