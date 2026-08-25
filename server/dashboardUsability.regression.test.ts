import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { appNavigation } from "../client/src/lib/appNavigation";

const root = resolve(import.meta.dirname, "..");
const read = (relativePath: string) => readFileSync(resolve(root, relativePath), "utf8");

describe("authenticated dashboard usability repair", () => {
  const layout = read("client/src/components/DashboardLayout.tsx");
  const dashboard = read("client/src/pages/SimpleDashboard.tsx");
  const navigation = read("client/src/components/AppNavigation.tsx");
  const overrides = read("client/src/dashboardUsability.css");

  it("keeps one desktop primary navigation pattern and retains all destinations in the sidebar", () => {
    expect(layout).not.toContain("<AppPrimaryNavigation compact />");
    expect(layout).toContain("overflow-y-auto overscroll-contain");
    expect(navigation).toContain("appNavigation.map");
    expect(appNavigation.map((area) => area.label)).toEqual([
      "Dashboard", "Content Studio", "Scheduling", "Automation", "Business", "Analytics", "Account", "Billing",
    ]);
  });

  it("uses sentence-case dashboard labels and a restrained credit metric", () => {
    expect(dashboard).toContain("Workspace signal");
    expect(dashboard).toContain("Start here");
    expect(dashboard).toContain("Account signal");
    expect(dashboard).not.toContain("WORKSPACE SIGNAL");
    expect(overrides).toContain("text-transform: none");
    expect(overrides).toContain("font-size: 34px");
  });

  it("keeps the header controls aligned and promotes the Content Studio entry action", () => {
    expect(layout).toContain('hidden h-14 items-center justify-end');
    expect(dashboard).toContain('className="lumae-section-row__action"');
    expect(dashboard).toContain("Open Content Studio");
    expect(overrides).toContain(".lumae-section-row__action");
    expect(overrides).toContain("justify-content: center");
  });
});
