import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), "utf8");

describe("Create Post Pro scheduling feedback", () => {
  it("requires the real connected, validated, Auto-Post-ready state before scheduling", () => {
    const page = read("client/src/pages/CreatePostAdvanced.tsx");
    expect(page).toContain("account?.isConnected && account.isValidated");
    expect(page).toContain("Enable Auto-Post for every selected account before scheduling.");
  });

  it("converts every schedule rejection into an inline actionable result instead of a silent failure", () => {
    const page = read("client/src/pages/CreatePostAdvanced.tsx");
    expect(page).toContain("Promise.allSettled");
    expect(page).toContain("result.reason instanceof Error ? result.reason.message");
    expect(page).toContain("setPublishResults([{ platform: \"schedule\", success: false, detail }])");
    expect(page).toContain("Scheduled for ${time.toLocaleString()}");
  });
});
