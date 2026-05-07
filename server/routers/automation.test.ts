import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "../routers";
import { TrpcContext } from "../_core/trpc";
import * as db from "../db";

// Mock database functions
vi.mock("../db", () => ({
  getAutomationSchedulesByUserId: vi.fn(),
  createAutomationSchedule: vi.fn(),
  updateAutomationSchedule: vi.fn(),
  deleteAutomationSchedule: vi.fn(),
  deductCredits: vi.fn(),
  getUserCredits: vi.fn(),
}));

const createMockContext = (subscriptionTier: "free" | "pro" = "free"): TrpcContext => ({
  user: {
    id: "test-user-123",
    email: "test@example.com",
    subscriptionTier,
    role: "user" as const,
  },
  req: {
    headers: {
      origin: "http://localhost:3000",
    },
  } as any,
  res: {} as any,
});

describe("Automation Router - 3 Free Automations System", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Free tier users", () => {
    it("should allow creating first 3 automations for free", async () => {
      vi.mocked(db.getAutomationSchedulesByUserId).mockResolvedValueOnce([]);
      vi.mocked(db.createAutomationSchedule).mockResolvedValueOnce({
        id: "automation-1",
        userId: "test-user-123",
        name: "Test Automation",
        niche: "Tech",
        targetAudience: "Developers",
        platform: "twitter",
        goal: "Increase engagement",
        contentStyle: "casual",
        cronExpression: "0 0 * * *",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const caller = appRouter.createCaller(createMockContext("free"));

      const result = await caller.automation.create({
        name: "Test Automation",
        niche: "Tech",
        targetAudience: "Developers",
        platform: "twitter",
        goal: "Increase engagement",
        contentStyle: "casual",
        cronExpression: "0 0 * * *",
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe("Automation created (free)");
      expect(result.freeAutomationsRemaining).toBe(2);
    });

    it("should reject 4th automation for free tier users", async () => {
      // Mock 3 existing automations
      vi.mocked(db.getAutomationSchedulesByUserId).mockResolvedValueOnce([
        { id: "auto-1" },
        { id: "auto-2" },
        { id: "auto-3" },
      ] as any);

      const caller = appRouter.createCaller(createMockContext("free"));

      await expect(
        caller.automation.create({
          name: "Test Automation 4",
          niche: "Tech",
          targetAudience: "Developers",
          platform: "twitter",
          goal: "Increase engagement",
          contentStyle: "casual",
          cronExpression: "0 0 * * *",
        })
      ).rejects.toThrow("Free tier limited to 3 automations");
    });

    it("should return correct free automations remaining count", async () => {
      // Mock 1 existing automation
      vi.mocked(db.getAutomationSchedulesByUserId).mockResolvedValueOnce([{ id: "auto-1" }] as any);

      const caller = appRouter.createCaller(createMockContext("free"));

      const result = await caller.automation.list();

      expect(result.success).toBe(true);
      expect(result.automationCount).toBe(1);
      expect(result.freeAutomationsRemaining).toBe(2);
    });
  });

  describe("Pro tier users", () => {
    it("should allow creating first 3 automations for free", async () => {
      vi.mocked(db.getAutomationSchedulesByUserId).mockResolvedValueOnce([]);
      vi.mocked(db.createAutomationSchedule).mockResolvedValueOnce({
        id: "automation-1",
        userId: "test-user-123",
        name: "Test Automation",
        niche: "Tech",
        targetAudience: "Developers",
        platform: "twitter",
        goal: "Increase engagement",
        contentStyle: "casual",
        cronExpression: "0 0 * * *",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const caller = appRouter.createCaller(createMockContext("pro"));

      const result = await caller.automation.create({
        name: "Test Automation",
        niche: "Tech",
        targetAudience: "Developers",
        platform: "twitter",
        goal: "Increase engagement",
        contentStyle: "casual",
        cronExpression: "0 0 * * *",
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe("Automation created (free)");
    });

    it("should deduct 10 credits for 4th automation for pro users", async () => {
      // Mock 3 existing automations
      vi.mocked(db.getAutomationSchedulesByUserId).mockResolvedValueOnce([
        { id: "auto-1" },
        { id: "auto-2" },
        { id: "auto-3" },
      ] as any);
      vi.mocked(db.deductCredits).mockResolvedValueOnce(true);
      vi.mocked(db.createAutomationSchedule).mockResolvedValueOnce({
        id: "automation-4",
        userId: "test-user-123",
        name: "Test Automation 4",
        niche: "Tech",
        targetAudience: "Developers",
        platform: "twitter",
        goal: "Increase engagement",
        contentStyle: "casual",
        cronExpression: "0 0 * * *",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      vi.mocked(db.getUserCredits).mockResolvedValueOnce(90);

      const caller = appRouter.createCaller(createMockContext("pro"));

      const result = await caller.automation.create({
        name: "Test Automation 4",
        niche: "Tech",
        targetAudience: "Developers",
        platform: "twitter",
        goal: "Increase engagement",
        contentStyle: "casual",
        cronExpression: "0 0 * * *",
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe("Automation created (10 credits deducted)");
      expect(result.creditsRemaining).toBe(90);
      expect(vi.mocked(db.deductCredits)).toHaveBeenCalledWith(
        "test-user-123",
        10,
        expect.stringContaining("Automation")
      );
    });

    it("should reject 4th automation if insufficient credits", async () => {
      // Mock 3 existing automations
      vi.mocked(db.getAutomationSchedulesByUserId).mockResolvedValueOnce([
        { id: "auto-1" },
        { id: "auto-2" },
        { id: "auto-3" },
      ] as any);
      vi.mocked(db.deductCredits).mockResolvedValueOnce(false);

      const caller = appRouter.createCaller(createMockContext("pro"));

      await expect(
        caller.automation.create({
          name: "Test Automation 4",
          niche: "Tech",
          targetAudience: "Developers",
          platform: "twitter",
          goal: "Increase engagement",
          contentStyle: "casual",
          cronExpression: "0 0 * * *",
        })
      ).rejects.toThrow("Insufficient credits for additional automations");
    });

    it("should allow unlimited automations with credits for pro users", async () => {
      // Mock 10 existing automations
      const existingAutomations = Array.from({ length: 10 }, (_, i) => ({
        id: `auto-${i + 1}`,
      }));
      vi.mocked(db.getAutomationSchedulesByUserId).mockResolvedValueOnce(existingAutomations as any);
      vi.mocked(db.deductCredits).mockResolvedValueOnce(true);
      vi.mocked(db.createAutomationSchedule).mockResolvedValueOnce({
        id: "automation-11",
        userId: "test-user-123",
        name: "Test Automation 11",
        niche: "Tech",
        targetAudience: "Developers",
        platform: "twitter",
        goal: "Increase engagement",
        contentStyle: "casual",
        cronExpression: "0 0 * * *",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      vi.mocked(db.getUserCredits).mockResolvedValueOnce(50);

      const caller = appRouter.createCaller(createMockContext("pro"));

      const result = await caller.automation.create({
        name: "Test Automation 11",
        niche: "Tech",
        targetAudience: "Developers",
        platform: "twitter",
        goal: "Increase engagement",
        contentStyle: "casual",
        cronExpression: "0 0 * * *",
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe("Automation created (10 credits deducted)");
    });
  });

  describe("Automation list endpoint", () => {
    it("should return free automations remaining for free users", async () => {
      vi.mocked(db.getAutomationSchedulesByUserId).mockResolvedValueOnce([
        { id: "auto-1" },
        { id: "auto-2" },
      ] as any);

      const caller = appRouter.createCaller(createMockContext("free"));

      const result = await caller.automation.list();

      expect(result.success).toBe(true);
      expect(result.automationCount).toBe(2);
      expect(result.freeAutomationsRemaining).toBe(1);
      expect(result.subscriptionTier).toBe("free");
    });

    it("should return credits remaining for pro users", async () => {
      vi.mocked(db.getAutomationSchedulesByUserId).mockResolvedValueOnce([
        { id: "auto-1" },
        { id: "auto-2" },
        { id: "auto-3" },
        { id: "auto-4" },
      ] as any);
      vi.mocked(db.getUserCredits).mockResolvedValueOnce(80);

      const caller = appRouter.createCaller(createMockContext("pro"));

      const result = await caller.automation.list();

      expect(result.success).toBe(true);
      expect(result.automationCount).toBe(4);
      expect(result.creditsRemaining).toBe(80);
      expect(result.subscriptionTier).toBe("pro");
    });
  });
});
