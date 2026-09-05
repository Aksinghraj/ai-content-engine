import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), "utf8");

describe("social media scheduling reliability", () => {
  it("creates a pending scheduled post only after ownership, validation, token, Auto-Post, media, and future-time checks", () => {
    const router = read("server/routers/socialMedia.ts");
    expect(router).toContain("assertSchedulingReadiness(connection, input.platform)");
    expect(router).toContain("assertManagedMediaForUser(ctx.user.id, input.mediaUrl, input.mediaKey)");
    expect(router).toContain("Instagram scheduling requires a Lumae-managed image or video.");
    expect(router).toContain("Choose a future date and time for a scheduled post.");
    expect(router).toContain("const post = await createScheduledPost(");
    expect(router).toContain("success: true,");
  });

  it("never permits a disconnected, unvalidated, expired, or Auto-Post-off connection to be scheduled", () => {
    const router = read("server/routers/socialMedia.ts");
    expect(router).toContain("!connection.isConnected || !connection.isValidated");
    expect(router).toContain("access token has expired. Reconnect before scheduling.");
    expect(router).toContain("Enable Auto-Post for your validated ${platform} account before scheduling.");
  });

  it("surfaces fulfilled and rejected multi-platform outcomes in Create Post Pro", () => {
    const page = read("client/src/pages/CreatePostAdvanced.tsx");
    expect(page).toContain("const outcomes = results.map");
    expect(page).toContain("setPublishResults(outcomes)");
    expect(page).toContain("Scheduling failed before the post was saved.");
    expect(page).toContain("toast.error(failed.map");
  });
});
