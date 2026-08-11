# Troubleshooting: OAuth & Social Publishing

This guide helps resolve common issues with OAuth authentication and social media publishing.

---

## OAuth Issues

### Issue: "Invalid redirect_uri" Error

**Symptoms:**
- Error appears when clicking "Connect"
- Redirected to error page after platform login

**Causes:**
1. Redirect URI not registered with platform
2. Redirect URI doesn't match exactly (case-sensitive)
3. Domain mismatch (e.g., `www.lumae.co.in` instead of `lumae.co.in`)

**Solutions:**
1. **Verify URI is registered:**
   - Go to platform's developer console
   - Check **Redirect URIs** section
   - Ensure `https://lumae.co.in/api/oauth/callback/{platform}` is listed

2. **Check for exact match:**
   - Copy the URI from platform settings
   - Compare with: `https://lumae.co.in/api/oauth/callback/{platform}`
   - Ensure no extra spaces or characters

3. **Wait for propagation:**
   - Changes can take 5-10 minutes to propagate
   - Try again after 10 minutes

4. **Clear browser cache:**
   - Clear cookies and cache
   - Try again in incognito/private mode

---

### Issue: "Invalid scope" Error

**Symptoms:**
- Error during OAuth authorization
- Message mentions "scope" or "permission"

**Causes:**
1. Requested scopes not valid for platform
2. App doesn't have permission to request scopes
3. Scopes changed in platform settings

**Solutions:**
1. **Verify scopes:**
   - Check platform's OAuth documentation
   - Ensure all requested scopes are valid
   - Remove invalid scopes

2. **Check app permissions:**
   - Go to platform's developer console
   - Verify app has permission for requested scopes
   - Request additional permissions if needed

3. **For Instagram/Facebook:**
   - Ensure app is in development mode
   - Add your account as a test user
   - Request elevated access if needed

4. **For Twitter:**
   - Request elevated API access
   - Wait for approval
   - Verify scopes in Twitter Developer Portal

---

### Issue: "Unauthorized" Error

**Symptoms:**
- Error after successful login
- Message: "Unauthorized" or "Authentication failed"

**Causes:**
1. Client ID or Client Secret is incorrect
2. Credentials expired or revoked
3. App is not active/approved

**Solutions:**
1. **Verify credentials:**
   - Go to Lumae AI Settings → Secrets
   - Check `{PLATFORM}_CLIENT_ID` and `{PLATFORM}_CLIENT_SECRET`
   - Copy correct values from platform's developer console
   - Update if incorrect

2. **Check app status:**
   - Go to platform's developer console
   - Verify app is active and not suspended
   - Verify app is approved (if required)

3. **Regenerate credentials:**
   - Go to platform's developer console
   - Regenerate Client ID and Secret
   - Update in Lumae AI Settings → Secrets

4. **Check token expiration:**
   - Some platforms require periodic credential rotation
   - Regenerate and update credentials

---

### Issue: "User denied access"

**Symptoms:**
- User clicks "Deny" on OAuth consent screen
- Account not connected

**Causes:**
- User intentionally denied access
- User clicked wrong button

**Solutions:**
1. **Try again:**
   - Click "Connect" again
   - This time click "Allow" or "Authorize"

2. **Check permissions:**
   - Ensure you're requesting appropriate permissions
   - Some users deny access if permissions seem excessive

---

### Issue: "App not authorized" (Twitter)

**Symptoms:**
- Error when connecting Twitter account
- Message: "App not authorized"

**Causes:**
- Twitter app doesn't have elevated API access
- Elevated access request not approved

**Solutions:**
1. **Request elevated access:**
   - Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
   - Click "Products" → "Twitter API v2"
   - Click "Elevated" → "Request access"
   - Fill out the form
   - Wait for approval (usually 24-48 hours)

2. **Verify access level:**
   - Go to Twitter Developer Portal
   - Check "Products" → "Twitter API v2"
   - Verify you have "Elevated" access

---

### Issue: "App not approved" (TikTok)

**Symptoms:**
- Error when connecting TikTok account
- Message: "App not approved"

**Causes:**
- TikTok app hasn't been submitted for review
- App review is pending
- App was rejected

