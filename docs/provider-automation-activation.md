# Provider Automation Activation Guide

## Current live state

Lumae has no validated Facebook, YouTube, X, or LinkedIn automation connection ready to activate. The system will not publish or enable Auto-Post until a provider connection is validated server-side. This protects customer accounts and prevents false successful-publish messages.

| Platform | What works after validation | One owner action still needed |
| --- | --- | --- |
| Facebook | Text posts and single Lumae-managed image posts to one validated Facebook Page | Connect a Facebook account that has the `CREATE_CONTENT` Page task and one intended Page. Meta must approve the Page permissions for customer use. |
| YouTube | Lumae-managed video uploads, initially as **private** videos | Confirm YouTube Data API v3 is enabled, add your Google account as an OAuth test user while the consent screen is in Testing, then connect the channel. |
| LinkedIn | Text posts to the connected member profile | Enable **OpenID Connect** and **Share on LinkedIn**, register Lumae’s exact callback URL, then connect the profile. |
| X | Secure connection path only | Approve a paid X API budget and set a spending limit. Posting and Auto-Post are intentionally locked until that approval is recorded. |

## Safe activation sequence

Open **Scheduling → Connected accounts**. Select **Connect** for exactly one provider, complete the provider's own consent page, and return to Lumae. Do not enter any social password or developer secret in Lumae. The card must show a validated account before Auto-Post becomes available. For Facebook, YouTube, and LinkedIn, enable Auto-Post only after the status is validated and you are ready to allow scheduled posting.

For X, contact the owner after funding the X developer account and setting a spend ceiling. The server-side lock will remain active until that separate approval is made; it cannot be bypassed from the browser.

## Content constraints

Facebook accepts text or one Lumae-managed image. YouTube requires a Lumae-managed video and uploads it privately. LinkedIn supports text only until its provider asset-upload workflow is implemented. Any unsupported selection is blocked before the provider is contacted.
