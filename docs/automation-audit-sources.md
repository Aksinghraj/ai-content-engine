# Automation Audit: Provider Capability Notes

## Instagram content publishing

Meta's current Instagram Platform documentation describes a two-stage publishing flow: create a media container through `/<IG_ID>/media`, then publish that container through `/<IG_ID>/media_publish`. It requires a professional account, applicable access permissions, a public media URL, and may require Page Publishing Authorization. The documented API-publishing rate limit is 100 posts per rolling 24-hour period.

Source: <https://developers.facebook.com/documentation/instagram-platform/content-publishing>

## Instagram Business reconnection

Meta's current Instagram API with Facebook Login requires an Instagram Business or Creator account attached to a Facebook Page, a Facebook user with an appropriate Page task, and a Facebook app configured for Facebook Login. The application should request `instagram_basic`, `instagram_content_publish`, `pages_show_list`, and `pages_read_engagement`; it must then resolve the connected Instagram professional account from the Facebook Pages the user manages and retain the Page access token for publishing.

Source: <https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-facebook-login/get-started>

## TikTok direct posting

TikTok's current Direct Post flow requires creator-information retrieval, user consent, initialization through `/v2/post/publish/video/init/`, and either a public URL pull or an upload to the returned upload URL. It requires the `video.publish` scope. Clients that have not completed TikTok's audit are restricted to private viewing mode.

Source: <https://developers.tiktok.com/doc/content-posting-api-reference-direct-post>

## YouTube publishing

YouTube's current video publishing route is `videos.insert`, which uploads a video and requires an appropriate YouTube upload scope. Projects created after July 2020 require a YouTube API audit before uploaded videos can be public. The former `activities.insert` method is obsolete because channel bulletins were removed.

Sources: <https://developers.google.com/youtube/v3/docs/videos/insert> and <https://developers.google.com/youtube/v3/docs/activities/insert>

## Facebook, LinkedIn, and X

Facebook’s Page Feed API supports publishing to a Page feed rather than to a personal profile. LinkedIn’s current Posts API is the supported post-creation surface, while Lumae currently calls the legacy UGC Posts endpoint. X provides a current create-post route, but use is governed by its developer-plan and usage pricing terms.

Sources: <https://developers.facebook.com/docs/graph-api/reference/page/feed/>, <https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api?view=li-lms-2026-08>, and <https://docs.x.com/x-api/posts/create-post>

## Confirmed Meta external prerequisite (2026-08-27)

The owner's Meta dashboard screenshot shows Business Verification as **In review** and only the Marketing API use case visibly active. Meta's current Instagram documentation requires the **Instagram > API setup with Facebook login** product in addition to **Facebook Login for Business** for Lumae's selected login model. The Facebook account completing consent must manage the Facebook Page linked to the Instagram Business or Creator account and must have Content or Full Control to grant content-publishing access. Standard Access is limited to people with app or claimed-business roles; Advanced Access requires App Review and Business Verification for broader customer use.

Source: <https://developers.facebook.com/documentation/instagram-platform/overview> and <https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-facebook-login/get-started>
