import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) => readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("smart generator length preferences", () => {
  it("provides platform-specific presets and live speaking-time guidance", () => {
    const page = read("client/src/pages/Generator.tsx");
    expect(page).toContain("const PLATFORM_LENGTH_PRESETS");
    expect(page).toContain("Recommended for {formData.platform}");
    expect(page).toContain("Apply");
    expect(page).toContain("Length guide:");
    expect(page).toContain("spoken video");
  });

  it("persists only the signed-in user's validated generator length defaults", () => {
    const schema = read("drizzle/schema.ts");
    const db = read("server/db.ts");
    const router = read("server/routers.ts");
    const page = read("client/src/pages/Generator.tsx");
    expect(schema).toContain("generatorLengthPreferences");
    expect(schema).toContain("generator_length_preferences_user_unique");
    expect(db).toContain("getGeneratorLengthPreference(userId: number)");
    expect(db).toContain("saveGeneratorLengthPreference(userId: number");
    expect(router).toContain("lengthPreferences: protectedProcedure");
    expect(router).toContain("saveLengthPreferences: protectedProcedure");
    expect(page).toContain("Save defaults");
    expect(page).toContain("hasRestoredLengthPreferences");
  });
});
