# Lumae AI — Field-by-Field Google Play Console Submission Guide

> **Use this guide while signed in to the owner’s Google Play Console.** It separates values that are ready to enter from declarations that require the owner to confirm legal, payment, or testing facts. Do not submit a declaration merely because it appears as a suggested value below.

## 1. Before opening “Create app”

| Requirement | What to use or do | Status |
|---|---|---|
| Google Play developer account | Create or sign in using the business owner’s Google account. Complete Google’s required developer verification and payment profile steps in the account owner’s name. | **Owner action** |
| Android package name | `in.lumae.app` | **Ready** |
| Upload format | Upload an Android App Bundle (`.aab`), not an APK. | **Ready after signing** |
| Build artifact | A validated **unsigned** bundle has been produced. It must be rebuilt with the owner’s upload key before upload. | **Owner action** |
| Play App Signing | Accept the Play App Signing terms when Play Console requests them. | **Owner action** |
| Privacy Policy | `https://lumae.co.in/privacy` | **Verify URL opens publicly** |
| Terms of Service | `https://lumae.co.in/terms` | **Verify URL opens publicly** |
| Public support contact | Prefer a monitored Lumae-owned email such as `support@lumae.co.in`. Until that exists, use only an email the owner monitors daily. | **Owner action** |

Google Play uses Android App Bundles to generate optimized APKs, and the package name is permanent once created.[1]

## 2. Create app

Go to **All apps → Create app**, then complete the form as follows.

| Play Console field | Lumae value | Notes |
|---|---|---|
| App name | **Lumae AI** | Use this exact public brand name. |
| Default language | **English (United States)** | Add other localizations later, only after they are reviewed. |
| App or game | **App** | Lumae is a productivity SaaS application. |
| Free or paid | **Free** | A Play app marked free cannot later be converted to paid. Do not treat this as a payment-policy decision; see the billing warning below. |
| App support email | **A monitored Lumae email address** | Use the public support mailbox, not an address that will go unattended. |
| Declarations | Accept **Developer Program Policies**, **US export laws**, and **Play App Signing Terms** only after the owner has read and accepted them. | These confirmations are owner-controlled legal actions. |

### Critical billing warning

Lumae currently sells digital credits and subscriptions on the web. **Do not upload an Android build that exposes Razorpay web checkout for digital credits or subscriptions until the applicable Google Play payments-policy path has been reviewed.** Before the production release, either integrate Google Play Billing where required or remove/disable the in-app digital purchase path for the Play-distributed Android build. This should be resolved before the owner submits the release for review.

## 3. Store listing → Main store listing

| Field | Enter this | Owner confirmation required |
|---|---|---|
| App name | **Lumae AI** | No |
| Short description | **Create, refine, schedule, and manage platform-ready content with Lumae AI.** | No |
| Full description | Paste the approved text below. | No |
| App icon | Upload a genuine Lumae 512 × 512 PNG icon with no misleading badges, pricing, or promotions. | Asset required |
| Feature graphic | Upload a genuine Lumae 1024 × 500 PNG feature graphic. | Asset required |
| Phone screenshots | Upload real screenshots from the signed Android app, showing login, Dashboard, Generator, Content Studio, and Account Security. | Asset required |
| App category | **Productivity** | No |
| Tags | **AI content creation**, **productivity**, **social media tools** | Confirm tags offered by the console. |
| Contact email | The monitored Lumae support email. | Yes |
| Website | `https://lumae.co.in` | Verify it is live. |
| Privacy Policy | `https://lumae.co.in/privacy` | Verify it is live, accurate, and linked inside the app. |

### Full description to paste

Lumae AI is a content workspace for creators and teams. Turn ideas into focused, platform-ready drafts, refine existing content, plan publishing workflows, and keep your creative process organized in one secure place.

Use Lumae AI to generate and improve content, adapt messaging for different platforms, review performance insights, and manage connected publishing workflows. Account protection includes secure sign-in options, two-factor authentication, passkeys, recovery codes, and trusted-device controls.

Some Business messaging and phone verification capabilities may display as Coming Soon until the required provider account, sender verification, or business approval is complete. Lumae does not activate these services until configured by the account owner.

