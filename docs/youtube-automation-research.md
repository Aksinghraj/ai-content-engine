# YouTube Automation Research

Google’s server-side OAuth guidance states that a web application performing work when the user is away must request `access_type=offline` so it receives a refresh token with the access token. The configured redirect URI must exactly match an authorized Google OAuth redirect URI, and the application should request only necessary scopes.[1] [2]

For Lumae’s current workflow, `https://www.googleapis.com/auth/youtube.upload` is the minimum YouTube Data API scope needed for private video uploads. The authorization request should add `access_type=offline`, `include_granted_scopes=true`, and `prompt=consent` for a fresh connection so the server can store the encrypted refresh token required by durable scheduled publishing. The connecting Google account must remain a test user while the OAuth consent screen is in Testing; broader users require Google verification.[1]

## Sources

[1]: https://developers.google.com/youtube/v3/guides/auth/server-side-web-apps "Google — Using OAuth 2.0 for Web Server Applications"
[2]: https://developers.google.com/identity/protocols/oauth2/web-server "Google — OAuth 2.0 for Web Server Applications"
