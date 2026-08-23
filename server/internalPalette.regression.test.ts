import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("Internal premium palette and motion boundary", () => {
  const css = read("client/src/index.css");
  const signalfield = read("client/src/signalfield.css");

  it("defines a distinct Signalfield surface, text, and semantic accent system", () => {
    for (const token of ["--lumae-ink: #0a1116", "--lumae-panel: #111c22", "--lumae-line: #263940", "--lumae-copy: #f5f7f6", "--lumae-muted: #9aabb2", "--lumae-teal: #2dd4bf", "--lumae-sea: #78e2d0", "--lumae-coral: #ff6b5f", "--lumae-positive: #38c892"]) {
      expect(signalfield).toContain(token);
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
    expect(read("client/src/components/DashboardLayout.tsx")).toContain('className="app-static-motion lumae-product-shell"');
  });
});
