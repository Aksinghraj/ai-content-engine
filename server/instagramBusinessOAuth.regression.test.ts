import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (file: string) => readFileSync(resolve(root, file), "utf8");

describe("Instagram Business OAuth contract", () => {
  const platforms = read("server/_core/oauthPlatforms.ts");
  const validation = read("server/_core/credentialValidation.ts");
  const flow = read("server/_core/oauthFlow.ts");
  const publishing = read("server/_core/socialMediaPosting.ts");
  const oauthRouter = read("server/routers/socialOAuthIntegration.ts");
  const accountsPage = read("client/src/pages/ConnectedAccounts.tsx");

  it("uses Meta Business OAuth rather than the retired Instagram Basic Display path", () => {
    expect(platforms).toContain('authorizationEndpoint: "https://www.facebook.com/v26.0/dialog/oauth"');
    expect(platforms).toContain('tokenEndpoint: "https://graph.facebook.com/v26.0/oauth/access_token"');
    expect(platforms).toContain('return `${baseUrl}/api/oauth/callback/${platform}/callback`;');
    expect(platforms).toContain('"instagram_content_publish"');
    expect(platforms).toContain('"pages_show_list"');
    expect(platforms).not.toContain('authorizationEndpoint: "https://api.instagram.com/oauth/authorize"');
  });

  it("accepts both the registered Instagram callback path and the previous callback alias", () => {
    const callbacks = read("server/routes/oauthCallbackSecure.ts");
    expect(callbacks).toContain('router.get("/instagram", async');
    expect(callbacks).toContain('router.get("/instagram/callback", async');
  });

  it("resolves an Instagram professional account and stores its Page publishing token", () => {
    expect(validation).toContain('https://graph.facebook.com/v26.0/me/accounts');
    expect(validation).toContain('instagram_business_account{id,username,name}');
    expect(validation).toContain("publishingAccessToken: page.access_token");
    expect(flow).toContain("validationResult.publishingAccessToken || tokenData.access_token");
    expect(publishing).toContain("https://graph.facebook.com/${INSTAGRAM_API_VERSION}/${igUserId}/media");
    expect(publishing).toContain("https://graph.facebook.com/${INSTAGRAM_API_VERSION}/${igUserId}/media_publish");
  });

  it("creates a fresh non-cacheable authorization state for every Connect action", () => {
    expect(oauthRouter).toContain("getAuthorizationUrl: protectedProcedure");
    expect(oauthRouter).toContain(".mutation(async ({ input, ctx }) => {");
    expect(accountsPage).toContain("getAuthorizationUrl.mutate(");
    expect(accountsPage).not.toContain("getAuthorizationUrl.query(");
  });

  it("serializes Meta permissions as comma-delimited scopes rather than a literal separator label", () => {
    expect(flow).toContain('config.scopeSeparator === "comma" ? "," : " "');
    expect(flow).toContain("scope: config.scopes.join(scopeSeparator)");
  });
});
