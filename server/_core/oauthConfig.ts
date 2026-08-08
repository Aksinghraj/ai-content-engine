/**
 * OAuth Configuration for Social Media Platforms
 * Credentials are loaded from environment variables (Lumae's developer apps).
 * Users are redirected to each provider's consent page using these credentials.
 * Access tokens are stored encrypted in the database per user.
 */

const BASE_URL = process.env.FRONTEND_URL || "https://lumae.co.in";

export const OAUTH_CONFIG = {
  instagram: {
    clientId: process.env.INSTAGRAM_CLIENT_ID || "",
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || "",
    redirectUri: `${BASE_URL}/api/oauth/callback/instagram`,
    authUrl: "https://api.instagram.com/oauth/authorize",
    tokenUrl: "https://graph.instagram.com/v18.0/access_token",
    userInfoEndpoint: "https://graph.instagram.com/v18.0/me?fields=id,username",
    scope: "user_profile,user_media",
    isMock: false,
  },
  twitter: {
    clientId: process.env.TWITTER_CLIENT_ID || "",
    clientSecret: process.env.TWITTER_CLIENT_SECRET || "",
    redirectUri: `${BASE_URL}/api/oauth/callback/twitter`,
    authUrl: "https://twitter.com/i/oauth2/authorize",
    tokenUrl: "https://api.twitter.com/2/oauth2/token",
    userInfoEndpoint: "https://api.twitter.com/2/users/me",
    scope: "tweet.read tweet.write users.read follows.manage follows.read",
    isMock: false,
  },
  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID || "",
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "",
    redirectUri: `${BASE_URL}/api/oauth/callback/linkedin`,
    authUrl: "https://www.linkedin.com/oauth/v2/authorization",
    tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    userInfoEndpoint: "https://api.linkedin.com/v2/me",
    scope: "r_basicprofile w_member_social",
    isMock: false,
  },
  facebook: {
    clientId: process.env.FACEBOOK_CLIENT_ID || "",
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
    redirectUri: `${BASE_URL}/api/oauth/callback/facebook`,
    authUrl: "https://www.facebook.com/v18.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v18.0/oauth/access_token",
    userInfoEndpoint: "https://graph.facebook.com/me?fields=id,name,email",
    scope: "public_profile,pages_manage_posts,pages_read_engagement",
    isMock: false,
  },
  youtube: {
    clientId: process.env.YOUTUBE_CLIENT_ID || "",
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET || "",
    redirectUri: `${BASE_URL}/api/oauth/callback/youtube`,
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    userInfoEndpoint: "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
    scope: "https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly",
    isMock: false,
  },
  tiktok: {
    clientId: process.env.TIKTOK_CLIENT_ID || "",
    clientSecret: process.env.TIKTOK_CLIENT_SECRET || "",
    redirectUri: `${BASE_URL}/api/oauth/callback/tiktok`,
    authUrl: "https://www.tiktok.com/v1/oauth/authorize",
    tokenUrl: "https://open.tiktokapis.com/v1/oauth/token",
    userInfoEndpoint: "https://open.tiktokapis.com/v1/user/info/",
    scope: "user.info.basic,video.upload,video.publish",
    isMock: !process.env.TIKTOK_CLIENT_ID,
  },
};

export function getOAuthUrl(platform: string, state: string): string {
  const config = OAUTH_CONFIG[platform as keyof typeof OAUTH_CONFIG];
  if (!config) throw new Error(`Unknown platform: ${platform}`);

  if (!config.clientId) {
    throw new Error(`OAuth not configured for ${platform}. Missing CLIENT_ID.`);
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: config.scope,
    state: state,
  });

  // YouTube requires offline access for refresh tokens
  if (platform === "youtube") {
    params.set("access_type", "offline");
    params.set("prompt", "consent");
  }

  return `${config.authUrl}?${params.toString()}`;
}

export function isOAuthConfigured(platform: string): boolean {
  const config = OAUTH_CONFIG[platform as keyof typeof OAUTH_CONFIG];
  return !!(config?.clientId && config?.clientSecret);
}

export function generateOAuthState(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function getRedirectUri(platform: string): string {
  return OAUTH_CONFIG[platform as keyof typeof OAUTH_CONFIG]?.redirectUri || `${BASE_URL}/auth/${platform}/callback`;
}
