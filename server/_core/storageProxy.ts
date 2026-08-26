import type { Express } from "express";
import { ENV } from "./env";

const LUMAE_PREVIEW_EAGLE_VIDEO_KEY = "lumae-eagle-dive-motion_84502f79.mp4";

export function registerStorageProxy(app: Express) {
  app.get("/manus-storage/*", async (req, res) => {
    const key = (req.params as any)[0] as string;
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }

    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(500).send("Storage proxy not configured");
      return;
    }

    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/",
      );
      forgeUrl.searchParams.set("path", key);

      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` },
      });

      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }

      const { url } = (await forgeResp.json()) as { url: string };
      if (!url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }

      // The public Lumae preview video must remain same-origin so production
      // CSP can stay restrictive while browsers load the MP4 without a redirect.
      if (key === LUMAE_PREVIEW_EAGLE_VIDEO_KEY) {
        const range = typeof req.headers.range === "string" ? req.headers.range : undefined;
        const videoResp = await fetch(url, {
          headers: range ? { Range: range } : undefined,
        });

        if (!videoResp.ok) {
          console.error(`[StorageProxy] preview video error: ${videoResp.status}`);
          res.status(502).send("Preview media unavailable");
          return;
        }

        const contentLength = videoResp.headers.get("content-length");
        const contentRange = videoResp.headers.get("content-range");
        res.status(videoResp.status === 206 ? 206 : 200);
        res.set("Content-Type", videoResp.headers.get("content-type") || "video/mp4");
        res.set("Accept-Ranges", "bytes");
        res.set("Cache-Control", "public, max-age=31536000, immutable");
        if (contentLength) res.set("Content-Length", contentLength);
        if (contentRange) res.set("Content-Range", contentRange);
        res.send(Buffer.from(await videoResp.arrayBuffer()));
        return;
      }

      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}
