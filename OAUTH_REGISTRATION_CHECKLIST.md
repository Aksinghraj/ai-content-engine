# OAuth Redirect URI Registration Checklist

Complete this checklist to register redirect URIs with all 6 social media platforms. This is **required** for OAuth to work.

---

## 1. Instagram (Meta App)

**Redirect URI to Register:** `https://lumae.co.in/api/oauth/callback/instagram`

### Steps:

- [ ] Go to [Meta Developers](https://developers.facebook.com/)
- [ ] Select your Instagram app
- [ ] Navigate to **Products** → **Instagram Graph API**
- [ ] Click **Settings** → **Basic Display**
- [ ] Under "Valid OAuth Redirect URIs", click **Add URI**
- [ ] Paste: `https://lumae.co.in/api/oauth/callback/instagram`
- [ ] Click **Save Changes**
- [ ] Verify it appears in the list

**Status:** ⏳ Pending

---

## 2. Facebook

**Redirect URI to Register:** `https://lumae.co.in/api/oauth/callback/facebook`

### Steps:

- [ ] Go to [Meta Developers](https://developers.facebook.com/)
- [ ] Select your Facebook app
- [ ] Navigate to **Products** → **Facebook Login**
- [ ] Click **Settings** → **Valid OAuth Redirect URIs**
- [ ] Add: `https://lumae.co.in/api/oauth/callback/facebook`
- [ ] Click **Save Changes**
- [ ] Verify it appears in the list

**Status:** ⏳ Pending

---

## 3. Twitter/X

**Redirect URI to Register:** `https://lumae.co.in/api/oauth/callback/twitter`

### Steps:

- [ ] Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
- [ ] Select your app
- [ ] Navigate to **Settings** → **Authentication Settings**
- [ ] Under "OAuth 2.0 Settings", click **Edit**
- [ ] Add Redirect URI: `https://lumae.co.in/api/oauth/callback/twitter`
- [ ] Set **Website URL**: `https://lumae.co.in`
- [ ] Click **Save**
- [ ] Verify it appears in the list

**Status:** ⏳ Pending

---

## 4. LinkedIn

**Redirect URI to Register:** `https://lumae.co.in/api/oauth/callback/linkedin`

### Steps:

- [ ] Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
- [ ] Select your app
- [ ] Go to **Auth** tab
- [ ] Under "Authorized redirect URLs for your app", click **Add redirect URL**
- [ ] Add: `https://lumae.co.in/api/oauth/callback/linkedin`
- [ ] Click **Update**
- [ ] Verify it appears in the list

**Status:** ⏳ Pending

---

## 5. YouTube (Google Cloud)

**Redirect URI to Register:** `https://lumae.co.in/api/oauth/callback/youtube`

### Steps:

- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Select your project
- [ ] Go to **APIs & Services** → **Credentials**
- [ ] Click on your OAuth 2.0 Client ID (Web application)
- [ ] Under "Authorized redirect URIs", click **Add URI**
- [ ] Add: `https://lumae.co.in/api/oauth/callback/youtube`
- [ ] Click **Save**
- [ ] Verify it appears in the list

**Status:** ⏳ Pending

---

## 6. TikTok

**Redirect URI to Register:** `https://lumae.co.in/api/oauth/callback/tiktok`

### Steps:

- [ ] Go to [TikTok Developer](https://developer.tiktok.com/)
- [ ] Select your app
- [ ] Go to **App Settings**
- [ ] Under "Redirect URLs", click **Add**
- [ ] Add: `https://lumae.co.in/api/oauth/callback/tiktok`
- [ ] Click **Save**
- [ ] Verify it appears in the list

**Status:** ⏳ Pending

---

## Verification

After registering all redirect URIs, verify they work:

- [ ] All 6 redirect URIs registered
- [ ] Dev server running on https://lumae.co.in
- [ ] Navigate to **Connected Accounts** page in dashboard
- [ ] Click **Connect** button for Instagram
- [ ] You should be redirected to Instagram's OAuth consent screen
- [ ] After authorizing, you should be redirected back to Lumae
- [ ] Account should show as "Connected"
- [ ] Repeat for remaining 5 platforms

---

## Troubleshooting

### "Redirect URI mismatch" Error
- ✅ Verify the exact redirect URI matches (case-sensitive)
- ✅ Check for trailing slashes or extra spaces
- ✅ Ensure HTTPS is used (not HTTP)
- ✅ Wait 5-10 minutes for changes to propagate

### "Invalid Client ID/Secret" Error
- ✅ Verify credentials are correctly copied in environment variables
- ✅ Check for extra spaces or special characters
- ✅ Regenerate credentials if needed
- ✅ Restart dev server after updating credentials

### "Invalid Scope" Error
- ✅ Verify scopes are correct for the platform
- ✅ Check platform documentation for current scope requirements
- ✅ Some platforms require space-separated vs comma-separated scopes

---

## Important Notes

⚠️ **Security:**
- Never share Client Secrets publicly
- Keep them secure in environment variables only
- Use HTTPS only (redirect URIs must use HTTPS in production)
- Rotate credentials regularly

⚠️ **Timing:**
- Changes can take 5-10 minutes to propagate
- If you see errors, wait a bit and try again
- Clear browser cache if needed

⚠️ **Testing:**
- Test each platform individually
- Verify the full OAuth flow works (consent → authorization → token exchange)
- Check that account info is displayed after connecting

---

## Next Steps

Once all redirect URIs are registered and tested:

1. ✅ All platforms connected and working
2. ⏳ Implement automatic token refresh (YouTube, LinkedIn, Facebook)
3. ⏳ Add social post publishing feature
4. ⏳ Add analytics tracking for connected accounts

