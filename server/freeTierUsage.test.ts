import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { BASIC_SCRIPT_DAILY_LIMIT, deriveBasicScriptUsage, ROLLING_FREE_WINDOW_MS } from "./freeTierUsage";

describe("Basic Script Generation rolling quota", () => {
  const now = Date.UTC(2026, 7, 20, 12, 0, 0);

  it("enforces exactly three free successful uses in an active rolling 24-hour window", () => {
    const usage = deriveBasicScriptUsage({ count: BASIC_SCRIPT_DAILY_LIMIT, resetAt: new Date(now + 60_000) }, now);
    expect(usage).toMatchObject({ available: false, count: 3, remaining: 0, limit: 3 });
  });

  it("resets the allowance after 24 hours rather than at a calendar boundary", () => {
    const expired = deriveBasicScriptUsage({ count: BASIC_SCRIPT_DAILY_LIMIT, resetAt: new Date(now - 1) }, now);
    expect(expired).toMatchObject({ available: true, count: 0, remaining: 3 });
    expect(ROLLING_FREE_WINDOW_MS).toBe(24 * 60 * 60 * 1000);
  });

  it("keeps free-script accounting isolated from credit balance and credit transactions", () => {
    const router = readFileSync(resolve(process.cwd(), "server/routers/freeTier.ts"), "utf8");
    const usageService = readFileSync(resolve(process.cwd(), "server/freeTierUsage.ts"), "utf8");
    expect(router).not.toContain("deductCredits");
    expect(router).not.toContain("creditTransactions");
    expect(usageService).not.toContain("userCredits");
    expect(usageService).not.toContain("creditTransactions");
  });
});
