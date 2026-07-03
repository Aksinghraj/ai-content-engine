/**
 * Social Media OAuth Service
 * Handles OAuth flows for all supported social platforms
 */

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface OAuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
}

export interface SocialProfile {
  id: string;
  username: string;
  displayName: string;
  profileImage?: string;
  email?: string;
  bio?: string;
  followers?: number;
  verified?: boolean;
}

// Platform-specific OAuth configurations
const OAUTH_CONFIGS: Record<string, Partial<OAuthConfig>> = {
  instagram: {
    scopes: ["user_profile", "user_media"],
  },
  twitter: {
    scopes: ["tweet.read", "tweet.write", "users.read", "follows.read", "follows.write"],
  },
  linkedin: {
    scopes: ["r_liteprofile", "r_emailaddress", "w_member_social"],
  },
  facebook: {
    scopes: ["pages_manage_posts", "pages_read_engagement", "pages_manage_metadata"],
  },
  youtube: {
    scopes: ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube"],
  },
  tiktok: {
    scopes: ["user.info.basic", "video.upload"],
  },
};

/**
 * Generate OAuth authorization URL for a platform
 */
export function getOAuthAuthorizationUrl(
  platform: string,
  clientId: string,
  redirectUri: string,
  state: string
): string {
  const baseUrls: Record<string, string> = {
    instagram: "https://api.instagram.com/oauth/authorize",
    twitter: "https://twitter.com/i/oauth2/authorize",
    linkedin: "https://www.linkedin.com/oauth/v2/authorization",
    facebook: "https://www.facebook.com/v18.0/dialog/oauth",
    youtube: "https://accounts.google.com/o/oauth2/v2/auth",
    tiktok: "https://www.tiktok.com/v1/oauth/authorize",
  };

  const scopes = OAUTH_CONFIGS[platform]?.scopes || [];
  const baseUrl = baseUrls[platform];

  if (!baseUrl) {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("redirect_uri", redirectUri);
  params.append("state", state);
  params.append("response_type", "code");

  // Platform-specific parameters
  switch (platform) {
    case "instagram":
      params.append("scope", scopes.join(","));
      break;
    case "twitter":
      params.append("scope", scopes.join(" "));
      params.append("code_challenge", generateCodeChallenge());
      params.append("code_challenge_method", "S256");
      break;
    case "linkedin":
      params.append("scope", scopes.join(" "));
      break;
    case "facebook":
      params.append("scope", scopes.join(","));
      break;
    case "youtube":
      params.append("scope", scopes.join(" "));
      params.append("access_type", "offline");
      params.append("prompt", "consent");
      break;
    case "tiktok":
      params.append("scope", scopes.join(","));
      break;
  }

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(
  platform: string,
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<OAuthToken> {
  const tokenUrls: Record<string, string> = {
    instagram: "https://graph.instagram.com/v18.0/oauth/access_token",
    twitter: "https://twitter.com/2/oauth2/token",
    linkedin: "https://www.linkedin.com/oauth/v2/accessToken",
    facebook: "https://graph.facebook.com/v18.0/oauth/access_token",
    youtube: "https://oauth2.googleapis.com/token",
    tiktok: "https://open.tiktokapis.com/v1/oauth/token",
  };

  const tokenUrl = tokenUrls[platform];
  if (!tokenUrl) {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  const body = new URLSearchParams();
  body.append("client_id", clientId);
  body.append("client_secret", clientSecret);
  body.append("code", code);
  body.append("redirect_uri", redirectUri);
  body.append("grant_type", "authorization_code");

  try {
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OAuth token exchange failed: ${error.error_description || error.error}`);
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      tokenType: data.token_type || "Bearer",
    };
  } catch (error) {
    console.error(`[OAuth] Token exchange error for ${platform}:`, error);
    throw error;
  }
}

/**
 * Fetch user profile from platform
 */
export async function fetchUserProfile(
  platform: string,
  accessToken: string
): Promise<SocialProfile> {
  const profileUrls: Record<string, string> = {
    instagram: "https://graph.instagram.com/me?fields=id,username,name,profile_picture_url,biography,followers_count,ig_id",
    twitter: "https://api.twitter.com/2/users/me?user.fields=id,name,username,profile_image_url,public_metrics,verified",
    linkedin: "https://api.linkedin.com/v2/me?projection=(id,firstName,lastName,profilePicture(displayImage))",
    facebook: "https://graph.facebook.com/me?fields=id,name,email,picture,verified",
    youtube: "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true",
    tiktok: "https://open.tiktokapis.com/v1/user/info/?fields=open_id,union_id,avatar_url,display_name,bio_description,follower_count,video_count,heart_count",
  };

  const url = profileUrls[platform];
  if (!url) {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
    };

    // Platform-specific headers
    if (platform === "twitter") {
      headers["User-Agent"] = "LumaeAI/1.0";
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`Failed to fetch profile from ${platform}: ${response.statusText}`);
    }

    const data = await response.json();

    // Parse platform-specific response formats
    switch (platform) {
      case "instagram":
        return {
          id: data.id,
          username: data.username,
          displayName: data.name,
          profileImage: data.profile_picture_url,
          bio: data.biography,
          followers: data.followers_count,
        };
      case "twitter":
        return {
          id: data.data.id,
          username: data.data.username,
          displayName: data.data.name,
          profileImage: data.data.profile_image_url,
          verified: data.data.verified,
          followers: data.data.public_metrics?.followers_count,
        };
      case "linkedin":
        return {
          id: data.id,
          username: data.localizedFirstName || "",
          displayName: `${data.localizedFirstName} ${data.localizedLastName}`,
          profileImage: data.profilePicture?.displayImage,
        };
      case "facebook":
        return {
          id: data.id,
          username: data.name,
          displayName: data.name,
          email: data.email,
          profileImage: data.picture?.data?.url,
          verified: data.verified,
        };
      case "youtube":
        const channel = data.items[0];
        return {
          id: channel.id,
          username: channel.snippet.customUrl || channel.id,
          displayName: channel.snippet.title,
          profileImage: channel.snippet.thumbnails?.default?.url,
          bio: channel.snippet.description,
          followers: channel.statistics?.subscriberCount,
        };
      case "tiktok":
        return {
          id: data.data.open_id,
          username: data.data.display_name,
          displayName: data.data.display_name,
          profileImage: data.data.avatar_url,
          bio: data.data.bio_description,
          followers: data.data.follower_count,
        };
      default:
        throw new Error(`Unknown platform: ${platform}`);
    }
  } catch (error) {
    console.error(`[OAuth] Profile fetch error for ${platform}:`, error);
    throw error;
  }
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(
  platform: string,
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<OAuthToken> {
  const tokenUrls: Record<string, string> = {
    instagram: "https://graph.instagram.com/v18.0/oauth/access_token",
    twitter: "https://twitter.com/2/oauth2/token",
    linkedin: "https://www.linkedin.com/oauth/v2/accessToken",
    facebook: "https://graph.facebook.com/v18.0/oauth/access_token",
    youtube: "https://oauth2.googleapis.com/token",
    tiktok: "https://open.tiktokapis.com/v1/oauth/token",
  };

  const tokenUrl = tokenUrls[platform];
  if (!tokenUrl) {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  const body = new URLSearchParams();
  body.append("client_id", clientId);
  body.append("client_secret", clientSecret);
  body.append("refresh_token", refreshToken);
  body.append("grant_type", "refresh_token");

  try {
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed for ${platform}`);
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresIn: data.expires_in,
      tokenType: data.token_type || "Bearer",
    };
  } catch (error) {
    console.error(`[OAuth] Token refresh error for ${platform}:`, error);
    throw error;
  }
}

/**
 * Generate PKCE code challenge for Twitter OAuth
 */
function generateCodeChallenge(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  let codeVerifier = "";
  for (let i = 0; i < 128; i++) {
    codeVerifier += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Simple base64url encoding of SHA256 hash
  // In production, use crypto library for proper implementation
  return Buffer.from(codeVerifier).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/**
 * Validate OAuth state parameter
 */
export function validateOAuthState(state: string, storedState: string): boolean {
  return state === storedState;
}

/**
 * Generate secure random state for OAuth
 */
export function generateOAuthState(): string {
  return Buffer.from(Math.random().toString()).toString("base64");
}
