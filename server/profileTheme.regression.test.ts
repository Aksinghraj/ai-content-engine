import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) => readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("professional profile and theme modes", () => {
  it("renders a professional introduction with editable professional identity fields", () => {
    const profile = read("client/src/pages/ProfileAdvanced.tsx");
    expect(profile).toContain("Professional introduction");
    expect(profile).toContain("Professional title");
    expect(profile).toContain("Areas of expertise");
    expect(profile).toContain("Availability");
    expect(profile).toContain("Profile complete");
  });

  it("persists bright, dark, and system theme choices while updating the root theme class", () => {
    const context = read("client/src/contexts/ThemeContext.tsx");
    const settings = read("client/src/pages/SettingsAdvanced.tsx");
    const layout = read("client/src/components/DashboardLayout.tsx");
    expect(context).toContain('type Theme = "light" | "dark" | "auto"');
    expect(context).toContain("localStorage.setItem(STORAGE_KEY, nextTheme)");
    expect(context).toContain("setThemeMutation.mutate({ theme: nextTheme })");
    expect(context).toContain('root.classList.toggle("dark", effectiveTheme === "dark")');
    expect(settings).toContain('label: "Bright"');
    expect(settings).toContain('label: "Dark"');
    expect(settings).toContain('label: "System"');
    expect(layout).toContain("toggleTheme");
  });
});
