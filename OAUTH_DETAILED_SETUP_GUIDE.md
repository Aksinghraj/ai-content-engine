# OAuth Redirect URI Setup - Detailed Guide

This guide provides exact navigation paths for registering redirect URIs with each platform.

---

## Platform-by-Platform Setup

### 1️⃣ Instagram (Meta)

**Your Redirect URI:** `https://lumae.co.in/api/oauth/callback/instagram`

#### Navigation Path:
```
Meta Developers Dashboard
  ↓
Select Your App
  ↓
Products (left sidebar)
  ↓
Instagram Graph API
  ↓
Settings
  ↓
Basic Display
  ↓
Valid OAuth Redirect URIs (scroll down)
  ↓
Click "Add URI"
  ↓
Paste: https://lumae.co.in/api/oauth/callback/instagram
  ↓
Click "Save Changes"
```

#### Scopes Required:
- `user_profile`
- `user_media`

#### Verification:
After saving, you should see your URI listed under "Valid OAuth Redirect URIs". If you see it, ✅ you're done with Instagram.

---

### 2️⃣ Facebook

**Your Redirect URI:** `https://lumae.co.in/api/oauth/callback/facebook`

#### Navigation Path:
```
Meta Developers Dashboard
  ↓
Select Your App
  ↓
Products (left sidebar)
  ↓
Facebook Login
  ↓
Settings
  ↓
Valid OAuth Redirect URIs (scroll down)
  ↓
Click "Add URI"
  ↓
Paste: https://lumae.co.in/api/oauth/callback/facebook
  ↓
Click "Save Changes"
```

#### Scopes Required:
- `public_profile`
- `pages_manage_posts`
- `pages_read_engagement`

#### Verification:
After saving, you should see your URI listed. If you see it, ✅ you're done with Facebook.

---

### 3️⃣ Twitter/X

**Your Redirect URI:** `https://lumae.co.in/api/oauth/callback/twitter`

#### Navigation Path:
```
Twitter Developer Portal
  ↓
Select Your App
  ↓
Settings (top menu)
  ↓
Authentication Settings
  ↓
OAuth 2.0 Settings
  ↓
Click "Edit"
  ↓
Redirect URIs section
  ↓
Click "Add"
  ↓
Paste: https://lumae.co.in/api/oauth/callback/twitter
  ↓
Website URL: https://lumae.co.in
  ↓
Click "Save"
```

#### Scopes Required:
- `tweet.read`
- `tweet.write`
- `users.read`
- `follows.manage`
- `follows.read`

#### Verification:
After saving, you should see your URI in the Redirect URIs list. If you see it, ✅ you're done with Twitter.

---

### 4️⃣ LinkedIn

**Your Redirect URI:** `https://lumae.co.in/api/oauth/callback/linkedin`

#### Navigation Path:
```
LinkedIn Developers
  ↓
My apps (top right)
  ↓
Select Your App
  ↓
Auth (left sidebar)
  ↓
Authorized redirect URLs for your app
  ↓
Click "Add redirect URL"
  ↓
Paste: https://lumae.co.in/api/oauth/callback/linkedin
  ↓
Click "Update"
```

#### Scopes Required:
- `r_basicprofile`
- `w_member_social`

#### Verification:
After updating, you should see your URI in the list. If you see it, ✅ you're done with LinkedIn.

---

### 5️⃣ YouTube (Google Cloud)

**Your Redirect URI:** `https://lumae.co.in/api/oauth/callback/youtube`

#### Navigation Path:
```
Google Cloud Console
  ↓
Select Your Project
  ↓
APIs & Services (left sidebar)
  ↓
Credentials
  ↓
Click Your OAuth 2.0 Client ID (Web application)
  ↓
Authorized redirect URIs section
  ↓
Click "Add URI"
  ↓
Paste: https://lumae.co.in/api/oauth/callback/youtube
  ↓
Click "Save"
```

#### Scopes Required:
- `https://www.googleapis.com/auth/youtube.upload`
- `https://www.googleapis.com/auth/youtube.readonly`

