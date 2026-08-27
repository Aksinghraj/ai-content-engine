# LinkedIn Automation Research

LinkedIn makes the **Share on LinkedIn** product and `w_member_social` permission available through self-service for posting on behalf of an authenticated member. The current Posts API replaces the legacy UGC Posts API and requires the `Linkedin-Version` and `X-Restli-Protocol-Version: 2.0.0` headers.[1] [2]

Lumae’s configured LinkedIn scope includes `w_member_social`, and its current server path creates a text-only member post through `POST https://api.linkedin.com/rest/posts`. Image, video, and document posts require a LinkedIn asset upload and the returned LinkedIn asset URN before post creation. Lumae must keep those media post variants blocked with clear guidance until it implements that provider asset-upload sequence.[2]

## Sources

[1]: https://learn.microsoft.com/en-us/linkedin/shared/authentication/getting-access "LinkedIn — Getting Access to LinkedIn APIs"
[2]: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api?view=li-lms-2026-05 "LinkedIn — Posts API"
