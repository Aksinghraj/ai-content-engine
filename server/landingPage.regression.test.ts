import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(__dirname, "..");
const home = readFileSync(resolve(projectRoot, "client/src/pages/Home.tsx"), "utf8");
const indexHtml = readFileSync(resolve(projectRoot, "client/index.html"), "utf8");
const serviceWorker = readFileSync(resolve(projectRoot, "client/public/sw.js"), "utf8");
const styles = readFileSync(resolve(projectRoot, "client/src/index.css"), "utf8");

describe("landing-page premium redesign", () => {
  it("uses authentication-aware navbar actions and an accessible fixed-size logo", () => {
    expect(home).toContain('alt="Lumae AI"');
    expect(home).toContain("width={size}");
    expect(home).toContain("height={size}");
    expect(home).toContain("Log In");
    expect(home).toContain("Sign Up");
    expect(home).toContain("signedIn ?");
  });

  it("uses the premium accent gradient and free-trial CTA", () => {
    expect(home).toContain("#6366f1");
    expect(home).toContain("#8b5cf6");
    expect(home).toContain("#06b6d4");
    expect(home).toContain("#09090b");
    expect(home).toContain("Generate My First Post Free");
    expect(home).toContain("Match your voice. Optimize every platform.");
    expect(indexHtml).toContain('<meta name="theme-color" content="#09090b"');
  });

  it("confines decorative animation to landing-specific styles with reduced-motion support", () => {
    expect(home).toContain("IntersectionObserver");
    expect(home).toContain("lumae-landing-hero");
    expect(styles).toContain("@keyframes lumae-hero-gradient");
    expect(styles).toContain(".app-static-motion .animate-gradient");
    expect(styles).toContain("prefers-reduced-motion: reduce");
  });

  it("uses network-first HTML navigation so releases do not remain cached", () => {
    expect(serviceWorker).toContain("lumae-ai-v2");
    expect(serviceWorker).toContain("event.request.mode === 'navigate'");
  });
});
