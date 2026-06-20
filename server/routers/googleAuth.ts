import { publicProcedure, router } from "../_core/trpc";
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

      const state = Buffer.from(JSON.stringify({
        returnPath: input?.returnPath || "/",
        timestamp: Date.now(),
      })).toString("base64");

      // Build URL with scopes as SEPARATE parameters (not as single string)
      // Google OAuth requires: scope=openid&scope=profile&scope=email
      const scopes = ["openid", "profile", "email"];
      const scopeParams = scopes.map(s => `scope=${encodeURIComponent(s)}`).join("&");
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&${scopeParams}&state=${encodeURIComponent(state)}&access_type=offline&prompt=consent`;

      return { url: authUrl };
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
        // Decode state to get return path
        let returnPath = "/";
        try {
          const stateData = JSON.parse(Buffer.from(input.state, "base64").toString());
          returnPath = stateData.returnPath || "/";
        } catch (e) {
          console.error("Failed to decode state:", e);
        }

        // Exchange code for tokens
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            code: input.code,
            grant_type: "authorization_code",
            redirect_uri: redirectUri,
          }).toString(),
        });

        if (!tokenResponse.ok) {
          const error = await tokenResponse.json();
          console.error("Token exchange error:", error);
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Failed to exchange authorization code for tokens",
          });
        }

        const tokens = await tokenResponse.json();

        // Get user info
        const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        });

        if (!userResponse.ok) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Failed to fetch user info",
          });
        }

        const userInfo = await userResponse.json();

        return {
          tokens: {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresIn: tokens.expires_in,
          },
          user: {
            id: userInfo.id,
            name: userInfo.name,
            email: userInfo.email,
            picture: userInfo.picture,
          },
          returnPath,
        };
      } catch (error) {
        console.error("OAuth exchange error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "OAuth exchange failed",
        });
      }
    }),

  // Refresh access token
  refreshToken: publicProcedure
    .input(z.object({
      refreshToken: z.string(),
    }))
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
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: input.refreshToken,
            grant_type: "refresh_token",
          }).toString(),
        });

        if (!tokenResponse.ok) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Failed to refresh token",
          });
        }

        const tokens = await tokenResponse.json();

        return {
          accessToken: tokens.access_token,
          expiresIn: tokens.expires_in,
        };
      } catch (error) {
        console.error("Token refresh error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Token refresh failed",
        });
      }
    }),
});
