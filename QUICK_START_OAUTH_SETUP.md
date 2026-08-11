# Quick Start: OAuth Redirect URI Registration

This guide provides a quick checklist to register OAuth redirect URIs with all 6 platforms. Complete this setup to enable OAuth login for your users.

## Redirect URI Template

All platforms use this callback URL:
```
https://lumae.co.in/api/oauth/callback/{platform}
```

Replace `{platform}` with: `instagram`, `facebook`, `twitter`, `linkedin`, `youtube`, or `tiktok`

---

## ✅ Registration Checklist

### 1. Instagram (Meta)
**Redirect URI:**
```
https://lumae.co.in/api/oauth/callback/instagram
```

**Quick Steps:**
1. Go to [Meta Developers](https://developers.facebook.com/)
2. Select your Instagram app → **Settings → Basic**
3. Add to **App Domains**: `lumae.co.in`
4. Go to **Products → Instagram Graph API → Settings**
5. Add **Valid OAuth Redirect URIs**: `https://lumae.co.in/api/oauth/callback/instagram`
6. Go to **Roles → Test Users** and add your Instagram business account

**Status:** [ ] Registered

---

### 2. Facebook
**Redirect URI:**
```
https://lumae.co.in/api/oauth/callback/facebook
```

**Quick Steps:**
1. Go to [Meta Developers](https://developers.facebook.com/)
2. Select your Facebook app → **Settings → Basic**
3. Add to **App Domains**: `lumae.co.in`
4. Go to **Products → Facebook Login → Settings**
5. Add **Valid OAuth Redirect URIs**: `https://lumae.co.in/api/oauth/callback/facebook`
6. Save changes

**Status:** [ ] Registered

---

### 3. Twitter / X
**Redirect URI:**
```
https://lumae.co.in/api/oauth/callback/twitter
```

**Quick Steps:**
1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Select your app → **App Settings**
3. Scroll to **Authentication Settings** → Click **Edit**
4. Enable **3-legged OAuth**
5. Add **Callback URLs**: `https://lumae.co.in/api/oauth/callback/twitter`
6. Set **Website URL**: `https://lumae.co.in`
7. Save

**Note:** Requires elevated API access - apply in Developer Portal

**Status:** [ ] Registered

---

### 4. LinkedIn
**Redirect URI:**
```
https://lumae.co.in/api/oauth/callback/linkedin
```

**Quick Steps:**
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Select your app → **Auth** tab
3. Add **Authorized redirect URLs**: `https://lumae.co.in/api/oauth/callback/linkedin`
4. Click **Update**

**Note:** Request access to "Sign In with LinkedIn" and "Share on LinkedIn" products

**Status:** [ ] Registered

---

### 5. YouTube (Google)
**Redirect URI:**
```
https://lumae.co.in/api/oauth/callback/youtube
```

**Quick Steps:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project → **APIs & Services → Credentials**
3. Click **Create Credentials → OAuth 2.0 Client ID**
4. Select **Web application**
5. Add **Authorized redirect URIs**: `https://lumae.co.in/api/oauth/callback/youtube`
6. Click **Create**
7. Enable **YouTube Data API v3** in APIs & Services

**Status:** [ ] Registered

---

### 6. TikTok
**Redirect URI:**
```
https://lumae.co.in/api/oauth/callback/tiktok
```

**Quick Steps:**
1. Go to [TikTok Developers](https://developers.tiktok.com/)
2. Select your app → **App Settings**
3. Add **Redirect URLs**: `https://lumae.co.in/api/oauth/callback/tiktok`
4. Save
5. Submit app for review

**Note:** TikTok requires app review before OAuth works

**Status:** [ ] Registered

---

## Verification

After registering all URIs, verify they work:

1. **Navigate to Connected Accounts page** in Lumae AI dashboard
2. **Click "Connect" on each platform**
3. **Verify you're redirected to the platform's login page**
4. **After login, verify you're redirected back to Lumae AI**
5. **Verify the account shows as "Connected"**

---

## Troubleshooting

### "Invalid redirect_uri" Error
- ✅ Check the URI exactly matches (case-sensitive)
- ✅ Ensure domain is `lumae.co.in` (not `www.lumae.co.in`)
- ✅ Wait 5-10 minutes for changes to propagate

### "App not authorized" Error (Twitter)
- ✅ Request elevated API access in Twitter Developer Portal
- ✅ Wait for approval

### "App not approved" Error (TikTok)
- ✅ Submit your app for review in TikTok Developer Portal
- ✅ Wait for approval

### "Invalid scope" Error
- ✅ Verify all requested scopes are valid for the platform
- ✅ Check that your app has permission to request those scopes

---

## Next Steps

Once all URIs are registered:

1. ✅ Test OAuth flow for each platform
2. ✅ Connect your accounts
3. ✅ Test social media publishing
4. ✅ Monitor token refresh logs

See **OAUTH_TESTING_GUIDE.md** for detailed testing procedures.

---

## Support

For detailed setup instructions, see **OAUTH_REDIRECT_URI_REGISTRATION.md**

For testing procedures, see **OAUTH_TESTING_GUIDE.md**
