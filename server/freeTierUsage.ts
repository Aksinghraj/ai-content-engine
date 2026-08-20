import { and, eq, gte, sql } from "drizzle-orm";
import { dailyFreeActions } from "../drizzle/schema";
import { getDb } from "./db";

export const BASIC_SCRIPT_ACTION = "basic_script_gen" as const;
export const BASIC_SCRIPT_DAILY_LIMIT = 3;
export const ROLLING_FREE_WINDOW_MS = 24 * 60 * 60 * 1000;

export type FreeActionUsage = {
  available: boolean;
  count: number;
  limit: number;
  remaining: number;
  resetAt: Date | null;
};

export function deriveBasicScriptUsage(record?: { count: number; resetAt: Date }, now: number = Date.now()): FreeActionUsage {
  if (!record || record.resetAt.getTime() <= now) {
    return { available: true, count: 0, limit: BASIC_SCRIPT_DAILY_LIMIT, remaining: BASIC_SCRIPT_DAILY_LIMIT, resetAt: record?.resetAt ?? null };
  }
  return {
    available: record.count < BASIC_SCRIPT_DAILY_LIMIT,
    count: record.count,
    limit: BASIC_SCRIPT_DAILY_LIMIT,
    remaining: Math.max(0, BASIC_SCRIPT_DAILY_LIMIT - record.count),
    resetAt: record.resetAt,
  };
}

export async function getBasicScriptUsage(userId: number): Promise<FreeActionUsage> {
  const db = await getDb();
  if (!db) throw new Error("Free-tier usage tracking is unavailable");
  const [record] = await db.select().from(dailyFreeActions)
    .where(and(eq(dailyFreeActions.userId, userId), eq(dailyFreeActions.actionType, BASIC_SCRIPT_ACTION))).limit(1);
  return deriveBasicScriptUsage(record);
}

/**
 * Atomically reserves one Basic Script Generation. It first ensures a counter
 * row exists, then increments only if the active rolling window is below cap.
 */
export async function reserveBasicScriptGeneration(userId: number): Promise<FreeActionUsage> {
  const db = await getDb();
  if (!db) throw new Error("Free-tier usage tracking is unavailable");

  const firstWindowEnd = new Date(Date.now() + ROLLING_FREE_WINDOW_MS);
  await db.insert(dailyFreeActions).values({
    userId,
    actionType: BASIC_SCRIPT_ACTION,
    count: 0,
    resetAt: firstWindowEnd,
  }).onDuplicateKeyUpdate({ set: { actionType: BASIC_SCRIPT_ACTION } });

  const result = await db.update(dailyFreeActions).set({
    count: sql`IF(${dailyFreeActions.resetAt} <= NOW(), 1, ${dailyFreeActions.count} + 1)`,
    resetAt: sql`IF(${dailyFreeActions.resetAt} <= NOW(), DATE_ADD(NOW(), INTERVAL 24 HOUR), ${dailyFreeActions.resetAt})`,
  }).where(and(
    eq(dailyFreeActions.userId, userId),
    eq(dailyFreeActions.actionType, BASIC_SCRIPT_ACTION),
    sql`(${dailyFreeActions.resetAt} <= NOW() OR ${dailyFreeActions.count} < ${BASIC_SCRIPT_DAILY_LIMIT})`,
  ));

  const affectedRows = Array.isArray(result)
    ? ((result[0] as { affectedRows?: number } | undefined)?.affectedRows ?? 0)
    : ((result as { affectedRows?: number }).affectedRows ?? 0);
  const [record] = await db.select().from(dailyFreeActions)
    .where(and(eq(dailyFreeActions.userId, userId), eq(dailyFreeActions.actionType, BASIC_SCRIPT_ACTION))).limit(1);
  if (!record) throw new Error("Failed to reserve Basic Script Generation");

  return { ...deriveBasicScriptUsage(record), available: affectedRows > 0 };
}

/** Reverses a reservation after an upstream LLM failure. Failed requests are never charged. */
export async function releaseBasicScriptGeneration(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(dailyFreeActions).set({ count: sql`GREATEST(${dailyFreeActions.count} - 1, 0)` }).where(and(
    eq(dailyFreeActions.userId, userId),
    eq(dailyFreeActions.actionType, BASIC_SCRIPT_ACTION),
    gte(dailyFreeActions.resetAt, new Date()),
  ));
}
