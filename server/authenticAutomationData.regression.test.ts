import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) => readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("authentic automation data", () => {
  it("renders the active Auto-Reply inbox from user-owned events and an honest empty state", () => {
    const page = read("client/src/pages/AutoReplySystem.tsx");

    expect(page).toContain("trpc.enterprise.getEngagementEvents.useQuery");
    expect(page).toContain("No incoming events yet");
    expect(page).not.toContain("DEMO_COMMENTS");
    expect(page).not.toContain("@sarah_fitness");
  });

  it("persists knowledge and rule changes with ownership-scoped server procedures", () => {
    const router = read("server/routers/enterprise.ts");
    const database = read("server/db/enterprise.ts");

    expect(router).toContain("deleteKnowledgeBase: protectedProcedure");
    expect(router).toContain("updateAutoReplyRule: protectedProcedure");
    expect(database).toContain("deleteKnowledgeBaseForUser");
    expect(database).toContain("updateAutoReplyRuleForUser");
    expect(database).toContain("eq(autoReplyRules.userId, userId)");
  });

  it("keeps Reply Inbox and Escalation bound to real engagement events", () => {
    const inbox = read("client/src/pages/AutoReplyAdvanced.tsx");
    const escalation = read("client/src/pages/SentimentEscalation.tsx");

    expect(inbox).toContain("trpc.enterprise.getEngagementEvents.useQuery");
    expect(inbox).not.toContain("john_doe");
    expect(inbox).not.toContain("Thank You Response");
    expect(escalation).toContain("trpc.enterprise.getEscalatedEvents.useQuery");
    expect(escalation).not.toContain("MOCK_ESCALATIONS");
    expect(escalation).not.toContain("Response sent!");
  });

  it("keeps Calendar, Analytics, and Settings free of fabricated account data", () => {
    const calendar = read("client/src/pages/ContentCalendar.tsx");
    const analytics = read("client/src/pages/AnalyticsDashboard.tsx");
    const usageAnalytics = read("client/src/pages/UsageAnalytics.tsx");
    const settings = read("client/src/pages/SettingsAdvanced.tsx");

    expect(calendar).toContain("trpc.socialMedia.getScheduledPosts.useQuery");
    expect(calendar).not.toContain("MOCK_EVENTS");
    expect(analytics).toContain('export { default } from "./UsageAnalytics"');
    expect(usageAnalytics).toContain("trpc.analytics.getContentAnalytics.useQuery");
    expect(usageAnalytics).not.toContain("Mock data for demonstration");
    expect(usageAnalytics).not.toContain("Tokens Used Today");
    expect(settings).toContain("useLanguage");
    expect(settings).not.toContain("user@example.com");
    expect(settings).not.toContain("sk_live_");
  });

  it("does not fabricate analytics, ROI, or trends in the legacy analytics service", () => {
    const service = read("server/_core/analyticsService.ts");

    expect(service).not.toContain("Math.random");
    expect(service).not.toContain("mockConnections");
    expect(service).not.toContain("conversionRate");
    expect(service).not.toContain("#AI-ContentCreation");
    expect(service).toContain("Measured analytics will appear after a supported provider insight import.");
  });
});
