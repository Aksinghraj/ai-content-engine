import { desc, eq, and, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, contentHistory, InsertContentHistory, tokenUsage, automationSchedules } from "../drizzle/schema";
import { ENV } from './_core/env';

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
