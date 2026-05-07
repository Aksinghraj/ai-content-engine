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
    it("should allow creating automations (free for all)", async () => {
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
      expect(result.freeAutomationsRemaining).toBeNull();
    });

    it("should allow unlimited automations for free tier users (free for all)", async () => {
      // Mock 10 existing automations
      const existingAutomations = Array.from({ length: 10 }, (_, i) => ({
        id: `auto-${i + 1}`,
      }));
      vi.mocked(db.getAutomationSchedulesByUserId).mockResolvedValueOnce(existingAutomations as any);
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

      const caller = appRouter.createCaller(createMockContext("free"));

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
      expect(result.message).toBe("Automation created (free)");
    });

    it("should return unlimited automations for free users (free for all)", async () => {
      // Mock 10 existing automations
      const existingAutomations = Array.from({ length: 10 }, (_, i) => ({
        id: `auto-${i + 1}`,
      }));
      vi.mocked(db.getAutomationSchedulesByUserId).mockResolvedValueOnce(existingAutomations as any);

      const caller = appRouter.createCaller(createMockContext("free"));

      const result = await caller.automation.list();

      expect(result.success).toBe(true);
      expect(result.automationCount).toBe(10);
      expect(result.freeAutomationsRemaining).toBeNull();
    });
  });

  describe("Pro tier users", () => {
    it("should allow creating automations for pro users (free for all)", async () => {
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

    it("should allow unlimited automations for pro users (free for all)", async () => {
      // Mock 10 existing automations
      const existingAutomations = Array.from({ length: 10 }, (_, i) => ({
        id: `auto-${i + 1}`,
      }));
      vi.mocked(db.getAutomationSchedulesByUserId).mockResolvedValueOnce(existingAutomations as any);
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
      expect(result.message).toBe("Automation created (free)");
    });

    it("should handle multiple automations for pro users (free for all)", async () => {
      // Mock 5 existing automations
      const existingAutomations = Array.from({ length: 5 }, (_, i) => ({
        id: `auto-${i + 1}`,
      }));
      vi.mocked(db.getAutomationSchedulesByUserId).mockResolvedValueOnce(existingAutomations as any);
      vi.mocked(db.createAutomationSchedule).mockResolvedValueOnce({
        id: "automation-6",
        userId: "test-user-123",
        name: "Test Automation 6",
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
        name: "Test Automation 6",
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


  });

  describe("Automation list endpoint", () => {
    it("should return automations for free users (free for all)", async () => {
      vi.mocked(db.getAutomationSchedulesByUserId).mockResolvedValueOnce([
        { id: "auto-1" },
        { id: "auto-2" },
      ] as any);

      const caller = appRouter.createCaller(createMockContext("free"));

      const result = await caller.automation.list();

      expect(result.success).toBe(true);
      expect(result.automationCount).toBe(2);
      expect(result.freeAutomationsRemaining).toBeNull();
      expect(result.subscriptionTier).toBeNull();
    });

    it("should return automations for pro users (free for all)", async () => {
      vi.mocked(db.getAutomationSchedulesByUserId).mockResolvedValueOnce([
        { id: "auto-1" },
        { id: "auto-2" },
        { id: "auto-3" },
        { id: "auto-4" },
      ] as any);

      const caller = appRouter.createCaller(createMockContext("pro"));

      const result = await caller.automation.list();

      expect(result.success).toBe(true);
      expect(result.automationCount).toBe(4);
      expect(result.creditsRemaining).toBeNull();
      expect(result.subscriptionTier).toBeNull();
    });
  });
});
