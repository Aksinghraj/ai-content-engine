import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "..");
const read = (relativePath: string) => readFileSync(resolve(root, relativePath), "utf8");

describe("Lumae Android release configuration", () => {
  it("uses the permanent in.lumae.app identity and an API 36 Play target", () => {
    const capacitorConfig = read("capacitor.config.ts");
    const gradle = read("android/app/build.gradle");
    const variables = read("android/variables.gradle");
    const strings = read("android/app/src/main/res/values/strings.xml");

    expect(capacitorConfig).toContain("appId: 'in.lumae.app'");
    expect(capacitorConfig).toContain("appName: 'Lumae AI'");
    expect(gradle).toContain('namespace = "in.lumae.app"');
    expect(gradle).toContain('applicationId "in.lumae.app"');
    expect(variables).toContain("targetSdkVersion = 36");
    expect(strings).toContain("<string name=\"app_name\">Lumae AI</string>");
  });

  it("keeps release signing external and records secure Play release requirements", () => {
    const gradle = read("android/app/build.gradle");
    const ignore = read("android/.gitignore");
    const manifest = read("android/app/src/main/AndroidManifest.xml");
    const releaseGuide = read("android/PLAY_RELEASE.md");

    expect(gradle).toContain("keystore.properties");
    expect(ignore).toContain("keystore.properties");
    expect(ignore).toContain("*.jks");
    expect(manifest).toContain('android:usesCleartextTraffic="false"');
    expect(manifest).toContain('android:autoVerify="true"');
    expect(releaseGuide).toContain("Play App Signing");
    expect(existsSync(resolve(root, "android/keystore.properties"))).toBe(false);
  });
});