## 4. Policy and programs → App content

### Privacy Policy

Select **Start** and enter:

```text
https://lumae.co.in/privacy
```

The policy must be public, accurate, app-specific, and also available within the app.[3]

### Ads

Select **Yes** if the Android build displays any AdSense, banner, interstitial, native, or other advertising content. The current Lumae web experience includes advertising-related functionality, so verify the final Android bundle and do **not** answer “No” unless all ads are removed from the Play build. Google Play requires an accurate ads declaration and shows a “Contains ads” label when applicable.[3]

### App access / Sign-in details

Select **Yes, all or some functionality is restricted**.

Create a dedicated review account before submission. It must be fully accessible, non-expiring for the review period, and have no personal/customer data. In the reviewer instructions, provide:

| Reviewer field | What to provide |
|---|---|
| Email / username | A dedicated Lumae review-account email |
| Password | The temporary review-account password, changed after review if necessary |
| Two-factor authentication | **Disabled for the review account**, or provide a stable test second-factor process that does not require the reviewer to contact the owner |
| Login path | “Open the app, select Continue with email, enter the credentials above, then select Sign in.” |
| Test scope | “Dashboard, AI Generator, Content Studio, Account Security, and all non-payment features can be reviewed. Business messaging providers and phone OTP intentionally show Coming Soon.” |
| Extra instructions | State that payment/credit purchase is unavailable in the Play review build until the approved Google Play billing path is implemented. |

Google Play requires working access instructions for restricted areas and allows up to five instruction sets.[3]

### Target audience and content

Select only age groups the owner genuinely intends to serve. **Recommended starting choice: 18 and over** if Lumae is not designed for children or teens. Do not select child or teen groups unless the app and privacy practices are ready for the applicable additional policy obligations.

### Content rating

Complete the IARC questionnaire truthfully. For the current Lumae feature set, answer **No** to violence, sexual content, gambling, controlled substances, and user-to-user chat unless the final Android build includes such content or features. Do not guess; the rating must match the final release.

### Data safety

All published apps, including those on closed or open testing tracks, must complete an accurate Data safety form and provide a privacy policy.[2]

Start with **Yes, Lumae collects or shares user data**. Confirm **data is encrypted in transit: Yes** only after verifying that all final-app/backend traffic uses HTTPS. For data deletion, select **Yes** only when the owner can honor deletion requests through an available process; otherwise resolve that gap before submission.

Use the following as a **review checklist**, not a blind declaration:

| Data type to assess | Likely Lumae use | Purpose to consider | Required / optional | Shared? |
|---|---|---|---|---|
| Name | Account profile and personalization | Account management, app functionality | Required for account | Verify server/SDK behavior |
| Email address | Account identity, sign-in, support, receipts, verification | Account management, app functionality | Required for account | Verify provider behavior |
| User IDs | Sessions, account ownership, security controls | Account management, fraud prevention/security | Required for account | Verify provider behavior |
| User-generated content | Prompts, generated content, saved content/preferences | App functionality, personalization | Feature-dependent | Verify storage and LLM provider behavior |
| Purchase history / credits | Credit and subscription fulfilment | App functionality, account management | Feature-dependent | Verify payment architecture |
| Diagnostics | Only if crash/analytics SDKs are included in the Android app | Analytics, fraud prevention/security | SDK-dependent | Verify each SDK |

Do **not** declare phone number, SMS, contacts, precise location, camera, microphone, or payment-card details unless the final Android build actually collects them. Phone OTP is currently disabled and the manifest does not request SMS permissions, so it should not be declared as collected merely because it is planned for a future release.

### Other App content declarations

| Declaration | Recommended current response | Confirmation |
|---|---|---|
| News or Magazine | **No** | Lumae is a productivity app, not a news or magazine app. |
| COVID-19 contact tracing / status | **No** | No such functionality exists. |
| Government apps | **No** | Lumae is not a government app. |
| Financial features | Review carefully before choosing; Lumae’s content credits are not banking/loan/investment features. | Owner must confirm no regulated financial product is offered. |
| Sensitive permissions | **No declaration expected** for the current manifest, which requests only Internet access. | Re-check every release. |

