# Lumae AI — Google Play Store Launch Guide

This guide explains how to launch **Lumae AI** on Google Play. The current Lumae product is a secure web application at `https://lumae.co.in`. Google Play distribution requires a separately packaged Android application, delivered as an **Android App Bundle (`.aab`)**, rather than merely a website link.[1]

> **Recommended approach:** Build a dedicated Lumae Android app connected to the existing Lumae backend. This provides an appropriate mobile experience for secure sign-in, passkeys and two-factor authentication, content generation, billing hand-offs, and Android lifecycle behavior. Do not publish a thin website-only wrapper.

## Phase 1 — Create the owner-controlled Google accounts

1. Create or use the Google account that should permanently own Lumae’s developer identity. Use a business-controlled account, not a freelancer’s personal account.
2. Open [Google Play Console](https://play.google.com/console) and create a developer account. Complete the requested identity, contact, and payment-profile verification.
3. Choose the account type carefully. Select **Organization** if Lumae is operated as a registered organization; otherwise select **Personal**. The account owner must retain recovery access and two-factor authentication.
4. In Google Play Console, select **Create app**, then enter the following initial values.

| Play Console field | Recommended Lumae value |
|---|---|
| App name | Lumae AI |
| Default language | English (India) |
| App or game | App |
| Free or paid | Free |
| Contact email | A Lumae-controlled support address |
| Package name | `in.lumae.app` — confirm this before creating it; package names are permanent and cannot be reused.[2] |

5. Accept the Play Developer Program Policies, US export declaration, and Play App Signing terms when prompted.[2]

## Phase 2 — Build the Android app

1. Confirm the permanent package name with the Lumae owner before any Android build is generated.
2. Create the Lumae Android project as a native React Native/Expo application, connected to the existing `https://lumae.co.in` backend.
3. Reuse Lumae’s existing security design: Google sign-in, email/password, password reset, passkeys, authenticator-app two-factor authentication, trusted-device expiry, secure sign-out, and rate-limit feedback.
4. Keep Phone OTP disabled until the owner separately chooses, configures, and funds an SMS provider.
5. Configure Android App Links and OAuth callbacks for the production package name, signed release certificate, and `https://lumae.co.in`.
6. Target the current Play-required Android API level. From August 31, 2026, new apps and updates must target Android 16 / API 36 or higher.[3]
7. Build a signed `.aab` release. New Play apps must use Android App Bundles; Google Play generates optimized APKs for each device configuration.[1]

## Phase 3 — Prepare security, privacy, and store materials

### Existing Lumae materials to retain

| Requirement | Current Lumae status | Android launch action |
|---|---|---|
| Privacy Policy | Available on the website | Use the public production URL in Play Console |
| Terms of Service | Available on the website | Retain the production URL |
| Support contact | Website contact flow exists | Add a monitored Lumae support email in Play Console |
| Authentication security | Google, email/password, 2FA, passkeys, recovery codes, trusted devices | Test each mobile flow before release |
| Cookies | Website consent banner exists | Native app should disclose local storage/analytics in Data safety instead of showing browser-only cookie language |

### Data safety declaration

Google Play requires every published app—including testing-track apps—to complete the Data safety form and link a privacy policy.[4] The declaration must match the final mobile app and every included third-party SDK.

For the current Lumae feature set, review and declare at minimum the following before submitting. Do **not** copy this table blindly; verify it again after the Android build is complete.

| Data category to review | Why Lumae may handle it | Expected protection statement to validate |
|---|---|---|
| Name and email address | Account creation, support, receipts | Encrypted in transit; access-controlled backend processing |
| Authentication data | Password hashes, passkey public credentials, second-factor state | Passwords are never stored in plaintext; tokens are encrypted/hashed as applicable |
| User content | Prompts, generated content, saved preferences, scheduled posts | Used to provide requested Lumae functionality |
| Payment references | Razorpay order/payment identifiers | Payment provider processing; never declare card data as collected unless the Android app itself collects it |
| Diagnostics | Crash or performance SDK data, if added | Declare only after choosing the Android SDKs |

Google requires accurate disclosure of data collected or shared by both the app and its third-party SDKs, including whether data is encrypted in transit and whether users can request deletion.[4]

### Store assets to prepare

1. **App icon:** 512 × 512 PNG, using the confirmed Lumae mark.
2. **Feature graphic:** 1024 × 500 PNG, using the Lumae dark indigo/violet/cyan visual system.
3. **Phone screenshots:** at least four genuine screenshots of the built Android app: sign-in, dashboard, AI generator, and connected-account/security experience.
4. **Short description:** up to 80 characters.
5. **Full description:** explain content generation, platform-aware creation, scheduling, analytics, and security without unsupported claims.
6. **Support email and website:** use Lumae-controlled addresses and `https://lumae.co.in`.
7. **Privacy policy URL:** use the existing public Lumae Privacy Policy URL.

## Phase 4 — Test before production

1. Upload the first signed `.aab` to **Internal testing**. Google permits up to 100 internal testers and recommends it as an early quality-control step.[5]
2. Test on physical Android phones across recent Android versions. Verify sign-up, Google sign-in, password reset, passkey/2FA, trusted-device expiry, content generation, payment handoff, logout, deep links, and error states.
3. Fix every crash, login dead end, consent issue, and broken external link before moving forward.
4. If the Play Console account is a **personal account created after November 13, 2023**, run a **closed test** with at least **12 testers opted in continuously for 14 days** before applying for production access.[6]
5. Collect tester feedback and keep a short record of issues found and resolved. Play Console asks about this testing and production-readiness work when granting production access.[6]

## Phase 5 — Complete Play Console app content

1. Complete the **App access** declaration. If reviewers need sign-in, give Google a valid review account and clear test instructions; do not share a personal owner account.[6]
2. Complete the **Ads** declaration accurately. If the mobile app includes AdSense/other ads, state that; do not declare ads if the native app does not display them.
3. Complete **Content rating** and select the correct target audience.
4. Complete **Data safety** using the final Android code, backend behavior, and third-party SDK inventory.
5. Add the privacy-policy URL, support email, store listing, screenshots, and app icon.
6. Complete any country, export, financial-feature, or account-deletion declarations that Play Console prompts for.

## Phase 6 — Release safely

1. Run Play Console’s pre-launch report and resolve material stability, compatibility, accessibility, and policy findings.
2. Upload a production `.aab`, create release notes, and start with a staged rollout rather than 100% of users on day one.
3. Monitor crashes, ANRs, sign-in failures, reviews, and policy status daily during the first week.
4. Keep the Play signing and developer-account recovery settings under Lumae owner control.

## What the Lumae owner must do next

1. Create or confirm the Google Play Console owner account.
2. Reply with the chosen permanent Android package name. The suggested option is `in.lumae.app`.
3. Confirm whether the account type is Personal or Organization.
4. Authorize creation of the separate Lumae Android app project. The Android app can then be built against the existing Lumae backend.

## References

[1] [Android Developers — About Android App Bundles](https://developer.android.com/guide/app-bundle)  
[2] [Google Play Console Help — Create and set up your app](https://support.google.com/googleplay/android-developer/answer/9859152?hl=en)  
[3] [Android Developers — Google Play target API requirements](https://developer.android.com/google/play/requirements/target-sdk)  
[4] [Google Play Console Help — Data safety section](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en)  
[5] [Google Play Console Help — Testing tracks](https://support.google.com/googleplay/android-developer/answer/9845334?hl=en)  
[6] [Google Play Console Help — Testing requirements for new personal accounts](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en)
