import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getOAuthUrl, generateOAuthState, OAUTH_CONFIG } from "../_core/oauthConfig";

export const oauthFlowRouter = router({
  // Get OAuth login URL for a platform
  getLoginUrl: publicProcedure
    .input(z.object({ platform: z.string() }))
    .query(({ input }) => {
      try {
        const state = generateOAuthState();
        const loginUrl = getOAuthUrl(input.platform, state);
        
        return {
          success: true,
          loginUrl,
          state,
          platform: input.platform,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to generate OAuth URL",
        };
      }
    }),

  // Handle OAuth callback
  handleCallback: publicProcedure
    .input(z.object({
      platform: z.string(),
      code: z.string(),
      state: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        const config = OAUTH_CONFIG[input.platform as keyof typeof OAUTH_CONFIG];
        if (!config) {
          return { success: false, error: "Unknown platform" };
        }

        // Exchange authorization code for access token
        const tokenResponse = await fetch(config.tokenUrl, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: config.clientId,
            client_secret: config.clientSecret,
            code: input.code,
            redirect_uri: config.redirectUri,
            grant_type: "authorization_code",
          }).toString(),
        });

        if (!tokenResponse.ok) {
          return { success: false, error: "Failed to exchange authorization code" };
        }

        const tokenData = await tokenResponse.json();

        return {
          success: true,
          platform: input.platform,
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          expiresIn: tokenData.expires_in,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "OAuth callback failed",
        };
      }
    }),

  // Get platform-specific user info
  getUserInfo: protectedProcedure
    .input(z.object({
      platform: z.string(),
      accessToken: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        let userInfoUrl = "";
        let headers: Record<string, string> = {};

        switch (input.platform) {
          case "instagram":
            userInfoUrl = "https://graph.instagram.com/me?fields=id,username,name&access_token=" + input.accessToken;
            break;
          case "twitter":
            userInfoUrl = "https://api.twitter.com/2/users/me";
            headers = { Authorization: `Bearer ${input.accessToken}` };
            break;
          case "linkedin":
            userInfoUrl = "https://api.linkedin.com/v2/me";
            headers = { Authorization: `Bearer ${input.accessToken}` };
            break;
          case "facebook":
            userInfoUrl = "https://graph.facebook.com/me?fields=id,name,email&access_token=" + input.accessToken;
            break;
          case "youtube":
            userInfoUrl = "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true";
            headers = { Authorization: `Bearer ${input.accessToken}` };
            break;
          case "tiktok":
            userInfoUrl = "https://open.tiktokapis.com/v1/user/info/";
            headers = { Authorization: `Bearer ${input.accessToken}` };
            break;
          default:
            return { success: false, error: "Unknown platform" };
        }

        const response = await fetch(userInfoUrl, { headers });
        if (!response.ok) {
          return { success: false, error: "Failed to fetch user info" };
        }

        const userData = await response.json();

        return {
          success: true,
          platform: input.platform,
          user: userData,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to get user info",
        };
      }
    }),

  // Revoke access token
  revokeAccess: protectedProcedure
    .input(z.object({
      platform: z.string(),
      accessToken: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        // Platform-specific revocation logic
        switch (input.platform) {
          case "instagram":
          case "facebook":
            await fetch("https://graph.instagram.com/me/permissions", {
              method: "DELETE",
              body: new URLSearchParams({
                access_token: input.accessToken,
              }).toString(),
            });
            break;
          case "twitter":
            await fetch("https://api.twitter.com/2/oauth2/revoke", {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Bearer ${input.accessToken}`,
              },
              body: new URLSearchParams({
                token: input.accessToken,
              }).toString(),
            });
            break;
          // Add other platform revocation logic as needed
        }

        return { success: true, platform: input.platform };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to revoke access",
        };
      }
    }),
});