**Solutions:**
1. **Submit for review:**
   - Go to [TikTok Developers](https://developers.tiktok.com/)
   - Select your app
   - Click "Submit for review"
   - Fill out the form with your use case
   - Wait for approval (usually 1-2 weeks)

2. **Check review status:**
   - Go to TikTok Developers
   - Check "App Review" status
   - If rejected, fix issues and resubmit

---

## Social Publishing Issues

### Issue: "Content exceeds character limit"

**Symptoms:**
- Error when trying to publish
- Message: "Content exceeds {platform} limit"

**Causes:**
- Content is longer than platform's character limit
- Platform-specific limit not respected

**Solutions:**
1. **Check character count:**
   - Look at character count display in Social Publishing page
   - Ensure it's within platform limit

2. **Platform limits:**
   - Instagram: 2,200 characters
   - Facebook: 63,206 characters
   - Twitter: 280 characters
   - LinkedIn: 3,000 characters
   - YouTube: 5,000 characters
   - TikTok: 2,200 characters

3. **Shorten content:**
   - Remove unnecessary words
   - Use abbreviations
   - Split into multiple posts

---

### Issue: "Account not connected"

**Symptoms:**
- Error when trying to publish
- Message: "Account not connected"

**Causes:**
- Platform account not connected
- Connection was disconnected
- Token expired

**Solutions:**
1. **Connect account:**
   - Go to **Connected Accounts** page
   - Click "Connect" for the platform
   - Complete OAuth flow

2. **Reconnect account:**
   - Go to **Connected Accounts** page
   - Click "Disconnect"
   - Click "Connect" again
   - Complete OAuth flow

3. **Check token expiration:**
   - Go to **Connected Accounts** page
   - Check "Expires" date
   - If expired, click "Refresh"

---

### Issue: "Failed to publish"

**Symptoms:**
- Generic error message
- Post doesn't appear on platform

**Causes:**
1. Network error
2. Platform API error
3. Invalid content
4. Rate limit exceeded

**Solutions:**
1. **Check network:**
   - Verify internet connection
   - Try again

2. **Check content:**
   - Verify content doesn't violate platform guidelines
   - Ensure media is in correct format
   - Check for special characters that might cause issues

3. **Check rate limits:**
   - Some platforms limit posts per hour/day
   - Wait before posting again
   - Check platform's rate limit documentation

4. **Check platform status:**
   - Go to platform's status page
   - Verify platform is not experiencing outages
   - Try again after platform is back up

5. **Check logs:**
   - Open browser console (F12)
   - Look for error messages
   - Report error to support

---

### Issue: "Post doesn't appear on platform"

**Symptoms:**
- Publishing succeeds
- Post doesn't appear on platform

**Causes:**
1. Post is in moderation queue
2. Post violates platform guidelines
3. Account is restricted
4. Platform delay

**Solutions:**
1. **Wait for moderation:**
   - Some platforms moderate posts before publishing
   - Wait 5-10 minutes
   - Post should appear after moderation

2. **Check account restrictions:**
   - Go to platform
   - Check if account is restricted or suspended
   - Review account status

3. **Check post content:**
   - Verify post doesn't violate platform guidelines
   - Remove flagged content
   - Try posting again

4. **Check platform delay:**
   - Some platforms have delays
   - Wait up to 1 hour
   - Post should appear eventually

---

### Issue: "Media upload fails"

**Symptoms:**
- Error when uploading image/video
- Media preview doesn't appear

**Causes:**
1. File format not supported
2. File size too large
3. Network error

**Solutions:**
1. **Check file format:**
   - Supported formats: JPG, PNG, GIF, MP4, WebM
   - Convert file to supported format
   - Try again

2. **Check file size:**
   - Maximum size: 10MB
   - Compress file if too large
   - Try again

3. **Check network:**
   - Verify internet connection
   - Try again

4. **Try different file:**
   - Try uploading a different image/video
   - Verify it works
   - Try original file again

---

### Issue: "Hashtags not appearing"

**Symptoms:**
- Hashtags in content
- Hashtags don't appear on platform

**Causes:**
1. Platform removed hashtags (spam filter)
2. Hashtag format incorrect
3. Too many hashtags

**Solutions:**
1. **Check hashtag format:**
   - Use format: `#hashtag`
   - No spaces in hashtags
   - No special characters except underscore

2. **Reduce hashtags:**
   - Instagram: max 30 hashtags
   - Twitter: max 5-10 recommended
   - Facebook: max 3-5 recommended
   - LinkedIn: max 3-5 recommended

3. **Avoid spam hashtags:**
   - Don't use banned/blocked hashtags
   - Don't repeat same hashtag
   - Don't use irrelevant hashtags

---

### Issue: "Mentions not clickable"

**Symptoms:**
- Mentions in content (@username)
- Mentions not clickable on platform

**Causes:**
1. Mention format incorrect
2. Username doesn't exist
3. Platform doesn't support mentions in this context

**Solutions:**
1. **Check mention format:**
   - Use format: `@username`
   - No spaces before @
   - Correct username spelling

2. **Verify username exists:**
   - Go to platform
   - Search for username
   - Verify username is correct

3. **Check platform support:**
   - Some platforms don't support mentions in certain contexts
   - Try posting without mentions
   - Verify platform supports mentions

---

## Performance Issues

### Issue: "Publishing is slow"

**Symptoms:**
- Publishing takes more than 5 minutes
- System appears frozen

**Causes:**
1. Network latency
2. Platform API slow
3. Large file upload
4. System overload

**Solutions:**
1. **Check network:**
   - Verify internet connection speed
   - Try from different network
   - Try again during off-peak hours

2. **Check platform status:**
   - Go to platform's status page
   - Verify platform is not experiencing issues
   - Try again later

3. **Reduce file size:**
   - Compress images/videos
   - Reduce resolution
   - Try again

4. **Try again:**
   - Refresh page
   - Try publishing again
   - Check if post was published

---

### Issue: "System freezes during publishing"

**Symptoms:**
- Page becomes unresponsive
- Can't interact with UI

**Causes:**
1. Large file upload
2. Browser memory issue
3. Network timeout

**Solutions:**
1. **Reduce file size:**
   - Compress images/videos
   - Try again

2. **Clear browser cache:**
   - Clear cookies and cache
   - Restart browser
   - Try again

3. **Use different browser:**
   - Try Chrome, Firefox, Safari, Edge
   - Verify it works in different browser

4. **Check browser console:**
   - Open F12
   - Look for error messages
   - Report errors to support

---

## Getting Help

If you can't resolve the issue:

1. **Check documentation:**
   - OAUTH_REDIRECT_URI_REGISTRATION.md
   - OAUTH_TESTING_GUIDE.md
   - SOCIAL_PUBLISHING_TEST_GUIDE.md

2. **Check browser console:**
   - Open F12
   - Look for error messages
   - Copy error and search for solution

3. **Contact support:**
   - Go to Contact page
   - Describe the issue
   - Include error message and steps to reproduce

4. **Check platform status:**
   - Go to platform's status page
   - Verify platform is not experiencing outages

---

## Common Solutions

**Most issues can be resolved by:**
1. Clearing browser cache and cookies
2. Trying again in incognito/private mode
3. Waiting 5-10 minutes for changes to propagate
4. Verifying credentials are correct
5. Checking internet connection
6. Trying from different browser/device
