# Facebook Automation Research

## Official publishing requirements

Meta’s current Pages API documentation states that a Facebook Page publishing workflow requires a **Page access token** obtained after user authorization, not merely a personal user token. The connecting user must have the required Page task, including `CREATE_CONTENT`, and the app must have the appropriate Page permissions.[1] [2]

Lumae’s current Facebook scope and validation flow must therefore resolve the user’s selected Page and persist its Page ID and Page access token only after validation. A ready connection can then publish a text post through `POST /{page-id}/feed`. Photo publishing uses `POST /{page-id}/photos` with a publicly reachable media URL; video publishing needs the separate Video API path and must not be represented as supported until implemented.[2]

| Capability | Required conditions | Current repair decision |
| --- | --- | --- |
| Text Page post | Page token, `pages_manage_posts`, Page `CREATE_CONTENT` task | Support only after the connection resolves a valid Page token. |
| Image Page post | Valid Page token and a publicly reachable image URL | Use a Lumae-managed signed media URL and the Page photos endpoint; do not pass a relative application URL. |
| Video Page post | Valid Page token and the Pages Video API flow | Keep blocked until a dedicated provider upload implementation exists. |
| Scheduled Page post | Same validated Page requirements; Meta’s native schedule has a 10-minute to 30-day window | Lumae’s durable dispatcher can post at the scheduled time once connection validation is correct. |

## Sources

[1]: https://developers.facebook.com/documentation/pages-api "Meta — Facebook Pages API"
[2]: https://developers.facebook.com/documentation/pages-api/posts "Meta — Facebook Pages API: Posts"
[3]: https://developers.facebook.com/docs/graph-api/reference/page/feed/ "Meta — Page Feed reference"
