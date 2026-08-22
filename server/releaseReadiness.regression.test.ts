import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(__dirname, "..");
const readProject = (relativePath: string) => readFileSync(resolve(projectRoot, relativePath), "utf8");

describe("Google Play release readiness safeguards", () => {
  it("provides real, comprehensive account erasure and a public web deletion route", () => {
    const deletionRouter = readProject("server/routers/accountDeletion.ts");
    const settings = readProject("client/src/pages/SettingsAdvanced.tsx");
    const app = readProject("client/src/App.tsx");
    const privacy = readProject("client/src/pages/PrivacyPolicy.tsx");
    const publicDeletion = readProject("client/src/pages/DeleteAccount.tsx");

    expect(deletionRouter).toContain("await db.transaction");
    expect(deletionRouter).toContain("await tx.delete(webAuthnPasskeys)");
    expect(deletionRouter).toContain("await tx.delete(trustedDevices)");
    expect(deletionRouter).toContain("await tx.delete(localAuthCredentials)");
    expect(deletionRouter).toContain("await tx.delete(businessContacts)");
    expect(deletionRouter).toContain("await tx.delete(socialConnections)");
    expect(deletionRouter).toContain("deleteHeartbeatJob");
    expect(settings).toContain("trpc.auth.account.deleteAccount.useMutation");
    expect(settings).toContain('Type DELETE to continue');
    expect(app).toContain('path="/delete-account"');
    expect(privacy).toContain('href="/delete-account"');
    expect(publicDeletion).toContain("Sign in to delete your account");
  });

  it("keeps website tracking consented and excludes web ads and analytics from the native Android container", () => {
    const html = readProject("client/index.html");
    const consent = readProject("client/src/components/CookieConsentBanner.tsx");

    expect(html).toContain("window.__lumaeNativeContainer");
    expect(html).toContain("window.loadLumaeWebTracking");
    expect(html).toContain("window.__lumaeNativeContainer || localStorage.getItem('cookie-consent') !== 'accepted-all'");
    expect(html).not.toContain('<script async src="https://pagead2.googlesyndication.com');
    expect(html).not.toContain('<script async src="https://www.googletagmanager.com');
    expect(html).not.toContain('src="%VITE_ANALYTICS_ENDPOINT%/umami"');
    expect(html).toContain("const umamiEndpoint = '%VITE_ANALYTICS_ENDPOINT%'");
    expect(consent).toContain("window.loadLumaeWebTracking?.()");
  });

  it("keeps the Android release constrained to a secure API 36 web container", () => {
    const manifest = readProject("android/app/src/main/AndroidManifest.xml");
    const gradle = readProject("android/app/build.gradle");
    const variables = readProject("android/variables.gradle");

    expect(manifest).toContain('android:usesCleartextTraffic="false"');
    expect(manifest).toContain('android.permission.INTERNET');
    expect(manifest).not.toContain('android.permission.READ_CONTACTS');
    expect(manifest).not.toContain('android.permission.SEND_SMS');
    expect(gradle).toContain('applicationId "in.lumae.app"');
    expect(gradle).toContain("minifyEnabled true");
    expect(gradle).toContain("shrinkResources true");
    expect(variables).toContain("targetSdkVersion = 36");
  });
});
