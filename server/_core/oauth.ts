import { COOKIE_NAME } from "@shared/const";
import crypto from "crypto";
import { parse as parseCookie } from "cookie";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { sendVerificationEmail } from "./emailService";
import oauthCallbackRouter from "../routes/oauthCallbackSecure";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

const GOOGLE_OAUTH_ORIGIN = (process.env.FRONTEND_URL || "https://lumae.co.in").replace(/\/$/, "");
const GOOGLE_OAUTH_REDIRECT_URI = `${GOOGLE_OAUTH_ORIGIN}/api/oauth/google/callback`;
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const GOOGLE_OAUTH_STATE_COOKIE = "lumae_google_oauth_state";
const GOOGLE_OAUTH_STATE_TTL_MS = 1000 * 60 * 10;

type GoogleOAuthState = { nonce: string; returnPath: string };

const isSafeRelativePath = (value: unknown): value is string =>
  typeof value === "string" && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/api/");

function statesMatch(expected: string, received: string): boolean {
  const expectedBuffer = Buffer.from(expected, "utf8");
  const receivedBuffer = Buffer.from(received, "utf8");
  return expectedBuffer.length === receivedBuffer.length && crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

function readGoogleOAuthState(req: Request): GoogleOAuthState | null {
  const encoded = parseCookie(req.headers.cookie ?? "")[GOOGLE_OAUTH_STATE_COOKIE];
  if (!encoded) return null;
  try {
    const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as GoogleOAuthState;
    return typeof parsed.nonce === "string" && isSafeRelativePath(parsed.returnPath) ? parsed : null;
  } catch {
    return null;
  }
}

// Build: 2026-06-21 — form-based Google OAuth (no redirect, no double-encoding)
export function registerOAuthRoutes(app: Express) {
  // ─── Google OAuth ──────────────────────────────────────────────────────────
  //
  // Step 1: /api/oauth/google/login
  //   The frontend navigates here. We respond with a plain HTML page containing
  //   an auto-submitting GET form. This is the only reliable cross-platform way
  //   to send the scope as separate words — the browser encodes the form field
  //   value exactly once, so Google receives "scope=openid+profile+email" which
  //   it accepts. Any redirect-based approach risks double-encoding on Android.
  //
  app.get("/api/oauth/google/login", (req: Request, res: Response) => {
    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
    if (!clientId) {
      return res.status(500).send("Google OAuth not configured (missing GOOGLE_OAUTH_CLIENT_ID)");
    }

    // Google requires an exact registered URI. Never derive it from preview
    // hosts or a client-provided origin, either of which can cause a mismatch.
    const redirectUri = GOOGLE_OAUTH_REDIRECT_URI;

    const requestedReturnPath = getQueryParam(req, "returnPath") || "/";
    const returnPath = isSafeRelativePath(requestedReturnPath) ? requestedReturnPath : "/";

    // Bind the provider callback to this browser with a short-lived HttpOnly
    // state cookie. The provider receives only an unpredictable nonce.
    const state = crypto.randomBytes(32).toString("base64url");
    const stateCookie = Buffer.from(JSON.stringify({ nonce: state, returnPath })).toString("base64url");
    const cookieOptions = getSessionCookieOptions(req);
    res.cookie(GOOGLE_OAUTH_STATE_COOKIE, stateCookie, {
      ...cookieOptions,
      sameSite: "lax",
      maxAge: GOOGLE_OAUTH_STATE_TTL_MS,
    });

    // Escape HTML special chars to prevent XSS in attribute values
    const esc = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

    // NOTE: scope value is plain text — the browser encodes it once on submit.
    // Do NOT pre-encode it here.
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Signing in with Google…</title>
  <style>
    body { font-family: sans-serif; display: flex; align-items: center;
           justify-content: center; min-height: 100vh; margin: 0;
           background: #0f172a; color: #94a3b8; }
  </style>
</head>
<body>
  <p>Redirecting to Google…</p>
  <form id="f" method="GET" action="https://accounts.google.com/o/oauth2/v2/auth">
    <input type="hidden" name="client_id"     value="${esc(clientId)}">
    <input type="hidden" name="redirect_uri"  value="${esc(redirectUri)}">
    <input type="hidden" name="response_type" value="code">
    <input type="hidden" name="scope"         value="openid profile email">
    <input type="hidden" name="state"         value="${esc(state)}">
    <input type="hidden" name="access_type"   value="offline">
    <input type="hidden" name="prompt"        value="consent">
  </form>
  <script>document.getElementById('f').submit();</script>
</body>
</html>`;

    // This isolated transition page needs an external form action and one
    // auto-submit script. Its narrow CSP overrides the broader app policy only
    // for this response, keeping Google OAuth functional without loosening all
    // application pages.
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'none'; base-uri 'none'; form-action https://accounts.google.com; style-src 'unsafe-inline'; script-src 'unsafe-inline'"
    );
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.send(html);
  });

  // Step 2: /api/oauth/google/callback
  //   Google redirects here with ?code=...&state=...
  //   We exchange the code for tokens, fetch the user's profile, upsert them
  //   into our DB, create a session cookie, and redirect to the dashboard.
  //
  app.get("/api/oauth/google/callback", async (req: Request, res: Response) => {
    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;

    const error = req.query.error as string | undefined;
    const code = req.query.code as string | undefined;
    const stateRaw = req.query.state as string | undefined;

    if (error) {
      res.clearCookie(GOOGLE_OAUTH_STATE_COOKIE, getSessionCookieOptions(req));
      console.error("[Google OAuth] Error from Google:", error);
      return res.redirect(`/login?error=${encodeURIComponent(error)}`);
    }
    if (!code) {
      return res.redirect("/login?error=missing_code");
    }
    if (!clientId || !clientSecret) {
      return res.redirect("/login?error=google_oauth_not_configured");
    }

    const storedState = readGoogleOAuthState(req);
    if (!stateRaw || !storedState || !statesMatch(storedState.nonce, stateRaw)) {
      res.clearCookie(GOOGLE_OAUTH_STATE_COOKIE, getSessionCookieOptions(req));
      return res.redirect("/login?error=invalid_state");
    }
    res.clearCookie(GOOGLE_OAUTH_STATE_COOKIE, getSessionCookieOptions(req));
    const returnPath = storedState.returnPath;

    const redirectUri = GOOGLE_OAUTH_REDIRECT_URI;

    try {
      // Exchange authorization code for tokens
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      if (!tokenRes.ok) {
        console.error("[Google OAuth] Token exchange failed:", tokenRes.status);
        return res.redirect(`/login?error=${encodeURIComponent("token_exchange_failed")}`);
      }

      const tokens = (await tokenRes.json()) as {
        access_token: string;
        id_token?: string;
        refresh_token?: string;
        expires_in: number;
      };

      // Fetch user profile using the access token
      const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      if (!profileRes.ok) {
        console.error("[Google OAuth] Profile fetch failed:", profileRes.status);
        return res.redirect(`/login?error=${encodeURIComponent("profile_fetch_failed")}`);
      }

      const profile = (await profileRes.json()) as {
        id: string;
        email: string;
        name: string;
        picture?: string;
      };

      if (!profile.id) {
        return res.redirect(`/login?error=${encodeURIComponent("missing_google_id")}`);
      }

      // Use "google:<id>" as the openId so it doesn't clash with Manus openIds
      const openId = `google:${profile.id}`;

      // Detect new user BEFORE upsert so isNewGoogleUser is accurate
      const existingGoogleUser = await db.getUserByOpenId(openId);
      const isNewGoogleUser = !existingGoogleUser;

      await db.upsertUser({
        openId,
        name: profile.name || null,
        email: profile.email || null,
        loginMethod: "google",
        lastSignedIn: new Date(),
      });

      // Get the user to access their ID for email verification
      const user = await db.getUserByOpenId(openId);
      const isNewUser = !user; // User didn't exist before upsert
      
      if (isNewUser && profile.email) {
        // Only send verification email to NEW users
        const freshUser = await db.getUserByOpenId(openId);
        if (freshUser) {
          try {
            const verificationToken = await db.generateEmailVerificationToken(freshUser.id);
            const verificationUrl = `${GOOGLE_OAUTH_ORIGIN}/verify-email?token=${verificationToken}`;
            await sendVerificationEmail(
              profile.email,
              profile.name || "User",
              verificationToken,
              verificationUrl
            );
            console.log("[Google OAuth] Verification email sent to new user: [REDACTED]");
          } catch (emailErr) {
            console.warn("[Google OAuth] Failed to send verification email:", emailErr);
            // Don't block login if email fails
          }
        }
      }

      // Grant 50 free trial credits to brand new Google users
      if (isNewGoogleUser) {
        try {
          const freshUser = await db.getUserByOpenId(openId);
          if (freshUser) {
            const existingCredits = await db.getUserCredits(freshUser.id);
            if (!existingCredits) {
              await db.initializeUserCredits(freshUser.id);
              await db.addCredits(
                freshUser.id,
                50,
                "Welcome gift: 50 free trial credits",
                undefined
              );
              console.log(`[Google OAuth] Granted 50 free trial credits to new user: ${freshUser.id}`);
            }
          }
        } catch (credErr) {
          console.warn("[Google OAuth] Failed to grant free trial credits:", credErr);
          // Don't block login if credit grant fails
        }
      }

      // Ensure name is never empty — verifySession rejects tokens with empty name
      const displayName = profile.name || profile.email?.split("@")[0] || "User";

      const sessionToken = await sdk.createSessionToken(openId, {
        name: displayName,
        expiresInMs: SESSION_TTL_MS,
      });

      console.log("[Google OAuth] Session token created");

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: SESSION_TTL_MS });
      
      // Redirect to dashboard after login, not home page
      // This prevents the ?code= param from being visible on the home page
      const redirectTarget = returnPath === "/" ? "/dashboard" : returnPath;
      console.log("[Google OAuth] Cookie set, redirecting to", redirectTarget);
      return res.redirect(302, redirectTarget);
    } catch (err: unknown) {
      console.error("[Google OAuth] Callback error:", err);
      return res.redirect(`/login?error=${encodeURIComponent("internal_error")}`);
    }
  });

  // ─── Social Media OAuth Callbacks ──────────────────────────────────────────
  // Register secure OAuth callbacks for all social platforms
  app.use("/api/oauth/callback", oauthCallbackRouter);

  // ─── Manus OAuth Callback ──────────────────────────────────────────────────
  app.get("/api/oauth/manus/callback", async (req: Request, res: Response) => {
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

      // Detect new user BEFORE upsert
      const existingManusUser = await db.getUserByOpenId(userInfo.openId);
      const isNewManusUser = !existingManusUser;

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      // Grant 50 free trial credits to brand new Manus users
      if (isNewManusUser) {
        try {
          const freshUser = await db.getUserByOpenId(userInfo.openId);
          if (freshUser) {
            const existingCredits = await db.getUserCredits(freshUser.id);
            if (!existingCredits) {
              await db.initializeUserCredits(freshUser.id);
              await db.addCredits(
                freshUser.id,
                50,
                "Welcome gift: 50 free trial credits",
                undefined
              );
              console.log(`[OAuth] Granted 50 free trial credits to new user: ${freshUser.id}`);
            }
          }
        } catch (credErr) {
          console.warn("[OAuth] Failed to grant free trial credits:", credErr);
          // Don't block login if credit grant fails
        }
      }

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: SESSION_TTL_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: SESSION_TTL_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
