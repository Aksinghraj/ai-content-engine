import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) => readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("custom generator lengths and Basic Script Free quota clarity", () => {
  it("supports minute-based custom video duration and script word targets in the UI and API", () => {
    const page = read("client/src/pages/Generator.tsx");
    const router = read("server/routers.ts");
    const generator = read("server/_core/contentGenerator.ts");

    expect(page).toContain('code: "custom", name: "Custom duration…"');
    expect(page).toContain('code: "custom", name: "Custom word target…"');
    expect(page).toContain("Custom duration in minutes");
    expect(page).toContain("customVideoMinutes < 1 || customVideoMinutes > 60");
    expect(page).toContain("Math.round(customVideoMinutes * 60)");
    expect(page).toContain("customScriptWordTarget < 25 || customScriptWordTarget > 12000");
    expect(router).toContain("customVideoSeconds: z.number().int().min(5).max(3600).optional()");
    expect(router).toContain("customScriptWordTarget: z.number().int().min(25).max(12000).optional()");
    expect(generator).toContain("approximately ${customVideoSeconds} seconds");
    expect(generator).toContain("LONG-FORM PRIORITY:");
    expect(generator).toContain("not a 2-3 minute summary");
    expect(generator).toContain("approximately ${customScriptWordTarget} words");
  });

  it("makes the Basic Script Free rolling quota explicit and independent of paid credits", () => {
    const page = read("client/src/pages/BasicScriptGeneration.tsx");
    expect(page).toContain("3 script generations per rolling 24 hours");
    expect(page).toContain("No credits used");
  });

  it("keeps Language and the Generate Content action ahead of optional trends on mobile", () => {
    const page = read("client/src/pages/Generator.tsx");
    const languageStart = page.indexOf('<Label className="text-slate-300">Language</Label>');
    const generateStart = page.indexOf('type="submit"');
    const trendsStart = page.indexOf("Unified cached trends: Live YouTube");

    expect(page).toContain("lg:sticky lg:top-6");
    expect(languageStart).toBeGreaterThan(-1);
    expect(generateStart).toBeGreaterThan(languageStart);
    expect(trendsStart).toBeGreaterThan(generateStart);
  });
});
