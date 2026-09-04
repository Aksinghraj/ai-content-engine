
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, contentHistory, InsertContentHistory, tokenUsage, automationSchedules, automationExecutionLogs, contentAnalytics, userCredits, creditTransactions, creditPackages, passwordResetTokens, generatorLengthPreferences, professionalProfiles, professionalProfileViews, lumaePulseIntroDismissals, scheduledPosts, socialConnections, razorpayCreditOrders } from "../drizzle/schema";
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
    if (user.emailVerified !== undefined) {
      values.emailVerified = user.emailVerified;
      updateSet.emailVerified = user.emailVerified;
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

export async function updateUserHighContrast(userId: number, highContrast: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(users).set({ highContrast }).where(eq(users.id, userId));
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
      mediaUrl: schedule.mediaUrl,
      mediaType: schedule.mediaType,
      cronExpression: schedule.cronExpression,
      isActive: true,
    });
    const scheduleId = Number((result as any).insertId);
    const created = await db
      .select()
      .from(automationSchedules)
      .where(eq(automationSchedules.id, scheduleId))
      .limit(1);
    return created[0] ?? null;
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

export async function getAutomationScheduleByIdForUser(scheduleId: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(automationSchedules)
    .where(and(eq(automationSchedules.id, scheduleId), eq(automationSchedules.userId, userId)))
    .limit(1);
  return result[0] ?? null;
}

export async function getAutomationScheduleByTaskUid(taskUid: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(automationSchedules)
    .where(eq(automationSchedules.scheduleCronTaskUid, taskUid))
    .limit(1);
  return result[0] ?? null;
}

export async function updateAutomationScheduleForUser(
  scheduleId: number,
  userId: number,
  updates: Partial<typeof automationSchedules.$inferInsert>,
) {
  const db = await getDb();
  if (!db) return null;
  await db
    .update(automationSchedules)
    .set(updates)
    .where(and(eq(automationSchedules.id, scheduleId), eq(automationSchedules.userId, userId)));
  return getAutomationScheduleByIdForUser(scheduleId, userId);
}

export async function deleteAutomationScheduleForUser(scheduleId: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  return db
    .delete(automationSchedules)
    .where(and(eq(automationSchedules.id, scheduleId), eq(automationSchedules.userId, userId)));
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

export type RazorpayCreditOrderInput = {
  userId: number;
  razorpayOrderId: string;
  receiptId: string;
  packageId: string;
  credits: number;
  amountPaise: number;
  currency: string;
};

/** Creates the server-side source of truth for a Razorpay credit checkout. */
export async function createRazorpayCreditOrder(input: RazorpayCreditOrderInput) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(razorpayCreditOrders).values(input);
  const rows = await db.select().from(razorpayCreditOrders)
    .where(eq(razorpayCreditOrders.razorpayOrderId, input.razorpayOrderId)).limit(1);
  return rows[0] ?? null;
}

/** Looks up an order only if it belongs to the authenticated user. */
export async function getRazorpayCreditOrderForUser(userId: number, razorpayOrderId: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(razorpayCreditOrders)
    .where(and(eq(razorpayCreditOrders.userId, userId), eq(razorpayCreditOrders.razorpayOrderId, razorpayOrderId)))
    .limit(1);
  return rows[0] ?? null;
}

