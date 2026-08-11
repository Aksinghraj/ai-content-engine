# OAuth Testing & Verification Guide

This guide provides step-by-step procedures to test and verify the OAuth implementation for all 6 social platforms.

## Pre-Testing Checklist

Before testing, ensure:
- [ ] All redirect URIs are registered with each platform (see OAUTH_REDIRECT_URI_REGISTRATION.md)
- [ ] OAuth credentials (Client ID/Secret) are configured in Lumae AI
- [ ] You have test accounts for each platform
- [ ] You're logged into Lumae AI
- [ ] Browser console is open (F12 or right-click → Inspect)

## Testing Procedures

### Test 1: Instagram OAuth Flow

**Objective:** Verify Instagram authorization and token storage

**Steps:**
1. Navigate to **Dashboard → Connected Accounts**
2. Locate the **Instagram** card
3. Click **Connect**
4. You should be redirected to Instagram login
5. Log in with your Instagram test account
6. Grant permission when prompted
7. You should be redirected back to Connected Accounts
8. Verify:
   - [ ] Instagram card shows "Connected" badge
   - [ ] Username is displayed
   - [ ] Token expiration date is shown
   - [ ] "Refresh" and "Disconnect" buttons appear

**Expected Result:** ✅ Account successfully connected

**Troubleshooting:**
- If redirected to error page, check browser console for error message
- If stuck on Instagram login, verify redirect URI is registered
- If "Invalid platform app" error, check server logs

---

### Test 2: Facebook OAuth Flow

**Objective:** Verify Facebook authorization and token storage

**Steps:**
1. On **Connected Accounts** page, locate **Facebook** card
2. Click **Connect**
3. Log in with your Facebook test account
4. Grant permission for pages management
5. Verify connection (same as Instagram test above)

**Expected Result:** ✅ Account successfully connected

---

### Test 3: Twitter/X OAuth Flow

**Objective:** Verify Twitter authorization and token storage

**Steps:**
1. On **Connected Accounts** page, locate **Twitter / X** card
2. Click **Connect**
3. Log in with your Twitter test account
4. Grant permission
5. Verify connection

**Expected Result:** ✅ Account successfully connected

**Note:** Twitter requires elevated API access. If you get "app not authorized" error, request elevated access in Twitter Developer Portal.

---

### Test 4: LinkedIn OAuth Flow

**Objective:** Verify LinkedIn authorization and token storage

**Steps:**
1. On **Connected Accounts** page, locate **LinkedIn** card
2. Click **Connect**
3. Log in with your LinkedIn account
4. Grant permission for profile and social sharing
5. Verify connection

**Expected Result:** ✅ Account successfully connected

---

### Test 5: YouTube OAuth Flow

**Objective:** Verify YouTube authorization and token storage

**Steps:**
1. On **Connected Accounts** page, locate **YouTube** card
2. Click **Connect**
3. Log in with your Google account
4. Grant permission for YouTube access
5. Verify connection

**Expected Result:** ✅ Account successfully connected

**Note:** YouTube uses Google OAuth, so you'll be redirected to Google login.

---

### Test 6: TikTok OAuth Flow

**Objective:** Verify TikTok authorization and token storage

**Steps:**
1. On **Connected Accounts** page, locate **TikTok** card
2. Click **Connect**
3. Log in with your TikTok account
4. Grant permission
5. Verify connection

**Expected Result:** ✅ Account successfully connected

**Note:** TikTok requires app review. If you get "app not approved" error, submit your app for review in TikTok Developer Portal.

---

## Advanced Testing

### Test 7: Token Refresh

**Objective:** Verify automatic token refresh for YouTube, LinkedIn, Facebook

**Steps:**
1. Connect YouTube, LinkedIn, and Facebook accounts
2. Wait 5 minutes (or manually trigger refresh)
3. Click **Refresh** button on each card
4. Verify:
   - [ ] No error message appears
   - [ ] Token expiration date updates
   - [ ] Success toast notification appears

**Expected Result:** ✅ Tokens refreshed successfully

---

### Test 8: Disconnect Account

**Objective:** Verify token revocation and database cleanup

**Steps:**
1. On **Connected Accounts** page, click **Disconnect** on any account
2. Confirm the action when prompted
3. Verify:
   - [ ] Card shows "Connect" button again
   - [ ] "Connected" badge disappears
   - [ ] Success toast notification appears
   - [ ] Token is removed from database

**Expected Result:** ✅ Account disconnected and tokens removed

