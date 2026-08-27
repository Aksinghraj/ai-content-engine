import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) => readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("language and OAuth recovery", () => {
  it("uses the registered short callbacks for Facebook, YouTube, LinkedIn, and X while retaining Instagram Business Login", () => {
    const platforms = read("server/_core/oauthPlatforms.ts");
    const callbacks = read("server/routes/oauthCallbackSecure.ts");
    expect(platforms).toContain('platform === "instagram"');
    expect(platforms).toContain('`${baseUrl}/api/oauth/callback/${platform}`');
    expect(callbacks).toContain('router.get("/linkedin"');
    expect(callbacks).toContain('router.get("/facebook"');
    expect(callbacks).toContain('router.get("/youtube"');
    expect(callbacks).toContain('router.get("/twitter"');
    expect(callbacks).toContain('/scheduling/connected-accounts?error=');
  });

  it("keeps Bhojpuri selectable, persisted, and explicitly requested by the server generator", () => {
    const generator = read("client/src/pages/Generator.tsx");
    const contentGenerator = read("server/_core/contentGenerator.ts");
    const preferenceRouter = read("server/routers/accountPreferences.ts");
    expect(generator).toContain('{ code: "bho", name: "Bhojpuri" }');
    expect(generator).toContain("trpc.accountPreferences.setLanguage.useMutation");
    expect(contentGenerator).toContain('bho: "Bhojpuri"');
    expect(contentGenerator).toContain("Do not silently switch to Hindi or English");
    expect(preferenceRouter).toContain('"bho"');
  });
});
