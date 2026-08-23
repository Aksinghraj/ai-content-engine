# Lumae AI — Google Play Store Launch
## From production-ready app to first public Android release

**Purpose:** Give the Lumae owner a clear, practical roadmap for launching the Android app on Google Play.

---

# 1. Launch objective

## Put Lumae AI in users’ hands—securely and credibly

Lumae is prepared as a branded Android application connected to the live Lumae platform. The release goal is a controlled progression: internal testing, policy completion, closed testing when required, and production rollout.

**Lumae release identity**

| Item | Confirmed value |
|---|---|
| App name | Lumae AI |
| Android package | `in.lumae.app` |
| Initial version | 1.0 / versionCode 1 |
| Distribution | Google Play internal test → production |
| App category | Productivity |

> The Android package name is permanent after the Play app is created. Do not recreate or rename it.

---

# 2. What is already ready

## Engineering foundation: validated

Lumae’s Android release uses the current API 36 target, HTTPS-only network behavior, a minimized release build, and a successfully built Android App Bundle.

| Release control | Current status |
|---|---|
| API target | API 36 |
| Native permissions | Internet only |
| Cleartext traffic | Disabled |
| Android bundle | Built and validated |
| Automated tests | 47 files / 558 tests passing |
| Critical/high dependency findings | 0 / 0 |

**Key principle:** The app is technically ready for signing and internal testing. Owner-controlled Google Play steps remain.

---

# 3. The launch sequence

## Four controlled gates

1. **Developer account:** Create and verify the Google Play Console account.
2. **App identity:** Create “Lumae AI,” confirm `in.lumae.app`, and enroll in Play App Signing.
3. **Internal test:** Upload the signed App Bundle and validate core flows on real devices.
4. **Production review:** Complete policy declarations, resolve pre-launch findings, and submit.

**Why this sequence works**

It separates engineering verification from account, legal, and signing actions that only the owner can complete.

---

# 4. Step 1 — Create the Play developer account

## Owner action: Google Play Console

Create the developer account using the individual or business identity that should own Lumae long term. Google asks for verification and charges a one-time registration fee in the standard flow.

| Console field | Lumae value / action |
|---|---|
| Account type | Select the real long-term owner: individual or organization |
| Developer name | Lumae AI or the registered business name |
| Contact email | An actively monitored Lumae owner email |
| Website | `https://lumae.co.in` |
| Payment and verification | Complete directly in Google Play Console |

> Use the same long-term owner identity for Play Console, legal pages, and public support details.

---

# 5. Step 2 — Create the Android app

## App setup values

Create the app in Play Console with these values.

| Field | Value |
|---|---|
| App name | **Lumae AI** |
| Default language | English (United States) |
| App or game | App |
| Free or paid | Free |
| Package name | `in.lumae.app` |
| Category | Productivity |
| Contact website | `https://lumae.co.in` |
| Privacy policy | `https://lumae.co.in/privacy` |
| Account deletion URL | `https://lumae.co.in/delete-account` |

**Play App Signing:** Enroll when prompted. Keep any upload keystore outside source control.

![Google Play Console](assets/google-play-console.png)

---

# 6. Step 3 — Store listing and creative assets

## Present Lumae clearly and honestly

The store listing must describe only features that are active in the release.

| Asset / field | Requirement |
|---|---|
| App icon | 512 × 512 PNG |
| Feature graphic | 1024 × 500 PNG or JPG |
| Phone screenshots | Real screenshots from the signed app |
| Short description | One concise value proposition |
| Full description | Explain AI content creation, organization, and security controls |
| Support contact | Lumae support email + `https://lumae.co.in/contact` |

**Do not claim yet:** live phone OTP, GitHub OAuth, WhatsApp sending, business email sending, or live reset-email delivery. Those remain provider-gated.

---

# 7. Step 4 — Policy, privacy, and Data safety

## Declarations must match actual behavior

Lumae’s native container excludes AdSense, Google Analytics, and Umami. Website tracking remains web-only and consent-gated.

| Play Console declaration | Lumae release position |
|---|---|
| Ads | No, for the native Android release |
| Account creation | Yes — email/password and Google sign-in |
| Account deletion | Yes — in Settings and at the public deletion URL |
| Data safety | Declare only data actually handled for account, service, and security functions |
| Children | Do not target children unless the product and policy are redesigned for that audience |
| AI disclosures | Describe AI assistance accurately; do not guarantee correctness |

> Every data-safety answer must match the shipped app, backend, and privacy policy.

---

# 8. Step 5 — Test the signed App Bundle

## Internal testing before public visibility

Upload the signed `.aab` to an **Internal testing** track first. Add the owner and trusted testers, then install through the Play test link.

**Test on physical Android devices**

| Flow | Expected result |
|---|---|
| First launch | App opens without crash or blocked web view |
| Google sign-in | Returns securely to Lumae |
| Email/password | Registration, verification, login, and logout work |
| 2FA / passkeys | Challenge and recovery paths work |
| Account deletion | In-app path and public information route are reachable |
| Navigation | Works after background/return, rotation, and offline interruption |

If the Play account is newly registered as personal, satisfy Google’s applicable closed-testing requirement before production.

---

# 9. Reviewer access and production submission

## Make the review straightforward

Provide Play reviewers with a working account and short instructions for any authentication barrier.

| Reviewer field | Recommended Lumae entry |
|---|---|
| Login required? | Yes |
| Test account | Create a dedicated review account |
| 2FA instructions | Provide the permitted authenticator/passkey test method |
| Restricted features | Phone OTP, GitHub OAuth, WhatsApp, email sending are intentionally unavailable until configured |
| Contact | Lumae support contact |

Before production, review the Play pre-launch report for crashes, ANRs, accessibility problems, and device compatibility warnings.

---

# 10. Launch-day checklist

## Final go / no-go decision

**Go only when every applicable item is complete.**

| Item | Owner status |
|---|---|
| Developer account verified | ☐ |
| Play App Signing enrolled | ☐ |
| Signed AAB uploaded | ☐ |
| Store listing assets uploaded | ☐ |
| Privacy, account deletion, and Data safety complete | ☐ |
| Internal-test device checks recorded | ☐ |
| Reviewer account and instructions entered | ☐ |
| Pre-launch report findings resolved | ☐ |
| Production release submitted | ☐ |

**After launch:** Monitor Android vitals, crashes, user feedback, authentication failures, and policy notices. Treat every update as a new release-validation cycle.

---

# References

[1] Google Play target API requirements — https://developer.android.com/google/play/requirements/target-sdk

[2] Google Play Data safety requirements — https://support.google.com/googleplay/android-developer/answer/10787469?hl=en

[3] Google Play account deletion requirements — https://support.google.com/googleplay/android-developer/answer/13327111?hl=en

[4] Google Play closed testing for new personal developer accounts — https://support.google.com/googleplay/android-developer/answer/14151465?hl=en
