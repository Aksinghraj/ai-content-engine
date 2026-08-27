/**
 * Credential Validation Module
 * Validates social media credentials against actual platform APIs
 * Only marks account as "Connected" if credentials are verified as valid
 */

import axios from "axios";

const PROVIDER_VALIDATION_TIMEOUT_MS = 2_000;

export type SocialPlatform = "instagram" | "twitter" | "linkedin" | "facebook" | "youtube" | "tiktok";

interface ValidationResult {
  isValid: boolean;
  username?: string;
  userId?: string;
  publishingAccessToken?: string;
  error?: string;
  message: string;
}

/**
 * Validate Instagram credentials
 * Checks if access token is valid by calling Instagram Graph API
 */
export async function validateInstagramCredentials(
  accessToken: string
): Promise<ValidationResult> {
  try {
    const pagesResponse = await axios.get("https://graph.facebook.com/v26.0/me/accounts", {
      params: {
        fields: "id,name,access_token,tasks",
        access_token: accessToken,
      },
      timeout: PROVIDER_VALIDATION_TIMEOUT_MS,
    });

    for (const page of pagesResponse.data?.data ?? []) {
      if (!page?.id || !page?.access_token) continue;
      const accountResponse = await axios.get(`https://graph.facebook.com/v26.0/${page.id}`, {
        params: {
          fields: "instagram_business_account{id,username,name}",
          access_token: page.access_token,
        },
        timeout: PROVIDER_VALIDATION_TIMEOUT_MS,
      });
      const account = accountResponse.data?.instagram_business_account;
      if (account?.id) {
        return {
          isValid: true,
          username: account.username || account.name || page.name || "Instagram professional account",
          userId: account.id,
          publishingAccessToken: page.access_token,
          message: "Instagram professional account verified successfully",
        };
      }
    }

    return {
      isValid: false,
      error: "No eligible Instagram professional account was found on a Facebook Page you manage",
      message: "Connect an Instagram Business or Creator account to a Facebook Page, then try again",
    };
  } catch (error: any) {
    const errorMsg = error?.response?.data?.error?.message || error?.message || "Unknown error";
    return {
      isValid: false,
      error: errorMsg,
      message: `Instagram validation failed: ${errorMsg}`,
    };
  }
}

/**
 * Validate Twitter/X credentials
 * Checks if bearer token is valid by calling Twitter API v2
 */
export async function validateTwitterCredentials(accessToken: string): Promise<ValidationResult> {
  try {
    const response = await axios.get("https://api.twitter.com/2/users/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      timeout: PROVIDER_VALIDATION_TIMEOUT_MS,
    });

    if (response.data?.data?.id && response.data?.data?.username) {
      return {
        isValid: true,
        username: response.data.data.username,
        userId: response.data.data.id,
        message: "Twitter credentials verified successfully",
      };
    }

    return {
      isValid: false,
      error: "Invalid response from Twitter API",
      message: "Failed to verify Twitter credentials",
    };
  } catch (error: any) {
    const errorMsg = error?.response?.data?.detail || error?.message || "Unknown error";
    return {
      isValid: false,
      error: errorMsg,
      message: `Twitter validation failed: ${errorMsg}`,
    };
  }
}

/**
 * Validate LinkedIn credentials
 * Checks if access token is valid by calling LinkedIn API
 */
export async function validateLinkedInCredentials(
  accessToken: string
): Promise<ValidationResult> {
  try {
    const response = await axios.get("https://api.linkedin.com/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Accept": "application/json",
      },
      timeout: PROVIDER_VALIDATION_TIMEOUT_MS,
    });

    if (response.data?.sub || response.data?.id) {
      const userId = response.data.sub || response.data.id;
      const username = response.data?.name || response.data?.given_name || userId;
      return {
        isValid: true,
        username: username,
        userId,
        message: "LinkedIn credentials verified successfully",
      };
    }

    return {
      isValid: false,
      error: "Invalid response from LinkedIn API",
      message: "Failed to verify LinkedIn credentials",
    };
  } catch (error: any) {
    const errorMsg = error?.response?.data?.message || error?.message || "Unknown error";
    return {
      isValid: false,
      error: errorMsg,
      message: `LinkedIn validation failed: ${errorMsg}`,
    };
  }
}

