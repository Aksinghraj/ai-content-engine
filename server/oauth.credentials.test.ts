import { describe, it, expect } from "vitest";

describe("OAuth Credentials - Environment Variables", () => {
  it("should have Instagram OAuth credentials set", () => {
    expect(process.env.INSTAGRAM_CLIENT_ID).toBeTruthy();
    expect(process.env.INSTAGRAM_CLIENT_SECRET).toBeTruthy();
    expect(process.env.INSTAGRAM_CLIENT_ID).toBe("2549450502178937");
  });

  it("should have Facebook OAuth credentials set", () => {
    expect(process.env.FACEBOOK_CLIENT_ID).toBeTruthy();
    expect(process.env.FACEBOOK_CLIENT_SECRET).toBeTruthy();
    expect(process.env.FACEBOOK_CLIENT_ID).toBe("1025691710044904");
  });

  it("should have Twitter/X OAuth credentials set", () => {
    expect(process.env.TWITTER_CLIENT_ID).toBeTruthy();
    expect(process.env.TWITTER_CLIENT_SECRET).toBeTruthy();
    expect(process.env.TWITTER_CLIENT_ID).toBe("bHkzQmFIbzYxV0ZaSTFkRzlLZVo6MTpjaQ");
  });

  it("should have LinkedIn OAuth credentials set", () => {
    expect(process.env.LINKEDIN_CLIENT_ID).toBeTruthy();
    expect(process.env.LINKEDIN_CLIENT_SECRET).toBeTruthy();
    expect(process.env.LINKEDIN_CLIENT_ID).toBe("77vvanuiddfmvk");
  });

  it("should have YouTube/Google OAuth credentials set", () => {
    expect(process.env.YOUTUBE_CLIENT_ID).toBeTruthy();
    expect(process.env.YOUTUBE_CLIENT_SECRET).toBeTruthy();
    expect(process.env.YOUTUBE_CLIENT_ID).toContain("908937384435");
  });

  it("should have all 5 platforms configured (TikTok pending)", () => {
    const platforms = [
      "INSTAGRAM_CLIENT_ID",
      "FACEBOOK_CLIENT_ID",
      "TWITTER_CLIENT_ID",
      "LINKEDIN_CLIENT_ID",
      "YOUTUBE_CLIENT_ID",
    ];
    platforms.forEach((key) => {
      expect(process.env[key], `${key} must be set`).toBeTruthy();
    });
  });
});
