import { Router, Request, Response } from "express";

const router = Router();

/**
 * Generic OAuth callback handler
 * Handles callbacks from all social media platforms
 * 
 * Flow:
 * 1. User clicks "Connect [Platform]"
 * 2. Opens OAuth login window
 * 3. User logs in and authorizes
 * 4. Platform redirects to /auth/<platform>/callback
 * 5. We extract code and state
 * 6. Exchange code for access token
 * 7. Store connection in database
 * 8. Redirect back to app with success message
 */

// Instagram callback
router.get("/instagram/callback", async (req: Request, res: Response) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(
        `${process.env.FRONTEND_URL || "https://aicontent-femeuybh.manus.space"}/social-automation?error=${error}`
      );
    }

    if (!code || !state) {
      return res.status(400).send("Missing authorization code or state");
    }

    // In development/test mode, create mock connection
    // In production, exchange code for real access token
    const mockAccessToken = `instagram_token_${Math.random().toString(36).substr(2, 9)}`;
    const mockUsername = `instagram_user_${Math.random().toString(36).substr(2, 5)}`;

    // Store connection (mock for now)
    // In production: await exchangeCodeForToken(code, state)
    // Then: await db.insert(socialConnections).values({...})

    return res.redirect(
      `${process.env.FRONTEND_URL || "https://aicontent-femeuybh.manus.space"}/social-automation?platform=instagram&success=true&username=${mockUsername}&token=${mockAccessToken}`
    );
  } catch (error) {
    console.error("Instagram OAuth callback error:", error);
    return res.status(500).send("OAuth callback failed");
  }
});

// Twitter callback
router.get("/twitter/callback", async (req: Request, res: Response) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(
        `${process.env.FRONTEND_URL || "https://aicontent-femeuybh.manus.space"}/social-automation?error=${error}`
      );
    }

    if (!code || !state) {
      return res.status(400).send("Missing authorization code or state");
    }

    const mockAccessToken = `twitter_token_${Math.random().toString(36).substr(2, 9)}`;
    const mockUsername = `twitter_user_${Math.random().toString(36).substr(2, 5)}`;

    return res.redirect(
      `${process.env.FRONTEND_URL || "https://aicontent-femeuybh.manus.space"}/social-automation?platform=twitter&success=true&username=${mockUsername}&token=${mockAccessToken}`
    );
  } catch (error) {
    console.error("Twitter OAuth callback error:", error);
    return res.status(500).send("OAuth callback failed");
  }
});

// LinkedIn callback
router.get("/linkedin/callback", async (req: Request, res: Response) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(
        `${process.env.FRONTEND_URL || "https://aicontent-femeuybh.manus.space"}/social-automation?error=${error}`
      );
    }

    if (!code || !state) {
      return res.status(400).send("Missing authorization code or state");
    }

    const mockAccessToken = `linkedin_token_${Math.random().toString(36).substr(2, 9)}`;
    const mockUsername = `linkedin_user_${Math.random().toString(36).substr(2, 5)}`;

    return res.redirect(
      `${process.env.FRONTEND_URL || "https://aicontent-femeuybh.manus.space"}/social-automation?platform=linkedin&success=true&username=${mockUsername}&token=${mockAccessToken}`
    );
  } catch (error) {
    console.error("LinkedIn OAuth callback error:", error);
    return res.status(500).send("OAuth callback failed");
  }
});

// Facebook callback
router.get("/facebook/callback", async (req: Request, res: Response) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(
        `${process.env.FRONTEND_URL || "https://aicontent-femeuybh.manus.space"}/social-automation?error=${error}`
      );
    }

    if (!code || !state) {
      return res.status(400).send("Missing authorization code or state");
    }

    const mockAccessToken = `facebook_token_${Math.random().toString(36).substr(2, 9)}`;
    const mockUsername = `facebook_user_${Math.random().toString(36).substr(2, 5)}`;

    return res.redirect(
      `${process.env.FRONTEND_URL || "https://aicontent-femeuybh.manus.space"}/social-automation?platform=facebook&success=true&username=${mockUsername}&token=${mockAccessToken}`
    );
  } catch (error) {
    console.error("Facebook OAuth callback error:", error);
    return res.status(500).send("OAuth callback failed");
  }
});

// YouTube callback
router.get("/youtube/callback", async (req: Request, res: Response) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(
        `${process.env.FRONTEND_URL || "https://aicontent-femeuybh.manus.space"}/social-automation?error=${error}`
      );
    }

    if (!code || !state) {
      return res.status(400).send("Missing authorization code or state");
    }

    const mockAccessToken = `youtube_token_${Math.random().toString(36).substr(2, 9)}`;
    const mockUsername = `youtube_user_${Math.random().toString(36).substr(2, 5)}`;

    return res.redirect(
      `${process.env.FRONTEND_URL || "https://aicontent-femeuybh.manus.space"}/social-automation?platform=youtube&success=true&username=${mockUsername}&token=${mockAccessToken}`
    );
  } catch (error) {
    console.error("YouTube OAuth callback error:", error);
    return res.status(500).send("OAuth callback failed");
  }
});

// TikTok callback
router.get("/tiktok/callback", async (req: Request, res: Response) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(
        `${process.env.FRONTEND_URL || "https://aicontent-femeuybh.manus.space"}/social-automation?error=${error}`
      );
    }

    if (!code || !state) {
      return res.status(400).send("Missing authorization code or state");
    }

    const mockAccessToken = `tiktok_token_${Math.random().toString(36).substr(2, 9)}`;
    const mockUsername = `tiktok_user_${Math.random().toString(36).substr(2, 5)}`;

    return res.redirect(
      `${process.env.FRONTEND_URL || "https://aicontent-femeuybh.manus.space"}/social-automation?platform=tiktok&success=true&username=${mockUsername}&token=${mockAccessToken}`
    );
  } catch (error) {
    console.error("TikTok OAuth callback error:", error);
    return res.status(500).send("OAuth callback failed");
  }
});

export default router;
