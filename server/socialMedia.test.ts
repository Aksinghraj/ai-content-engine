import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  getDb: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    onDuplicateKeyUpdate: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    execute: vi.fn().mockResolvedValue([]),
  })),
}));

describe("Social Media Automation", () => {
  describe("OAuth PKCE", () => {
    it("should generate code verifier of correct length", async () => {
      const { generateCodeVerifier } = await import("./_core/oauthPKCE");
      const verifier = generateCodeVerifier();
      expect(verifier).toBeDefined();
      expect(typeof verifier).toBe("string");
      expect(verifier.length).toBeGreaterThanOrEqual(43);
      expect(verifier.length).toBeLessThanOrEqual(128);
    });

    it("should generate code challenge from verifier", async () => {
      const { generateCodeVerifier, generateCodeChallenge } = await import("./_core/oauthPKCE");
      const verifier = generateCodeVerifier();
      const challenge = await generateCodeChallenge(verifier);
      expect(challenge).toBeDefined();
      expect(typeof challenge).toBe("string");
      expect(challenge).not.toBe(verifier);
    });

    it("should encrypt and decrypt tokens", async () => {
      const { encryptToken, decryptToken } = await import("./_core/oauthPKCE");
      const originalToken = "test_access_token_12345";
      const key = "test_encryption_key_for_testing";
      const encrypted = encryptToken(originalToken, key);
      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(originalToken);
      const decrypted = decryptToken(encrypted, key);
      expect(decrypted).toBe(originalToken);
    });

    it("should generate different encrypted values for same token", async () => {
      const { encryptToken } = await import("./_core/oauthPKCE");
      const token = "same_token_value";
      const key = "test_encryption_key_for_testing";
      const encrypted1 = encryptToken(token, key);
      const encrypted2 = encryptToken(token, key);
      // AES-256-GCM uses random IV, so encrypted values should differ
      expect(encrypted1).not.toBe(encrypted2);
    });
  });

  describe("Platform Configurations", () => {
    it("should have initializeOAuthConfigs function", async () => {
      const { initializeOAuthConfigs } = await import("./_core/oauthPlatforms");
      expect(initializeOAuthConfigs).toBeDefined();
      expect(typeof initializeOAuthConfigs).toBe("function");
    });

    it("should initialize configs for all 6 platforms", async () => {
      const { initializeOAuthConfigs } = await import("./_core/oauthPlatforms");
      const configs = initializeOAuthConfigs("http://localhost:3000");
      const platforms = ["instagram", "twitter", "linkedin", "facebook", "youtube", "tiktok"];
      for (const platform of platforms) {
        expect(configs[platform]).toBeDefined();
        expect(configs[platform].authorizationEndpoint).toBeDefined();
        expect(configs[platform].tokenEndpoint).toBeDefined();
        expect(configs[platform].scopes).toBeDefined();
        expect(Array.isArray(configs[platform].scopes)).toBe(true);
      }
    });

    it("should have correct auth URLs for each platform", async () => {
      const { initializeOAuthConfigs } = await import("./_core/oauthPlatforms");
      const configs = initializeOAuthConfigs("http://localhost:3000");
      expect(configs.instagram.authorizationEndpoint).toContain("instagram.com");
      expect(configs.twitter.authorizationEndpoint).toContain("twitter.com");
      expect(configs.linkedin.authorizationEndpoint).toContain("linkedin.com");
      expect(configs.facebook.authorizationEndpoint).toContain("facebook.com");
      expect(configs.youtube.authorizationEndpoint).toContain("google.com");
      expect(configs.tiktok.authorizationEndpoint).toContain("tiktok.com");
    });
  });

  describe("Language Detection", () => {
    it("should export detectLanguage function", async () => {
      const { detectLanguage } = await import("./_core/languageDetection");
      expect(detectLanguage).toBeDefined();
      expect(typeof detectLanguage).toBe("function");
    });

    it("should export SUPPORTED_LANGUAGES constant", async () => {
      const { SUPPORTED_LANGUAGES } = await import("./_core/languageDetection");
      expect(SUPPORTED_LANGUAGES).toBeDefined();
      expect(SUPPORTED_LANGUAGES.en).toBeDefined();
      expect(SUPPORTED_LANGUAGES.hi).toBeDefined();
      expect(SUPPORTED_LANGUAGES.es).toBeDefined();
      expect(SUPPORTED_LANGUAGES.fr).toBeDefined();
      expect(SUPPORTED_LANGUAGES.de).toBeDefined();
      expect(SUPPORTED_LANGUAGES.ja).toBeDefined();
      expect(SUPPORTED_LANGUAGES.zh).toBeDefined();
      expect(SUPPORTED_LANGUAGES.ar).toBeDefined();
      expect(SUPPORTED_LANGUAGES.ko).toBeDefined();
      expect(SUPPORTED_LANGUAGES.ru).toBeDefined();
    });

    it("should export generateMultilingualResponse function", async () => {
      const { generateMultilingualResponse } = await import("./_core/languageDetection");
      expect(generateMultilingualResponse).toBeDefined();
      expect(typeof generateMultilingualResponse).toBe("function");
    });
  });

  describe("Social Media Posting Service", () => {
    it("should export posting functions for all platforms", async () => {
      const posting = await import("./_core/socialMediaPosting");
      expect(posting.postToInstagram).toBeDefined();
      expect(posting.postToTwitter).toBeDefined();
      expect(posting.postToLinkedIn).toBeDefined();
      expect(posting.postToFacebook).toBeDefined();
      expect(posting.postToYouTube).toBeDefined();
      expect(posting.postToTikTok).toBeDefined();
      expect(posting.postToMultiplePlatforms).toBeDefined();
    });
  });
});
