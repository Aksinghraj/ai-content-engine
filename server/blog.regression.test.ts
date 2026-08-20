import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const read = (relativePath: string) => readFileSync(resolve(root, relativePath), "utf8");

describe("Static blog launch", () => {
  it("ships the three real launch articles as Markdown with required frontmatter", () => {
    const files = [
      ["client/src/content/blog/introducing-auto-reply-ai.md", "introducing-auto-reply-ai", "product-updates"],
      ["client/src/content/blog/content-repurposing-framework.md", "content-repurposing-framework", "marketing-tips"],
      ["client/src/content/blog/why-i-built-lumae-ai.md", "why-i-built-lumae-ai", "company"],
    ];
    for (const [path, slug, category] of files) {
      const content = read(path);
      expect(content).toContain(`slug: "${slug}"`);
      expect(content).toContain(`category: "${category}"`);
      expect(content).toContain("author: \"founder\"");
      expect(content.split(/\s+/).length).toBeGreaterThan(150);
    }
  });

  it("uses Veer Rajput, founder photo, and confirmed Instagram link in the author catalog", () => {
    const catalog = read("client/src/lib/blog.ts");
    expect(catalog).toContain('name: "Veer Rajput"');
    expect(catalog).toContain("lumae-founder-ankit-singh_e71f093e.jpg");
    expect(catalog).toContain("veer_rajpute04");
    expect(catalog).toContain("lumaeai");
  });

  it("registers index, category, and article routes plus sitemap entries", () => {
    const routes = read("client/src/App.tsx");
    const sitemap = read("client/public/sitemap.xml");
    const home = read("client/src/pages/Home.tsx");
    expect(routes).toContain('path="/blog"');
    expect(routes).toContain('path="/blog/category/:category"');
    expect(routes).toContain('path="/blog/:category/:slug"');
    expect(sitemap).toContain("/blog/company/why-i-built-lumae-ai");
    expect(sitemap).toContain("/blog/product-updates/introducing-auto-reply-ai");
    expect(home).toContain('navigate("/blog")');
  });
});
