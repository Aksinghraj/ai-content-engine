import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import {
  users,
  contentHistory,
  socialConnections,
  creditTransactions,
  userCredits,
  automationSchedules,
  twoFactorAuthenticators,
  webAuthnPasskeys,
  webAuthnCeremonies,
  trustedDevices,
  businessContacts,
  businessConsentEvents,
  whatsappBusinessConnections,
  localAuthCredentials,
  localPasswordResetTokens,
  localAuthSessionVersions,
  professionalProfiles,
  professionalProfileViews,
  tokenUsage,
  automationExecutionLogs,
  contentAnalytics,
  passwordResetTokens,
  dailyFreeActions,
  generatorLengthPreferences,
  scheduledPosts,
  socialOAuthStates,
  engagementEvents,
  knowledgeBase,
  autoReplyRules,
  repurposedContent,
  platformAnalytics,
  neulinkIntegration,
  savedTrends,
  contentIdeas,
} from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";
import { deleteHeartbeatJob } from "../_core/heartbeat";
import { parse as parseCookie } from "cookie";

export const accountDeletionRouter = router({
  /**
   * Permanently delete user account and all associated data (GDPR compliance)
   */
  deleteAccount: protectedProcedure
    .mutation(async ({ ctx }) => {
      const userId = ctx.user.id;
      const db = await getDb();

      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      try {
        const schedules = await db
          .select({ scheduleCronTaskUid: automationSchedules.scheduleCronTaskUid })
          .from(automationSchedules)
          .where(eq(automationSchedules.userId, userId));
        const session = parseCookie(ctx.req.headers.cookie ?? "")[COOKIE_NAME] ?? "";

        for (const schedule of schedules) {
          if (schedule.scheduleCronTaskUid) {
            await deleteHeartbeatJob(schedule.scheduleCronTaskUid, session);
          }
        }

        await db.transaction(async (tx) => {
          // Delete dependent and security-sensitive records before the user record.
          await tx.delete(contentIdeas).where(eq(contentIdeas.userId, userId));
          await tx.delete(savedTrends).where(eq(savedTrends.userId, userId));
          await tx.delete(platformAnalytics).where(eq(platformAnalytics.userId, userId));
          await tx.delete(engagementEvents).where(eq(engagementEvents.userId, userId));
          await tx.delete(scheduledPosts).where(eq(scheduledPosts.userId, userId));
          await tx.delete(socialOAuthStates).where(eq(socialOAuthStates.userId, userId));
          await tx.delete(socialConnections).where(eq(socialConnections.userId, userId));
          await tx.delete(autoReplyRules).where(eq(autoReplyRules.userId, userId));
          await tx.delete(knowledgeBase).where(eq(knowledgeBase.userId, userId));
          await tx.delete(repurposedContent).where(eq(repurposedContent.userId, userId));
          await tx.delete(neulinkIntegration).where(eq(neulinkIntegration.userId, userId));
          await tx.delete(automationExecutionLogs).where(eq(automationExecutionLogs.userId, userId));
          await tx.delete(automationSchedules).where(eq(automationSchedules.userId, userId));
          await tx.delete(contentAnalytics).where(eq(contentAnalytics.userId, userId));
          await tx.delete(contentHistory).where(eq(contentHistory.userId, userId));
          await tx.delete(tokenUsage).where(eq(tokenUsage.userId, userId));
          await tx.delete(dailyFreeActions).where(eq(dailyFreeActions.userId, userId));
          await tx.delete(generatorLengthPreferences).where(eq(generatorLengthPreferences.userId, userId));
          await tx.delete(creditTransactions).where(eq(creditTransactions.userId, userId));
          await tx.delete(userCredits).where(eq(userCredits.userId, userId));
          await tx.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
          await tx.delete(localPasswordResetTokens).where(eq(localPasswordResetTokens.userId, userId));
          await tx.delete(localAuthSessionVersions).where(eq(localAuthSessionVersions.userId, userId));
          await tx.delete(localAuthCredentials).where(eq(localAuthCredentials.userId, userId));
          await tx.delete(webAuthnCeremonies).where(eq(webAuthnCeremonies.userId, userId));
          await tx.delete(webAuthnPasskeys).where(eq(webAuthnPasskeys.userId, userId));
          await tx.delete(twoFactorAuthenticators).where(eq(twoFactorAuthenticators.userId, userId));
          await tx.delete(trustedDevices).where(eq(trustedDevices.userId, userId));
          await tx.delete(businessConsentEvents).where(eq(businessConsentEvents.userId, userId));
          await tx.delete(businessContacts).where(eq(businessContacts.userId, userId));
          await tx.delete(whatsappBusinessConnections).where(eq(whatsappBusinessConnections.userId, userId));
          await tx.delete(professionalProfileViews).where(eq(professionalProfileViews.userId, userId));
          await tx.delete(professionalProfiles).where(eq(professionalProfiles.userId, userId));
          await tx.delete(users).where(eq(users.id, userId));
        });

        console.log("[AccountDeletion] Account data erased");

        // Clear session cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });

        return {
          success: true,
          message: "Your account and all associated data have been permanently deleted.",
        };
      } catch (error) {
        console.error("[AccountDeletion] Failed to erase account data", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete account. Please contact support.",
        });
      }
    }),

  /**
   * Export user data (GDPR data portability)
   */
  exportData: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.user.id;
      const db = await getDb();

      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      try {
        // Gather all user data
        const [userRecord] = await db.select().from(users).where(eq(users.id, userId));
        const history = await db.select().from(contentHistory).where(eq(contentHistory.userId, userId));
        const credits = await db.select().from(creditTransactions).where(eq(creditTransactions.userId, userId));

        // Strip sensitive fields
        const { emailVerificationToken, emailVerificationTokenExpiresAt, ...safeUser } = userRecord;

        return {
          exportedAt: new Date().toISOString(),
          profile: safeUser,
          contentHistory: history,
          creditTransactions: credits,
          note: "Social media access tokens are not included in exports for security reasons.",
        };
      } catch (error) {
        console.error(`[DataExport] Failed to export data for user ${userId}:`, error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to export data. Please contact support.",
        });
      }
    }),
});
