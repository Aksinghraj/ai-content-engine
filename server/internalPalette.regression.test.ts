import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("Internal premium palette and motion boundary", () => {
  const css = read("client/src/index.css");

  it("defines the requested premium surface, text, border, semantic, and chart tokens", () => {
    for (const token of ["--background: #09090b", "--card: #141417", "--border: #26262b", "--foreground: #f5f5f7", "--muted-foreground: #9a9aa2", "--chart-1: #6366f1", "--chart-2: #8b5cf6", "--chart-3: #06b6d4", "--chart-4: #10b981", "--chart-5: #f59e0b"]) {
      expect(css).toContain(token);
    }
  });

  it("normalizes legacy purple, pink, blue, and slate utility color families inside the internal shell", () => {
    expect(css).toContain('[class*="text-purple"]');
    expect(css).toContain('.app-static-motion [class*="bg-blue"]');
    expect(css).toContain('.app-static-motion [class*="bg-slate"]');
    expect(css).toContain('.app-static-motion [class*="min-h-screen"][class*="bg-gradient-to-"]');
  });

  it("keeps internal workflows static while allowing concise standard interaction transitions", () => {
    expect(css).toContain(".app-static-motion .animate-gradient");
    expect(css).toContain("animation: none !important");
    expect(css).toContain("transition-duration: 180ms");
    expect(read("client/src/components/DashboardLayout.tsx")).toContain('className="app-static-motion"');
  });
});
