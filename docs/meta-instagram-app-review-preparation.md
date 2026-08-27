# Lumae Instagram App Review Preparation

## Submission scope

Lumae is a web application that lets a business user connect an Instagram professional account, create or edit a caption, select one Lumae-managed image or video, and publish immediately or schedule the post. It is therefore a multi-business **Tech Provider** use case using **Instagram Login**. Meta requires App Review and Advanced Access for this scenario.[1]

> **Current status — owner-confirmed on 27 August 2026:** Meta business verification is under review and the app remains unpublished. Until Meta approves the required review and the app is made live, only correctly assigned app-role testers can use the connection flow for testing. Lumae must keep Auto-Post disabled unless a tester’s connection has been validated server-side.

The current Lumae connection flow requests only the permissions that the implemented product needs:

| Permission | Truthful product use | Review evidence to record |
| --- | --- | --- |
| `instagram_business_basic` | Confirm the connected professional account identity and username before it becomes available for publishing. | A screen recording of Connected Accounts showing an account connect, validation status, and account username. |
| `instagram_business_content_publish` | Create a media container and publish a user-selected Lumae-managed image or video to the account selected by that user. | A screen recording that shows write/generate copy, upload media, select the validated account, submit publish, and receive the provider outcome. |

Lumae does **not** request Instagram messaging, comment-management, or insights permissions in this submission because those provider functions are not currently part of the implemented connection-and-publishing path. Requesting only permissions used by the app is necessary for a truthful submission.[1]

## Reviewer instructions to paste and tailor

> **Website:** https://lumae.co.in
>
> **Test environment:** Web application. The reviewer should use the test account supplied in the App Review credential section. The Instagram account must be a professional account eligible for the Instagram API.
>
> **Steps:**
> 1. Sign in to Lumae using the supplied test account.
> 2. Open **Scheduling → Connected accounts**.
> 3. Select **Connect** for Instagram. Complete Instagram Business Login using the supplied Instagram test account.
> 4. Return to Lumae and verify that the card shows the connected account only after Lumae validates it.
> 5. Open **Scheduling → Social publishing** or **Scheduling → Post scheduling**.
> 6. Enter post text, upload a JPEG image through Lumae, select the validated Instagram account, and choose **Publish now**. For scheduling, enable Auto-Post only after validation, choose a future time, and select **Schedule post**.
> 7. Lumae sends the selected media and caption to Instagram only after the reviewer chooses the action. The result displayed is the provider response; Lumae does not manufacture a success result.
>
> **Permission explanation:** `instagram_business_basic` is used only to validate and display the selected Instagram professional account. `instagram_business_content_publish` is used only to create a media container and publish the image or video and caption selected by the signed-in Lumae user.

Replace the reference to supplied test credentials only after creating a dedicated review account. Do not enter a personal account password or an access token into this document or the reviewer instructions.

## Submission checklist

| Item | Owner action |
| --- | --- |
| Business verification | Complete it for the business connected to the Meta app; an app must be connected to a verified business before it can be published.[2] |
| Basic app settings | Provide the current app icon, privacy-policy URL, relevant app category, and business contact email.[1] |
| Hosted product | Confirm `https://lumae.co.in` is accessible to external reviewers and the Instagram Connect control is visible. |
| Reviewer test account | Create a dedicated Lumae test user and a dedicated Instagram professional test account; share credentials only inside Meta's protected review form. |
| Screencast | Record the end-to-end web workflow in English, including every requested permission's use.[1] |
| Successful API call | Complete at least one successful API call before requesting Advanced Access when Meta requires it.[1] |
| Publishing media | Use a publicly reachable JPEG image for the recorded image-publish path; Meta's publishing flow fetches media from a public server and JPEG is the supported image format.[3] |
| Page Publishing Authorization | If the connected professional account's Page requires PPA, complete it before publishing.[3] |

## Production constraints to preserve

The published Lumae service must retain its existing safeguards: it must store tokens encrypted server-side, never show them in the client, only show a connection as ready after validation, and refuse to enable Auto-Post if the account is disconnected, unvalidated, or expired. A scheduled Instagram publish must keep its managed media reachable at execution time. Instagram applies a moving 24-hour publishing limit, so users must not use scheduling to bypass platform limits.[3]

## References

[1]: https://developers.facebook.com/documentation/instagram-platform/app-review "Meta — App Review for Instagram API"
[2]: https://developers.facebook.com/documentation/instagram-platform/create-an-instagram-app "Meta — Customize the Manage messaging and content on Instagram Use Case"
[3]: https://developers.facebook.com/documentation/instagram-platform/content-publishing "Meta — Instagram Content Publishing"
