import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const project = process.cwd();
const read = (relativePath: string) => readFileSync(resolve(project, relativePath), "utf8");

describe("AI Assistant layout and unified trend UI", () => {
  it("keeps the empty state compact while retaining the chat input in the same flex shell", () => {
    const source = read("client/src/pages/PersonalAI.tsx");
    expect(source).toContain("min-h-[560px]");
    expect(source).toContain("px-4 py-16 text-center");
    expect(source).toContain("placeholder=\"Ask me anything...");
  });

  it("does not mount the public footer on authenticated application routes", () => {
    const source = read("client/src/App.tsx");
    expect(source).toContain("showPublicFooter");
    expect(source).toContain("{showPublicFooter && <Footer />}");
  });

  it("labels trend provenance and changes only Niche, Style, and Goal when a chip is selected", () => {
    const source = read("client/src/pages/Generator.tsx");
    expect(source).toContain("AI-estimated");
    expect(source).toContain("Live YouTube topics");
    expect(source).toContain("const applyTrendToBrief");
    expect(source).toContain("niche: topic.title");
    expect(source).toContain("contentStyle: topic.suggestedStyle");
    expect(source).toContain("goal: topic.suggestedGoal");
    expect(source).not.toContain("platform: topic.source");
  });
});
