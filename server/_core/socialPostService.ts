import { decryptToken } from "./oauthService";
import * as db from "../db";

export interface SocialPost {
  content: string;
  mediaUrls?: string[];
  hashtags?: string[];
  scheduledFor?: Date;
}

export interface PublishResult {
  platform: string;
  success: boolean;
  postId?: string;
  url?: string;
  error?: string;
}

/**
 * Publish a post to Instagram
 */
export async function publishToInstagram(
  accessToken: string,
  content: string,
  mediaUrls?: string[]
): Promise<PublishResult> {
  try {
    const decryptedToken = decryptToken(accessToken);

    // Instagram requires media to be uploaded first
    if (!mediaUrls || mediaUrls.length === 0) {
      return {
        platform: "instagram",
        success: false,
        error: "Instagram requires at least one image",
      };
    }

    // Step 1: Create media container
    const mediaResponse = await fetch(
      "https://graph.instagram.com/v18.0/me/media",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${decryptedToken}`,
        },
        body: JSON.stringify({
          image_url: mediaUrls[0],
          caption: content,
        }),
      }
    );

    if (!mediaResponse.ok) {
      const error = await mediaResponse.text();
      throw new Error(`Instagram media creation failed: ${error}`);
    }

    const mediaData = await mediaResponse.json();

    // Step 2: Publish the media
    const publishResponse = await fetch(
      `https://graph.instagram.com/v18.0/${mediaData.id}/publish`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${decryptedToken}`,
        },
      }
    );

    if (!publishResponse.ok) {
      const error = await publishResponse.text();
      throw new Error(`Instagram publish failed: ${error}`);
    }

    const publishData = await publishResponse.json();

    return {
      platform: "instagram",
      success: true,
      postId: publishData.id,
      url: `https://instagram.com/p/${publishData.id}`,
    };
  } catch (error) {
    console.error("[SocialPost] Instagram publish error:", error);
    return {
      platform: "instagram",
      success: false,
      error: (error as Error).message,
    };
  }
}

/**
 * Publish a post to Facebook
 */
export async function publishToFacebook(
  accessToken: string,
  content: string,
  mediaUrls?: string[]
): Promise<PublishResult> {
  try {
    const decryptedToken = decryptToken(accessToken);

    const body: any = {
      message: content,
      access_token: decryptedToken,
    };

    // Add image if provided
    if (mediaUrls && mediaUrls.length > 0) {
      body.picture = mediaUrls[0];
    }

    const response = await fetch("https://graph.facebook.com/v18.0/me/feed", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Facebook publish failed: ${error}`);
    }

    const data = await response.json();

    return {
      platform: "facebook",
      success: true,
      postId: data.id,
      url: `https://facebook.com/${data.id}`,
    };
  } catch (error) {
    console.error("[SocialPost] Facebook publish error:", error);
    return {
      platform: "facebook",
      success: false,
      error: (error as Error).message,
    };
  }
}

/**
 * Publish a post to Twitter/X
 */
export async function publishToTwitter(
  accessToken: string,
  content: string
): Promise<PublishResult> {
  try {
    const decryptedToken = decryptToken(accessToken);

    // Twitter has a 280 character limit
    if (content.length > 280) {
      return {
        platform: "twitter",
        success: false,
        error: "Tweet exceeds 280 character limit",
      };
    }

    const response = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${decryptedToken}`,
      },
      body: JSON.stringify({
        text: content,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Twitter publish failed: ${error}`);
    }

    const data = await response.json();

    return {
      platform: "twitter",
      success: true,
      postId: data.data.id,
      url: `https://twitter.com/i/web/status/${data.data.id}`,
    };
  } catch (error) {
    console.error("[SocialPost] Twitter publish error:", error);
    return {
      platform: "twitter",
      success: false,
      error: (error as Error).message,
    };
  }
}

/**
 * Publish a post to LinkedIn
 */
export async function publishToLinkedIn(
  accessToken: string,
  content: string,
  mediaUrls?: string[]
): Promise<PublishResult> {
  try {
    const decryptedToken = decryptToken(accessToken);

    const body: any = {
      commentary: content,
      visibility: "PUBLIC",
    };

    // Add media if provided
    if (mediaUrls && mediaUrls.length > 0) {
      body.content = {
        media: {
          title: "Shared content",
          description: content,
          originalUrl: mediaUrls[0],
        },
      };
    }

    const response = await fetch(
      "https://api.linkedin.com/v2/ugcPosts",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${decryptedToken}`,
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`LinkedIn publish failed: ${error}`);
    }

    const data = await response.json();

    return {
      platform: "linkedin",
      success: true,
      postId: data.id,
      url: `https://linkedin.com/feed/update/${data.id}`,
    };
  } catch (error) {
    console.error("[SocialPost] LinkedIn publish error:", error);
    return {
      platform: "linkedin",
      success: false,
      error: (error as Error).message,
    };
  }
}

