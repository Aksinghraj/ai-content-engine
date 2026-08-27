# X Automation Research

X’s OAuth 2.0 Authorization Code Flow with PKCE supports delegated user access with `tweet.write` for post creation, `users.read` for identity validation, and `offline.access` for a refresh token. The authorization callback must verify state and retain the PKCE verifier for the token exchange.[1]

Lumae now limits the X connection request to `tweet.read`, `tweet.write`, `users.read`, and `offline.access`. **It does not execute posts yet.** X publishes through a paid, credit-based API: official current pricing lists a charge per post creation request. Lumae therefore keeps the server-side publishing lock closed until the owner explicitly approves a budget and enables a spending limit in the X developer console.[2]

## Sources

[1]: https://docs.x.com/fundamentals/authentication/oauth-2-0/user-access-token "X — OAuth 2.0 Authorization Code Flow with PKCE"
[2]: https://docs.x.com/x-api/getting-started/pricing "X — API pay-per-usage pricing and credits"
