import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) => readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("Lumae visual design preview", () => {
  it("keeps the preview separate from secure login and uses the approved dark eagle design", () => {
    const preview = read("client/src/pages/LumaeDesignPreview.tsx");
    const app = read("client/src/App.tsx");
    const home = read("client/src/pages/Home.tsx");

    expect(preview).toContain('/api/trpc/preview-eagle.mp4');
    expect(preview).toContain('aria-label="Lumae motion design preview"');
    expect(preview).toContain('autoPlay');
    expect(preview).toContain('muted');
    expect(preview).toContain('loop');
    expect(preview).toContain('playsInline');
    expect(preview).toContain('navigate("/login")');
    expect(preview).toContain('Turn Ideas Into Content');
    expect(preview).toContain('Instantly');
    expect(preview).toContain('Welcome Back!');
    expect(preview).toContain('Built for creators who move fast');
    expect(preview.toLowerCase()).not.toContain('signal');
    expect(preview).not.toContain('cloudfront.net');
    expect(read("client/src/lumaeDesignPreview.css")).toContain('background: #09090b');
    expect(read("client/src/lumaeDesignPreview.css")).toContain('linear-gradient(180deg,#4f46e5,#7c3aed)');
    const storageProxy = read("server/_core/storageProxy.ts");
    expect(storageProxy).toContain('LUMAE_PREVIEW_EAGLE_VIDEO_KEY');
    expect(storageProxy).toContain('res.send(Buffer.from(await videoResp.arrayBuffer()))');
    const server = read("server/_core/index.ts");
    expect(server).toContain('app.get("/api/trpc/preview-eagle.mp4"');
    expect(server).toContain('storageGetSignedUrl("lumae-eagle-dive-motion_84502f79.mp4")');
    expect(app).toContain('path="/lumae-preview"');
    expect(home).toContain('navigate("/lumae-preview")');
  });
});
