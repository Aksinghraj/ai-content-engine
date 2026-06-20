import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

/**
 * Build a Google OAuth 2.0 authorization URL with correct scope encoding.
 *
 * IMPORTANT: Both `URLSearchParams` and `URL.searchParams` encode spaces as '+',
 * which is application/x-www-form-urlencoded format. Google OAuth requires RFC 3986
 * percent-encoding (%20) for spaces in the scope parameter. Using '+' causes:
 *   "Error 400: OAuth 2 parameters can only have a single value: scope"
 *
 * Solution: build the query string manually using encodeURIComponent for all values,
 * and join scope words with '%20' so spaces are encoded as %20 (not +).
 */
function buildGoogleOAuthUrl(params: {
  clientId: string;
  redirectUri: string;
  state: string;
  scope: string;
}): string {
  const enc = encodeURIComponent;
  // Encode each scope word individually and join with %20 (not +)
  const scopeEncoded = params.scope.split(" ").map(enc).join("%20");

  const qs = [
    `client_id=${enc(params.clientId)}`,
    `redirect_uri=${enc(params.redirectUri)}`,
    `response_type=code`,
    `scope=${scopeEncoded}`,
    `state=${enc(params.state)}`,
    `access_type=offline`,
    `prompt=consent`,
  ].join("&");

  return `https://accounts.google.com/o/oauth2/v2/auth?${qs}`;
}

export const googleAuthRouter = router({
  // Get Google OAuth login URL
  getLoginUrl: publicProcedure
    .input(z.object({ origin: z.string().optional(), returnPath: z.string().optional() }).optional())
    .query(({ input, ctx }) => {
      const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;

      if (!clientId) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Google OAuth not configured",
        });
      }

      // Use origin from input (passed by frontend) or fallback to request headers
      const origin =
        input?.origin ||
        (ctx.req.headers.origin as string) ||
        `${ctx.req.headers["x-forwarded-proto"] || "https"}://${ctx.req.headers.host}`;

      const redirectUri = `${origin}/api/oauth/google/callback`;

      const state = Buffer.from(
        JSON.stringify({
          returnPath: input?.returnPath || "/",
          origin,
          timestamp: Date.now(),
        })
      ).toString("base64");

      const url = buildGoogleOAuthUrl({
        clientId,
        redirectUri,
        state,
        scope: "openid profile email",
      });

      return { url };
    }),

  // Exchange Google auth code for tokens
  exchangeCode: publicProcedure
    .input(
      z.object({
        code: z.string(),
        state: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Google OAuth not configured",
        });
      }

      try {
        // Decode state to get origin and return path
        let returnPath = "/";
        let origin = `${ctx.req.headers["x-forwarded-proto"] || "https"}://${ctx.req.headers.host}`;
        try {
          const stateData = JSON.parse(Buffer.from(input.state, "base64").toString());
          returnPath = stateData.returnPath || "/";
          if (stateData.origin) origin = stateData.origin;
        } catch (e) {
          console.error("Failed to decode state:", e);
        }

        const redirectUri = `${origin}/api/oauth/google/callback`;

        // Exchange code for tokens
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
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

      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: input.refreshToken,
          grant_type: "refresh_token",
        }).toString(),
      });

      if (!tokenResponse.ok) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Failed to refresh token" });
      }

      const tokens = await tokenResponse.json();
      return { accessToken: tokens.access_token, expiresIn: tokens.expires_in };
    }),
});
