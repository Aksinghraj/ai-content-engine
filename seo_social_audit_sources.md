# Social Automation Audit Sources and Findings

## Official provider references

- Meta webhook setup: https://developers.facebook.com/documentation/instagram-platform/webhooks
- Meta Instagram private replies: https://developers.facebook.com/documentation/instagram-platform/private-replies
- Meta Instagram messaging: https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-instagram-login/messaging-api
- YouTube Data API reference: https://developers.google.com/youtube/v3/docs
- YouTube comments resource: https://developers.google.com/youtube/v3/docs/comments
- LinkedIn comments API: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/comments-api?view=li-lms-2026-08

## Code-level findings

- The active PlatformAutomationWorkspace is manual-review-first. It uses persisted schedules, real connected-account status, and the enterprise engagement-event query; it does not claim that DMs or automatic replies are active.
- The exposed legacy server/routers/socialOAuth.ts contained fabricated OAuth, connection, publishing, comment, and reply responses. It was replaced with persisted account reads, ownership checks, real engagement-event reads, and explicit retired/unsupported errors.
- The signed Meta webhook at /api/webhooks/meta now verifies the raw-body signature, maps comments/messages to an owned validated Meta connection by provider account ID, persists idempotently to engagementEvents, and never sends an automatic reply or DM.
- Current provider constraints remain: Facebook Page and YouTube live readiness still require provider-side account/permission validation; X remains budget-gated; LinkedIn/TikTok availability remains truthful.
- Validation completed during this pass: TypeScript clean; 5 focused test files / 21 tests passed; production build passed with existing large-chunk warnings; mobile screenshots of /automation/social-automation and /scheduling/connected-accounts captured. Cookie consent overlay was present in the screenshots and is unrelated to the automation code changes.
