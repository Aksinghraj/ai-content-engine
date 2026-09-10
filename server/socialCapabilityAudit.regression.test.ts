import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

describe("social automation capability audit", () => {
  it("does not expose fabricated legacy social credentials, posts, comments, or replies", () => {
    const router = read("server/routers/socialOAuth.ts");
    expect(router).toContain("legacy OAuth endpoint is retired");
    expect(router).toContain("current Schedule Post or Publish Now flow");
    expect(router).not.toContain("mock_token");
    expect(router).not.toContain("user123");
    expect(router).not.toContain("Math.random()");
  });

  it("persists only verified Meta events for an owned validated connection", () => {
    const webhook = read("server/routes/metaWebhook.ts");
    expect(webhook).toContain("isValidMetaWebhookSignature");
    expect(webhook).toContain("getSocialConnectionByPlatformUserId");
    expect(webhook).toContain("connection.isValidated");
    expect(webhook).toContain("hasEngagementEvent");
    expect(webhook).toContain('eventType: "comment"');
    expect(webhook).toContain('eventType: "dm"');
    expect(webhook).not.toContain("autoReplySent: true");
  });

  it("keeps provider capability boundaries explicit in the active automation workspace", () => {
    const workspace = read("client/src/components/PlatformAutomationWorkspace.tsx");
    expect(workspace).toContain("Manual review only");
    expect(workspace).toContain("Direct messages unavailable");
    expect(workspace).toContain("X execution remains locked");
    expect(workspace).toContain("trpc.enterprise.getEngagementEvents.useQuery");
    expect(workspace).toContain("Open review queue");
  });
});
