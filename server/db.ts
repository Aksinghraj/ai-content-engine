
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, contentHistory, InsertContentHistory, tokenUsage, automationSchedules, automationExecutionLogs, contentAnalytics, userCredits, creditTransactions, creditPackages, passwordResetTokens } from "../drizzle/schema";
import { ENV } from './_core/env';
import { eq, desc, and, gte, sql } from "drizzle-orm";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function saveContentHistory(data: InsertContentHistory) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save content history: database not available");
    return null;
  }

  try {
    const result = await db.insert(contentHistory).values(data);
    return result;
  } catch (error) {
    console.error("[Database] Failed to save content history:", error);
    throw error;
  }
}

export async function getContentHistoryByUserId(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get content history: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(contentHistory)
      .where(eq(contentHistory.userId, userId))
      .orderBy(desc(contentHistory.createdAt));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get content history:", error);
    return [];
  }
}

export async function getContentHistoryById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get content history: database not available");
    return null;
  }

  try {
    const result = await db
      .select()
      .from(contentHistory)
      .where(eq(contentHistory.id, id))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get content history:", error);
    return null;
  }
}

// Token management functions
export async function trackTokenUsage(userId: number, tokensUsed: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot track token usage: database not available");
    return null;
  }

  try {
    const result = await db.insert(tokenUsage).values({
      userId,
      tokensUsed,
      date: new Date(),
    });
    return result;
  } catch (error) {
    console.error("[Database] Failed to track token usage:", error);
    throw error;
  }
}

export async function getTodayTokenUsage(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get token usage: database not available");
    return 0;
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const result = await db
      .select()
      .from(tokenUsage)
      .where(and(
        eq(tokenUsage.userId, userId),
        gte(tokenUsage.date, today)
      ));
    
    return result.reduce((sum: number, record: any) => sum + record.tokensUsed, 0);
  } catch (error) {
    console.error("[Database] Failed to get token usage:", error);
    return 0;
  }
}

export async function updateUserTokenBalance(userId: number, newBalance: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update token balance: database not available");
    return null;
  }

  try {
    const result = await db
      .update(users)
      .set({ tokenBalance: newBalance })
      .where(eq(users.id, userId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to update token balance:", error);
    throw error;
  }
}

export async function updateUserSubscription(userId: number, tier: 'free' | 'pro', stripeCustomerId?: string, stripeSubscriptionId?: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update subscription: database not available");
    return null;
  }

  try {
    const updateData: any = { subscriptionTier: tier };
    if (stripeCustomerId) updateData.stripeCustomerId = stripeCustomerId;
    if (stripeSubscriptionId) updateData.stripeSubscriptionId = stripeSubscriptionId;
    
    const result = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to update subscription:", error);
    throw error;
  }
}

export async function updateUserTheme(userId: number, theme: 'light' | 'dark' | 'auto') {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update theme: database not available");
    return null;
  }

  try {
    const result = await db
      .update(users)
      .set({ theme })
      .where(eq(users.id, userId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to update theme:", error);
    throw error;
  }
}

// Automation schedule management functions
export async function createAutomationSchedule(userId: number, schedule: any) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create automation schedule: database not available");
    return null;
  }

  try {
    const result = await db.insert(automationSchedules).values({
      userId,
      name: schedule.name,
      niche: schedule.niche,
      targetAudience: schedule.targetAudience,
      platform: schedule.platform,
      goal: schedule.goal,
      contentStyle: schedule.contentStyle,
      cronExpression: schedule.cronExpression,
      isActive: true,
    });
    return result;
  } catch (error) {
    console.error("[Database] Failed to create automation schedule:", error);
    throw error;
  }
}

export async function getAutomationSchedulesByUserId(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get automation schedules: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(automationSchedules)
      .where(eq(automationSchedules.userId, userId))
      .orderBy(desc(automationSchedules.createdAt));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get automation schedules:", error);
    return [];
  }
}