/** Credits one server-owned order. Unique provider references make retries safe. */
export async function creditRazorpayOrder(userId: number, razorpayOrderId: string, paymentId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  if (!await getUserCredits(userId)) await initializeUserCredits(userId);

  return db.transaction(async (tx) => {
    const orders = await tx.select().from(razorpayCreditOrders)
      .where(and(eq(razorpayCreditOrders.userId, userId), eq(razorpayCreditOrders.razorpayOrderId, razorpayOrderId)))
      .limit(1);
    const order = orders[0];
    if (!order) throw new Error("Payment order not found");
    if (order.razorpayPaymentId && order.razorpayPaymentId !== paymentId) throw new Error("Payment order mismatch");
    if (order.status === "credited") return { order, creditsAdded: 0, alreadyCredited: true };

    const existing = await tx.select({ id: creditTransactions.id }).from(creditTransactions)
      .where(eq(creditTransactions.stripePaymentIntentId, paymentId)).limit(1);
    if (existing[0]) {
      await tx.update(razorpayCreditOrders).set({ status: "credited", razorpayPaymentId: paymentId, paidAt: new Date(), creditedAt: new Date() })
        .where(eq(razorpayCreditOrders.id, order.id));
      return { order, creditsAdded: 0, alreadyCredited: true };
    }

    await tx.update(userCredits).set({
      balance: sql`balance + ${order.credits}`,
      totalPurchased: sql`totalPurchased + ${order.credits}`,
    }).where(eq(userCredits.userId, userId));
    await tx.insert(creditTransactions).values({
      userId,
      type: "purchase",
      amount: order.credits,
      description: `Razorpay credit purchase: ${order.packageId}`,
      stripePaymentIntentId: paymentId,
    });
    await tx.update(razorpayCreditOrders).set({
      status: "credited", razorpayPaymentId: paymentId, paidAt: new Date(), creditedAt: new Date(),
    }).where(eq(razorpayCreditOrders.id, order.id));
    return { order, creditsAdded: order.credits, alreadyCredited: false };
  });
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

export type ProfessionalProfileInput = {
  displayName: string;
  professionalTitle: string;
  biography?: string | null;
  expertise?: string | null;
  availability?: string | null;
  phone?: string | null;
  location?: string | null;
  website?: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  socialLinks?: Record<string, string>;
  username?: string | null;
  profileStatus?: string | null;
  collaborationOpen: boolean;
  profileTheme: string;
  coverPreset: string;
  publicSlug?: string | null;
  isPublic: boolean;
  shareSocialLinks: boolean;
};

export async function getProfessionalProfileByUserId(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(professionalProfiles).where(eq(professionalProfiles.userId, userId)).limit(1);
  return rows[0] ?? null;
}

export async function updateProfessionalProfileMedia(userId: number, media: { avatarUrl?: string; coverUrl?: string }) {
  const database = await getDb();
  if (!database) throw new Error("Database unavailable");
  const existing = await getProfessionalProfileByUserId(userId);
  if (!existing) {
    await database.insert(professionalProfiles).values({
      userId,
      displayName: "Lumae creator",
      professionalTitle: "Content Strategist & AI Workflow Builder",
      biography: null,
      expertise: null,
      availability: "Open to collaborations",
      phone: null,
      location: null,
      website: null,
      avatarUrl: media.avatarUrl ?? null,
      coverUrl: media.coverUrl ?? null,
      socialLinks: {},
      username: null,
      profileStatus: "Building with Lumae",
      collaborationOpen: false,
      profileTheme: "signal",
      coverPreset: "aurora",
      publicSlug: null,
      isPublic: false,
      shareSocialLinks: false,
    });
  } else {
    const updates: { avatarUrl?: string; coverUrl?: string } = {};
    if (media.avatarUrl !== undefined) updates.avatarUrl = media.avatarUrl;
    if (media.coverUrl !== undefined) updates.coverUrl = media.coverUrl;
    if (Object.keys(updates).length > 0) await database.update(professionalProfiles).set(updates).where(eq(professionalProfiles.userId, userId));
  }
  return getProfessionalProfileByUserId(userId);
}

export async function saveProfessionalProfile(userId: number, profile: ProfessionalProfileInput) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const payload = { userId, ...profile, socialLinks: profile.socialLinks ?? {} };
  await db.insert(professionalProfiles).values(payload).onDuplicateKeyUpdate({
    set: {
      displayName: profile.displayName,
      professionalTitle: profile.professionalTitle,
      biography: profile.biography ?? null,
      expertise: profile.expertise ?? null,
      availability: profile.availability ?? null,
      phone: profile.phone ?? null,
      location: profile.location ?? null,
      website: profile.website ?? null,
      avatarUrl: profile.avatarUrl ?? null,
      coverUrl: profile.coverUrl ?? null,
      socialLinks: profile.socialLinks ?? {},
      username: profile.username ?? null,
      profileStatus: profile.profileStatus ?? null,
      collaborationOpen: profile.collaborationOpen,
      profileTheme: profile.profileTheme,
      coverPreset: profile.coverPreset,
      publicSlug: profile.publicSlug ?? null,
      isPublic: profile.isPublic,
      shareSocialLinks: profile.shareSocialLinks,
    },
  });
  return getProfessionalProfileByUserId(userId);
}

export async function getPublicProfessionalProfileBySlug(publicSlug: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select({
    ownerId: professionalProfiles.userId,
    displayName: professionalProfiles.displayName,
    professionalTitle: professionalProfiles.professionalTitle,
    biography: professionalProfiles.biography,
    expertise: professionalProfiles.expertise,
    availability: professionalProfiles.availability,
    location: professionalProfiles.location,
    website: professionalProfiles.website,
    avatarUrl: professionalProfiles.avatarUrl,
    coverUrl: professionalProfiles.coverUrl,
    socialLinks: professionalProfiles.socialLinks,
    username: professionalProfiles.username,
    profileStatus: professionalProfiles.profileStatus,
    collaborationOpen: professionalProfiles.collaborationOpen,
    profileTheme: professionalProfiles.profileTheme,
    coverPreset: professionalProfiles.coverPreset,
    publicSlug: professionalProfiles.publicSlug,
    isPublic: professionalProfiles.isPublic,
    shareSocialLinks: professionalProfiles.shareSocialLinks,
  }).from(professionalProfiles).where(eq(professionalProfiles.publicSlug, publicSlug)).limit(1);
  const profile = rows[0];
  if (!profile) return null;
  if (!profile.isPublic) {
    return {
      visibility: "locked" as const,
      ownerId: profile.ownerId,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      publicSlug: profile.publicSlug,
    };
  }
  return {
    visibility: "public" as const,
    ...profile,
    socialLinks: profile.shareSocialLinks ? profile.socialLinks : {},
  };
}

