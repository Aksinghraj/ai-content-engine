import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  disconnectSocialAccount,
  getSocialConnection,
  getUserSocialConnections,
} from "../db/social";
import { getEngagementEvents } from "../db/enterprise";

/**
 * Legacy compatibility router.
 *
 * The active OAuth and publishing flows live in socialOAuthIntegration and
 * socialMedia. This router remains mounted for old clients, but must never
 * fabricate credentials, posts, comments, or provider replies.
 */
export const socialOAuthRouter = router({
  getOAuthUrl: protectedProcedure
    .input(z.object({
      platform: z.enum(["instagram", "twitter", "linkedin", "facebook", "youtube", "tiktok"]),
      redirectUrl: z.string().url(),
    }))
    .query(() => {
      throw new Error("This legacy OAuth endpoint is retired. Use Connected Accounts to start a validated provider connection.");
    }),

  handleOAuthCallback: protectedProcedure
    .input(z.object({
      platform: z.enum(["instagram", "twitter", "linkedin", "facebook", "youtube", "tiktok"]),
      code: z.string(),
      state: z.string().optional(),
    }))
    .mutation(() => {
      throw new Error("This legacy OAuth callback is retired. Complete authorization through the current provider connection flow.");
    }),

  getConnectedAccounts: protectedProcedure.query(async ({ ctx }) => {
    const connections = await getUserSocialConnections(ctx.user.id);
    return {
      success: true,
      accounts: connections.map((connection) => ({
        id: String(connection.id),
        platform: connection.platform,
        username: connection.username,
        connectedAt: connection.createdAt,
        isActive: connection.isConnected && connection.isValidated,
        isConnected: connection.isConnected,
        isValidated: connection.isValidated,
        autoPost: connection.autoPost,
        autoReply: connection.autoReply,
        tokenExpiresAt: connection.tokenExpiresAt,
        validationError: connection.validationError,
      })),
    };
  }),

  disconnectAccount: protectedProcedure
    .input(z.object({ accountId: z.string().regex(/^\d+$/) }))
    .mutation(async ({ ctx, input }) => {
      const connectionId = Number(input.accountId);
      const connection = await getSocialConnection(connectionId);
      if (!connection || connection.userId !== ctx.user.id) {
        throw new Error("Connected account not found.");
      }
      await disconnectSocialAccount(ctx.user.id, connectionId);
      return { success: true };
    }),

  publishPost: protectedProcedure
    .input(z.object({
      accountId: z.string().regex(/^\d+$/),
      content: z.string().trim().min(1).max(100000),
      media: z.array(z.string().url()).max(10).optional(),
      scheduledFor: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const connection = await getSocialConnection(Number(input.accountId));
      if (!connection || connection.userId !== ctx.user.id) throw new Error("Connected account not found.");
      if (!connection.isConnected || !connection.isValidated) throw new Error("This account is not validated for publishing. Reconnect it in Connected Accounts.");
      throw new Error("This legacy publish endpoint is retired. Use the current Schedule Post or Publish Now flow.");
    }),

  getComments: protectedProcedure
    .input(z.object({ accountId: z.string().regex(/^\d+$/), limit: z.number().int().min(1).max(100).default(10) }))
    .query(async ({ ctx, input }) => {
      const connectionId = Number(input.accountId);
      const connection = await getSocialConnection(connectionId);
      if (!connection || connection.userId !== ctx.user.id) throw new Error("Connected account not found.");
      const events = await getEngagementEvents(ctx.user.id, input.limit * 2);
      const comments = events
        .filter((event) => event.socialConnectionId === connectionId && event.eventType === "comment")
        .slice(0, input.limit)
        .map((event) => ({
          id: String(event.id),
          author: event.authorName,
          authorId: event.authorId,
          content: event.content,
          createdAt: event.createdAt,
          postId: event.postId,
          sentiment: event.sentiment,
          intent: event.intent,
          autoReplyGenerated: event.autoReplyGenerated,
          autoReplySent: event.autoReplySent,
        }));
      return { success: true, comments };
    }),

  replyToComment: protectedProcedure
    .input(z.object({
      accountId: z.string().regex(/^\d+$/),
      commentId: z.string().regex(/^\d+$/),
      reply: z.string().trim().min(1).max(5000),
    }))
    .mutation(async ({ ctx, input }) => {
      const connection = await getSocialConnection(Number(input.accountId));
      if (!connection || connection.userId !== ctx.user.id) throw new Error("Connected account not found.");
      if (!connection.isConnected || !connection.isValidated) throw new Error("This account is not validated for replies.");
      throw new Error("Provider reply execution is not enabled for this account. Review the event in Reply Inbox and send it through an approved provider flow.");
    }),
});