export async function updateAutomationSchedule(scheduleId: number, updates: any) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update automation schedule: database not available");
    return null;
  }

  try {
    const result = await db
      .update(automationSchedules)
      .set(updates)
      .where(eq(automationSchedules.id, scheduleId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to update automation schedule:", error);
    throw error;
  }
}

export async function deleteAutomationSchedule(scheduleId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete automation schedule: database not available");
    return null;
  }

  try {
    const result = await db
      .delete(automationSchedules)
      .where(eq(automationSchedules.id, scheduleId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to delete automation schedule:", error);
    throw error;
  }
}

export async function getActiveAutomationSchedules() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get active automation schedules: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(automationSchedules)
      .where(eq(automationSchedules.isActive, true));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get active automation schedules:", error);
    return [];
  }
}

// Analytics tracking functions
export async function trackContentAnalytics(userId: number, data: any) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot track analytics: database not available");
    return null;
  }

  try {
    const result = await db.insert(contentAnalytics).values({
      userId,
      contentHistoryId: data.contentHistoryId,
      platform: data.platform,
      engagement: data.engagement || 0,
      reach: data.reach || 0,
      conversions: data.conversions || 0,
      clicks: data.clicks || 0,
      shares: data.shares || 0,
      comments: data.comments || 0,
      date: new Date(),
    });
    return result;
  } catch (error) {
    console.error("[Database] Failed to track analytics:", error);
    throw error;
  }
}

export async function getContentAnalyticsByUserId(userId: number, days: number = 7) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get analytics: database not available");
    return [];
  }

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await db
      .select()
      .from(contentAnalytics)
      .where(and(
        eq(contentAnalytics.userId, userId),
        gte(contentAnalytics.date, startDate)
      ))
      .orderBy(desc(contentAnalytics.date));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get analytics:", error);
    return [];
  }
}

export async function getAnalyticsByPlatform(userId: number, days: number = 7) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get platform analytics: database not available");
    return [];
  }

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await db
      .select({
        platform: contentAnalytics.platform,
        totalEngagement: sql`SUM(${contentAnalytics.engagement})`,
        totalReach: sql`SUM(${contentAnalytics.reach})`,
        totalConversions: sql`SUM(${contentAnalytics.conversions})`,
      })
      .from(contentAnalytics)
      .where(and(
        eq(contentAnalytics.userId, userId),
        gte(contentAnalytics.date, startDate)
      ))
      .groupBy(contentAnalytics.platform);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get platform analytics:", error);
    return [];
  }
}

// Automation execution logging functions
export async function logAutomationExecution(userId: number, scheduleId: number, status: 'success' | 'failed' | 'pending', generatedContent?: any, errorMessage?: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot log automation execution: database not available");
    return null;
  }

  try {
    const result = await db.insert(automationExecutionLogs).values({
      userId,
      scheduleId,
      status,
      generatedContent: generatedContent || null,
      errorMessage: errorMessage || null,
      executedAt: new Date(),
    });
    return result;
  } catch (error) {
    console.error("[Database] Failed to log automation execution:", error);
    throw error;
  }
}

export async function getAutomationExecutionLogs(userId: number, scheduleId?: number, limit: number = 50) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get execution logs: database not available");
    return [];
  }

  try {
    const conditions = [eq(automationExecutionLogs.userId, userId)];
    if (scheduleId) {
      conditions.push(eq(automationExecutionLogs.scheduleId, scheduleId));
    }

    const result = await db
      .select()
      .from(automationExecutionLogs)
      .where(and(...conditions))
      .orderBy(desc(automationExecutionLogs.executedAt))
      .limit(limit);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get execution logs:", error);
    return [];
  }
}

export async function getAutomationExecutionStats(userId: number, days: number = 7) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get execution stats: database not available");
    return null;
  }

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await db
      .select({
        totalExecutions: sql`COUNT(*)`,
        successfulExecutions: sql`SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END)`,
        failedExecutions: sql`SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END)`,
      })
      .from(automationExecutionLogs)
      .where(and(
        eq(automationExecutionLogs.userId, userId),
        gte(automationExecutionLogs.executedAt, startDate)
      ));

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get execution stats:", error);
    return null;
  }
}


