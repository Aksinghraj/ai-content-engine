import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(__dirname, "..");
const home = readFileSync(resolve(projectRoot, "client/src/pages/Home.tsx"), "utf8");
const indexHtml = readFileSync(resolve(projectRoot, "client/index.html"), "utf8");
const serviceWorker = readFileSync(resolve(projectRoot, "client/public/sw.js"), "utf8");
const styles = readFileSync(resolve(projectRoot, "client/src/index.css"), "utf8");
const signalfield = readFileSync(resolve(projectRoot, "client/src/signalfield.css"), "utf8");

describe("landing-page premium redesign", () => {
  it("uses authentication-aware navbar actions and an accessible fixed-size logo", () => {
    expect(home).toContain('alt="Lumae AI"');
    expect(home).toContain("width={34}");
    expect(home).toContain("height={34}");
    expect(home).toContain("Log in");
    expect(home).toContain("Start creating");
    expect(home).toContain("signedIn ?");
  });

  it("uses the Signalfield accent system and free-trial CTA", () => {
    expect(signalfield).toContain("--lumae-teal: #2dd4bf");
    expect(signalfield).toContain("--lumae-coral: #ff6b5f");
    expect(home).toContain("Build your first signal");
    expect(home).toContain("Your idea.");
    expect(home).toContain("Ready for every channel.");
    expect(indexHtml).toContain('<meta name="theme-color" content="#09090b"');
  });

  it("confines decorative animation to landing-specific styles with reduced-motion support", () => {
    expect(home).toContain("IntersectionObserver");
    expect(home).toContain("lumae-signal-hero");
    expect(styles).toContain("@keyframes lumae-hero-gradient");
    expect(styles).toContain(".app-static-motion .animate-gradient");
    expect(signalfield).toContain("prefers-reduced-motion:reduce");
  });

  it("uses network-first HTML navigation so releases do not remain cached", () => {
    expect(serviceWorker).toContain("lumae-ai-v2");
    expect(serviceWorker).toContain("event.request.mode === 'navigate'");
  });
});
