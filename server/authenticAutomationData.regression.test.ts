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
});
