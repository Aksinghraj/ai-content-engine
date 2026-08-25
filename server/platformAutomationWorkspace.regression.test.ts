import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const workspaceSource = readFileSync(resolve(projectRoot, "client/src/components/PlatformAutomationWorkspace.tsx"), "utf8");
const routerSource = readFileSync(resolve(projectRoot, "server/routers/automation.ts"), "utf8");
const executorSource = readFileSync(resolve(projectRoot, "server/_core/automationEngine.ts"), "utf8");

describe("platform automation safe-launch contracts", () => {
  it("keeps the four selected platforms visible and scopes schedules to the active platform", () => {
    expect(workspaceSource).toContain('id: "instagram"');
    expect(workspaceSource).toContain('id: "youtube"');
    expect(workspaceSource).toContain('id: "twitter"');
    expect(workspaceSource).toContain('id: "facebook"');
    expect(workspaceSource).toContain("schedule.platform === activeId");
  });

  it("states YouTube direct-message limits and keeps review manual-first", () => {
    expect(workspaceSource).toContain("Auto-DM unavailable");
    expect(workspaceSource).toContain("does not provide channel-to-viewer direct messages");
    expect(workspaceSource).toContain("SAFE LAUNCH · MANUAL REVIEW FIRST");
  });

  it("blocks X execution in request-time and scheduled execution paths", () => {
    expect(routerSource).toContain("Twitter/X execution is locked until an owner-approved API usage budget is configured.");
    expect(executorSource).toContain("Twitter/X execution is locked until an owner-approved API usage budget is configured");
  });

  it("requires a connected, validated, unexpired account with Auto-Post before publishing", () => {
    expect(routerSource).toContain("Reconnect your ${platform} account before creating an automation.");
    expect(routerSource).toContain("access token has expired");
    expect(routerSource).toContain("Enable Auto-Post");
    expect(executorSource).toContain("needs to be reconnected before automation can run");
    expect(executorSource).toContain("access token has expired; reconnect the account before automation can run");
  });
});
