import { describe, expect, it } from "vitest";
import { initializeOAuthConfigs } from "./oauthPlatforms";

describe("production OAuth routing", () => {
  const baseUrl = "https://lumae.co.in";
  const platforms = initializeOAuthConfigs(baseUrl);

  it("uses the registered mounted callback path for every configured provider", () => {
    for (const platform of ["instagram", "facebook", "twitter", "linkedin", "youtube", "tiktok"] as const) {
      expect(platforms[platform].redirectUri).toBe(
        platform === "instagram"
          ? `${baseUrl}/api/oauth/callback/instagram/callback`
          : `${baseUrl}/api/oauth/callback/${platform}`,
      );
    }
  });

  it("uses literal spaces rather than the word space between OAuth scopes", () => {
    for (const platform of ["twitter", "linkedin", "youtube", "tiktok"] as const) {
      expect(platforms[platform].scopeSeparator).toBe(" ");
      const renderedScopes = platforms[platform].scopes.join(platforms[platform].scopeSeparator);
      expect(renderedScopes).not.toContain("readspace");
      expect(renderedScopes).not.toContain("writespace");
    }
  });
});
