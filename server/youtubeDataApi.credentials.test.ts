import { describe, expect, it } from "vitest";

describe("YouTube Data API credential", () => {
  it("authorizes a minimal most-popular-video request without exposing the key", async () => {
    const apiKey = process.env.YOUTUBE_DATA_API_KEY;
    expect(apiKey).toBeTruthy();

    const url = new URL("https://www.googleapis.com/youtube/v3/videos");
    url.search = new URLSearchParams({
      part: "id",
      chart: "mostPopular",
      regionCode: "IN",
      maxResults: "1",
      key: apiKey!,
    }).toString();

    const response = await fetch(url, { signal: AbortSignal.timeout(8_000) });
    expect(response.ok).toBe(true);
    const payload = await response.json() as { items?: unknown[] };
    expect(Array.isArray(payload.items)).toBe(true);
  }, 12_000);
});
