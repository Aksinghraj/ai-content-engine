import { Router, Request, Response } from "express";
import { handleOAuthCallback as completeOAuthCallback } from "../_core/oauthFlow";

const router = Router();
const BASE_URL = process.env.FRONTEND_URL || "https://lumae.co.in";

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

    if (!state || typeof state !== "string") {
      return res.redirect(`${BASE_URL}/connected-accounts?error=invalid_state&platform=${platform}`);
    }

    // The state store binds the callback to the initiating user and preserves
    // the PKCE verifier. This is the sole token-exchange path for all providers.
    const completed = await completeOAuthCallback(
      BASE_URL,
      platform,
      code as string,
      state
    );

    // Redirect to success page
    const callbackPath = completed.returnPath.startsWith("/") && !completed.returnPath.startsWith("//")
      ? completed.returnPath
      : "/connected-accounts";
    const separator = callbackPath.includes("?") ? "&" : "?";
    return res.redirect(
      `${BASE_URL}${callbackPath}${separator}platform=${platform}&success=true&username=${encodeURIComponent(completed.userInfo?.name || completed.userInfo?.username || platform)}`
    );
  } catch (error) {
    console.error(`[OAuth] ${platform} callback error:`, error);
    return res.redirect(
      `${BASE_URL}/connected-accounts?error=callback_failed&platform=${platform}`
    );
  }
}

// Instagram callback
router.get("/instagram", async (req: Request, res: Response) => {
  await handleOAuthCallback(req, res, "instagram");
});

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
