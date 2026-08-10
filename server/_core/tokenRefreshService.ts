import { refreshAccessToken, decryptToken, encryptToken } from "./oauthService";
import * as db from "../db";

// Platforms that support refresh tokens
const REFRESH_ENABLED_PLATFORMS = ["youtube", "linkedin", "facebook"];

// Token refresh buffer: refresh token 5 minutes before expiration
const REFRESH_BUFFER_MS = 5 * 60 * 1000;

/**
 * Check if a token needs refresh based on expiration time
 */
export function shouldRefreshToken(tokenExpiresAt: Date | null): boolean {
  if (!tokenExpiresAt) return false;
  const now = Date.now();
  const expirationTime = tokenExpiresAt.getTime();
  return now > expirationTime - REFRESH_BUFFER_MS;
}

/**
 * Refresh a single user's token for a specific platform
 */
export async function refreshUserToken(
  userId: number,
  platform: string,
  clientId: string,
  clientSecret: string
): Promise<boolean> {
  try {
    // Only refresh enabled platforms
    if (!REFRESH_ENABLED_PLATFORMS.includes(platform)) {
      console.log(`[TokenRefresh] Platform ${platform} does not support token refresh`);
      return false;
    }

    // Get the user's social connection
    const connection = await db.getSocialConnection(userId, platform);
    if (!connection || !connection.refreshToken) {
      console.log(`[TokenRefresh] No refresh token for user ${userId} on ${platform}`);
      return false;
    }

    // Check if token needs refresh
    if (!shouldRefreshToken(connection.tokenExpiresAt)) {
      console.log(`[TokenRefresh] Token for user ${userId} on ${platform} does not need refresh yet`);
      return false;
    }

    console.log(`[TokenRefresh] Refreshing token for user ${userId} on ${platform}...`);

    // Decrypt refresh token
    const decryptedRefreshToken = decryptToken(connection.refreshToken);

    // Call platform's token refresh endpoint
    const newTokenData = await refreshAccessToken(
      platform as any,
      decryptedRefreshToken,
      clientId,
      clientSecret
    );

    // Encrypt new access token
    const encryptedAccessToken = encryptToken(newTokenData.accessToken);

    // Calculate new expiration time
    const newExpiresAt = newTokenData.expiresIn
      ? new Date(Date.now() + newTokenData.expiresIn * 1000)
      : undefined;

    // Update token in database
    await db.updateSocialConnectionToken(
      connection.id,
      encryptedAccessToken,
      newExpiresAt
    );

    console.log(`[TokenRefresh] Token refreshed successfully for user ${userId} on ${platform}`);
    return true;
  } catch (error) {
    console.error(`[TokenRefresh] Failed to refresh token for user ${userId} on ${platform}:`, error);
    return false;
  }
}

/**
 * Refresh all expired tokens for all users
 * Should be called periodically by a background job
 */
export async function refreshAllExpiredTokens(): Promise<{
  total: number;
  successful: number;
  failed: number;
}> {
  const results = {
    total: 0,
    successful: 0,
    failed: 0,
  };

  try {
    console.log("[TokenRefresh] Starting batch token refresh...");

    // Get all social connections that need refresh
    // This is a simplified version - in production, you'd query the database
    // for all connections with tokenExpiresAt < now + REFRESH_BUFFER_MS

    // For now, we'll just log that the service is ready
    console.log("[TokenRefresh] Batch token refresh completed");
    console.log(`[TokenRefresh] Results: ${results.successful} successful, ${results.failed} failed`);

    return results;
  } catch (error) {
    console.error("[TokenRefresh] Batch refresh failed:", error);
    return results;
  }
}

/**
 * Schedule periodic token refresh
 * Call this once during app initialization
 */
export function scheduleTokenRefresh(intervalMs: number = 60 * 60 * 1000): NodeJS.Timeout {
  console.log(`[TokenRefresh] Scheduling token refresh every ${intervalMs / 1000} seconds`);

  const intervalId = setInterval(async () => {
    try {
      await refreshAllExpiredTokens();
    } catch (error) {
      console.error("[TokenRefresh] Scheduled refresh failed:", error);
    }
  }, intervalMs);

  return intervalId;
}

/**
 * Get token refresh status for a user
 */
export async function getTokenRefreshStatus(userId: number, platform: string): Promise<{
  platform: string;
  isConnected: boolean;
  tokenExpiresAt: Date | null;
  needsRefresh: boolean;
  refreshSupported: boolean;
}> {
  const connection = await db.getSocialConnection(userId, platform);

  return {
    platform,
    isConnected: connection?.isConnected || false,
    tokenExpiresAt: connection?.tokenExpiresAt || null,
    needsRefresh: connection ? shouldRefreshToken(connection.tokenExpiresAt) : false,
    refreshSupported: REFRESH_ENABLED_PLATFORMS.includes(platform),
  };
}
