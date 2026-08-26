import { beforeEach, describe, expect, it, vi } from "vitest";

const getSocialConnectionByPlatform = vi.fn();
const getValidAccessToken = vi.fn();
const storageGetSignedUrl = vi.fn();

vi.mock("../db/social", () => ({
  getSocialConnectionByPlatform,
  getUserSocialConnections: vi.fn(),
}));
vi.mock("./oauthFlow", () => ({ getValidAccessToken }));
vi.mock("../storage", () => ({ storageGetSignedUrl }));

const { postToInstagram, postToLinkedIn, postToYouTube } = await import("./socialMediaPosting");

describe("provider publishing repairs", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    getSocialConnectionByPlatform.mockResolvedValue({ platformUserId: "platform-user" });
    getValidAccessToken.mockResolvedValue("valid-access-token");
    storageGetSignedUrl.mockResolvedValue("https://storage.example/social-media/asset");
  });

  it("creates and publishes an Instagram media container rather than returning the container as a post", async () => {
    const fetchMock = vi.spyOn(global, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: "container-1" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: "instagram-post-1" }), { status: 200 }));

    await expect(postToInstagram(7, { text: "A creator update", imageUrl: "/manus-storage/social-media/7/image.jpg" }))
      .resolves.toEqual({ success: true, postId: "instagram-post-1" });

    expect(fetchMock.mock.calls[0][0]).toContain("/media");
    expect(fetchMock.mock.calls[1][0]).toContain("/media_publish");
    expect(String(fetchMock.mock.calls[1][1]?.body)).toContain("creation_id=container-1");
  });

  it("uses the versioned LinkedIn Posts API with required headers", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response("", { status: 201, headers: { "x-restli-id": "urn:li:share:1" } }),
    );

    await expect(postToLinkedIn(7, { text: "A text-only post" })).resolves.toEqual({ success: true, postId: "urn:li:share:1" });

    expect(fetchMock.mock.calls[0][0]).toBe("https://api.linkedin.com/rest/posts");
    expect(fetchMock.mock.calls[0][1]?.headers).toMatchObject({
      "Linkedin-Version": "202608",
      "X-Restli-Protocol-Version": "2.0.0",
    });
  });

  it("uploads a managed video through YouTube videos.insert rather than the obsolete activities path", async () => {
    const fetchMock = vi.spyOn(global, "fetch")
      .mockResolvedValueOnce(new Response(new Uint8Array([1, 2, 3]), { status: 200, headers: { "content-type": "video/mp4", "content-length": "3" } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: "youtube-video-1" }), { status: 200 }));

    await expect(postToYouTube(7, { text: "A Lumae video", videoUrl: "/manus-storage/social-media/7/video.mp4" }))
      .resolves.toEqual({ success: true, postId: "youtube-video-1" });

    expect(String(fetchMock.mock.calls[1][0])).toContain("/upload/youtube/v3/videos");
    expect(fetchMock.mock.calls[1][1]?.headers).toMatchObject({ Authorization: "Bearer valid-access-token" });
    expect(String((fetchMock.mock.calls[1][1]?.headers as Record<string, string>)["Content-Type"])).toContain("multipart/related");
  });
});
