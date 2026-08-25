# Platform Automation Capability Notes

## Instagram and Facebook through Meta

Meta documents comment-triggered Instagram private replies as an event-driven feature. It requires webhooks, appropriate professional-account permissions, and a private reply based on a qualifying comment. Meta permits only one private reply to a commenter, normally within seven days of the comment; follow-up messages require the recipient to reply and are limited to a subsequent 24-hour window. Lumae must therefore model Instagram Auto-DM as a narrowly scoped, opt-in comment-triggered reply tool, not a bulk or promotional broadcast function.

Source: https://developers.facebook.com/documentation/instagram-platform/private-replies

## X (Twitter)

X now documents its API as pay-per-usage. Direct-message interactions are billable writes and incoming DM events are billable webhook events. Lumae should keep X Auto-DM locked behind an explicit connection-and-budget state, avoid polling, and require a user-confirmed send action or a policy-approved rule before sending real messages.

Source: https://docs.x.com/x-api/getting-started/pricing

## YouTube

The YouTube Data API supports listing comments and inserting replies to existing comments. Its documented resource and method set does not provide direct messages between channels and viewers. Lumae should retain a consistent Auto-DM tile in the YouTube workspace, but present it as unavailable with a factual explanation. YouTube comment reply and video scheduling can remain the primary workspace tools.

Source: https://developers.google.com/youtube/v3/docs/comments
