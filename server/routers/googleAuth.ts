import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const googleAuthRouter = router({
  // Get Google OAuth login URL
  getLoginUrl: publicProcedure
    .input(z.object({ returnPath: z.string().optional() }).optional())
    .query(({ input }) => {
      const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
      const redirectUri = `${process.env.VITE_FRONTEND_URL || "http://localhost:3000"}/api/oauth/google/callback`;
      
      if (!clientId) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Google OAuth not configured",
        });
      }

      const scope = encodeURIComponent([
        "openid",
        "profile",
        "email",
      ].join(" "));

      const state = Buffer.from(JSON.stringify({
        returnPath: input?.returnPath || "/",
        timestamp: Date.now(),
      })).toString("base64");

      const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      url.searchParams.set("client_id", clientId);
      url.searchParams.set("redirect_uri", redirectUri);
      url.searchParams.set("response_type", "code");
      url.searchParams.set("scope", scope);
      url.searchParams.set("state", state);
      url.searchParams.set("access_type", "offline");
      url.searchParams.set("prompt", "consent");

      return { url: url.toString() };
    }),

  // Exchange Google auth code for tokens
  exchangeCode: publicProcedure
    .input(z.object({
      code: z.string(),
      state: z.string(),
    }))
    .mutation(async ({ input }) => {
      const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
      const redirectUri = `${process.env.VITE_FRONTEND_URL || "http://localhost:3000"}/api/oauth/google/callback`;

      if (!clientId || !clientSecret) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Google OAuth not configured",
        });
      }

      try {
        // Exchange code for tokens
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            code: input.code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: "authorization_code",
          }).toString(),
        });

        if (!tokenResponse.ok) {
          const error = await tokenResponse.json();
          console.error("Google token exchange error:", error);
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Failed to exchange authorization code",
          });
        }

        const tokens = await tokenResponse.json();

        // Get user info
        const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        });

        if (!userResponse.ok) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Failed to fetch user info",
          });
        }

        const userInfo = await userResponse.json();

        // Parse state to get return path
        let returnPath = "/";
        try {
          const stateData = JSON.parse(Buffer.from(input.state, "base64").toString());
          returnPath = stateData.returnPath || "/";
        } catch (e) {
          console.error("Failed to parse state:", e);
        }

        return {
          user: {
            id: userInfo.id,
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
          },
          tokens: {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresIn: tokens.expires_in,
          },
          returnPath,
        };
      } catch (error) {
        console.error("Google OAuth error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Google OAuth failed",
        });
      }
    }),

  // Refresh Google access token
  refreshToken: protectedProcedure
    .input(z.object({ refreshToken: z.string() }))
    .mutation(async ({ input }) => {
      const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Google OAuth not configured",
        });
      }

      try {
        const response = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: input.refreshToken,
            grant_type: "refresh_token",
          }).toString(),
        });

        if (!response.ok) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Failed to refresh token",
          });
        }

        const tokens = await response.json();
        return {
          accessToken: tokens.access_token,
          expiresIn: tokens.expires_in,
        };
      } catch (error) {
        console.error("Token refresh error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to refresh Google token",
        });
      }
    }),
});
