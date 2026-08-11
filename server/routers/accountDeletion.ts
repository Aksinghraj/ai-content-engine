import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { users, contentHistory, socialConnections, creditTransactions, userCredits, automationSchedules } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";

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
        console.log(`[AccountDeletion] Starting deletion for user ${userId}`);

        // Delete in dependency order (child tables first)
        // 1. Delete credit transactions
        await db.delete(creditTransactions).where(eq(creditTransactions.userId, userId));

        // 2. Delete user credits
        await db.delete(userCredits).where(eq(userCredits.userId, userId));

        // 3. Delete social connections (tokens are encrypted, delete them)
        await db.delete(socialConnections).where(eq(socialConnections.userId, userId));

        // 4. Delete automation schedules
        await db.delete(automationSchedules).where(eq(automationSchedules.userId, userId));

        // 5. Delete content history
        await db.delete(contentHistory).where(eq(contentHistory.userId, userId));

        // 6. Delete the user record itself
        await db.delete(users).where(eq(users.id, userId));

        console.log(`[AccountDeletion] Successfully deleted all data for user ${userId}`);

        // Clear session cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });

        return {
          success: true,
          message: "Your account and all associated data have been permanently deleted.",
        };
      } catch (error) {
        console.error(`[AccountDeletion] Failed to delete account for user ${userId}:`, error);
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
