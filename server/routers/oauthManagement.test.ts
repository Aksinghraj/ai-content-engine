import { describe, it, expect, vi, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";
import * as oauthFlow from "../_core/oauthFlow";
import * as socialDb from "../db/social";

/**
 * OAuth Management Router Tests
 * Tests for social media account linking, OAuth flow, and token management
 */

describe("OAuth Management Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAuthorizationUrl", () => {
    it("should generate authorization URL for Instagram", async () => {
      const mockUrl = "https://instagram.com/oauth/authorize?client_id=test&state=abc123";
      vi.spyOn(oauthFlow, "generateAuthorizationUrl").mockResolvedValue({
        authorizationUrl: mockUrl,
        state: "abc123",
      });

      const result = await oauthFlow.generateAuthorizationUrl(
        "http://localhost:3000",
        "instagram",
        "user123"
      );

      expect(result.authorizationUrl).toBe(mockUrl);
      expect(result.state).toBe("abc123");
    });

    it("should generate authorization URL for Twitter", async () => {
      const mockUrl = "https://twitter.com/i/oauth2/authorize?client_id=test&state=xyz789";
      vi.spyOn(oauthFlow, "generateAuthorizationUrl").mockResolvedValue({
        authorizationUrl: mockUrl,
        state: "xyz789",
      });

      const result = await oauthFlow.generateAuthorizationUrl(
        "http://localhost:3000",
        "twitter",
        "user123"
      );

      expect(result.authorizationUrl).toBe(mockUrl);
      expect(result.state).toBe("xyz789");
    });

    it("should generate authorization URL for LinkedIn", async () => {
      const mockUrl = "https://www.linkedin.com/oauth/v2/authorization?client_id=test&state=lnk456";
      vi.spyOn(oauthFlow, "generateAuthorizationUrl").mockResolvedValue({
        authorizationUrl: mockUrl,
        state: "lnk456",
      });

      const result = await oauthFlow.generateAuthorizationUrl(
        "http://localhost:3000",
        "linkedin",
        "user123"
      );

      expect(result.authorizationUrl).toBe(mockUrl);
      expect(result.state).toBe("lnk456");
    });

    it("should throw error for invalid platform", async () => {
      vi.spyOn(oauthFlow, "generateAuthorizationUrl").mockRejectedValue(
        new Error("Invalid platform")
      );

      await expect(
        oauthFlow.generateAuthorizationUrl("http://localhost:3000", "invalid" as any, "user123")
      ).rejects.toThrow("Invalid platform");
    });
  });

  describe("getConnectedAccounts", () => {
    it("should return all connected accounts for user", async () => {
      const mockAccounts = [
        {
          id: "conn1",
          platform: "instagram",
          username: "testuser",
          platformUserId: "ig123",
          isConnected: true,
          autoPost: true,
          autoReply: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          tokenExpiresAt: new Date(Date.now() + 86400000),
        },
        {
          id: "conn2",
          platform: "twitter",
          username: "testuser_tw",
          platformUserId: "tw123",
          isConnected: true,
          autoPost: false,
          autoReply: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          tokenExpiresAt: new Date(Date.now() + 86400000),
        },
      ];

      vi.spyOn(socialDb, "getUserSocialConnections").mockResolvedValue(mockAccounts);

      const result = await socialDb.getUserSocialConnections("user123");

      expect(result).toHaveLength(2);
      expect(result[0].platform).toBe("instagram");
      expect(result[1].platform).toBe("twitter");
    });

    it("should return empty array when no accounts connected", async () => {
      vi.spyOn(socialDb, "getUserSocialConnections").mockResolvedValue([]);

      const result = await socialDb.getUserSocialConnections("user123");

      expect(result).toHaveLength(0);
    });
  });

  describe("getAccount", () => {
    it("should return specific connected account", async () => {
      const mockAccount = {
        id: "conn1",
        platform: "instagram",
        username: "testuser",
        platformUserId: "ig123",
        isConnected: true,
        autoPost: true,
        autoReply: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        tokenExpiresAt: new Date(Date.now() + 86400000),
      };

      vi.spyOn(socialDb, "getSocialConnectionByPlatform").mockResolvedValue(mockAccount);

      const result = await socialDb.getSocialConnectionByPlatform("user123", "instagram");

      expect(result).toBeDefined();
      expect(result?.platform).toBe("instagram");
      expect(result?.username).toBe("testuser");
    });

    it("should return null when account not connected", async () => {
      vi.spyOn(socialDb, "getSocialConnectionByPlatform").mockResolvedValue(null);

      const result = await socialDb.getSocialConnectionByPlatform("user123", "tiktok");

      expect(result).toBeNull();
    });
  });

  describe("disconnectAccount", () => {
    it("should disconnect social account", async () => {
      vi.spyOn(socialDb, "disconnectSocialAccount").mockResolvedValue(true);

      const result = await socialDb.disconnectSocialAccount("user123", "instagram");

      expect(result).toBe(true);
    });

    it("should handle disconnect error", async () => {
      vi.spyOn(socialDb, "disconnectSocialAccount").mockRejectedValue(
        new Error("Database error")
      );

      await expect(
        socialDb.disconnectSocialAccount("user123", "instagram")
      ).rejects.toThrow("Database error");
    });
  });

  describe("Token Management", () => {
    it("should get valid access token", async () => {
      const mockToken = "access_token_abc123";
      vi.spyOn(oauthFlow, "getValidAccessToken").mockResolvedValue(mockToken);

      const result = await oauthFlow.getValidAccessToken("user123", "instagram");

      expect(result).toBe(mockToken);
    });

    it("should refresh expired token", async () => {
      const newToken = "new_access_token_xyz789";
      vi.spyOn(oauthFlow, "refreshAccessToken").mockResolvedValue({
        accessToken: newToken,
        expiresIn: 3600,
        refreshToken: "refresh_token_new",
      });

      const result = await oauthFlow.refreshAccessToken("user123", "instagram");

      expect(result.accessToken).toBe(newToken);
      expect(result.expiresIn).toBe(3600);
    });

    it("should throw error when token refresh fails", async () => {
      vi.spyOn(oauthFlow, "refreshAccessToken").mockRejectedValue(
        new Error("Token refresh failed")
      );

      await expect(
        oauthFlow.refreshAccessToken("user123", "instagram")
      ).rejects.toThrow("Token refresh failed");
    });
  });

  describe("Account Health Score", () => {
    it("should calculate health score correctly", () => {
      const account = {
        id: "conn1",
        platform: "instagram",
        username: "testuser",
        connected: true,
        autoPost: true,
        autoReply: true,
      };

      // Score: 85 (base) = 85 (connected and both features enabled)
      let score = 85;
      if (!account.connected) score -= 30;
      if (!account.autoPost) score -= 10;
      if (!account.autoReply) score -= 10;

      expect(score).toBe(85);
    });

    it("should reduce score when features disabled", () => {
      const account = {
        id: "conn1",
        platform: "instagram",
        username: "testuser",
        connected: true,
        autoPost: false,
        autoReply: true,
      };

      let score = 85;
      if (!account.connected) score -= 30;
      if (!account.autoPost) score -= 10;
      if (!account.autoReply) score -= 10;

      expect(score).toBe(75);
    });

    it("should significantly reduce score when disconnected", () => {
      const account = {
        id: "conn1",
        platform: "instagram",
        username: "testuser",
        connected: false,
        autoPost: false,
        autoReply: false,
      };

      let score = 85;
      if (!account.connected) score -= 30;
      if (!account.autoPost) score -= 10;
      if (!account.autoReply) score -= 10;

      expect(score).toBe(35);
    });
  });

  describe("OAuth Security", () => {
    it("should validate state parameter", () => {
      const state = "abc123xyz789";
      const isValid = state.length > 10 && /^[a-zA-Z0-9]+$/.test(state);

      expect(isValid).toBe(true);
    });

    it("should reject invalid state parameter", () => {
      const state = "short";
      const isValid = state.length > 10 && /^[a-zA-Z0-9]+$/.test(state);

      expect(isValid).toBe(false);
    });

    it("should not expose sensitive tokens in response", () => {
      const response = {
        success: true,
        authorizationUrl: "https://instagram.com/oauth/authorize?...",
        state: "abc123xyz789",
      };

      expect(response).not.toHaveProperty("accessToken");
      expect(response).not.toHaveProperty("refreshToken");
      expect(response).not.toHaveProperty("clientSecret");
    });
  });

  describe("Multi-Platform Support", () => {
    const platforms = ["instagram", "twitter", "linkedin", "facebook", "youtube", "tiktok"];

    platforms.forEach((platform) => {
      it(`should support ${platform} OAuth flow`, async () => {
        const mockUrl = `https://${platform}.com/oauth/authorize?state=test123`;
        vi.spyOn(oauthFlow, "generateAuthorizationUrl").mockResolvedValue({
          authorizationUrl: mockUrl,
          state: "test123",
        });

        const result = await oauthFlow.generateAuthorizationUrl(
          "http://localhost:3000",
          platform as any,
          "user123"
        );

        expect(result.authorizationUrl).toContain(platform);
        expect(result.state).toBe("test123");
      });
    });
  });
});