#### Verification:
After saving, you should see your URI in the list. If you see it, ✅ you're done with YouTube.

---

### 6️⃣ TikTok

**Your Redirect URI:** `https://lumae.co.in/api/oauth/callback/tiktok`

#### Navigation Path:
```
TikTok Developer
  ↓
Select Your App
  ↓
App Settings
  ↓
Redirect URLs section
  ↓
Click "Add"
  ↓
Paste: https://lumae.co.in/api/oauth/callback/tiktok
  ↓
Click "Save"
```

#### Scopes Required:
- `user.info.basic`
- `video.upload`
- `video.publish`

#### Verification:
After saving, you should see your URI in the list. If you see it, ✅ you're done with TikTok.

---

## Quick Copy-Paste URIs

For easy reference, here are all 6 redirect URIs:

```
Instagram:  https://lumae.co.in/api/oauth/callback/instagram
Facebook:   https://lumae.co.in/api/oauth/callback/facebook
Twitter:    https://lumae.co.in/api/oauth/callback/twitter
LinkedIn:   https://lumae.co.in/api/oauth/callback/linkedin
YouTube:    https://lumae.co.in/api/oauth/callback/youtube
TikTok:     https://lumae.co.in/api/oauth/callback/tiktok
```

---

## Testing After Registration

Once you've registered all redirect URIs, test the OAuth flow:

### Test Steps:

1. **Open Lumae Dashboard**
   - Go to https://lumae.co.in
   - Click "Dashboard"
   - Navigate to "Connected Accounts" (in sidebar under "Settings")

2. **Test Instagram Connect**
   - Click the "Connect" button next to Instagram
   - You should be redirected to Instagram's OAuth consent screen
   - Click "Authorize" or "Allow"
   - You should be redirected back to Lumae
   - Instagram should now show as "Connected" with your username

3. **Repeat for Each Platform**
   - Test Facebook, Twitter, LinkedIn, YouTube, TikTok
   - Each should follow the same pattern

4. **Verify Token Storage**
   - After connecting, your access token is encrypted and stored securely
   - You can now use the connected account for posting

---

## Common Issues & Solutions

### Issue: "Redirect URI mismatch"
**Cause:** The URI you're trying to authenticate with doesn't match what's registered.
**Solution:**
- Copy the exact URI from this guide (case-sensitive)
- Check for trailing slashes (there should be none)
- Ensure it starts with `https://` (not `http://`)
- Wait 5-10 minutes for changes to propagate
- Try again

### Issue: "Invalid Client ID"
**Cause:** The Client ID or Secret in environment variables is wrong.
**Solution:**
- Verify Client ID and Secret are correctly set in Lumae Settings → Secrets
- Copy them exactly from the developer console (no extra spaces)
- Restart the dev server after updating
- Try again

### Issue: "Redirect URI not registered"
**Cause:** You haven't registered the URI yet or it's not saved.
**Solution:**
- Go back to the developer console
- Verify the URI appears in the list
- If not, add it again and click Save
- Wait 5-10 minutes
- Try again

### Issue: "Invalid Scope"
**Cause:** The scopes requested don't match what's configured.
**Solution:**
- This is usually automatic - the app requests the right scopes
- If you see this error, check the platform's documentation for current scopes
- Contact support if the issue persists

---

## Security Checklist

Before going live, verify:

- ✅ All 6 redirect URIs registered
- ✅ Client IDs and Secrets are in environment variables (not hardcoded)
- ✅ Client Secrets are never exposed to frontend
- ✅ HTTPS is used for all redirect URIs (not HTTP)
- ✅ Tokens are encrypted before storage
- ✅ Access tokens are never logged or displayed
- ✅ Refresh tokens are stored securely

---

## Next Steps

After completing redirect URI registration:

1. ✅ Test OAuth flow for all 6 platforms
2. ⏳ Implement automatic token refresh (YouTube, LinkedIn, Facebook)
3. ⏳ Add social post publishing feature
4. ⏳ Monitor token expiration and refresh automatically

