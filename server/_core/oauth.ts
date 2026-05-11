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
        const codeStr = typeof code === "string" ? code : undefined;
        const stateStr = typeof state === "string" ? state : undefined;

        if (error) {
          const errorMsg = typeof error === "string" ? error : "Unknown error";
          return res.redirect(
            `/social-automation?error=${encodeURIComponent(errorMsg)}&platform=${platform}`
          );
        }

        if (!codeStr || !stateStr) {
          return res.redirect(
            `/social-automation?error=${encodeURIComponent("Missing authorization code")}&platform=${platform}`
          );
        }

        // Import OAuth flow handler
        const { handleOAuthCallback } = await import("./oauthFlow");
        const baseUrl = process.env.APP_URL || "http://localhost:3000";

        // Exchange code for real tokens
        const result = await handleOAuthCallback(baseUrl, platform, codeStr as string, stateStr as string);
        // Redirect back to social automation page with success params
        return res.redirect(
          `/social-automation?platform=${platform}&success=true&username=${encodeURIComponent(result.userInfo.username || result.userInfo.name)}&token=${encodeURIComponent(result.accessToken)}`
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
