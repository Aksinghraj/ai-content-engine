# Lumae Release-Readiness Matrix

**Audit date:** 22 August 2026  
**Android package:** `in.lumae.app`  
**Release version:** `1.0` (`versionCode` 1)  
**Scope:** Lumae web application, packaged Capacitor Android app, and Google Play submission preparation.

> **Scope boundary:** This audit verifies code, configuration, automated tests, and a locally built Android App Bundle. It cannot prove production behavior on every physical device or complete account, identity, payment, signing, and policy declarations that only the Play Console owner can provide.

## Verified engineering readiness

| Area | Status | Verified evidence | Remaining action |
|---|---|---|---|
| Android package | Ready | `applicationId` and namespace are `in.lumae.app`. | Do not change after creating the Play app. |
| Android SDK target | Ready | Release targets API 36. | Keep target API current before each future Play release. [1] |
| Release optimization | Ready | Release build enables minification and resource shrinking. | Validate production behavior after each dependency upgrade. |
| Network security | Ready | `INTERNET` is the only declared permission and cleartext traffic is disabled. | Keep all API traffic on HTTPS. |
| Native data collection | Ready with declaration | Packaged Android container excludes AdSense, Google Analytics, and Umami. | In Play Console, declare only data actually handled by the app and backend. [2] |
| Website tracking and ads | Ready | Website tracking and ads load only after full cookie consent; native container excludes them. | If native ads are added, integrate and declare a supported mobile ads implementation first. |
| Account deletion | Ready | Authenticated deletion is wired in Account Settings; `/delete-account` is public; comprehensive account data erasure runs transactionally and cancels durable schedules. | Add this public URL in Play Console’s account-deletion field. [3] |
| Authentication | Ready | Email/password, Google, 2FA TOTP, passkeys, recovery codes, trusted devices, reset links, and bounded Remember Me sessions have regression coverage. | Phone OTP and GitHub remain visibly unavailable until their providers are configured. |
| Consent-first messaging | Ready but inactive | Contacts require explicit consent; email/WhatsApp delivery is disabled without verified provider configuration. | Do not claim live messaging in listing copy until Resend and Meta onboarding are completed. |
| Privacy policy | Ready for submission review | Public policy exists at `https://lumae.co.in/privacy` and links to deletion flow. | Confirm legal/business details in Play Console match the policy before release. |
| AI content | Ready with user responsibility controls | Terms prohibit illegal, harmful, deceptive, infringing, and spam use; users review output before publishing. | Do not claim that all AI output is automatically accurate or moderated. |
| Play listing materials | Ready | Drafts exist in `docs/google-play-store-listing.md` and `docs/google-play-console-field-guide.md`. | Paste into Play Console and tailor claims to enabled features only. |
| Android App Bundle | Ready for signing | Unsigned release bundle built successfully at `android/app/build/outputs/bundle/release/app-release.aab`. Final SHA-256: `821f15931eaee287849edd556ce6445ee008a7a2a5865acb54f1d77c5161b214`. | Sign with owner-controlled release key or enroll in Play App Signing. |
| Automated validation | Ready | TypeScript passes; **47 test files / 558 tests** pass. | Repeat before every release. |
| Dependency audit | Monitor | Production audit reports **0 critical, 0 high, 12 low, 32 moderate** advisories. | Review and patch remaining moderate/low transitive advisories routinely. |

## Owner-controlled Google Play actions

| Order | Console task | Value or action for Lumae |
|---|---|---|
| 1 | Create app | App name: **Lumae AI**; default language: **English (United States)**; app type: **App**; free/paid: **Free**. |
| 2 | Package name | Upload only builds with package **`in.lumae.app`**. |
| 3 | Play App Signing | Enroll in Play App Signing. Keep any upload keystore and `keystore.properties` outside source control. |
| 4 | App Link association | After Play provides the signing SHA-256 certificate, publish the matching Android App Links asset association for `lumae.co.in`. |
| 5 | Store listing | Use the prepared listing draft; upload real screenshots from the signed app, a 512×512 icon, and 1024×500 feature graphic. |
| 6 | App content | Complete privacy policy, ads declaration (**No** for the native release while ads remain excluded), content rating, target audience, and Data safety with only actually enabled data practices. |
| 7 | Account deletion | Enter **`https://lumae.co.in/delete-account`** as the web deletion URL and verify the authenticated setting flow. |
| 8 | Testing | Run an internal test first. If the developer account is a new personal account, meet the applicable closed-testing requirement before production access. [4] |
| 9 | Reviewer access | Provide a working reviewer login, test 2FA instructions, and a short note explaining provider-gated features are deliberately unavailable. |
| 10 | Production | Upload the signed `.aab`, resolve all Play pre-launch warnings, submit for review, then monitor Android vitals and crashes. |

## Physical-device checks still required

The following cannot be proven in this sandbox and must be recorded before production rollout:

1. Install the signed internal-test `.aab` on a current Android phone and an older supported Android device.
2. Verify first launch, Google sign-in, local email/password account creation, TOTP/passkey verification, logout, and account deletion.
3. Verify password reset only after an email sender/domain is configured; do not test real delivery until then.
4. Verify dark/light mode, tablet layout, display cutouts, offline behavior, rotation, and app background/return behavior.
5. Use Play Console pre-launch report results to resolve actual crash, ANR, accessibility, and device-compatibility findings.

## Explicitly deferred capabilities

| Capability | Current release behavior | Activation requirement |
|---|---|---|
| Phone OTP | Marked **Coming Soon**; sends no SMS. | Choose and configure a compliant SMS OTP provider. |
| GitHub OAuth | Marked unavailable; cannot be selected. | Create GitHub OAuth application and configure approved redirect URI/client credentials. |
| Password-reset emails | Reset links are generated securely and delivery failures revoke tokens; live sending is disabled. | Create Resend account, verify sending domain/address, and add credentials securely. |
| WhatsApp Business | Official connection status UI only; no linking or sending. | Complete Meta Business/Embedded Signup setup and configure verified credentials. |
| Business email automation | Consent-first contact management only; no outbound delivery. | Complete Resend/domain setup and explicit campaign-consent review. |

## Sources

[1] [Google Play target API requirements](https://developer.android.com/google/play/requirements/target-sdk)  
[2] [Google Play Data safety requirements](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en)  
[3] [Google Play account deletion requirements](https://support.google.com/googleplay/android-developer/answer/13327111?hl=en)  
[4] [Google Play closed testing for new personal accounts](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en)
