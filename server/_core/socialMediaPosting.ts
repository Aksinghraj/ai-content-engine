import { getDb } from "../db";
import { getSocialConnectionByPlatform, getUserSocialConnections } from "../db/social";
import { getValidAccessToken } from "./oauthFlow";

/**
 * Social Media Posting Service
 * Handles actual posting to connected social media accounts
 */

interface PostContent {
  text: string;
  imageUrl?: string;
  videoUrl?: string;
  hashtags?: string[];
}

/**
 * Post to Instagram
 */
export async function postToInstagram(
  userId: number,
  content: PostContent
): Promise<{ success: boolean; postId?: string; error?: string }> {
  try {
    const connection = await getSocialConnectionByPlatform(userId, "instagram");
    if (!connection) {
      return { success: false, error: "Instagram account not connected" };
    }

    const baseUrl = process.env.APP_URL || "http://localhost:3000";
    const accessToken = await getValidAccessToken(baseUrl, userId, "instagram");
    if (!accessToken) {
      return { success: false, error: "Failed to get valid access token" };
    }

    // Instagram Graph API endpoint
    const igUserId = connection.platformUserId;
    const endpoint = `https://graph.instagram.com/v18.0/${igUserId}/media`;

    const formData = new FormData();
    formData.append("media_type", content.imageUrl ? "IMAGE" : "CAROUSEL");
    if (content.imageUrl) {
      formData.append("image_url", content.imageUrl);
    }
    if (content.text) {
      formData.append("caption", content.text);
    }
    formData.append("access_token", accessToken);

    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error?.message || "Failed to post to Instagram" };
    }

    const data = await response.json();
    return { success: true, postId: data.id };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Post to Twitter/X
 */
export async function postToTwitter(
  userId: number,
  content: PostContent
): Promise<{ success: boolean; postId?: string; error?: string }> {
  try {
    const connection = await getSocialConnectionByPlatform(userId, "twitter");
    if (!connection) {
      return { success: false, error: "Twitter account not connected" };
    }

    const baseUrl = process.env.APP_URL || "http://localhost:3000";
    const accessToken = await getValidAccessToken(baseUrl, userId, "twitter");
    if (!accessToken) {
      return { success: false, error: "Failed to get valid access token" };
    }

    // Twitter API v2 endpoint
    const endpoint = "https://api.twitter.com/2/tweets";

    const payload: any = {
      text: content.text,
    };

    if (content.hashtags && content.hashtags.length > 0) {
      payload.text += " " + content.hashtags.map((tag) => `#${tag}`).join(" ");
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.errors?.[0]?.message || "Failed to post to Twitter" };
    }

    const data = await response.json();
    return { success: true, postId: data.data.id };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Post to LinkedIn
 */
export async function postToLinkedIn(
  userId: number,
  content: PostContent
): Promise<{ success: boolean; postId?: string; error?: string }> {
  try {
    const connection = await getSocialConnectionByPlatform(userId, "linkedin");
    if (!connection) {
      return { success: false, error: "LinkedIn account not connected" };
    }

    const baseUrl = process.env.APP_URL || "http://localhost:3000";
    const accessToken = await getValidAccessToken(baseUrl, userId, "linkedin");
    if (!accessToken) {
      return { success: false, error: "Failed to get valid access token" };
    }

    // LinkedIn API endpoint
    const endpoint = "https://api.linkedin.com/v2/ugcPosts";

    const payload = {
      author: `urn:li:person:${connection.platformUserId}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: content.text,
          },
          shareMediaCategory: "ARTICLE",
          media: [],
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || "Failed to post to LinkedIn" };
    }

    const data = await response.json();
    return { success: true, postId: data.id };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Post to Facebook
 */
export async function postToFacebook(
  userId: number,
  content: PostContent
): Promise<{ success: boolean; postId?: string; error?: string }> {
  try {
    const connection = await getSocialConnectionByPlatform(userId, "facebook");
    if (!connection) {
      return { success: false, error: "Facebook account not connected" };
    }

    const baseUrl = process.env.APP_URL || "http://localhost:3000";
    const accessToken = await getValidAccessToken(baseUrl, userId, "facebook");
    if (!accessToken) {
      return { success: false, error: "Failed to get valid access token" };
    }

    // Facebook Graph API endpoint
    const endpoint = `https://graph.facebook.com/v18.0/${connection.platformUserId}/feed`;

    const formData = new FormData();
    formData.append("message", content.text);
    if (content.imageUrl) {
      formData.append("picture", content.imageUrl);
    }
    formData.append("access_token", accessToken);

    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error?.message || "Failed to post to Facebook" };
    }

    const data = await response.json();
    return { success: true, postId: data.id };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Post to YouTube
 */
export async function postToYouTube(
  userId: number,
  content: PostContent
): Promise<{ success: boolean; postId?: string; error?: string }> {
  try {
    const connection = await getSocialConnectionByPlatform(userId, "youtube");
    if (!connection) {
      return { success: false, error: "YouTube account not connected" };
    }

    const baseUrl = process.env.APP_URL || "http://localhost:3000";
    const accessToken = await getValidAccessToken(baseUrl, userId, "youtube");
    if (!accessToken) {
      return { success: false, error: "Failed to get valid access token" };
    }

    // YouTube API endpoint for community posts
    const endpoint = `https://www.googleapis.com/youtube/v3/activities`;

    const payload = {
      snippet: {
        type: "upload",
        groupId: connection.platformUserId,
        title: content.text.substring(0, 100),
        description: content.text,
      },
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error?.message || "Failed to post to YouTube" };
    }

    const data = await response.json();
    return { success: true, postId: data.id };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Post to TikTok
 */
export async function postToTikTok(
  userId: number,
  content: PostContent
): Promise<{ success: boolean; postId?: string; error?: string }> {
  try {
    const connection = await getSocialConnectionByPlatform(userId, "tiktok");
    if (!connection) {
      return { success: false, error: "TikTok account not connected" };
    }

    const baseUrl = process.env.APP_URL || "http://localhost:3000";
    const accessToken = await getValidAccessToken(baseUrl, userId, "tiktok");
    if (!accessToken) {
      return { success: false, error: "Failed to get valid access token" };
    }

    // TikTok API endpoint
    const endpoint = `https://open.tiktok.com/v1/post/publish/action/publish/`;

    const payload = {
      data: {
        access_token: accessToken,
        video: {
          source: {
            video_url: content.videoUrl || "",
          },
        },
        post_info: {
          title: content.text,
          description: content.text,
        },
      },
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error?.message || "Failed to post to TikTok" };
    }

    const data = await response.json();
    return { success: true, postId: data.data?.video_id };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Post to multiple platforms
 */
export async function postToMultiplePlatforms(
  userId: number,
  platforms: string[],
  content: PostContent
): Promise<{ platform: string; success: boolean; postId?: string; error?: string }[]> {
  const results = [];

  for (const platform of platforms) {
    let result;

    switch (platform) {
      case "instagram":
        result = await postToInstagram(userId, content);
        break;
      case "twitter":
        result = await postToTwitter(userId, content);
        break;
      case "linkedin":
        result = await postToLinkedIn(userId, content);
        break;
      case "facebook":
        result = await postToFacebook(userId, content);
        break;
      case "youtube":
        result = await postToYouTube(userId, content);
        break;
      case "tiktok":
        result = await postToTikTok(userId, content);
        break;
      default:
        result = { success: false, error: `Unknown platform: ${platform}` };
    }

    results.push({
      platform,
      ...result,
    });
  }

  return results;
}
