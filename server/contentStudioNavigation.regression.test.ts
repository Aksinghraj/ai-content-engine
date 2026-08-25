import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { appNavigation } from "../client/src/lib/appNavigation";

const root = resolve(import.meta.dirname, "..");
const read = (relativePath: string) => readFileSync(resolve(root, relativePath), "utf8");

describe("complete Content Studio navigation", () => {
  const tabs = appNavigation.find((area) => area.label === "Content Studio")?.tabs ?? [];
  const navigation = read("client/src/components/AppNavigation.tsx");
  const styles = read("client/src/dashboardUsability.css");

  it("keeps all eight Content Studio tools on canonical deep links", () => {
    expect(tabs).toHaveLength(8);
    expect(tabs.map((tab) => tab.label)).toEqual([
      "AI Generator", "Basic Script Free", "Media Generation", "Content Rewriter",
      "Repurposing Engine", "Video Repurposing", "Format Agent", "Create Post Pro",
    ]);
    expect(tabs.every((tab) => tab.path.startsWith("/content-studio/"))).toBe(true);
  });

  it("renders Content Studio as an explicit complete selector instead of a hidden overflow rail", () => {
    expect(navigation).toContain('activeArea?.label === "Content Studio"');
    expect(navigation).toContain("lumae-group-tabs__rail--complete");
    expect(navigation).toContain("Choose one tool to keep every content task in the same workspace.");
    expect(styles).toContain("grid-template-columns: repeat(4, minmax(0, 1fr))");
    expect(styles).toContain("grid-template-columns: repeat(3, minmax(0, 1fr))");
    expect(styles).toContain("grid-template-columns: repeat(2, minmax(0, 1fr))");
    expect(styles).toContain("overflow: visible");
  });

  it("provides purpose-led cards and an accessible searchable command palette", () => {
    expect(navigation).toContain("const contentStudioTools");
    expect(navigation).toContain("Turn a brief into a post.");
    expect(navigation).toContain("Reuse one idea across channels.");
    expect(navigation).toContain("CommandDialog");
    expect(navigation).toContain("Search Content Studio tools…");
    expect(navigation).toContain("event.key.toLowerCase() === \"k\"");
    expect(navigation).toContain("lumae-tool-search");
    expect(styles).toContain(".lumae-command-palette");
    expect(styles).toContain(".lumae-group-tabs__rail--complete .lumae-group-tab small");
  });
});
