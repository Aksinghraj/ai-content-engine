import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (relativePath: string) => readFileSync(resolve(root, relativePath), "utf8");

describe("secure social profile redesign", () => {
  const schema = read("drizzle/schema.ts");
  const db = read("server/db.ts");
  const router = read("server/routers/professionalProfile.ts");
  const profilePage = read("client/src/pages/ProfileAdvanced.tsx");
  const publicPage = read("client/src/pages/PublicProfile.tsx");
  const appearance = read("client/src/lib/profileAppearance.ts");
  const profileCss = read("client/src/dashboardUsability.css");

  it("persists the new social-profile identity and privacy fields", () => {
    expect(schema).toContain('username: varchar("username", { length: 80 })');
    expect(schema).toContain('profileStatus: varchar("profileStatus", { length: 100 })');
    expect(schema).toContain('collaborationOpen: boolean("collaborationOpen").default(false).notNull()');
    expect(schema).toContain("professional_profiles_username_unique");
  });

  it("keeps public sharing private by default and returns a locked state rather than private details", () => {
    expect(router).toContain("isPublic: false");
    expect(db).toContain('visibility: "locked" as const');
    expect(db).toContain('visibility: "public" as const');
    expect(publicPage).toContain("profile.visibility === \"locked\"");
    expect(publicPage).toContain("No private activity, account, or contact details are shown.");
  });

  it("uses factual private Lumae counts and does not expose them in the public page", () => {
    expect(db).toContain("getProfessionalProfileActivity");
    expect(db).toContain("generatedContent");
    expect(db).toContain("connectedAccounts");
    expect(profilePage).toContain("Private Lumae activity");
    expect(publicPage).not.toContain("Private Lumae activity");
  });

  it("offers the requested social profile areas and an editable privacy workflow", () => {
    for (const label of ["Profile info", "Activity", "Highlights", "Posts", "Saved", "Settings"]) {
      expect(profilePage).toContain(`"${label}"`);
    }
    expect(profilePage).toContain("Edit profile");
    expect(profilePage).toContain("Make profile public");
    expect(profilePage).toContain("Open to collaborate");
  });

  it("defines a curated, typed appearance catalog and validates every persisted choice on the server", () => {
    for (const theme of ["signal", "violet", "sunset", "mono"]) expect(appearance).toContain(`id: "${theme}"`);
    for (const preset of ["aurora", "violet-grid", "sunrise", "ocean", "paper", "midnight"]) expect(appearance).toContain(`id: "${preset}"`);
    expect(appearance).toContain("export type ProfileThemeId");
    expect(appearance).toContain("export type CoverPresetId");
    expect(appearance).toContain("getCoverPreset");
    expect(router).toContain('profileTheme: z.enum(["signal", "violet", "sunset", "mono"]).default("signal")');
    expect(router).toContain('coverPreset: z.enum(["aurora", "violet-grid", "sunrise", "ocean", "paper", "midnight"]).default("aurora")');
  });

  it("persists appearance safely, gives uploaded covers precedence, and keeps the locked response minimal", () => {
    expect(schema).toContain('profileTheme: varchar("profileTheme", { length: 32 }).default("signal").notNull()');
    expect(schema).toContain('coverPreset: varchar("coverPreset", { length: 32 }).default("aurora").notNull()');
    expect(db).toContain("profileTheme: profile.profileTheme");
    expect(db).toContain("coverPreset: profile.coverPreset");
    expect(profilePage).toContain("coverUrl ? <img src={coverUrl}");
    expect(publicPage).toContain("profile.coverUrl ? <img src={profile.coverUrl}");
    expect(publicPage).toContain("getCoverPreset(profile.coverPreset)");
    const lockedReturn = db.slice(db.indexOf('visibility: "locked"'), db.indexOf('visibility: "public"'));
    expect(lockedReturn).not.toContain("profileTheme");
    expect(lockedReturn).not.toContain("coverPreset");
  });

  it("scopes theme styling to profile surfaces without mutating the overall Lumae theme", () => {
    expect(profilePage).toContain("data-profile-theme={profile.profileTheme}");
    expect(publicPage).toContain('data-profile-theme={profile.profileTheme || "signal"}');
    expect(profileCss).toContain('[data-profile-theme="violet"]');
    expect(profileCss).toContain('[data-profile-theme] .profile-identity-accent');
  });
});
