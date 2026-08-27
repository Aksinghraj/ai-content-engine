import { getDb } from "../db";
import { getSocialConnectionByPlatform, getUserSocialConnections } from "../db/social";
import { getValidAccessToken } from "./oauthFlow";
import { storageGetSignedUrl } from "../storage";

const OAUTH_BASE_URL = process.env.FRONTEND_URL || "https://lumae.co.in";
const INSTAGRAM_API_VERSION = "v26.0";
const LINKEDIN_API_VERSION = "202608";
const MAX_YOUTUBE_UPLOAD_BYTES = 250 * 1024 * 1024;

function isXPublishingEnabled(): boolean {
  return process.env.X_API_PUBLISHING_APPROVED === "true";
}

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

function getManagedSocialMediaKey(mediaUrl: string): string | null {
  try {
    const resolved = new URL(mediaUrl, OAUTH_BASE_URL);
    const expectedOrigin = new URL(OAUTH_BASE_URL).origin;
    const prefix = "/manus-storage/social-media/";
    if (resolved.origin !== expectedOrigin || !resolved.pathname.startsWith(prefix)) return null;
    return decodeURIComponent(resolved.pathname.slice("/manus-storage/".length));
  } catch {
    return null;
  }
}

async function getManagedSocialMediaUrl(mediaUrl: string): Promise<string> {
  const key = getManagedSocialMediaKey(mediaUrl);
  if (!key) throw new Error("Use a Lumae-managed media file for automated publishing");
  return storageGetSignedUrl(key);
}