/**
 * Validate Facebook credentials
 * Checks if access token is valid by calling Facebook Graph API
 */
export async function validateFacebookCredentials(
  accessToken: string
): Promise<ValidationResult> {
  try {
    const response = await axios.get("https://graph.facebook.com/me", {
      params: {
        fields: "id,name,email",
        access_token: accessToken,
      },
      timeout: PROVIDER_VALIDATION_TIMEOUT_MS,
    });

    if (response.data?.id && response.data?.name) {
      return {
        isValid: true,
        username: response.data.name,
        userId: response.data.id,
        message: "Facebook credentials verified successfully",
      };
    }

    return {
      isValid: false,
      error: "Invalid response from Facebook API",
      message: "Failed to verify Facebook credentials",
    };
  } catch (error: any) {
    const errorMsg = error?.response?.data?.error?.message || error?.message || "Unknown error";
    return {
      isValid: false,
      error: errorMsg,
      message: `Facebook validation failed: ${errorMsg}`,
    };
  }
}

/**
 * Validate YouTube credentials
 * Checks if access token is valid by calling YouTube API
 */
export async function validateYouTubeCredentials(
  accessToken: string
): Promise<ValidationResult> {
  try {
    const response = await axios.get("https://www.googleapis.com/youtube/v3/channels", {
      params: {
        part: "snippet",
        mine: true,
        access_token: accessToken,
      },
      timeout: PROVIDER_VALIDATION_TIMEOUT_MS,
    });

    if (response.data?.items?.[0]?.id && response.data?.items?.[0]?.snippet?.title) {
      return {
        isValid: true,
        username: response.data.items[0].snippet.title,
        userId: response.data.items[0].id,
        message: "YouTube credentials verified successfully",
      };
    }

    return {
      isValid: false,
      error: "Invalid response from YouTube API",
      message: "Failed to verify YouTube credentials",
    };
  } catch (error: any) {
    const errorMsg = error?.response?.data?.error?.message || error?.message || "Unknown error";
    return {
      isValid: false,
      error: errorMsg,
      message: `YouTube validation failed: ${errorMsg}`,
    };
  }
}

/**
 * Validate TikTok credentials
 * Checks if access token is valid by calling TikTok API
 */
export async function validateTikTokCredentials(
  accessToken: string
): Promise<ValidationResult> {
  try {
    const response = await axios.get("https://open.tiktokapis.com/v1/user/info/", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      timeout: PROVIDER_VALIDATION_TIMEOUT_MS,
    });

    if (response.data?.data?.user?.id && response.data?.data?.user?.username) {
      return {
        isValid: true,
        username: response.data.data.user.username,
        userId: response.data.data.user.id,
        message: "TikTok credentials verified successfully",
      };
    }

    return {
      isValid: false,
      error: "Invalid response from TikTok API",
      message: "Failed to verify TikTok credentials",
    };
  } catch (error: any) {
    const errorMsg = error?.response?.data?.error?.message || error?.message || "Unknown error";
    return {
      isValid: false,
      error: errorMsg,
      message: `TikTok validation failed: ${errorMsg}`,
    };
  }
}

/**
 * Main validation function - routes to platform-specific validators
 */
export async function validateCredentials(
  platform: SocialPlatform,
  accessToken: string
): Promise<ValidationResult> {
  if (!accessToken || accessToken.trim() === "") {
    return {
      isValid: false,
      error: "Access token is empty",
      message: "No access token provided",
    };
  }

  switch (platform) {
    case "instagram":
      return validateInstagramCredentials(accessToken);
    case "twitter":
      return validateTwitterCredentials(accessToken);
    case "linkedin":
      return validateLinkedInCredentials(accessToken);
    case "facebook":
      return validateFacebookCredentials(accessToken);
    case "youtube":
      return validateYouTubeCredentials(accessToken);
    case "tiktok":
      return validateTikTokCredentials(accessToken);
    default:
      return {
        isValid: false,
        error: `Unknown platform: ${platform}`,
        message: "Platform not supported",
      };
  }
}