// ============================================================================
// Credit System Helpers
// ============================================================================

export async function getUserCredits(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user credits: database not available");
    return null;
  }
  try {
    const result = await db.select().from(userCredits).where(eq(userCredits.userId, userId)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get user credits:", error);
    return null;
  }
}

export async function initializeUserCredits(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot initialize user credits: database not available");
    return null;
  }
  try {
    const result = await db.insert(userCredits).values({
      userId,
      balance: 0,
      totalPurchased: 0,
      totalUsed: 0,
    });
    return result;
  } catch (error) {
    console.error("[Database] Failed to initialize user credits:", error);
    return null;
  }
}

export async function addCredits(userId: number, amount: number, description: string, stripePaymentIntentId?: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot add credits: database not available");
    return null;
  }
  try {
    // Update user credits balance
    await db.update(userCredits)
      .set({
        balance: sql`balance + ${amount}`,
        totalPurchased: sql`totalPurchased + ${amount}`,
      })
      .where(eq(userCredits.userId, userId));

    // Log transaction
    const result = await db.insert(creditTransactions).values({
      userId,
      type: "purchase",
      amount,
      description,
      stripePaymentIntentId,
    });

    return result;
  } catch (error) {
    console.error("[Database] Failed to add credits:", error);
    return null;
  }
}

export async function deductCredits(userId: number, amount: number, description: string, relatedContentId?: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot deduct credits: database not available");
    return null;
  }
  try {
    // Update user credits balance
    await db.update(userCredits)
      .set({
        balance: sql`balance - ${amount}`,
        totalUsed: sql`totalUsed + ${amount}`,
      })
      .where(eq(userCredits.userId, userId));

    // Log transaction
    const result = await db.insert(creditTransactions).values({
      userId,
      type: "usage",
      amount,
      description,
      relatedContentId,
    });

    return result;
  } catch (error) {
    console.error("[Database] Failed to deduct credits:", error);
    return null;
  }
}

export async function getCreditTransactions(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get credit transactions: database not available");
    return [];
  }
  try {
    const result = await db.select().from(creditTransactions).where(eq(creditTransactions.userId, userId)).orderBy(desc(creditTransactions.createdAt)).limit(limit);
    return result || [];
  } catch (error) {
    console.error("[Database] Failed to get credit transactions:", error);
    return [];
  }
}

export async function getCreditPackages() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get credit packages: database not available");
    return [];
  }
  try {
    const result = await db.select().from(creditPackages).where(eq(creditPackages.isActive, true));
    return result || [];
  } catch (error) {
    console.error("[Database] Failed to get credit packages:", error);
    return [];
  }
}

// ============================================================================
// Password Reset Helpers
// ============================================================================

export async function createPasswordResetToken(userId: number, token: string, expiresAt: Date) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create password reset token: database not available");
    return null;
  }
  try {
    const result = await db.insert(passwordResetTokens).values({
      userId,
      token,
      expiresAt,
    });
    return result;
  } catch (error) {
    console.error("[Database] Failed to create password reset token:", error);
    return null;
  }
}

export async function verifyPasswordResetToken(token: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot verify password reset token: database not available");
    return null;
  }
  try {
    const result = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, token)).limit(1);

    if (result.length === 0) return null;

    const resetToken = result[0];
    // Check if token is expired
    if (new Date() > resetToken.expiresAt) {
      return null;
    }

    return resetToken;
  } catch (error) {
    console.error("[Database] Failed to verify password reset token:", error);
    return null;
  }
}

export async function deletePasswordResetToken(token: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete password reset token: database not available");
    return null;
  }
  try {
    const result = await db.delete(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token));
    return result;
  } catch (error) {
    console.error("[Database] Failed to delete password reset token:", error);
    return null;
  }
}


// Duplicate functions removed - use addCredits() and deductCredits() instead

