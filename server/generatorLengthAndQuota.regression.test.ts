import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) => readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("custom generator lengths and Basic Script Free quota clarity", () => {
  it("supports validated custom video seconds and script word targets in the UI and API", () => {
    const page = read("client/src/pages/Generator.tsx");
    const router = read("server/routers.ts");
    const generator = read("server/_core/contentGenerator.ts");

    expect(page).toContain('code: "custom", name: "Custom duration…"');
    expect(page).toContain('code: "custom", name: "Custom word target…"');
    expect(page).toContain("customVideoSeconds < 5 || customVideoSeconds > 3600");
    expect(page).toContain("customScriptWordTarget < 25 || customScriptWordTarget > 3000");
    expect(router).toContain("customVideoSeconds: z.number().int().min(5).max(3600).optional()");
    expect(router).toContain("customScriptWordTarget: z.number().int().min(25).max(3000).optional()");
    expect(generator).toContain("approximately ${customVideoSeconds} seconds");
    expect(generator).toContain("approximately ${customScriptWordTarget} words");
  });

  it("makes the Basic Script Free rolling quota explicit and independent of paid credits", () => {
    const page = read("client/src/pages/BasicScriptGeneration.tsx");
    expect(page).toContain("3 script generations per rolling 24 hours");
    expect(page).toContain("No credits used");
  });
});
