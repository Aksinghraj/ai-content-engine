import { describe, it, expect } from "vitest";

describe("Google OAuth credentials", () => {
  it("should have GOOGLE_OAUTH_CLIENT_ID set", () => {
    expect(process.env.GOOGLE_OAUTH_CLIENT_ID).toBeTruthy();
    expect(process.env.GOOGLE_OAUTH_CLIENT_ID).toContain(".apps.googleusercontent.com");
  });

  it("should have GOOGLE_OAUTH_CLIENT_SECRET set", () => {
    expect(process.env.GOOGLE_OAUTH_CLIENT_SECRET).toBeTruthy();
    expect(process.env.GOOGLE_OAUTH_CLIENT_SECRET!.startsWith("GOCSPX-")).toBe(true);
  });

  it("Google token endpoint should accept the client credentials (returns invalid_grant not invalid_client)", async () => {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: "test_invalid_code",
        client_id: process.env.GOOGLE_OAUTH_CLIENT_ID!,
        client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
        redirect_uri: "https://aicontent-femeuybh.manus.space/api/oauth/google/callback",
        grant_type: "authorization_code",
      }),
    });
    const body = (await res.json()) as { error: string };
    // invalid_grant = credentials accepted, code was bad (expected)
    // invalid_client = credentials rejected (fail)
    expect(body.error).toBe("invalid_grant");
  });
});
