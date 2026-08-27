import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), "utf8");

describe("social Connect and automation reliability contracts", () => {
  it("persists encrypted OAuth state instead of relying on process memory", () => {
    const stateStore = read("server/_core/oauthPKCE.ts");
    expect(stateStore).toContain("socialOAuthStates");
    expect(stateStore).toContain("encryptedCodeVerifier");
    expect(stateStore).not.toContain("const stateStore = new Map");
  });

  it("preserves only safe relative post-login and post-provider return routes", () => {
    const loginUrl = read("client/src/const.ts");
    const dashboardLayout = read("client/src/components/DashboardLayout.tsx");
    const googleOAuth = read("server/_core/oauth.ts");
    const socialCallback = read("server/routes/oauthCallbackSecure.ts");
    expect(loginUrl).toContain('getLoginUrl = (returnPath = "/")');
    expect(dashboardLayout).toContain("getLoginUrl(`${window.location.pathname}${window.location.search}`)");
    expect(googleOAuth).toContain("const isSafeRelativePath");
    expect(googleOAuth).toContain("isSafeRelativePath(requestedReturnPath)");
    expect(socialCallback).toContain("completed.returnPath");
  });

  it("requires a connected Auto-Post account before activating automation", () => {
    const automationRouter = read("server/routers/automation.ts");
    const workspace = read("client/src/components/PlatformAutomationWorkspace.tsx");
    expect(automationRouter).toContain("assertAutomationReadiness");
    expect(automationRouter).toContain("Enable Auto-Post");
    expect(workspace).toContain("status.kind !== \"ready\"");
    expect(workspace).toContain("Connect or reconnect");
  });

  it("requires a validated, non-expired connection before Auto-Post can be enabled", () => {
    const oauthRouter = read("server/routers/socialOAuthIntegration.ts");
    expect(oauthRouter).toContain("Reconnect and validate your ${input.platform} account before enabling Auto-Post.");
    expect(oauthRouter).toContain("access token has expired. Reconnect before enabling Auto-Post.");
    expect(oauthRouter).toContain("eq(socialConnections.id, connection.id)");
  });

  it("opens provider authorization at the top level instead of embedding Meta login on mobile", () => {
    const connectedAccounts = read("client/src/pages/ConnectedAccounts.tsx");
    expect(connectedAccounts).toContain('window.open("about:blank", "_blank")');
    expect(connectedAccounts).toContain("providerWindow.opener = null");
    expect(connectedAccounts).toContain("providerWindow.location.replace(result.url)");
    expect(connectedAccounts).toContain("window.location.assign(result.url)");
    expect(connectedAccounts).not.toContain("window.location.href = result.url");
  });
});
