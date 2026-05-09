# OAuth 2.0 Setup Guide for Social Media Automation

This guide walks you through setting up OAuth 2.0 credentials for all 6 supported social media platforms.

## Overview

The app uses **OAuth 2.0 Authorization Code Grant with PKCE** (RFC 7636) for secure authentication. This means:
- ✅ Users authorize the app to access their accounts
- ✅ Tokens are encrypted and stored securely
- ✅ Automatic token refresh when expired
- ✅ No passwords are stored

## Environment Variables

All OAuth credentials are stored in `.env` file. Here's the complete list:

```env
# Instagram
INSTAGRAM_CLIENT_ID=your_instagram_app_id
INSTAGRAM_CLIENT_SECRET=your_instagram_app_secret

# Twitter/X
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret

# LinkedIn
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# Facebook
FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret

# YouTube
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret

# TikTok
TIKTOK_CLIENT_ID=your_tiktok_client_key
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret

# Encryption key for token storage
OAUTH_ENCRYPTION_KEY=your_secure_encryption_key_min_32_chars

# App URL (for OAuth redirects)
APP_URL=https://yourdomain.com
```

---

## Platform-by-Platform Setup

### 1. Instagram

**Step 1: Create Meta App**
1. Go to [Meta Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Choose "Consumer" as app type
4. Fill in app details

**Step 2: Add Instagram Product**
1. In your app dashboard, click "Add Product"
2. Find "Instagram Graph API" and click "Set Up"
3. Accept terms and complete setup

**Step 3: Get Credentials**
1. Go to Settings → Basic
2. Copy **App ID** → `INSTAGRAM_CLIENT_ID`
3. Copy **App Secret** → `INSTAGRAM_CLIENT_SECRET`

**Step 4: Configure OAuth Redirect URI**
1. Go to Settings → Basic → App Domains
2. Add your domain (e.g., `yourdomain.com`)
3. Go to Instagram → Basic Display → Redirect URIs
4. Add: `https://yourdomain.com/api/oauth/callback/instagram`

**Required Scopes:**
- `instagram_basic`
- `instagram_graph_user`
- `pages_read_engagement`
- `pages_manage_metadata`
- `instagram_graph_user_media`
- `pages_read_user_content`
- `pages_manage_posts`

---

### 2. Twitter/X

**Step 1: Create Twitter Developer Account**
1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Apply for a developer account if you haven't already
3. Wait for approval (usually 1-2 hours)

**Step 2: Create an App**
1. Click "Create an app"
2. Choose "Native App" or "Web App"
3. Fill in app details

**Step 3: Get Credentials**
1. Go to App Settings → Keys and Tokens
2. Copy **API Key** → `TWITTER_CLIENT_ID`
3. Copy **API Secret Key** → `TWITTER_CLIENT_SECRET`

**Step 4: Configure OAuth Settings**
1. Go to App Settings → Authentication Settings
2. Enable "3-legged OAuth"
3. Set Callback URI: `https://yourdomain.com/api/oauth/callback/twitter`
4. Set Website URL: `https://yourdomain.com`
5. Set Terms of Service URL: `https://yourdomain.com/terms`
6. Set Privacy Policy URL: `https://yourdomain.com/privacy`

**Required Scopes:**
- `tweet.read`
- `tweet.write`
- `users.read`
- `follows.read`
- `follows.write`
- `offline.access` (for refresh tokens)
- `mute.read`
- `mute.write`
- `like.read`
- `like.write`
- `list.read`
- `list.write`
- `bookmark.read`
- `bookmark.write`
- `block.read`
- `block.write`
- `space.read`

**Note:** Twitter requires PKCE for enhanced security (already implemented).

---

### 3. LinkedIn

**Step 1: Create LinkedIn App**
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Click "Create app"
3. Fill in app details and accept terms

**Step 2: Get Credentials**
1. Go to Auth tab
2. Copy **Client ID** → `LINKEDIN_CLIENT_ID`
3. Copy **Client Secret** → `LINKEDIN_CLIENT_SECRET`

**Step 3: Configure Redirect URI**
1. In Auth tab, under "Authorized redirect URLs"
2. Add: `https://yourdomain.com/api/oauth/callback/linkedin`

**Required Scopes:**
- `profile`
- `email`
- `openid`
- `w_member_social` (post on behalf of member)
- `w_organization_social` (post on behalf of organization)

---

### 4. Facebook

**Step 1: Create Facebook App**
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Choose "Consumer" type
4. Fill in app details

**Step 2: Add Facebook Login Product**
1. In app dashboard, click "Add Product"
2. Find "Facebook Login" and click "Set Up"

**Step 3: Get Credentials**
1. Go to Settings → Basic
2. Copy **App ID** → `FACEBOOK_CLIENT_ID`
3. Copy **App Secret** → `FACEBOOK_CLIENT_SECRET`

**Step 4: Configure OAuth**
1. Go to Facebook Login → Settings
2. Add Valid OAuth Redirect URIs: `https://yourdomain.com/api/oauth/callback/facebook`
3. Add App Domains: `yourdomain.com`

**Required Scopes:**
- `public_profile`
- `email`
- `pages_read_user_content`
- `pages_read_engagement`
- `pages_manage_posts`
- `pages_manage_engagement`
- `pages_manage_metadata`
- `instagram_basic`
- `instagram_graph_user_media`

---

### 5. YouTube

**Step 1: Create Google Cloud Project**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable "YouTube Data API v3"

**Step 2: Create OAuth Credentials**
1. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
2. Choose "Web application"
3. Add Authorized redirect URIs: `https://yourdomain.com/api/oauth/callback/youtube`

**Step 3: Get Credentials**
1. Download the JSON file
2. Copy **Client ID** → `YOUTUBE_CLIENT_ID`
3. Copy **Client Secret** → `YOUTUBE_CLIENT_SECRET`

**Required Scopes:**
- `https://www.googleapis.com/auth/youtube` (full access)
- `https://www.googleapis.com/auth/youtube.upload` (upload videos)
- `https://www.googleapis.com/auth/youtube.readonly` (read-only)
- `https://www.googleapis.com/auth/userinfo.email`
- `https://www.googleapis.com/auth/userinfo.profile`

---

### 6. TikTok

**Step 1: Create TikTok Developer Account**
1. Go to [TikTok Developer](https://developers.tiktok.com/)
2. Sign up for a developer account
3. Complete business verification

**Step 2: Create an App**
1. Go to "My Apps" → "Create an app"
2. Choose "Web App"
3. Fill in app details

**Step 3: Get Credentials**
1. Go to App Settings
2. Copy **Client Key** → `TIKTOK_CLIENT_ID`
3. Copy **Client Secret** → `TIKTOK_CLIENT_SECRET`

**Step 4: Configure OAuth**
1. In App Settings → OAuth Settings
2. Add Redirect URI: `https://yourdomain.com/api/oauth/callback/tiktok`

**Required Scopes:**
- `user.info.basic` (basic user info)
- `user.info.profile` (profile info)
- `video.list` (list videos)
- `video.upload` (upload videos)
- `video.publish` (publish videos)

**Note:** TikTok recommends PKCE (already implemented).

---

## Testing OAuth Flow

### Step 1: Start the App
```bash
pnpm dev
```

### Step 2: Navigate to Social Automation
1. Go to Dashboard → Social Media Automation
2. Click "Connect [Platform]"

### Step 3: Authorize
1. You'll be redirected to the platform's login page
2. Log in with your account
3. Authorize the app to access your account
4. You'll be redirected back to the app

### Step 4: Verify Connection
1. Check if the account appears in "Connected Accounts"
2. You should see the platform name, username, and connection status

---

## Troubleshooting

### "Invalid Client ID" Error
- ✅ Check that you've copied the credentials correctly
- ✅ Verify the credentials match the platform in `.env`
- ✅ Ensure no extra spaces or quotes

### "Redirect URI Mismatch" Error
- ✅ Verify the redirect URI matches exactly: `https://yourdomain.com/api/oauth/callback/{platform}`
- ✅ Check that your domain is correct in `.env` (`APP_URL`)
- ✅ Ensure the platform's OAuth settings have the exact same URI

### "Token Expired" Error
- ✅ The app automatically refreshes tokens
- ✅ If you see this error, try disconnecting and reconnecting the account
- ✅ Check that `OAUTH_ENCRYPTION_KEY` is set correctly

### "Permission Denied" Error
- ✅ Ensure all required scopes are configured in the platform's app settings
- ✅ Some scopes require additional app review (e.g., publishing permissions)
- ✅ Check the platform's documentation for scope requirements

---

## Security Best Practices

1. **Never commit credentials to Git**
   - Use `.env` file (already in `.gitignore`)
   - Use environment variables in production

2. **Rotate credentials regularly**
   - Update client secrets every 90 days
   - Revoke old credentials after rotation

3. **Use HTTPS only**
   - OAuth requires HTTPS in production
   - Never use HTTP for OAuth redirects

4. **Encrypt tokens**
   - Tokens are encrypted with AES-256-GCM
   - Use a strong `OAUTH_ENCRYPTION_KEY` (min 32 characters)

5. **Monitor token usage**
   - Check platform dashboards for suspicious activity
   - Set up alerts for unusual API usage

---

## API Endpoints

Once OAuth is configured, use these tRPC procedures:

```typescript
// Get authorization URL
trpc.oauthManagement.getAuthorizationUrl.query({ platform: "instagram" })

// Get connected accounts
trpc.oauthManagement.getConnectedAccounts.query()

// Get specific account
trpc.oauthManagement.getAccount.query({ platform: "instagram" })

// Disconnect account
trpc.oauthManagement.disconnectAccount.mutate({ connectionId: 123 })

// Refresh token
trpc.oauthManagement.refreshToken.mutate({ platform: "instagram" })

// Get valid access token
trpc.oauthManagement.getAccessToken.query({ platform: "instagram" })

// Check if token is expired
trpc.oauthManagement.isTokenExpired.query({ platform: "instagram" })
```

---

## Next Steps

1. ✅ Set up all 6 platform credentials
2. ✅ Add credentials to `.env` file
3. ✅ Test OAuth flow for each platform
4. ✅ Build UI for managing connected accounts
5. ✅ Implement posting functionality

Happy automating! 🚀
