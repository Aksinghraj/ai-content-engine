import crypto from "crypto";
import { ENV } from "./env";

// OAuth configuration for each platform using Lumae's developer apps
const OAUTH_PROVIDERS = {
  instagram: {
    authUrl: "https://api.instagram.com/oauth/authorize",
    tokenUrl: "https://graph.instagram.com/v18.0/access_token",
    userUrl: "https://graph.instagram.com/me?fields=id,username,name",
    scope: "instagram_basic,instagram_graph_user_media",
  },
  facebook: {
    authUrl: "https://www.facebook.com/v18.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v18.0/oauth/access_token",
    userUrl: "https://graph.facebook.com/me?fields=id,name,email",
    scope: "pages_read_engagement,pages_manage_posts",
  },
  twitter: {
    authUrl: "https://twitter.com/i/oauth2/authorize",
    tokenUrl: "https://api.twitter.com/2/oauth2/token",
    userUrl: "https://api.twitter.com/2/users/me",
    scope: "tweet.read tweet.write users.read follows.read",
  },
  linkedin: {
    authUrl: "https://www.linkedin.com/oauth/v2/authorization",
    tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    userUrl: "https://api.linkedin.com/v2/me",
    scope: "r_liteprofile r_emailaddress w_member_social",
  },
  youtube: {
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    userUrl: "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
    scope: "https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.upload",
  },
  tiktok: {
    authUrl: "https://www.tiktok.com/v1/oauth/authorize",
    tokenUrl: "https://open.tiktokapis.com/v1/oauth/token",
    userUrl: "https://open.tiktokapis.com/v1/user/info",
    scope: "user.info.basic video.list video.create",
  },
};

// Encryption utilities for secure token storage
const ENCRYPTION_KEY = process.env.OAUTH_ENCRYPTION_KEY || crypto.randomBytes(32).toString("hex");
const ENCRYPTION_IV_LENGTH = 16;

export function encryptToken(token: string): string {
  const iv = crypto.randomBytes(ENCRYPTION_IV_LENGTH);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY, "hex"),
    iv
  );
  let encrypted = cipher.update(token, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

export function decryptToken(encryptedToken: string): string {
  const parts = encryptedToken.split(":");
  const iv = Buffer.from(parts[0], "hex");
  const encrypted = parts[1];
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY, "hex"),
    iv
  );
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

// Generate secure state token for CSRF protection
export function generateStateToken(userId: number, platform: string): string {
  const state = {
    userId,
    platform,
    timestamp: Date.now(),
    nonce: crypto.randomBytes(16).toString("hex"),
  };
  return Buffer.from(JSON.stringify(state)).toString("base64");
}

export function verifyStateToken(token: string, userId: number, platform: string): boolean {
  try {
    const state = JSON.parse(Buffer.from(token, "base64").toString());
    // Check if state is valid (not older than 10 minutes)
    const isValid =
      state.userId === userId &&
      state.platform === platform &&
      Date.now() - state.timestamp < 10 * 60 * 1000;
    return isValid;
  } catch {
    return false;
  }
}

// Get OAuth authorization URL
// Generate PKCE code challenge and verifier
function generatePKCE(): { codeVerifier: string; codeChallenge: string } {
  const codeVerifier = crypto
    .randomBytes(32)
    .toString("base64url")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, 128);
  
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url")
    .replace(/[^a-zA-Z0-9_-]/g, "");
  
  return { codeVerifier, codeChallenge };
}

export function getAuthorizationUrl(
  platform: keyof typeof OAUTH_PROVIDERS,
  userId: number,
  clientId: string,
  redirectUri: string
): { url: string; codeVerifier?: string } {
  const provider = OAUTH_PROVIDERS[platform];
  const state = generateStateToken(userId, platform);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: provider.scope,
    state,
  });

  // Platform-specific parameters
  if (platform === "instagram" || platform === "facebook") {
    params.set("display", "popup");
  }

  // Twitter requires PKCE
  let codeVerifier: string | undefined;
  if (platform === "twitter") {
    const { codeVerifier: verifier, codeChallenge } = generatePKCE();
    codeVerifier = verifier;
    params.set("code_challenge", codeChallenge);
    params.set("code_challenge_method", "S256");
  }

  return {
    url: `${provider.authUrl}?${params.toString()}`,
    codeVerifier,
  };
}

// Exchange authorization code for access token
export async function exchangeCodeForToken(
  platform: keyof typeof OAUTH_PROVIDERS,
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<{
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}> {
  const provider = OAUTH_PROVIDERS[platform];

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  const response = await fetch(provider.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

// Get user info from platform
export async function getUserInfo(
  platform: keyof typeof OAUTH_PROVIDERS,
  accessToken: string
): Promise<{
  id: string;
  username: string;
  name?: string;
  email?: string;
}> {
  const provider = OAUTH_PROVIDERS[platform];

  const response = await fetch(provider.userUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user info: ${response.statusText}`);
  }

  const data = await response.json();

  // Parse response based on platform
  switch (platform) {
    case "instagram":
      return {
        id: data.id,
        username: data.username,
        name: data.name,
      };
    case "facebook":
      return {
        id: data.id,
        username: data.name,
        name: data.name,
        email: data.email,
      };
    case "twitter":
      return {
        id: data.data.id,
        username: data.data.username,
        name: data.data.name,
      };
    case "linkedin":
      return {
        id: data.id,
        username: data.localizedFirstName,
        name: `${data.localizedFirstName} ${data.localizedLastName}`,
      };
    case "youtube":
      return {
        id: data.items[0].id,
        username: data.items[0].snippet.title,
        name: data.items[0].snippet.title,
      };
    case "tiktok":
      return {
        id: data.data.user.open_id,
        username: data.data.user.display_name,
        name: data.data.user.display_name,
      };
    default:
      throw new Error(`Unknown platform: ${platform}`);
  }
}

// Refresh access token
export async function refreshAccessToken(
  platform: keyof typeof OAUTH_PROVIDERS,
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<{
  accessToken: string;
  expiresIn?: number;
}> {
  const provider = OAUTH_PROVIDERS[platform];

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const response = await fetch(provider.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error(`Token refresh failed: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
  };
}
