import { Router, Request, Response } from "express";
import { handleOAuthCallback } from "../_core/oauthFlow";

/**
 * OAuth Callback Routes for All Platforms
 * Handles the redirect from OAuth providers after user authorization
 */

export const oauthCallbackRouter = Router();

/**
 * Generic callback handler for all platforms
 */
async function handleCallback(req: Request, res: Response, platform: string) {
  try {
    const { code, state, error, error_description } = req.query;

    // Check for OAuth errors
    if (error) {
      return res.status(400).json({
        success: false,
        error: error as string,
        description: error_description,
      });
    }

    if (!code || !state) {
      return res.status(400).json({
        success: false,
        error: "Missing authorization code or state parameter",
      });
    }

    // Get base URL from request
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // Handle OAuth callback
    const result = await handleOAuthCallback(
      baseUrl,
      platform,
      code as string,
      state as string
    );

    // Redirect to success page with user info
    const successUrl = `${baseUrl}/oauth/success?platform=${platform}&userId=${result.userId}&username=${encodeURIComponent(result.userInfo.username || result.userInfo.name || "User")}`;

    return res.redirect(successUrl);
  } catch (error) {
    console.error(`OAuth callback error for ${platform}:`, error);
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const errorUrl = `${baseUrl}/oauth/error?platform=${platform}&error=${encodeURIComponent((error as Error).message)}`;
    return res.redirect(errorUrl);
  }
}

/**
 * Instagram OAuth Callback
 */
oauthCallbackRouter.get("/instagram", (req, res) => handleCallback(req, res, "instagram"));

/**
 * Twitter/X OAuth Callback
 */
oauthCallbackRouter.get("/twitter", (req, res) => handleCallback(req, res, "twitter"));

/**
 * LinkedIn OAuth Callback
 */
oauthCallbackRouter.get("/linkedin", (req, res) => handleCallback(req, res, "linkedin"));

/**
 * Facebook OAuth Callback
 */
oauthCallbackRouter.get("/facebook", (req, res) => handleCallback(req, res, "facebook"));

/**
 * YouTube OAuth Callback
 */
oauthCallbackRouter.get("/youtube", (req, res) => handleCallback(req, res, "youtube"));

/**
 * TikTok OAuth Callback
 */
oauthCallbackRouter.get("/tiktok", (req, res) => handleCallback(req, res, "tiktok"));
