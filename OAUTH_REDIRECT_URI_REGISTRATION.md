# OAuth Redirect URI Registration Guide

This guide walks you through registering the OAuth redirect URIs for all 6 social media platforms. This is **REQUIRED** for the OAuth flow to work.

## Redirect URI Format

All redirect URIs follow this pattern:
```
https://lumae.co.in/api/oauth/callback/{platform}
```

## Platform-Specific Registration Steps

### 1. Instagram (Meta)

**Redirect URI:**
```
https://lumae.co.in/api/oauth/callback/instagram
```

**Steps:**
1. Go to [Meta Developers](https://developers.facebook.com/)
2. Select your Instagram app
3. Navigate to **Settings → Basic**
4. Copy your **App ID** and **App Secret**
5. Go to **Settings → Basic → App Domains**
6. Add: `lumae.co.in`
7. Go to **Products → Instagram Graph API → Settings**
8. Under "Instagram Graph API", click **Add Platform**
9. Select **Website**
10. Enter: `https://lumae.co.in`
11. Go to **Products → Instagram Graph API → Roles → Test Users**
12. Add your Instagram business account as a test user
13. Go to **App Roles → Instagram Testers**
14. Accept the invitation from your Instagram account

**Scopes Required:**
- `instagram_basic`
- `instagram_graph_user_media`

---

### 2. Facebook

**Redirect URI:**
```
https://lumae.co.in/api/oauth/callback/facebook
```

**Steps:**
1. Go to [Meta Developers](https://developers.facebook.com/)
2. Select your Facebook app
3. Navigate to **Settings → Basic**
4. Go to **Settings → Basic → App Domains**
5. Add: `lumae.co.in`
6. Go to **Products → Facebook Login → Settings**
7. Under "Valid OAuth Redirect URIs", add:
   ```
   https://lumae.co.in/api/oauth/callback/facebook
   ```
8. Click **Save Changes**
9. Go to **Roles → Test Users**
10. Create a test user or use your Facebook account

**Scopes Required:**
- `public_profile`
- `pages_manage_posts`
- `pages_read_engagement`

---

### 3. Twitter / X

**Redirect URI:**
```
https://lumae.co.in/api/oauth/callback/twitter
```

**Steps:**
1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Select your app
3. Go to **App Settings**
4. Scroll to **Authentication Settings**
5. Click **Edit**
6. Enable **3-legged OAuth**
7. Under "Callback URLs / Redirect URLs", add:
   ```
   https://lumae.co.in/api/oauth/callback/twitter
   ```
8. Set **Website URL**: `https://lumae.co.in`
9. Click **Save**
10. Go to **Keys and Tokens**
11. Copy your **API Key** and **API Secret Key**

**Scopes Required:**
- `tweet.read`
- `tweet.write`
- `users.read`
- `follows.manage`
- `follows.read`

**Note:** Twitter requires elevated access. Apply for elevated access in the Developer Portal.

---

### 4. LinkedIn

**Redirect URI:**
```
https://lumae.co.in/api/oauth/callback/linkedin
```

**Steps:**
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Select your app
3. Go to **Auth** tab
4. Under "Authorized redirect URLs for your app", click **Add redirect URL**
5. Enter:
   ```
   https://lumae.co.in/api/oauth/callback/linkedin
   ```
6. Click **Update**
7. Go to **Settings** tab
8. Copy your **Client ID** and **Client Secret**

**Scopes Required:**
- `r_basicprofile`
- `r_emailaddress`
- `w_member_social`

**Note:** Request access to "Sign In with LinkedIn" and "Share on LinkedIn" products.

---

### 5. YouTube (Google)

**Redirect URI:**
```
https://lumae.co.in/api/oauth/callback/youtube
```

**Steps:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth 2.0 Client ID**
5. Select **Web application**
6. Under "Authorized redirect URIs", click **Add URI**
7. Enter:
   ```
   https://lumae.co.in/api/oauth/callback/youtube
   ```
8. Click **Create**
9. Copy your **Client ID** and **Client Secret**
10. Go to **APIs & Services → Enabled APIs & Services**
11. Ensure **YouTube Data API v3** is enabled
12. Go to **OAuth consent screen**
13. Add `lumae.co.in` to authorized domains
14. Add the following scopes:
    - `https://www.googleapis.com/auth/youtube`
    - `https://www.googleapis.com/auth/youtube.upload`

**Scopes Required:**
- `https://www.googleapis.com/auth/youtube`
- `https://www.googleapis.com/auth/youtube.upload`

---

### 6. TikTok

**Redirect URI:**
```
https://lumae.co.in/api/oauth/callback/tiktok
```

**Steps:**
1. Go to [TikTok Developers](https://developers.tiktok.com/)
2. Create or select your app
3. Go to **App Settings**
4. Under "Redirect URLs", click **Add**
5. Enter:
   ```
   https://lumae.co.in/api/oauth/callback/tiktok
   ```
6. Click **Save**
7. Copy your **Client Key** and **Client Secret**
8. Go to **Permissions**
9. Request the following scopes:
    - `user.info.basic`
    - `video.list`
    - `video.create`

**Scopes Required:**
- `user.info.basic`
- `video.list`
- `video.create`

**Note:** TikTok requires app review. Submit your app for review in the Developer Portal.

---

## Verification Checklist

After registering all redirect URIs, verify:

- [ ] Instagram: Redirect URI registered and test user added
- [ ] Facebook: Redirect URI registered and test user created
- [ ] Twitter: Redirect URI registered and elevated access approved
- [ ] LinkedIn: Redirect URI registered and products approved
- [ ] YouTube: Redirect URI registered and API enabled
- [ ] TikTok: Redirect URI registered and app under review

## Testing the OAuth Flow

1. Navigate to **Connected Accounts** page in Lumae AI
2. Click **Connect** on each platform
3. You should be redirected to the platform's login page
4. After authorizing, you should be redirected back to Lumae AI
5. Your account should appear as "Connected"

## Troubleshooting

### "Invalid redirect_uri" Error
- Verify the redirect URI exactly matches what you registered (case-sensitive)
- Ensure the domain is `lumae.co.in` (not `www.lumae.co.in` or `aicontent-femeuybh.manus.space`)
- Wait 5-10 minutes after registering the URI for changes to propagate

### "Invalid scope" Error
- Verify all requested scopes are valid for the platform
- Check that your app has permission to request those scopes
- For Instagram/Facebook, ensure your app is in development mode

### "Unauthorized" Error
- Verify your Client ID and Client Secret are correct
- Ensure your app credentials are properly configured in Lumae AI
- Check that your app is not in sandbox/test mode (if applicable)

### "User denied access" Error
- This is normal - the user simply declined to authorize
- They can try again by clicking "Connect" again

## Support

If you encounter issues:
1. Check the browser console for detailed error messages
2. Review the server logs in Lumae AI dashboard
3. Verify all redirect URIs are registered exactly as shown above
4. Ensure your app credentials are correct and active
