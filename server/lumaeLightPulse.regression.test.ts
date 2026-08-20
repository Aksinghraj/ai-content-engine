import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(__dirname, "..");
const readClient = (relativePath: string) => readFileSync(resolve(projectRoot, "client", "src", relativePath), "utf8");

describe("Lumae Light Pulse motion system", () => {
  it("defines static, active, complete, and error variants with reduced-motion fallback", () => {
    const component = readClient("components/LumaeLightPulse.tsx");
    const styles = readClient("index.css");

    expect(component).toContain('"idle" | "active" | "complete" | "error"');
    expect(component).toContain("lumae-light-pulse--${state}");
    expect(styles).toContain("@keyframes lumae-light-flow");
    expect(styles).toContain("@keyframes lumae-light-complete");
    expect(styles).toContain("@media (prefers-reduced-motion: reduce)");
    expect(styles).toContain(".lumae-light-pulse--error");
  });

  it("uses one shared motion primitive in existing AI generation, analysis, automation, and analytics states", () => {
    const generator = readClient("pages/Generator.tsx");
    const rewriter = readClient("pages/ContentRewriter.tsx");
    const assistant = readClient("pages/PersonalAI.tsx");
    const automation = readClient("pages/Automation.tsx");
    const analytics = readClient("pages/AnalyticsDashboardEnhanced.tsx");

    [generator, rewriter, assistant, automation, analytics].forEach((source) => {
      expect(source).toContain("LumaeLightPulse");
    });
    expect(generator).toContain('setGenerationPulse("complete")');
    expect(generator).toContain('setGenerationPulse("error")');
  });
});