/**
 * Publish a video to YouTube
 */
export async function publishToYouTube(
  accessToken: string,
  title: string,
  description: string,
  videoUrl: string,
  tags?: string[]
): Promise<PublishResult> {
  try {
    const decryptedToken = decryptToken(accessToken);

    // YouTube requires video file upload, which is complex
    // This is a simplified implementation
    const body = {
      snippet: {
        title,
        description,
        tags: tags || [],
        categoryId: "22", // People & Blogs
      },
      status: {
        privacyStatus: "public",
      },
    };

    const response = await fetch(
      "https://www.googleapis.com/youtube/v3/videos?part=snippet,status&uploadType=multipart",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${decryptedToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`YouTube publish failed: ${error}`);
    }

    const data = await response.json();

    return {
      platform: "youtube",
      success: true,
      postId: data.id,
      url: `https://youtube.com/watch?v=${data.id}`,
    };
  } catch (error) {
    console.error("[SocialPost] YouTube publish error:", error);
    return {
      platform: "youtube",
      success: false,
      error: (error as Error).message,
    };
  }
}

/**
 * Publish a video to TikTok
 */
export async function publishToTikTok(
  accessToken: string,
  content: string,
  videoUrl: string
): Promise<PublishResult> {
  try {
    const decryptedToken = decryptToken(accessToken);

    // TikTok video upload is complex and requires special handling
    // This is a simplified implementation
    const response = await fetch(
      "https://open.tiktokapis.com/v1/video/upload/",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${decryptedToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          video_url: videoUrl,
          description: content,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`TikTok publish failed: ${error}`);
    }

    const data = await response.json();

    return {
      platform: "tiktok",
      success: true,
      postId: data.video_id,
      url: `https://tiktok.com/@user/video/${data.video_id}`,
    };
  } catch (error) {
    console.error("[SocialPost] TikTok publish error:", error);
    return {
      platform: "tiktok",
      success: false,
      error: (error as Error).message,
    };
  }
}

/**
 * Publish to multiple platforms
 */
export async function publishToMultiplePlatforms(
  userId: number,
  post: SocialPost,
  platforms: string[]
): Promise<PublishResult[]> {
  const results: PublishResult[] = [];

  for (const platform of platforms) {
    try {
      // Get user's connection for this platform
      const connection = await db.getSocialConnection(userId, platform);

      if (!connection || !connection.isConnected || !connection.accessToken) {
        results.push({
          platform,
          success: false,
          error: "Account not connected",
        });
        continue;
      }

      // Publish based on platform
      let result: PublishResult;

      switch (platform) {
        case "instagram":
          result = await publishToInstagram(
            connection.accessToken,
            post.content,
            post.mediaUrls
          );
          break;
        case "facebook":
          result = await publishToFacebook(
            connection.accessToken,
            post.content,
            post.mediaUrls
          );
          break;
        case "twitter":
          result = await publishToTwitter(connection.accessToken, post.content);
          break;
        case "linkedin":
          result = await publishToLinkedIn(
            connection.accessToken,
            post.content,
            post.mediaUrls
          );
          break;
        case "youtube":
          result = await publishToYouTube(
            connection.accessToken,
            post.content,
            post.content,
            post.mediaUrls?.[0] || ""
          );
          break;
        case "tiktok":
          result = await publishToTikTok(
            connection.accessToken,
            post.content,
            post.mediaUrls?.[0] || ""
          );
          break;
        default:
          result = {
            platform,
            success: false,
            error: "Unknown platform",
          };
      }

      results.push(result);

      // Log successful publish
      if (result.success) {
        console.log(
          `[SocialPost] Successfully published to ${platform}: ${result.postId}`
        );
      } else {
        console.error(
          `[SocialPost] Failed to publish to ${platform}: ${result.error}`
        );
      }
    } catch (error) {
      console.error(`[SocialPost] Error publishing to ${platform}:`, error);
      results.push({
        platform,
        success: false,
        error: (error as Error).message,
      });
    }
  }

  return results;
}
