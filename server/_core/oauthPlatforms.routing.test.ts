import { describe, expect, it } from "vitest";
import { initializeOAuthConfigs } from "./oauthPlatforms";

describe("production OAuth routing", () => {
  const baseUrl = "https://lumae.co.in";
  const platforms = initializeOAuthConfigs(baseUrl);

  it("uses the registered canonical callback for Instagram and mounted callback paths for other providers", () => {
    expect(platforms.instagram.redirectUri).toBe(
      `${baseUrl}/api/oauth/callback/instagram`,
    );

    for (const platform of ["facebook", "twitter", "linkedin", "youtube", "tiktok"] as const) {
      expect(platforms[platform].redirectUri).toBe(
        `${baseUrl}/api/oauth/callback/${platform}/callback`,
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
