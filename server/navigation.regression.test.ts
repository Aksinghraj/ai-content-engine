import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { appNavigation, getNavigationArea } from "../client/src/lib/appNavigation";

const appSource = readFileSync(resolve(__dirname, "../client/src/App.tsx"), "utf8");

describe("seven-area application navigation", () => {
  it("defines exactly the requested top-level areas with canonical defaults", () => {
    expect(appNavigation.map((area) => area.label)).toEqual([
      "Dashboard",
      "Content Studio",
      "Scheduling",
      "Automation",
      "Analytics",
      "Account",
      "Billing",
    ]);
    expect(appNavigation.find((area) => area.label === "Content Studio")?.path).toBe("/content-studio/ai-generator");
    expect(appNavigation.find((area) => area.label === "Scheduling")?.path).toBe("/scheduling/post-scheduling");
    expect(appNavigation.find((area) => area.label === "Automation")?.path).toBe("/automation/auto-reply");
  });

  it("maps canonical paths to their parent area and keeps reply inbox distinct", () => {
    expect(getNavigationArea("/content-studio/media-generation")?.label).toBe("Content Studio");
    expect(getNavigationArea("/scheduling/connected-accounts")?.label).toBe("Scheduling");
    expect(getNavigationArea("/automation/reply-inbox")?.label).toBe("Automation");
    expect(appNavigation.find((area) => area.label === "Automation")?.tabs?.map((tab) => tab.label)).toEqual([
      "Auto-Reply AI",
      "Reply Inbox",
      "Escalation",
      "Social Automation",
    ]);
  });

  it("redirects legacy feature URLs to their canonical grouped destinations", () => {
    expect(appSource).toContain('<Redirect to="/content-studio/ai-generator" />');
    expect(appSource).toContain('<Redirect to="/scheduling/connected-accounts" />');
    expect(appSource).toContain('<Redirect to="/automation/auto-reply" />');
    expect(appSource).toContain('<Redirect to="/analytics/usage" />');
    expect(appSource).toContain('<Redirect to="/account/profile" />');
    expect(appSource).toContain('<Redirect to="/billing/buy-credits" />');
    expect(appSource).toContain('component={GroupedGenerator}');
    expect(appSource).toContain('component={GroupedAutomation}');
  });
});