export async function recordProfessionalProfileView(userId: number) {
  const db = await getDb();
  if (!db) return;
  const now = new Date();
  const viewDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  await db.insert(professionalProfileViews).values({ userId, viewDate, views: 1 }).onDuplicateKeyUpdate({
    set: { views: sql`${professionalProfileViews.views} + 1` },
  });
}

export async function getProfessionalProfileViewSummary(userId: number) {
  const db = await getDb();
  if (!db) return { totalViews: 0, viewsLast30Days: 0 };
  const rows = await db.select().from(professionalProfileViews).where(eq(professionalProfileViews.userId, userId));
  const threshold = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);
  return {
    totalViews: rows.reduce((total, row) => total + row.views, 0),
    viewsLast30Days: rows.filter((row) => row.viewDate >= threshold).reduce((total, row) => total + row.views, 0),
  };
}

/** Returns only the requesting user's factual Lumae activity for their private profile. */
export async function getProfessionalProfileActivity(userId: number) {
  const db = await getDb();
  if (!db) return { generatedContent: 0, scheduledPosts: 0, connectedAccounts: 0, recentActivity: [] as Array<{ id: number; niche: string; platform: string; goal: string; createdAt: Date }> };
  const [contentRows, scheduleRows, connectionRows, recentActivity] = await Promise.all([
    db.select({ total: sql<number>`COUNT(*)` }).from(contentHistory).where(eq(contentHistory.userId, userId)),
    db.select({ total: sql<number>`COUNT(*)` }).from(scheduledPosts).where(eq(scheduledPosts.userId, userId)),
    db.select({ total: sql<number>`COUNT(*)` }).from(socialConnections).where(and(eq(socialConnections.userId, userId), eq(socialConnections.isConnected, true))),
    db.select({ id: contentHistory.id, niche: contentHistory.niche, platform: contentHistory.platform, goal: contentHistory.goal, createdAt: contentHistory.createdAt })
      .from(contentHistory)
      .where(eq(contentHistory.userId, userId))
      .orderBy(desc(contentHistory.createdAt))
      .limit(4),
  ]);
  return {
    generatedContent: Number(contentRows[0]?.total ?? 0),
    scheduledPosts: Number(scheduleRows[0]?.total ?? 0),
    connectedAccounts: Number(connectionRows[0]?.total ?? 0),
    recentActivity,
  };
}

/**
 * Counts introduction dismissals as a single daily product metric. It does not
 * accept or persist any user- or device-level identifier.
 */
export async function recordLumaePulseIntroDismissal(): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const now = new Date();
  const dismissalDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  await db.insert(lumaePulseIntroDismissals).values({ dismissalDate, dismissals: 1 }).onDuplicateKeyUpdate({
    set: { dismissals: sql`${lumaePulseIntroDismissals.dismissals} + 1` },
  });
  return true;
}

export async function getLumaePulseIntroDismissalSummary() {
  const db = await getDb();
  if (!db) return { totalDismissals: 0, dismissalsLast30Days: 0 };
  const rows = await db.select().from(lumaePulseIntroDismissals);
  const threshold = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);
  return {
    totalDismissals: rows.reduce((total, row) => total + row.dismissals, 0),
    dismissalsLast30Days: rows.filter((row) => row.dismissalDate >= threshold).reduce((total, row) => total + row.dismissals, 0),
  };
}


// Duplicate functions removed - use addCredits() and deductCredits() instead



// Email verification functions
export async function generateEmailVerificationToken(userId: number): Promise<string> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Update user with OTP
  await db.update(users)
    .set({
      emailVerificationToken: otp,
      emailVerificationTokenExpiresAt: expiresAt,
    })
    .where(eq(users.id, userId));

  return otp;
}

export async function verifyEmailToken(token: string): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select().from(users)
    .where(eq(users.emailVerificationToken, token))
    .limit(1);

  if (result.length === 0) {
    return false;
  }

  const user = result[0];
  
  // Check if token has expired
  if (!user.emailVerificationTokenExpiresAt || new Date() > user.emailVerificationTokenExpiresAt) {
    return false;
  }

  // Mark email as verified
  await db.update(users)
    .set({
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationTokenExpiresAt: null,
    })
    .where(eq(users.id, user.id));

  return true;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// Generation Credits & Free Quota Helpers
// ============================================================================

