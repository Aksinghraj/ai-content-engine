import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(__dirname, "..");
const home = readFileSync(resolve(projectRoot, "client/src/pages/Home.tsx"), "utf8");
const indexHtml = readFileSync(resolve(projectRoot, "client/index.html"), "utf8");
const serviceWorker = readFileSync(resolve(projectRoot, "client/public/sw.js"), "utf8");

describe("landing-page premium redesign", () => {
  it("uses authentication-aware navbar actions and an accessible fixed-size logo", () => {
    expect(home).toContain('alt="Lumae AI"');
    expect(home).toContain("width={size}");
    expect(home).toContain("height={size}");
    expect(home).toContain("Log In");
    expect(home).toContain("Sign Up");
    expect(home).toContain("signedIn ?");
  });

  it("uses the neutral premium accent and free-trial CTA", () => {
    expect(home).toContain("#0071e3");
    expect(home).toContain("#0a0a0b");
    expect(home).toContain("Generate My First Post Free");
    expect(home).toContain("Match your voice. Optimize every platform.");
    expect(indexHtml).toContain('<meta name="theme-color" content="#0a0a0b"');
  });

  it("uses network-first HTML navigation so releases do not remain cached", () => {
    expect(serviceWorker).toContain("lumae-ai-v2");
    expect(serviceWorker).toContain("event.request.mode === 'navigate'");
  });
});