**Verification:**
- Check database: `SELECT * FROM socialConnections WHERE userId = ? AND platform = ?`
- Verify `accessToken` is NULL and `isConnected` is false

---

### Test 9: Error Handling

**Objective:** Verify proper error handling for OAuth failures

**Steps:**

**Scenario A: User Denies Permission**
1. Click **Connect** on any platform
2. Click "Deny" or "Cancel" on the OAuth consent screen
3. Verify:
   - [ ] Redirected back to Connected Accounts
   - [ ] Error toast notification appears
   - [ ] Account remains disconnected

**Scenario B: Invalid Credentials**
1. Temporarily change OAuth credentials in environment variables
2. Click **Connect**
3. Verify:
   - [ ] Error message appears
   - [ ] User is informed of the issue

**Scenario C: Network Timeout**
1. Disconnect from internet during OAuth flow
2. Verify:
   - [ ] Timeout error is handled gracefully
   - [ ] User can retry

**Expected Result:** ✅ All errors handled gracefully with informative messages

---

## Database Verification

After successful OAuth connections, verify database entries:

```sql
-- Check all connected accounts for current user
SELECT 
  id,
  userId,
  platform,
  username,
  platformUserId,
  isConnected,
  tokenExpiresAt,
  createdAt,
  updatedAt
FROM socialConnections
WHERE userId = ? AND isConnected = true;
```

**Expected Output:**
- One row per connected platform
- `isConnected` = true
- `accessToken` is encrypted (not readable)
- `tokenExpiresAt` is a valid future date

---

## Server Log Verification

Check server logs for OAuth flow events:

```
[OAuth] Exchanging code for instagram...
[OAuth] Token exchange successful for instagram
[OAuth] User info fetched for instagram: username
[OAuth] Social connection saved for instagram (user: 123)
```

**Expected Logs:**
- Code exchange succeeds
- User info is fetched
- Connection is saved to database

---

## Performance Testing

### Test 10: Multiple Concurrent Connections

**Objective:** Verify system handles multiple simultaneous OAuth connections

**Steps:**
1. Open 2 browser tabs with Lumae AI
2. In Tab 1, click **Connect** on Instagram
3. In Tab 2, click **Connect** on Facebook
4. Complete both OAuth flows simultaneously
5. Verify both accounts are connected

**Expected Result:** ✅ Both connections succeed without conflicts

---

### Test 11: Rapid Reconnection

**Objective:** Verify system handles rapid connect/disconnect cycles

**Steps:**
1. Connect an account
2. Immediately disconnect
3. Immediately reconnect
4. Repeat 3 times
5. Verify:
   - [ ] No database errors
   - [ ] Final state is correct
   - [ ] No orphaned tokens

**Expected Result:** ✅ System handles rapid cycles correctly

---

## Compliance Verification

### Test 12: Token Security

**Objective:** Verify tokens are encrypted and never exposed

**Steps:**
1. Connect an account
2. Open browser DevTools → Network tab
3. Check all network requests
4. Verify:
   - [ ] Access tokens are never sent in URLs
   - [ ] Access tokens are never logged in console
   - [ ] Tokens are only sent in Authorization headers
   - [ ] Responses don't contain raw tokens

**Expected Result:** ✅ Tokens are secure and never exposed

---

### Test 13: CSRF Protection

**Objective:** Verify state token validation prevents CSRF attacks

**Steps:**
1. Connect an account successfully
2. Manually modify the `state` parameter in the callback URL
3. Verify:
   - [ ] Connection fails
   - [ ] Error message appears
   - [ ] Account is not connected

**Expected Result:** ✅ CSRF attack is prevented

---

## Final Verification Checklist

- [ ] All 6 platforms connect successfully
- [ ] Tokens are stored encrypted in database
- [ ] Token refresh works for YouTube, LinkedIn, Facebook
- [ ] Disconnect removes tokens from database
- [ ] Error handling works for all failure scenarios
- [ ] Server logs show correct OAuth flow
- [ ] Tokens are never exposed in logs or network
- [ ] CSRF protection is working
- [ ] Multiple concurrent connections work
- [ ] Rapid connect/disconnect cycles work

## Deployment Readiness

Once all tests pass, the OAuth implementation is ready for production:

✅ All redirect URIs registered
✅ All credentials configured
✅ All tests passing
✅ Error handling verified
✅ Security verified
✅ Performance verified

**Status:** 🚀 Ready for production deployment
