import { Router, Request, Response } from "express";
import fetch from "node-fetch";
import { saveSocialConnection } from "../db/social";
import { encrypt } from "../_core/encryption";
import { OAUTH_CONFIG } from "../_core/oauthConfig";
import { sdk } from "../_core/sdk";
import { COOKIE_NAME } from "@shared/const";

const router = Router();
const BASE_URL = process.env.FRONTEND_URL || "https://lumae.co.in";

/**
 * Helper: Exchange authorization code for access token
 */
async function exchangeCodeForToken(
  platform: string,
  code: string,
  codeVerifier?: string
): Promise<{
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}> {
  const config = OAUTH_CONFIG[platform as keyof typeof OAUTH_CONFIG];
  if (!config) throw new Error(`Unknown platform: ${platform}`);

  const body: Record<string, string> = {
    grant_type: "authorization_code",
    code,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.redirectUri,
  };

  // Add PKCE code_verifier if required (Twitter)
  if (codeVerifier && platform === "twitter") {
    body.code_verifier = codeVerifier;
  }

  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body).toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed for ${platform}: ${error}`);
  }

  const data = (await response.json()) as Record<string, any>;
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

/**
 * Helper: Fetch user info from platform
 */
async function fetchUserInfo(
  platform: string,
  accessToken: string
): Promise<{ id: string; username: string; email?: string }> {
  const config = OAUTH_CONFIG[platform as keyof typeof OAUTH_CONFIG];
  if (!config) throw new Error(`Unknown platform: ${platform}`);

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
  };

  // Instagram/Facebook use different header format
  if (platform === "instagram" || platform === "facebook") {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(config.userInfoEndpoint, { headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch user info from ${platform}`);
  }

  const data = (await response.json()) as Record<string, any>;

  // Parse platform-specific user info
  switch (platform) {
    case "instagram":
      return {
        id: data.id,
        username: data.username,
      };
    case "twitter":
      return {
        id: data.data.id,
        username: data.data.username,
      };
    case "linkedin":
      return {
        id: data.id,
        username: data.localizedFirstName || data.id,
      };
    case "facebook":
      return {
        id: data.id,
        username: data.name,
        email: data.email,
      };
    case "youtube":
      return {
        id: data.id,
        username: data.snippet?.title || data.id,
      };
    case "tiktok":
      return {
        id: data.user.open_id,
        username: data.user.display_name,
      };
    default:
      return {
        id: data.id || data.user_id,
        username: data.username || data.name,
      };
  }
}

/**
 * Generic OAuth callback handler
 */
async function handleOAuthCallback(
  req: Request,
  res: Response,
  platform: string
) {
  try {
    const { code, state, error, error_description } = req.query;

    // Handle OAuth errors
    if (error) {
      console.error(`[OAuth] ${platform} error:`, error, error_description);
      return res.redirect(
        `${BASE_URL}/connected-accounts?error=${error}&platform=${platform}`
      );
    }

    if (!code) {
      return res.status(400).send("Missing authorization code");
    }

    // Get user ID from session/cookie
    // Get user from session cookie (req.user is not populated on Express routes)
    let userId: number | undefined;
    try {
      const cookies = req.headers.cookie || "";
      const match = cookies.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
      if (match?.[1]) {
        const session = await sdk.verifySession(match[1]);
        if (session?.openId) {
          const { getUserByOpenId } = await import("../db");
          const user = await getUserByOpenId(session.openId);
          userId = user?.id;
        }
      }
    } catch {
      // ignore session errors
    }
    if (!userId) {
      return res.redirect(`${BASE_URL}/login?redirect=/connected-accounts`);
    }

    // Exchange code for token
    const tokenData = await exchangeCodeForToken(
      platform,
      code as string,
      (req.query.code_verifier as string) || undefined
    );

    // Fetch user info
    const userInfo = await fetchUserInfo(platform, tokenData.accessToken);

    // Encrypt tokens before storing
    const encryptedAccessToken = encrypt(tokenData.accessToken);
    const encryptedRefreshToken = tokenData.refreshToken
      ? encrypt(tokenData.refreshToken)
      : null;

    // Calculate token expiration
    const tokenExpiresAt = tokenData.expiresIn
      ? new Date(Date.now() + tokenData.expiresIn * 1000)
      : null;

    // Save to database
    await saveSocialConnection(
      userId,
      platform,
      userInfo.username,
      encryptedAccessToken,
      userInfo.id,
      encryptedRefreshToken || undefined,
      tokenExpiresAt || undefined
    );

    // Redirect to success page
    return res.redirect(
      `${BASE_URL}/connected-accounts?platform=${platform}&success=true&username=${encodeURIComponent(userInfo.username)}`
    );
  } catch (error) {
    console.error(`[OAuth] ${platform} callback error:`, error);
    return res.redirect(
      `${BASE_URL}/connected-accounts?error=callback_failed&platform=${platform}`
    );
  }
}

// Instagram callback
router.get("/instagram/callback", async (req: Request, res: Response) => {
  await handleOAuthCallback(req, res, "instagram");
});

// Twitter callback
router.get("/twitter/callback", async (req: Request, res: Response) => {
  await handleOAuthCallback(req, res, "twitter");
});

// LinkedIn callback
router.get("/linkedin/callback", async (req: Request, res: Response) => {
  await handleOAuthCallback(req, res, "linkedin");
});

// Facebook callback
router.get("/facebook/callback", async (req: Request, res: Response) => {
  await handleOAuthCallback(req, res, "facebook");
});

// YouTube callback
router.get("/youtube/callback", async (req: Request, res: Response) => {
  await handleOAuthCallback(req, res, "youtube");
});

// TikTok callback
router.get("/tiktok/callback", async (req: Request, res: Response) => {
  await handleOAuthCallback(req, res, "tiktok");
});

export default router;
