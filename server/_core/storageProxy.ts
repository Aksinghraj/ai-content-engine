import type { Express } from "express";
import { ENV } from "./env";
import { sdk } from "./sdk";

const LUMAE_PREVIEW_EAGLE_VIDEO_KEY = "lumae-eagle-dive-motion_84502f79.mp4";

function normalizeRequestedKey(value: string): string | null {
  const key = value.replace(/^\/+/, "");
  if (!key || key.includes("\\") || key.split("/").some((part) => !part || part === "." || part === "..")) return null;
  return key;
}

function ownerIdForPrivateKey(key: string): number | null {
  const match = /^(?:feedback|social-media)\/(\d+)\//.exec(key);
  return match ? Number(match[1]) : null;
}

function isExplicitlyPublicAsset(key: string): boolean {
  return key === LUMAE_PREVIEW_EAGLE_VIDEO_KEY || key.startsWith("lumae-");
}

export function registerStorageProxy(app: Express) {
  app.get("/manus-storage/*", async (req, res) => {
    const key = normalizeRequestedKey((req.params as any)[0] as string);
    if (!key) {
      res.status(404).send("Not found");
      return;
    }

    if (!isExplicitlyPublicAsset(key)) {
      const ownerId = ownerIdForPrivateKey(key);
      if (!ownerId) {
        res.status(404).send("Not found");
        return;
      }
      try {
        const user = await sdk.authenticateRequest(req);
        if (user.isCron || (user.id !== ownerId && user.role !== "admin")) {
          res.status(404).send("Not found");
          return;
        }
      } catch {
        res.status(404).send("Not found");
        return;
      }
    }

    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(503).send("Storage unavailable");
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
        console.error(`[StorageProxy] forge error: ${forgeResp.status}`);
        res.status(502).send("Storage unavailable");
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
