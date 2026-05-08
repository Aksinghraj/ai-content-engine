import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  // Social Media OAuth Callbacks for Instagram, Twitter, LinkedIn, Facebook, YouTube, TikTok
  const platforms = ["instagram", "twitter", "linkedin", "facebook", "youtube", "tiktok"];
  
  platforms.forEach((platform) => {
    app.get(`/auth/${platform}/callback`, async (req: Request, res: Response) => {
      try {
        const { code, state, error } = req.query;

        if (error) {
          const errorMsg = typeof error === "string" ? error : "Unknown error";
          return res.redirect(
            `/social-automation?error=${encodeURIComponent(errorMsg)}&platform=${platform}`
          );
        }

        if (!code || !state) {
          return res.redirect(
            `/social-automation?error=${encodeURIComponent("Missing authorization code")}&platform=${platform}`
          );
        }

        // Generate mock tokens for development
        // In production, exchange code for real access token from platform
        const mockAccessToken = `${platform}_token_${Math.random().toString(36).substr(2, 9)}`;
        const mockUsername = `${platform}_user_${Math.random().toString(36).substr(2, 5)}`;

        // Redirect back to social automation page with success params
        return res.redirect(
          `/social-automation?platform=${platform}&success=true&username=${encodeURIComponent(mockUsername)}&token=${encodeURIComponent(mockAccessToken)}`
        );
      } catch (error) {
        console.error(`${platform} OAuth callback error:`, error);
        return res.redirect(
          `/social-automation?error=${encodeURIComponent("OAuth callback failed")}&platform=${platform}`
        );
      }
    });
  });

  // Manus OAuth Callback
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