## 5. Policy and programs → App content → Data deletion

Before selecting that users can request deletion, publish a monitored deletion route. The safest immediate option is a dedicated privacy contact on the Lumae Privacy Policy page, such as `privacy@lumae.co.in`, with a documented internal process to verify the requester and remove or anonymize eligible data. Do not claim an automated deletion feature unless it is deployed and working.

## 6. Test and release → Testing

| Track | Use | What to enter |
|---|---|---|
| Internal testing | First installation and smoke test | Upload the signed `.aab`; add the owner and a small trusted group. |
| Closed testing | Required route for many new personal accounts | Create a closed test, choose email-list or Google Group testers, and add at least 12 real testers. |
| Open testing | Optional, after production access is available | Do not use until the store listing and policy declarations are ready for public visibility. |
| Production | Final public launch | Use only after testing/policy/access prerequisites are complete. |

For personal developer accounts created after November 13, 2023, Google requires a closed test with **at least 12 testers opted in continuously for 14 days** before production access can be requested.[4]

### Closed-test setup values

| Field | Enter |
|---|---|
| Track name | `Lumae AI Closed Beta` |
| Testers | A Google Group or explicit tester email list containing at least 12 real testers |
| Release name | `Lumae AI 1.0.0 Closed Beta` |
| Release notes | `First closed beta of Lumae AI. Please test sign-in, content generation, settings, and account security. Business messaging and phone OTP remain unavailable until provider onboarding is complete.` |

## 7. Test and release → Production

When eligible for production access, create a production release with:

| Field | Enter |
|---|---|
| App Bundle | The **signed** release `app-release.aab` with package `in.lumae.app` |
| Release name | `Lumae AI 1.0.0` |
| Release notes | `Launch release for Lumae AI with secure sign-in, AI content workflows, account security controls, and platform-ready creation tools.` |
| Countries / regions | Start with **India** if this is the intended legal and support market; add other markets only after confirming support, privacy, tax, and payment readiness. |
| Rollout | Use a staged rollout, not an immediate 100% rollout, for the first production release. |

## 8. Owner-only actions that cannot be completed by an assistant

| Action | Why the owner must do it |
|---|---|
| Developer account registration, identity verification, and payment profile | Requires personal/business identity and payment information. |
| Accepting Play Developer Distribution Agreement and App Signing terms | Legal acceptance must be made by the owner. |
| Creating and safeguarding the upload key | The signing key is a high-value secret. Keep it offline/secure and never send it in chat. |
| Uploading the signed AAB | This is a consequential publishing action. |
| Selecting target markets, pricing, and data declarations | These are legal/business representations that must be accurate. |
| Adding reviewer credentials | The owner must create and maintain a dedicated safe review account. |

## 9. Final submission sequence

1. Complete developer-account verification and create the Play app using the details in Section 2.
2. Generate the owner-controlled upload key, rebuild and sign the AAB, then enable Play App Signing.
3. Upload the signed AAB to Internal testing and install it on real Android devices.
4. Complete Store listing, App access, App content, content rating, and Data safety from Sections 3–5.
5. Run the closed test and keep the required testers opted in for the required period, if your account is subject to the personal-account testing requirement.[4]
6. Obtain the Play App Signing SHA-256 certificate, publish the matching `assetlinks.json` at `https://lumae.co.in/.well-known/assetlinks.json`, and test password-reset and OAuth links on a signed test install.
7. Resolve the Android digital-purchase policy path before allowing credit/subscription checkout in the Play build.
8. Request production access, answer the testing/readiness questions truthfully, then submit a staged production rollout.

## References

[1] [Google Play Console Help — Create and set up your app](https://support.google.com/googleplay/android-developer/answer/9859152?hl=en)

[2] [Google Play Console Help — Provide information for Google Play’s Data safety section](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en)

[3] [Google Play Console Help — Prepare your app for review](https://support.google.com/googleplay/android-developer/answer/9859455?hl=en)

[4] [Google Play Console Help — App testing requirements for new personal developer accounts](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en)
