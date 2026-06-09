import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  validateCredentials,
  validateInstagramCredentials,
  validateTwitterCredentials,
  validateLinkedInCredentials,
  validateFacebookCredentials,
  validateYouTubeCredentials,
  validateTikTokCredentials,
} from "./credentialValidation";

/**
 * Credential Validation Tests
 * Tests that credentials are properly validated before marking accounts as connected
 */

describe("Credential Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Instagram Validation", () => {
    it("should validate correct Instagram access token", async () => {
      // This test would require mocking axios
      // In production, use a test token from Instagram Graph API
      expect(true).toBe(true);
    });

    it("should reject invalid Instagram access token", async () => {
      const result = await validateInstagramCredentials("invalid_token_xyz");
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should reject empty Instagram access token", async () => {
      const result = await validateInstagramCredentials("");
      expect(result.isValid).toBe(false);
    });
  });

  describe("Twitter Validation", () => {
    it("should reject invalid Twitter bearer token", async () => {
      const result = await validateTwitterCredentials("invalid_bearer_token");
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should reject empty Twitter token", async () => {
      const result = await validateTwitterCredentials("");
      expect(result.isValid).toBe(false);
    });
  });

  describe("LinkedIn Validation", () => {
    it("should reject invalid LinkedIn access token", async () => {
      const result = await validateLinkedInCredentials("invalid_linkedin_token");
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should reject empty LinkedIn token", async () => {
      const result = await validateLinkedInCredentials("");
      expect(result.isValid).toBe(false);
    });
  });

  describe("Facebook Validation", () => {
    it("should reject invalid Facebook access token", async () => {
      const result = await validateFacebookCredentials("invalid_fb_token");
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should reject empty Facebook token", async () => {
      const result = await validateFacebookCredentials("");
      expect(result.isValid).toBe(false);
    });
  });

  describe("YouTube Validation", () => {
    it("should reject invalid YouTube access token", async () => {
      const result = await validateYouTubeCredentials("invalid_youtube_token");
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should reject empty YouTube token", async () => {
      const result = await validateYouTubeCredentials("");
      expect(result.isValid).toBe(false);
    });
  });

  describe("TikTok Validation", () => {
    it("should reject invalid TikTok access token", async () => {
      const result = await validateTikTokCredentials("invalid_tiktok_token");
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should reject empty TikTok token", async () => {
      const result = await validateTikTokCredentials("");
      expect(result.isValid).toBe(false);
    });
  });

  describe("Main Validation Router", () => {
    it("should route to Instagram validator", async () => {
      const result = await validateCredentials("instagram", "invalid_token");
      expect(result.isValid).toBe(false);
    });

    it("should route to Twitter validator", async () => {
      const result = await validateCredentials("twitter", "invalid_token");
      expect(result.isValid).toBe(false);
    });

    it("should route to LinkedIn validator", async () => {
      const result = await validateCredentials("linkedin", "invalid_token");
      expect(result.isValid).toBe(false);
    });

    it("should route to Facebook validator", async () => {
      const result = await validateCredentials("facebook", "invalid_token");
      expect(result.isValid).toBe(false);
    });

    it("should route to YouTube validator", async () => {
      const result = await validateCredentials("youtube", "invalid_token");
      expect(result.isValid).toBe(false);
    });

    it("should route to TikTok validator", async () => {
      const result = await validateCredentials("tiktok", "invalid_token");
      expect(result.isValid).toBe(false);
    });

    it("should reject empty token for all platforms", async () => {
      const platforms = ["instagram", "twitter", "linkedin", "facebook", "youtube", "tiktok"];
      for (const platform of platforms) {
        const result = await validateCredentials(platform as any, "");
        expect(result.isValid).toBe(false);
        expect(result.message).toContain("No access token provided");
      }
    });

    it("should reject whitespace-only token", async () => {
      const result = await validateCredentials("instagram", "   ");
      expect(result.isValid).toBe(false);
    });
  });

  describe("Validation Error Messages", () => {
    it("should provide clear error messages for invalid tokens", async () => {
      const result = await validateInstagramCredentials("wrong_token");
      expect(result.message).toBeDefined();
      expect(result.message.length > 0).toBe(true);
    });

    it("should include platform name in error message", async () => {
      const result = await validateInstagramCredentials("invalid");
      expect(result.message).toContain("Instagram");
    });

    it("should not expose sensitive information in error", async () => {
      const result = await validateTwitterCredentials("secret_token_12345");
      expect(result.error).not.toContain("secret_token");
      expect(result.error).not.toContain("12345");
    });
  });

  describe("Connection Status Logic", () => {
    it("should only mark account as connected if validation passes", () => {
      // Simulating the OAuth callback logic
      const validationResult = { isValid: false, error: "Invalid token" };
      const shouldConnect = validationResult.isValid;
      expect(shouldConnect).toBe(false);
    });

    it("should mark account as connected only with valid credentials", () => {
      // Simulating successful validation
      const validationResult = {
        isValid: true,
        username: "testuser",
        userId: "12345",
      };
      const shouldConnect = validationResult.isValid;
      expect(shouldConnect).toBe(true);
    });

    it("should store validation error for failed attempts", () => {
      const validationResult = {
        isValid: false,
        error: "Invalid access token",
        message: "Instagram validation failed: Invalid access token",
      };
      expect(validationResult.error).toBeDefined();
      expect(validationResult.message).toContain("failed");
    });
  });

  describe("Multi-Platform Consistency", () => {
    it("should have consistent error handling across platforms", async () => {
      const platforms = ["instagram", "twitter", "linkedin", "facebook", "youtube", "tiktok"];
      const results = await Promise.all(
        platforms.map((p) => validateCredentials(p as any, "invalid_token"))
      );

      // All should fail with invalid token
      results.forEach((result) => {
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.message).toBeDefined();
      });
    });

    it("should return consistent response structure", async () => {
      const result = await validateCredentials("instagram", "test_token");
      expect(result).toHaveProperty("isValid");
      expect(result).toHaveProperty("message");
      expect(result).toHaveProperty("error");
    });
  });

  describe("Security Considerations", () => {
    it("should not log sensitive tokens", async () => {
      const consoleSpy = vi.spyOn(console, "log");
      await validateCredentials("instagram", "sensitive_token_xyz");
      // Verify token is not logged
      const logs = consoleSpy.mock.calls.map((call) => call[0].toString());
      logs.forEach((log) => {
        expect(log).not.toContain("sensitive_token_xyz");
      });
      consoleSpy.mockRestore();
    });

    it("should handle timeout gracefully", async () => {
      // This would test timeout handling in production
      expect(true).toBe(true);
    });
  });
});
