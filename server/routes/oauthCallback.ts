import { Router, Request, Response } from "express";
import { exchangeCodeForToken, getUserInfo, encryptToken, verifyStateToken } from "../_core/oauthService";
import * as db from "../db";

const router = Router();

// Generic OAuth callback handler for all platforms
router.get("/:platform", async (req: Request, res: Response) => {
  try {
    const { platform } = req.params;
    const { code, state, error, error_description } = req.query;

    // Validate platform
    if (!platform || typeof platform !== "string") {
      return res.status(400).json({ error: "Missing or invalid platform parameter" });
    }

    const validPlatforms = ["instagram", "facebook", "twitter", "linkedin", "youtube", "tiktok"];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({ error: `Invalid platform: ${platform}` });
    }

    // Handle OAuth errors from provider
    if (error) {
      console.error(`[OAuth] ${platform} error:`, error, error_description);
      return res.redirect(`/connected-accounts?error=${error}&message=${error_description}`);
    }

    // Validate authorization code
    if (!code || typeof code !== "string") {
      console.error(`[OAuth] Missing authorization code for ${platform}`);
      return res.status(400).json({ error: "Missing authorization code" });
    }

    // Validate state token (CSRF protection)
    if (!state || typeof state !== "string") {
      console.error(`[OAuth] Missing state token for ${platform}`);
      return res.status(400).json({ error: "Missing state token" });
    }

    // Get user from session
    const userId = (req as any).session?.userId || (req as any).user?.id;
    if (!userId) {
      console.error(`[OAuth] No user session for ${platform}`);
      return res.redirect("/login?error=session_expired");
    }

    // Verify state token (CSRF protection)
    if (!verifyStateToken(state as string, userId, platform)) {
      console.error(`[OAuth] Invalid state token for ${platform}`);
      return res.status(400).json({ error: "Invalid state token - possible CSRF attack" });
    }

    // Get OAuth credentials from environment
    const clientIdEnv = `${platform.toUpperCase()}_CLIENT_ID`;
    const clientSecretEnv = `${platform.toUpperCase()}_CLIENT_SECRET`;
    const clientId = process.env[clientIdEnv];
    const clientSecret = process.env[clientSecretEnv];

    if (!clientId || !clientSecret) {
      console.error(`[OAuth] Missing credentials for ${platform}`);
      return res.status(500).json({ error: `OAuth not configured for ${platform}` });
    }

    // Determine redirect URI
    const redirectUri = `https://lumae.co.in/api/oauth/callback/${platform}`;

    console.log(`[OAuth] Exchanging code for ${platform}...`);

    // Step 1: Exchange authorization code for access token
    const tokenData = await exchangeCodeForToken(
      platform as any,
      code as string,
      clientId,
      clientSecret,
      redirectUri
    );

    console.log(`[OAuth] Token exchange successful for ${platform}`);

    // Step 2: Fetch user info from platform
    const userInfo = await getUserInfo(platform as any, tokenData.accessToken);

    console.log(`[OAuth] User info fetched for ${platform}: ${userInfo.username}`);

    // Step 3: Encrypt tokens before storage
    const encryptedAccessToken = encryptToken(tokenData.accessToken);
    const encryptedRefreshToken = tokenData.refreshToken ? encryptToken(tokenData.refreshToken) : null;

    // Step 4: Save or update social connection
    const tokenExpiresAt = tokenData.expiresIn
      ? new Date(Date.now() + tokenData.expiresIn * 1000)
      : undefined;

    const existingConnection = await db.getSocialConnection(userId, platform);
    if (existingConnection) {
      await db.updateSocialConnectionToken(
        existingConnection.id,
        encryptedAccessToken,
        tokenExpiresAt
      );
    }

    console.log(`[OAuth] Social connection saved for ${platform} (user: ${userId})`);

    // Step 5: Redirect back to connected accounts page with success
    return res.redirect(`/connected-accounts?success=true&platform=${platform}`);
  } catch (error) {
    console.error(`[OAuth] Callback error:`, error);
    const errorMessage = (error as Error).message || "Unknown error";
    return res.redirect(`/connected-accounts?error=callback_failed&message=${encodeURIComponent(errorMessage)}`);
  }
});

export default router;
