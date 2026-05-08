/**
 * OAuth Configuration for Social Media Platforms
 * This file contains OAuth app credentials and URLs for each platform
 */

export const OAUTH_CONFIG = {
  instagram: {
    clientId: process.env.INSTAGRAM_CLIENT_ID || "YOUR_INSTAGRAM_APP_ID",
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || "YOUR_INSTAGRAM_APP_SECRET",
    redirectUri: `${process.env.FRONTEND_URL || "https://aicontent-femeuybh.manus.space"}/auth/instagram/callback`,
    authUrl: "https://api.instagram.com/oauth/authorize",
    tokenUrl: "https://graph.instagram.com/v18.0/access_token",
    scope: "user_profile,user_media",
  },
  twitter: {
    clientId: process.env.TWITTER_CLIENT_ID || "YOUR_TWITTER_CLIENT_ID",
    clientSecret: process.env.TWITTER_CLIENT_SECRET || "YOUR_TWITTER_CLIENT_SECRET",
    redirectUri: `${process.env.FRONTEND_URL || "https://aicontent-femeuybh.manus.space"}/auth/twitter/callback`,
    authUrl: "https://twitter.com/i/oauth2/authorize",
    tokenUrl: "https://api.twitter.com/2/oauth2/token",
    scope: "tweet.read tweet.write users.read follows.manage follows.read",
  },
  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID || "YOUR_LINKEDIN_CLIENT_ID",
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "YOUR_LINKEDIN_CLIENT_SECRET",
    redirectUri: `${process.env.FRONTEND_URL || "https://aicontent-femeuybh.manus.space"}/auth/linkedin/callback`,
    authUrl: "https://www.linkedin.com/oauth/v2/authorization",
    tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    scope: "r_basicprofile w_member_social",
  },
  facebook: {
    clientId: process.env.FACEBOOK_CLIENT_ID || "YOUR_FACEBOOK_APP_ID",
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "YOUR_FACEBOOK_APP_SECRET",
    redirectUri: `${process.env.FRONTEND_URL || "https://aicontent-femeuybh.manus.space"}/auth/facebook/callback`,
    authUrl: "https://www.facebook.com/v18.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v18.0/oauth/access_token",
    scope: "public_profile,pages_manage_posts,pages_read_engagement",
  },
  youtube: {
    clientId: process.env.YOUTUBE_CLIENT_ID || "YOUR_YOUTUBE_CLIENT_ID",
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET || "YOUR_YOUTUBE_CLIENT_SECRET",
    redirectUri: `${process.env.FRONTEND_URL || "https://aicontent-femeuybh.manus.space"}/auth/youtube/callback`,
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scope: "https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly",
  },
  tiktok: {
    clientId: process.env.TIKTOK_CLIENT_ID || "YOUR_TIKTOK_CLIENT_KEY",
    clientSecret: process.env.TIKTOK_CLIENT_SECRET || "YOUR_TIKTOK_CLIENT_SECRET",
    redirectUri: `${process.env.FRONTEND_URL || "https://aicontent-femeuybh.manus.space"}/auth/tiktok/callback`,
    authUrl: "https://www.tiktok.com/v1/oauth/authorize",
    tokenUrl: "https://open.tiktokapis.com/v1/oauth/token",
    scope: "user.info.basic,video.upload,video.publish",
  },
};

export function getOAuthUrl(platform: string, state: string): string {
  const config = OAUTH_CONFIG[platform as keyof typeof OAUTH_CONFIG];
  if (!config) throw new Error(`Unknown platform: ${platform}`);

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: config.scope,
    state: state,
  });

  return `${config.authUrl}?${params.toString()}`;
}

export function generateOAuthState(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
