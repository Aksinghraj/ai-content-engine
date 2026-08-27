import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { generateAuthorizationUrl, refreshAccessToken } from "../_core/oauthFlow";
import { getConnectedSocialAccounts, getDb } from "../db";
import { socialConnections } from "../../drizzle/schema";

const supportedPlatforms = z.enum([
  "instagram",
  "facebook",
  "twitter",
  "linkedin",
  "youtube",
  "tiktok",
]);

function isXPublishingEnabled(): boolean {
  return process.env.X_API_PUBLISHING_APPROVED === "true";
}

/**
 * The single frontend-facing OAuth router. It delegates state, PKCE, and token
 * exchange to oauthFlow.ts and the Express callback handler.
 */
export const socialOAuthIntegrationRouter = router({
  getAuthorizationUrl: protectedProcedure
    .input(z.object({ platform: supportedPlatforms }))
    .mutation(async ({ input, ctx }) => {
      const baseUrl = process.env.FRONTEND_URL;
      if (!baseUrl) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "OAuth is temporarily unavailable. Please try again later.",
        });
      }

      try {
        const { authorizationUrl } = await generateAuthorizationUrl(
          baseUrl,
          input.platform,
          ctx.user.id,
        );

        return { url: authorizationUrl, platform: input.platform };
      } catch (error) {
        console.error(`[OAuth] Failed to initiate ${input.platform}`, error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Unable to start ${input.platform} connection. Check its developer-app setup and try again.`,
        });
      }
    }),

  getConnectedAccounts: protectedProcedure.query(async ({ ctx }) => {
    try {
      const connections = await getConnectedSocialAccounts(ctx.user.id);
      return connections.map((connection) => ({
        id: connection.id,
        platform: connection.platform,
        username: connection.username,
        isValidated: connection.isValidated,
        autoPost: connection.autoPost,
        canEnableAutoPost: connection.platform !== "twitter" || isXPublishingEnabled(),
        autoReply: connection.autoReply,
        tokenExpiresAt: connection.tokenExpiresAt,
        connectedAt: connection.createdAt,
      }));
    } catch (error) {
      console.error("[OAuth] Failed to load social connections", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to load connected accounts." });
    }
  }),

  disconnectAccount: protectedProcedure
    .input(z.object({ platform: supportedPlatforms }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable." });
      }

      await database
        .update(socialConnections)
        .set({
          isConnected: false,
          isValidated: false,
          accessToken: "",
          refreshToken: null,
          tokenExpiresAt: null,
          validationError: "Account disconnected by user",
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(socialConnections.userId, ctx.user.id),
            eq(socialConnections.platform, input.platform),
          ),
        );

      return { success: true, message: `${input.platform} disconnected.` };
    }),

  refreshToken: protectedProcedure
    .input(z.object({ platform: supportedPlatforms }))
    .mutation(async ({ input, ctx }) => {
      const baseUrl = process.env.FRONTEND_URL;
      if (!baseUrl) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "OAuth is temporarily unavailable." });
      }

      try {
        const refreshed = await refreshAccessToken(baseUrl, ctx.user.id, input.platform);
        return { success: true, expiresIn: refreshed.expiresIn };
      } catch (error) {
        console.error(`[OAuth] Failed to refresh ${input.platform} token`, error);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Unable to refresh the ${input.platform} connection. Please reconnect the account.`,
        });
      }
    }),

  setAutoPost: protectedProcedure
    .input(z.object({ platform: supportedPlatforms, enabled: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable." });
      }

      const [connection] = await database
        .select({ id: socialConnections.id, isConnected: socialConnections.isConnected, isValidated: socialConnections.isValidated, tokenExpiresAt: socialConnections.tokenExpiresAt })
        .from(socialConnections)
        .where(and(eq(socialConnections.userId, ctx.user.id), eq(socialConnections.platform, input.platform)))
        .limit(1);

      if (!connection?.isConnected || !connection.isValidated) {
        throw new TRPCError({ code: "BAD_REQUEST", message: `Reconnect and validate your ${input.platform} account before enabling Auto-Post.` });
      }
      if (connection.tokenExpiresAt && connection.tokenExpiresAt.getTime() <= Date.now()) {
        throw new TRPCError({ code: "BAD_REQUEST", message: `Your ${input.platform} access token has expired. Reconnect before enabling Auto-Post.` });
      }
      if (input.platform === "twitter" && input.enabled && !isXPublishingEnabled()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "X Auto-Post is unavailable until the owner enables an approved X API budget.",
        });
      }

      await database
        .update(socialConnections)
        .set({ autoPost: input.enabled, updatedAt: new Date() })
        .where(
          and(
            eq(socialConnections.id, connection.id),
            eq(socialConnections.userId, ctx.user.id),
          ),
        );
      return { success: true, autoPost: input.enabled };
    }),
});