/** Returns the user's current free AI generation count and image/video credits */
export async function getUserGenerationStats(userId: number) {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db
      .select({
        freeAiGenerationsUsed: users.freeAiGenerationsUsed,
        imageVideoCredits: users.imageVideoCredits,
        subscriptionTier: users.subscriptionTier,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get generation stats:", error);
    return null;
  }
}

/** Increments freeAiGenerationsUsed by 1 — call after a successful AI text generation */
export async function incrementFreeAiGenerations(userId: number) {
  const db = await getDb();
  if (!db) return null;
  try {
    await db
      .update(users)
      .set({ freeAiGenerationsUsed: sql`freeAiGenerationsUsed + 1` })
      .where(eq(users.id, userId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to increment free AI generations:", error);
    return false;
  }
}

/** Deducts imageVideoCredits by 1 — call before image/video generation */
export async function deductImageVideoCredit(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  try {
    // Atomic deduct only if balance > 0
    const result = await db
      .update(users)
      .set({ imageVideoCredits: sql`imageVideoCredits - 1` })
      .where(and(eq(users.id, userId), sql`imageVideoCredits > 0`));
    // rowsAffected > 0 means deduction succeeded
    const affected = (result as any)?.[0]?.affectedRows ?? (result as any)?.rowsAffected ?? 1;
    return affected > 0;
  } catch (error) {
    console.error("[Database] Failed to deduct image/video credit:", error);
    return false;
  }
}

/** Adds imageVideoCredits (e.g., after a credit purchase) */
export async function addImageVideoCredits(userId: number, amount: number) {
  const db = await getDb();
  if (!db) return null;
  try {
    await db
      .update(users)
      .set({ imageVideoCredits: sql`imageVideoCredits + ${amount}` })
      .where(eq(users.id, userId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to add image/video credits:", error);
    return false;
  }
}

// Social Media OAuth Connection Management

/** Get all connected social accounts for a user */
export async function getConnectedSocialAccounts(userId: number) {
  const db = await getDb();
  if (!db) return [];
  try {
    const { socialConnections } = await import("../drizzle/schema");
    const result = await db
      .select()
      .from(socialConnections)
      .where(and(eq(socialConnections.userId, userId), eq(socialConnections.isConnected, true)));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get connected accounts:", error);
    return [];
  }
}

/** Get a specific social connection */
export async function getSocialConnection(userId: number, platform: string) {
  const db = await getDb();
  if (!db) return null;
  try {
    const { socialConnections } = await import("../drizzle/schema");
    const result = await db
      .select()
      .from(socialConnections)
      .where(and(eq(socialConnections.userId, userId), eq(socialConnections.platform, platform)))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get social connection:", error);
    return null;
  }
}

/** Update social connection token */
export async function updateSocialConnectionToken(
  connectionId: number,
  accessToken: string,
  tokenExpiresAt?: Date
) {
  const db = await getDb();
  if (!db) return false;
  try {
    const { socialConnections } = await import("../drizzle/schema");
    await db
      .update(socialConnections)
      .set({
        accessToken,
        tokenExpiresAt,
        lastValidationAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(socialConnections.id, connectionId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update social connection token:", error);
    return false;
  }
}

export type GeneratorLengthPreferenceInput = {
  videoLength: string;
  scriptLength: string;
  customVideoSeconds?: number;
  customScriptWordTarget?: number;
};

/** Returns only the requesting user's saved paid-generator length defaults. */
export async function getGeneratorLengthPreference(userId: number) {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db
      .select()
      .from(generatorLengthPreferences)
      .where(eq(generatorLengthPreferences.userId, userId))
      .limit(1);
    return result[0] ?? null;
  } catch (error) {
    console.error("[Database] Failed to get generator length preference:", error);
    return null;
  }
}

/** Upserts only the requesting user's validated paid-generator length defaults. */
export async function saveGeneratorLengthPreference(userId: number, input: GeneratorLengthPreferenceInput) {
  const db = await getDb();
  if (!db) return null;
  try {
    const values = {
      userId,
      videoLength: input.videoLength,
      scriptLength: input.scriptLength,
      customVideoSeconds: input.videoLength === "custom" ? input.customVideoSeconds ?? null : null,
      customScriptWordTarget: input.scriptLength === "custom" ? input.customScriptWordTarget ?? null : null,
      updatedAt: new Date(),
    };
    await db.insert(generatorLengthPreferences).values(values).onDuplicateKeyUpdate({
      set: {
        videoLength: values.videoLength,
        scriptLength: values.scriptLength,
        customVideoSeconds: values.customVideoSeconds,
        customScriptWordTarget: values.customScriptWordTarget,
        updatedAt: values.updatedAt,
      },
    });
    return values;
  } catch (error) {
    console.error("[Database] Failed to save generator length preference:", error);
    return null;
  }
}
