import fetch from "node-fetch";
import { URLSearchParams } from "url";
import {
  generateCodeVerifier,
  generateCodeChallenge,
  generateState,
  storeOAuthState,
  getOAuthState,
  deleteOAuthState,
  encryptToken,
  decryptToken,
} from "./oauthPKCE";
import { initializeOAuthConfigs, getPlatformConfig, validateOAuthConfig } from "./oauthPlatforms";
import { saveSocialConnection, getSocialConnectionByPlatform, updateSocialConnection } from "../db/social";

/**
 * OAuth 2.0 Authorization Code Grant Flow Handler
 */

const ENCRYPTION_KEY = process.env.OAUTH_ENCRYPTION_KEY || "default-encryption-key-change-in-production";

/**
 * Step 1: Generate authorization URL for user to click
 */
export async function generateAuthorizationUrl(
  baseUrl: string,
  platform: string,
  userId: number
): Promise<{ authorizationUrl: string; state: string }> {
  const platforms = initializeOAuthConfigs(baseUrl);
  const config = getPlatformConfig(platforms, platform);

  if (!validateOAuthConfig(config)) {
    throw new Error(
      `OAuth not configured for ${platform}. Please set environment variables.`
    );
  }

  // Generate PKCE parameters if required
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = generateState();

  // Store state for verification during callback
  storeOAuthState({
    state,
    codeVerifier,
    platform,
    userId,
    createdAt: Date.now(),
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
  });

  // Build authorization URL
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    state,
    scope: config.scopes.join(config.scopeSeparator),
  });

  // Add PKCE parameters if required
  if (config.pkceRequired) {
    params.append("code_challenge", codeChallenge);
    params.append("code_challenge_method", "S256");
  }

  const authorizationUrl = `${config.authorizationEndpoint}?${params.toString()}`;

  return { authorizationUrl, state };
}

/**
 * Step 2: Handle OAuth callback and exchange authorization code for tokens
 */
export async function handleOAuthCallback(
  baseUrl: string,
  platform: string,
  code: string,
  state: string
): Promise<{
  userId: number;
  platform: string;
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  userInfo: any;
}> {
  // Verify state parameter
  const oauthState = getOAuthState(state);
  if (!oauthState) {
    throw new Error("Invalid or expired state parameter");
  }

  if (oauthState.platform !== platform) {
    throw new Error("Platform mismatch");
  }

  const platforms = initializeOAuthConfigs(baseUrl);
  const config = getPlatformConfig(platforms, platform);

  // Exchange authorization code for tokens
  const tokenParams = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.redirectUri,
  });

  // Add PKCE verifier if required
  if (config.pkceRequired) {
    tokenParams.append("code_verifier", oauthState.codeVerifier);
  }

  const tokenResponse = await fetch(config.tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: tokenParams.toString(),
  });

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  const tokenData: any = await tokenResponse.json();

  // Get user info
  const userInfoResponse = await fetch(config.userInfoEndpoint, {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
    },
  });

  if (!userInfoResponse.ok) {
    throw new Error("Failed to fetch user info");
  }

  const userInfo = await userInfoResponse.json();

  // Extract user ID based on platform
  const platformUserId = extractPlatformUserId(platform, userInfo);
  const username = extractUsername(platform, userInfo);

  // Save connection to database
  await saveSocialConnection(
    oauthState.userId,
    platform,
    username,
    tokenData.access_token,
    platformUserId,
    tokenData.refresh_token,
    tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : undefined
  );

  // Clean up state
  deleteOAuthState(state);

  return {
    userId: oauthState.userId,
    platform,
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresIn: tokenData.expires_in,
    userInfo,
  };
}

/**
 * Step 3: Refresh access token when expired
 */
export async function refreshAccessToken(
  baseUrl: string,
  userId: number,
  platform: string
): Promise<{ accessToken: string; expiresIn: number }> {
  const connection = await getSocialConnectionByPlatform(userId, platform);
  if (!connection || !connection.refreshToken) {
    throw new Error("No refresh token available");
  }

  const platforms = initializeOAuthConfigs(baseUrl);
  const config = getPlatformConfig(platforms, platform);

  const refreshParams = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: connection.refreshToken,
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });

  const tokenResponse = await fetch(config.tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: refreshParams.toString(),
  });

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    throw new Error(`Token refresh failed: ${error}`);
  }

  const tokenData: any = await tokenResponse.json();

   // Update token in database (use saveSocialConnection to update)
  await saveSocialConnection(
    userId,
    platform,
    connection.username,
    tokenData.access_token,
    connection.platformUserId,
    tokenData.refresh_token || connection.refreshToken,
    tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000)
      : undefined
  );

  return {
    accessToken: tokenData.access_token,
    expiresIn: tokenData.expires_in,
  };
}

/**
 * Extract platform-specific user ID
 */
function extractPlatformUserId(platform: string, userInfo: any): string {
  switch (platform.toLowerCase()) {
    case "instagram":
      return userInfo.id;
    case "twitter":
      return userInfo.data?.id || userInfo.id;
    case "linkedin":
      return userInfo.id;
    case "facebook":
      return userInfo.id;
    case "youtube":
      return userInfo.id;
    case "tiktok":
      return userInfo.data?.user?.open_id || userInfo.open_id;
    default:
      return userInfo.id || userInfo.user_id;
  }
}

/**
 * Extract username from user info
 */
function extractUsername(platform: string, userInfo: any): string {
  switch (platform.toLowerCase()) {
    case "instagram":
      return userInfo.username || userInfo.name || "Instagram User";
    case "twitter":
      return userInfo.data?.username || userInfo.username || "Twitter User";
    case "linkedin":
      return userInfo.localizedFirstName + " " + userInfo.localizedLastName || "LinkedIn User";
    case "facebook":
      return userInfo.name || "Facebook User";
    case "youtube":
      return userInfo.name || "YouTube User";
    case "tiktok":
      return userInfo.data?.user?.display_name || userInfo.display_name || "TikTok User";
    default:
      return userInfo.name || userInfo.username || "User";
  }
}

/**
 * Get valid access token (refresh if needed)
 */
export async function getValidAccessToken(
  baseUrl: string,
  userId: number,
  platform: string
): Promise<string> {
  const connection = await getSocialConnectionByPlatform(userId, platform);
  if (!connection) {
    throw new Error("Social connection not found");
  }

  // Check if token is expired
  if (connection.tokenExpiresAt && new Date() > connection.tokenExpiresAt) {
    // Try to refresh
    try {
      const { accessToken } = await refreshAccessToken(baseUrl, userId, platform);
      return accessToken;
    } catch (error) {
      throw new Error("Token expired and refresh failed");
    }
  }

  return connection.accessToken;
}
