import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) => readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("profile sharing and accessibility", () => {
  it("keeps professional profile sharing private by default and filters sensitive fields from public reads", () => {
    const schema = read("drizzle/schema.ts");
    const db = read("server/db.ts");
    const router = read("server/routers/professionalProfile.ts");
    expect(schema).toContain('isPublic: boolean("isPublic").default(false)');
    expect(db).toContain("getPublicProfessionalProfileBySlug");
    expect(db).not.toMatch(/phone: professionalProfiles\.phone[\s\S]{0,80}getPublicProfessionalProfileBySlug/);
    expect(router).toContain("Choose a public profile link before enabling sharing.");
    expect(router).toContain("shareSocialLinks");
  });

  it("provides a public profile route and persistent high-contrast mode", () => {
    const app = read("client/src/App.tsx");
    const context = read("client/src/contexts/ThemeContext.tsx");
    const css = read("client/src/index.css");
    const settings = read("client/src/pages/SettingsAdvanced.tsx");
    const publicProfile = read("client/src/pages/PublicProfile.tsx");
    const profilePage = read("client/src/pages/ProfileAdvanced.tsx");
    const db = read("server/db.ts");
    expect(app).toContain('path="/u/:slug"');
    expect(context).toContain("setHighContrastMutation.mutate");
    expect(context).toContain("root.classList.toggle(\"high-contrast\", highContrast)");
    expect(css).toContain('[data-theme="light"].high-contrast');
    expect(css).toContain('[data-theme="dark"].high-contrast');
    expect(settings).toContain("High contrast");
    expect(publicProfile).toContain("QRCodeSVG");
    expect(profilePage).toContain('window.location.origin}/u/${encodeURIComponent(profile.publicSlug.trim())}');
    expect(profilePage).toContain("navigator.share");
    expect(profilePage).toContain("document.execCommand(\"copy\")");
    expect(profilePage).toContain("disabled={!profile.isPublic || !publicUrl}");
    expect(profilePage).toContain("Profile visibility: {profile.isPublic ? \"Public\" : \"Private\"}");
    expect(profilePage).toContain("const derivePublicSlug");
    expect(profilePage).toContain("Your share link is ready.");
    expect(publicProfile).toContain("recordPublicView");
    expect(publicProfile).toContain('setMeta("og:title"');
    expect(db).toContain("professionalProfileViews");
    expect(db).toContain("recordProfessionalProfileView");
    expect(db).not.toMatch(/professionalProfileViews[\s\S]{0,180}(ipAddress|userAgent|visitorId)/i);
  });
});
