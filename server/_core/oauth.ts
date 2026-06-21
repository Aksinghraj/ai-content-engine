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
  // ─── Google OAuth: server-side redirect ────────────────────────────────────
  //
  // The frontend navigates to /api/oauth/google/login?origin=...
  // The server builds the Google OAuth URL and issues a 302 redirect.
  //
  // WHY server-side? When the frontend does window.location.href = url, different
  // browsers (especially Android WebView / Chrome mobile) handle spaces in URLs
  // inconsistently. A server-side redirect guarantees the Location header contains
  // exactly the bytes we want — scope=openid%20profile%20email — with no
  // double-encoding or browser interference.
  //
  app.get("/api/oauth/google/login", (req: Request, res: Response) => {
    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
    if (!clientId) {
      return res.status(500).json({ error: "Google OAuth not configured" });
    }

    const origin =
      (req.query.origin as string) ||
      `${req.headers["x-forwarded-proto"] || req.protocol}://${req.headers.host}`;
    const returnPath = (req.query.returnPath as string) || "/";
    const redirectUri = `${origin}/api/oauth/google/callback`;

    const state = Buffer.from(
      JSON.stringify({ returnPath, origin, timestamp: Date.now() })
    ).toString("base64");

    // Serve an auto-submitting HTML form instead of a 302 redirect.
    //
    // WHY A FORM?
    // A GET form submission sends each field value through the browser's
    // standard URL encoding exactly ONCE. There is no risk of double-encoding
    // because the browser reads the raw text value of each <input> and encodes
    // it when building the request URL.
    //
    // With a 302 redirect, the Location header value may be re-encoded by
    // proxies or browsers (especially Android WebView), causing %20 → %2520.
    //
    // IMPORTANT: form field values must be PLAIN TEXT — not pre-encoded.
    // The browser will encode them exactly once when submitting.
    // Use escapeHtml() only to prevent XSS in the HTML attribute value.
    const escHtml = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

    const html = `<!DOCTYPE html>
<html>
<head><title>Redirecting to Google...</title></head>
<body>
<p>Redirecting to Google...</p>
<form id="f" method="GET" action="https://accounts.google.com/o/oauth2/v2/auth">
  <input type="hidden" name="client_id" value="${escHtml(clientId)}">
  <input type="hidden" name="redirect_uri" value="${escHtml(redirectUri)}">
  <input type="hidden" name="response_type" value="code">
  <input type="hidden" name="scope" value="openid profile email">
  <input type="hidden" name="state" value="${escHtml(state)}">
  <input type="hidden" name="access_type" value="offline">
  <input type="hidden" name="prompt" value="consent">
</form>
<script>document.getElementById('f').submit();</script>
</body>
</html>`;
    res.setHeader("Content-Type", "text/html");
    return res.send(html);
  });

  // Google OAuth callback: Google redirects here with ?code=...&state=...
  // We forward to the frontend React page that handles token exchange.
  app.get("/api/oauth/google/callback", (req: Request, res: Response) => {
    const enc = encodeURIComponent;
    const error = req.query.error as string;
    const code = req.query.code as string;
    const state = req.query.state as string;

    if (error) {
      return res.redirect(`/auth/google/callback?error=${enc(error)}`);
    }
    if (!code) {
      return res.redirect("/auth/google/callback?error=missing_code");
    }
    return res.redirect(
      `/auth/google/callback?code=${enc(code)}&state=${enc(state || "")}`
    );
  });

  // ─── Social Media OAuth Callbacks ──────────────────────────────────────────
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

        const { handleOAuthCallback } = await import("./oauthFlow");
        const baseUrl = process.env.APP_URL || "http://localhost:3000";

        const result = await handleOAuthCallback(baseUrl, platform, codeStr, stateStr);
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

  // ─── Manus OAuth Callback ──────────────────────────────────────────────────
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
