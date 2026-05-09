/**
 * Platform-Specific OAuth 2.0 Configurations
 * Each platform requires specific scopes, endpoints, and handling
 */

export interface OAuthPlatformConfig {
  name: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  userInfoEndpoint: string;
  scopes: string[];
  scopeSeparator: string; // "space" or "comma"
  pkceRequired: boolean;
}

export interface OAuthPlatforms {
  [key: string]: OAuthPlatformConfig;
}

/**
 * Get base redirect URI (will be appended with /callback/{platform})
 */
function getRedirectUri(baseUrl: string, platform: string): string {
  return `${baseUrl}/api/oauth/callback/${platform}`;
}

/**
 * Initialize OAuth configurations from environment variables
 */
export function initializeOAuthConfigs(baseUrl: string): OAuthPlatforms {
  return {
    instagram: {
      name: "Instagram",
      clientId: process.env.INSTAGRAM_CLIENT_ID || "YOUR_INSTAGRAM_CLIENT_ID",
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || "YOUR_INSTAGRAM_CLIENT_SECRET",
      redirectUri: getRedirectUri(baseUrl, "instagram"),
      authorizationEndpoint: "https://api.instagram.com/oauth/authorize",
      tokenEndpoint: "https://graph.instagram.com/v18.0/access_token",
      userInfoEndpoint: "https://graph.instagram.com/v18.0/me",
      scopes: [
        "instagram_basic",
        "instagram_graph_user",
        "pages_read_engagement",
        "pages_manage_metadata",
        "instagram_graph_user_media",
        "pages_read_user_content",
        "pages_manage_posts",
      ],
      scopeSeparator: "comma",
      pkceRequired: false,
    },

    twitter: {
      name: "X (Twitter)",
      clientId: process.env.TWITTER_CLIENT_ID || "YOUR_TWITTER_CLIENT_ID",
      clientSecret: process.env.TWITTER_CLIENT_SECRET || "YOUR_TWITTER_CLIENT_SECRET",
      redirectUri: getRedirectUri(baseUrl, "twitter"),
      authorizationEndpoint: "https://twitter.com/i/oauth2/authorize",
      tokenEndpoint: "https://api.twitter.com/2/oauth2/token",
      userInfoEndpoint: "https://api.twitter.com/2/users/me",
      scopes: [
        "tweet.read",
        "tweet.write",
        "tweet.moderate.write",
        "users.read",
        "follows.read",
        "follows.write",
        "offline.access",
        "mute.read",
        "mute.write",
        "like.read",
        "like.write",
        "list.read",
        "list.write",
        "bookmark.read",
        "bookmark.write",
        "block.read",
        "block.write",
        "space.read",
        "mute.manage.read",
        "mute.manage.write",
      ],
      scopeSeparator: "space",
      pkceRequired: true, // Twitter requires PKCE
    },

    linkedin: {
      name: "LinkedIn",
      clientId: process.env.LINKEDIN_CLIENT_ID || "YOUR_LINKEDIN_CLIENT_ID",
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "YOUR_LINKEDIN_CLIENT_SECRET",
      redirectUri: getRedirectUri(baseUrl, "linkedin"),
      authorizationEndpoint: "https://www.linkedin.com/oauth/v2/authorization",
      tokenEndpoint: "https://www.linkedin.com/oauth/v2/accessToken",
      userInfoEndpoint: "https://api.linkedin.com/v2/me",
      scopes: [
        "profile",
        "email",
        "openid",
        "w_member_social",
        "w_organization_social",
      ],
      scopeSeparator: "space",
      pkceRequired: false,
    },

    facebook: {
      name: "Facebook",
      clientId: process.env.FACEBOOK_CLIENT_ID || "YOUR_FACEBOOK_CLIENT_ID",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "YOUR_FACEBOOK_CLIENT_SECRET",
      redirectUri: getRedirectUri(baseUrl, "facebook"),
      authorizationEndpoint: "https://www.facebook.com/v18.0/dialog/oauth",
      tokenEndpoint: "https://graph.facebook.com/v18.0/oauth/access_token",
      userInfoEndpoint: "https://graph.facebook.com/me",
      scopes: [
        "public_profile",
        "email",
        "pages_read_user_content",
        "pages_read_engagement",
        "pages_manage_posts",
        "pages_manage_engagement",
        "pages_manage_metadata",
        "instagram_basic",
        "instagram_graph_user_media",
        "pages_manage_instant_articles",
      ],
      scopeSeparator: "comma",
      pkceRequired: false,
    },

    youtube: {
      name: "YouTube",
      clientId: process.env.YOUTUBE_CLIENT_ID || "YOUR_YOUTUBE_CLIENT_ID",
      clientSecret: process.env.YOUTUBE_CLIENT_SECRET || "YOUR_YOUTUBE_CLIENT_SECRET",
      redirectUri: getRedirectUri(baseUrl, "youtube"),
      authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenEndpoint: "https://oauth2.googleapis.com/token",
      userInfoEndpoint: "https://www.googleapis.com/oauth2/v2/userinfo",
      scopes: [
        "https://www.googleapis.com/auth/youtube",
        "https://www.googleapis.com/auth/youtube.upload",
        "https://www.googleapis.com/auth/youtube.readonly",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
      ],
      scopeSeparator: "space",
      pkceRequired: false,
    },

    tiktok: {
      name: "TikTok",
      clientId: process.env.TIKTOK_CLIENT_ID || "YOUR_TIKTOK_CLIENT_ID",
      clientSecret: process.env.TIKTOK_CLIENT_SECRET || "YOUR_TIKTOK_CLIENT_SECRET",
      redirectUri: getRedirectUri(baseUrl, "tiktok"),
      authorizationEndpoint: "https://www.tiktok.com/v1/oauth/authorize",
      tokenEndpoint: "https://open.tiktokapis.com/v1/oauth/token",
      userInfoEndpoint: "https://open.tiktokapis.com/v1/user/info",
      scopes: [
        "user.info.basic",
        "user.info.profile",
        "video.list",
        "video.upload",
        "video.publish",
      ],
      scopeSeparator: "space",
      pkceRequired: true, // TikTok recommends PKCE
    },
  };
}

/**
 * Get configuration for a specific platform
 */
export function getPlatformConfig(
  platforms: OAuthPlatforms,
  platform: string
): OAuthPlatformConfig {
  const config = platforms[platform.toLowerCase()];
  if (!config) {
    throw new Error(`Unknown OAuth platform: ${platform}`);
  }
  return config;
}

/**
 * Validate that all required environment variables are set
 */
export function validateOAuthConfig(config: OAuthPlatformConfig): boolean {
  return (
    config.clientId !== `YOUR_${config.name.toUpperCase()}_CLIENT_ID` &&
    config.clientSecret !== `YOUR_${config.name.toUpperCase()}_CLIENT_SECRET` &&
    config.clientId.length > 0 &&
    config.clientSecret.length > 0
  );
}
