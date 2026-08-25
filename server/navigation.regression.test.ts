import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { appNavigation, getNavigationArea } from "../client/src/lib/appNavigation";

const appSource = readFileSync(resolve(__dirname, "../client/src/App.tsx"), "utf8");
const footerSource = readFileSync(resolve(__dirname, "../client/src/components/Footer.tsx"), "utf8");
const dashboardLayoutSource = readFileSync(resolve(__dirname, "../client/src/components/DashboardLayout.tsx"), "utf8");

describe("application navigation", () => {
  it("defines Business directly after Automation with canonical defaults", () => {
    expect(appNavigation.map((area) => area.label)).toEqual([
      "Dashboard",
      "Content Studio",
      "Scheduling",
      "Automation",
      "Business",
      "Analytics",
      "Account",
      "Billing",
    ]);
    expect(appNavigation.find((area) => area.label === "Content Studio")?.path).toBe("/content-studio/ai-generator");
    expect(appNavigation.find((area) => area.label === "Scheduling")?.path).toBe("/scheduling/post-scheduling");
    expect(appNavigation.find((area) => area.label === "Automation")?.path).toBe("/automation/auto-reply");
    expect(appNavigation.find((area) => area.label === "Business")?.path).toBe("/business/email-automation");
  });

  it("maps canonical paths to their parent area and keeps reply inbox distinct", () => {
    expect(getNavigationArea("/content-studio/media-generation")?.label).toBe("Content Studio");
    expect(getNavigationArea("/scheduling/connected-accounts")?.label).toBe("Scheduling");
    expect(getNavigationArea("/automation/reply-inbox")?.label).toBe("Automation");
    expect(getNavigationArea("/business/whatsapp-automation")?.label).toBe("Business");
    expect(appNavigation.find((area) => area.label === "Automation")?.tabs?.map((tab) => tab.label)).toEqual([
      "Auto-Reply AI",
      "Reply Inbox",
      "Escalation",
      "Social Automation",
    ]);
    expect(appNavigation.find((area) => area.label === "Business")?.tabs?.map((tab) => tab.label)).toEqual([
      "Email Automation",
      "WhatsApp Automation",
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
    expect(appSource).toContain('component={BusinessEmailAutomation}');
    expect(appSource).toContain('component={BusinessWhatsAppAutomation}');
  });

  it("keeps every primary navigation destination backed by a registered application route", () => {
    const primaryPaths = [...new Set(appNavigation.flatMap((area) => [area.path, ...(area.tabs?.map((tab) => tab.path) ?? [])]))];
    expect(primaryPaths.length).toBeGreaterThan(20);
    for (const path of primaryPaths) expect(appSource).toContain(`path="${path}"`);
  });

  it("keeps public footer destinations and discovered legacy navigation paths valid", () => {
    for (const path of ["/", "/pricing", "/about", "/blog", "/contact", "/privacy-policy", "/terms", "/cookie-policy"]) {
      expect(footerSource).toContain(`href="${path}"`);
    }
    expect(appSource).toContain('<Route path="/generate-content"><Redirect to="/content-studio/ai-generator" /></Route>');
    expect(appSource).toContain('<Route path="/social-automation"><Redirect to="/automation/social-automation" /></Route>');
    expect(appSource).toContain('<Route path="/payments"><Redirect to="/billing/buy-credits" /></Route>');
  });

  it("keeps first-time motion education from blocking every authenticated destination", () => {
    expect(dashboardLayoutSource).toContain('const showLightPulseIntroduction = location === "/dashboard"');
    expect(dashboardLayoutSource).toContain('{showLightPulseIntroduction && <LumaeLightPulseIntroModal />}');
  });
});
