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

  it("introduces the motion language once through an accessible, reduced-motion-aware dialog", () => {
    const modal = readClient("components/LumaeLightPulseIntroModal.tsx");
    const layout = readClient("components/DashboardLayout.tsx");

    expect(modal).toContain('LUMAE_PULSE_INTRO_STORAGE_KEY = "lumae_pulse_intro_seen"');
    expect(modal).toContain('window.matchMedia("(prefers-reduced-motion: reduce)")');
    expect(modal).toContain('state={prefersReducedMotion ? "idle" : "active"}');
    expect(modal).toContain("<Dialog open={open} onOpenChange={handleOpenChange}>");
    expect(modal).toContain("Got it");
    expect(layout).toContain("<LumaeLightPulseIntroModal />");
  });

  it("records introduction dismissals only as privacy-safe daily aggregates", () => {
    const schema = readFileSync(resolve(projectRoot, "drizzle", "schema.ts"), "utf8");
    const database = readFileSync(resolve(projectRoot, "server", "db.ts"), "utf8");
    const router = readFileSync(resolve(projectRoot, "server", "routers.ts"), "utf8");
    const modal = readClient("components/LumaeLightPulseIntroModal.tsx");
    const dismissalTable = schema.slice(
      schema.indexOf("export const lumaePulseIntroDismissals"),
      schema.indexOf("export type LumaePulseIntroDismissal")
    );

    expect(schema).toContain("lumaePulseIntroDismissals");
    expect(schema).toContain("dismissalDate");
    expect(dismissalTable).not.toMatch(/userId|sessionId|deviceId|ipAddress|userAgent/i);
    expect(database).toContain("recordLumaePulseIntroDismissal");
    expect(database).toContain("getLumaePulseIntroDismissalSummary");
    expect(router).toContain("recordDismissal: protectedProcedure");
    expect(router).toContain("dismissalSummary: protectedProcedure");
    expect(modal).toContain("recordDismissal.mutateAsync().catch(() => undefined)");
    expect(modal).toContain("dismissalRecordedRef");
  });
});
