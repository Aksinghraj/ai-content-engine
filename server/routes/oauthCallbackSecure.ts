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
        `${BASE_URL}/scheduling/connected-accounts?error=${encodeURIComponent(String(error))}&platform=${encodeURIComponent(platform)}&message=${encodeURIComponent(typeof error_description === "string" ? error_description : "The provider did not approve this connection.")}`
      );
    }

    if (!code) {
      return res.status(400).send("Missing authorization code");
    }

    if (!state || typeof state !== "string") {
      return res.redirect(`${BASE_URL}/scheduling/connected-accounts?error=invalid_state&platform=${platform}&message=${encodeURIComponent("The connection session expired. Start Connect again from Lumae.")}`);
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
      : "/scheduling/connected-accounts";
    const separator = callbackPath.includes("?") ? "&" : "?";
    if (!completed.isValidated) {
      const validationMessage = encodeURIComponent(completed.validationError || "Lumae could not validate the provider connection.");
      return res.redirect(`${BASE_URL}${callbackPath}${separator}platform=${platform}&error=validation_failed&message=${validationMessage}`);
    }
    return res.redirect(
      `${BASE_URL}${callbackPath}${separator}platform=${platform}&success=true&username=${encodeURIComponent(completed.userInfo?.name || completed.userInfo?.username || platform)}`
    );
  } catch (error) {
    console.error(`[OAuth] ${platform} callback error:`, error);
    return res.redirect(
      `${BASE_URL}/scheduling/connected-accounts?error=callback_failed&platform=${platform}&message=${encodeURIComponent("Lumae could not complete the provider connection. Check the provider-specific guidance and try again.")}`
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
router.get("/twitter", async (req: Request, res: Response) => {
  await handleOAuthCallback(req, res, "twitter");
});

router.get("/twitter/callback", async (req: Request, res: Response) => {
  await handleOAuthCallback(req, res, "twitter");
});

// LinkedIn callback
router.get("/linkedin", async (req: Request, res: Response) => {
  await handleOAuthCallback(req, res, "linkedin");
});

router.get("/linkedin/callback", async (req: Request, res: Response) => {
  await handleOAuthCallback(req, res, "linkedin");
});

// Facebook callback
router.get("/facebook", async (req: Request, res: Response) => {
  await handleOAuthCallback(req, res, "facebook");
});

router.get("/facebook/callback", async (req: Request, res: Response) => {
  await handleOAuthCallback(req, res, "facebook");
});

// YouTube callback
router.get("/youtube", async (req: Request, res: Response) => {
  await handleOAuthCallback(req, res, "youtube");
});

router.get("/youtube/callback", async (req: Request, res: Response) => {
  await handleOAuthCallback(req, res, "youtube");
});

// TikTok callback
router.get("/tiktok/callback", async (req: Request, res: Response) => {
  await handleOAuthCallback(req, res, "tiktok");
});

export default router;