async function getProviderError(response: Response, fallback: string): Promise<string> {
  try {
    const payload: any = await response.json();
    return payload?.error?.message || payload?.message || payload?.errors?.[0]?.message || fallback;
  } catch {
    return fallback;
  }
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

    const baseUrl = OAUTH_BASE_URL;
    const accessToken = await getValidAccessToken(baseUrl, userId, "instagram");
    if (!accessToken) {
      return { success: false, error: "Failed to get valid access token" };
    }

    if (Boolean(content.imageUrl) === Boolean(content.videoUrl)) {
      return { success: false, error: "Instagram publishing requires exactly one Lumae-managed image or video." };
    }

    const igUserId = connection.platformUserId;
    const createParams = new URLSearchParams();
    if (content.imageUrl) {
      createParams.set("image_url", await getManagedSocialMediaUrl(content.imageUrl));
    } else if (content.videoUrl) {
      createParams.set("video_url", await getManagedSocialMediaUrl(content.videoUrl));
      createParams.set("media_type", "REELS");
    }
    if (content.text) createParams.set("caption", content.text);

    const createResponse = await fetch(`https://graph.instagram.com/${INSTAGRAM_API_VERSION}/${igUserId}/media`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: createParams.toString(),
    });

    if (!createResponse.ok) {
      return { success: false, error: await getProviderError(createResponse, "Instagram could not create a media container") };
    }

    const container = await createResponse.json() as { id?: string };
    if (!container.id) return { success: false, error: "Instagram did not return a media container ID" };

    const publishResponse = await fetch(`https://graph.instagram.com/${INSTAGRAM_API_VERSION}/${igUserId}/media_publish`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ creation_id: container.id }).toString(),
    });
    if (!publishResponse.ok) {
      return { success: false, error: await getProviderError(publishResponse, "Instagram could not publish the media container") };
    }
    const published = await publishResponse.json() as { id?: string };
    return { success: true, postId: published.id || container.id };
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
    if (!isXPublishingEnabled()) {
      return {
        success: false,
        error: "X publishing is unavailable until the owner enables an approved X API budget.",
      };
    }

    const connection = await getSocialConnectionByPlatform(userId, "twitter");
    if (!connection) {
      return { success: false, error: "Twitter account not connected" };
    }

    const baseUrl = OAUTH_BASE_URL;
    const accessToken = await getValidAccessToken(baseUrl, userId, "twitter");
    if (!accessToken) {
      return { success: false, error: "Failed to get valid access token" };
    }

    // Twitter API v2 endpoint
    const endpoint = "https://api.x.com/2/tweets";

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

    const baseUrl = OAUTH_BASE_URL;
    const accessToken = await getValidAccessToken(baseUrl, userId, "linkedin");
    if (!accessToken) {
      return { success: false, error: "Failed to get valid access token" };
    }

    if (content.imageUrl || content.videoUrl) {
      return { success: false, error: "LinkedIn media posts require a separately uploaded LinkedIn asset; use text-only publishing until asset uploads are added." };
    }

    const endpoint = "https://api.linkedin.com/rest/posts";

    const payload = {
      author: `urn:li:person:${connection.platformUserId}`,
      commentary: content.text,
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      lifecycleState: "PUBLISHED",
      isReshareDisabledByAuthor: false,
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "Linkedin-Version": LINKEDIN_API_VERSION,
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return { success: false, error: await getProviderError(response, "LinkedIn could not create the post") };
    }

    const data: any = await response.json().catch(() => ({}));
    return { success: true, postId: response.headers.get("x-restli-id") || data.id };
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

    const baseUrl = OAUTH_BASE_URL;
    const accessToken = await getValidAccessToken(baseUrl, userId, "facebook");
    if (!accessToken) {
      return { success: false, error: "Failed to get valid access token" };
    }

    if (content.videoUrl) {
      return {
        success: false,
        error: "Facebook video publishing requires a dedicated Page video upload and is not available yet. Use text or one Lumae-managed image.",
      };
    }

    const endpoint = content.imageUrl
      ? `https://graph.facebook.com/v26.0/${connection.platformUserId}/photos`
      : `https://graph.facebook.com/v26.0/${connection.platformUserId}/feed`;
    const formData = new URLSearchParams();
    if (content.imageUrl) {
      formData.append("url", await getManagedSocialMediaUrl(content.imageUrl));
      if (content.text) formData.append("caption", content.text);
    } else {
      formData.append("message", content.text);
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
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

    const baseUrl = OAUTH_BASE_URL;
    const accessToken = await getValidAccessToken(baseUrl, userId, "youtube");
    if (!accessToken) {
      return { success: false, error: "Failed to get valid access token" };
    }

    if (!content.videoUrl) {
      return { success: false, error: "YouTube publishing requires a Lumae-managed video file." };
    }

    const sourceResponse = await fetch(await getManagedSocialMediaUrl(content.videoUrl));
    if (!sourceResponse.ok) return { success: false, error: "Unable to retrieve the selected YouTube video." };
    const videoContentType = sourceResponse.headers.get("content-type") || "video/mp4";
    if (!videoContentType.startsWith("video/")) return { success: false, error: "The selected YouTube media is not a video." };
    const contentLength = Number(sourceResponse.headers.get("content-length") || 0);
    if (contentLength > MAX_YOUTUBE_UPLOAD_BYTES) return { success: false, error: "YouTube media must be 250 MB or smaller." };
    const videoBytes = new Uint8Array(await sourceResponse.arrayBuffer());
    if (videoBytes.byteLength === 0 || videoBytes.byteLength > MAX_YOUTUBE_UPLOAD_BYTES) {
      return { success: false, error: "YouTube media must be between 1 byte and 250 MB." };
    }

    const boundary = `lumae-${crypto.randomUUID()}`;
    const metadata = JSON.stringify({
      snippet: {
        title: content.text.slice(0, 100) || "Lumae scheduled video",
        description: content.text,
        categoryId: "22",
      },
      // Private is the safe default until the user and project have completed YouTube's API audit.
      status: { privacyStatus: "private", selfDeclaredMadeForKids: false },
    });
    const multipartBody = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`),
      Buffer.from(`--${boundary}\r\nContent-Type: ${videoContentType}\r\n\r\n`),
      Buffer.from(videoBytes),
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);
    const endpoint = "https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status&uploadType=multipart";

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body: multipartBody,
    });

    if (!response.ok) {
      return { success: false, error: await getProviderError(response, "YouTube could not upload the video") };
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

    const baseUrl = OAUTH_BASE_URL;
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
