import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getWorkspaceShortcut, workspaceShortcuts } from "../client/src/lib/workspaceShortcuts";

const root = resolve(import.meta.dirname, "..");
const readClient = (relativePath: string) => readFileSync(resolve(root, "client", "src", relativePath), "utf8");

describe("primary workspace keyboard shortcuts", () => {
  it("maps every primary workspace to a unique Alt+Shift number shortcut", () => {
    expect(workspaceShortcuts.map((shortcut) => shortcut.label)).toEqual([
      "Dashboard",
      "Content Studio",
      "Scheduling",
      "Automation",
      "Business",
      "Analytics",
      "Account",
      "Billing",
    ]);
    expect(workspaceShortcuts.map((shortcut) => shortcut.key)).toEqual(["1", "2", "3", "4", "5", "6", "7", "8"]);
    expect(getWorkspaceShortcut("2")).toMatchObject({ label: "Content Studio", path: "/content-studio/ai-generator" });
    expect(getWorkspaceShortcut("9")).toBeUndefined();
  });

  it("guards typing, composition, modifier conflicts, and open dialogs before navigation", () => {
    const layout = readClient("components/DashboardLayout.tsx");
    const helper = readClient("lib/workspaceShortcuts.ts");

    expect(layout).toContain("!event.altKey");
    expect(layout).toContain("!event.shiftKey");
    expect(layout).toContain("event.ctrlKey");
    expect(layout).toContain("event.metaKey");
    expect(layout).toContain("event.isComposing");
    expect(layout).toContain("[role='dialog'][data-state='open']");
    expect(helper).toContain("input, textarea, select, [contenteditable='true'], [role='textbox']");
  });

  it("exposes an accessible reference and announces successful shortcut navigation", () => {
    const layout = readClient("components/DashboardLayout.tsx");

    expect(layout).toContain("Workspace shortcuts");
    expect(layout).toContain('aria-label="Primary workspace keyboard shortcuts"');
    expect(layout).toContain('aria-live="polite"');
    expect(layout).toContain("Keyboard shortcuts");
  });
});
