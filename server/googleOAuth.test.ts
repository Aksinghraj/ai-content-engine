import { describe, it, expect, beforeAll } from "vitest";

describe("Google OAuth Configuration", () => {
  let clientId: string;
  let clientSecret: string;

  beforeAll(() => {
    clientId = process.env.GOOGLE_OAUTH_CLIENT_ID || "";
    clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET || "";
  });

  it("should have Google OAuth credentials configured", () => {
    expect(clientId).toBeTruthy();
    expect(clientSecret).toBeTruthy();
  });

  it("should have valid Client ID format", () => {
    // Google Client IDs end with .apps.googleusercontent.com
    expect(clientId).toMatch(/\.apps\.googleusercontent\.com$/);
  });

  it("should have valid Client Secret format", () => {
    // Google Client Secrets start with GOCSPX-
    expect(clientSecret).toMatch(/^GOCSPX-/);
  });

  it("should have Client ID with correct structure", () => {
    const parts = clientId.split("-");
    expect(parts.length).toBeGreaterThan(1);
    expect(parts[0]).toMatch(/^\d+$/); // First part should be numeric
  });

  it("should validate credentials are not empty strings", () => {
    expect(clientId.length).toBeGreaterThan(10);
    expect(clientSecret.length).toBeGreaterThan(10);
  });
});
