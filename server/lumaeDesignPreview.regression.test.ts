import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) => readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("Lumae visual design preview", () => {
  it("keeps the preview separate from secure login and uses the managed original video asset", () => {
    const preview = read("client/src/pages/LumaeDesignPreview.tsx");
    const app = read("client/src/App.tsx");
    const home = read("client/src/pages/Home.tsx");

    expect(preview).toContain('/manus-storage/lumae-falcon-motion_7162a4a1.mp4');
    expect(preview).toContain('aria-label="Lumae motion design preview"');
    expect(preview).toContain('navigate("/login")');
    expect(preview).not.toContain('cloudfront.net');
    expect(app).toContain('path="/lumae-preview"');
    expect(home).toContain('navigate("/lumae-preview")');
  });
});
