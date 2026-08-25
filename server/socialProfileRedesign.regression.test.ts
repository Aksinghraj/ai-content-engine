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
});
