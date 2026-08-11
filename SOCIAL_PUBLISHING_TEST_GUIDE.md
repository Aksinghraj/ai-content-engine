# Social Publishing Test Guide

This guide provides step-by-step procedures to test the social media publishing feature across all platforms.

## Prerequisites

Before testing, ensure:
- [ ] All OAuth redirect URIs are registered (see QUICK_START_OAUTH_SETUP.md)
- [ ] You have connected at least one social media account
- [ ] You're logged into Lumae AI
- [ ] Browser console is open (F12)

---

## Test Scenario 1: Single Platform Publishing

**Objective:** Publish content to one platform and verify it appears

### Test 1.1: Publish to Instagram

**Setup:**
1. Navigate to **Dashboard → Social Publishing**
2. Verify Instagram is listed as "Connected"

**Steps:**
1. Enter content: `Testing Lumae AI social publishing! 🚀 #AI #ContentMarketing`
2. Upload an image (JPG/PNG)
3. Select only **Instagram** platform
4. Click **Publish to 1 Platform**
5. Wait for success message

**Verification:**
- [ ] Success toast notification appears
- [ ] Content is published to your Instagram account
- [ ] Image is displayed correctly
- [ ] Hashtags are preserved

**Expected Result:** ✅ Post appears on Instagram within 30 seconds

---

### Test 1.2: Publish to Facebook

**Setup:**
1. Ensure Facebook account is connected
2. Navigate to **Social Publishing** page

**Steps:**
1. Enter content: `Check out Lumae AI - the AI-powered content automation platform! 🤖`
2. Optionally upload an image
3. Select only **Facebook** platform
4. Click **Publish to 1 Platform**

**Verification:**
- [ ] Success message appears
- [ ] Post appears on your Facebook page
- [ ] Image displays correctly (if uploaded)

**Expected Result:** ✅ Post appears on Facebook

---

### Test 1.3: Publish to Twitter/X

**Setup:**
1. Ensure Twitter account is connected
2. Navigate to **Social Publishing** page

**Steps:**
1. Enter content: `Just launched Lumae AI! 🎉 Create viral content in seconds. #AI #Automation`
2. Select only **Twitter** platform
3. Click **Publish to 1 Platform**

**Verification:**
- [ ] Success message appears
- [ ] Tweet appears on your timeline
- [ ] Character count is within 280 limit
- [ ] Hashtags are preserved

**Expected Result:** ✅ Tweet appears on Twitter

---

### Test 1.4: Publish to LinkedIn

**Setup:**
1. Ensure LinkedIn account is connected
2. Navigate to **Social Publishing** page

**Steps:**
1. Enter content: `Excited to announce Lumae AI - revolutionizing content creation with AI. Learn more at lumae.co.in`
2. Optionally upload an image
3. Select only **LinkedIn** platform
4. Click **Publish to 1 Platform**

**Verification:**
- [ ] Success message appears
- [ ] Post appears on your LinkedIn feed
- [ ] Image displays correctly (if uploaded)

**Expected Result:** ✅ Post appears on LinkedIn

---

## Test Scenario 2: Multi-Platform Publishing

**Objective:** Publish the same content to multiple platforms simultaneously

### Test 2.1: Publish to 3 Platforms

**Setup:**
1. Ensure Instagram, Facebook, and Twitter are connected
2. Navigate to **Social Publishing** page

**Steps:**
1. Enter content: `Multi-platform publishing test with Lumae AI! 📱 #SocialMedia`
2. Upload an image (for Instagram)
3. Select **Instagram**, **Facebook**, and **Twitter**
4. Click **Publish to 3 Platforms**
5. Wait for completion

**Verification:**
- [ ] Success message shows "Published to 3 platforms"
- [ ] Post appears on Instagram with image
- [ ] Post appears on Facebook with image
- [ ] Tweet appears on Twitter (text only)
- [ ] All posts appear within 1 minute

**Expected Result:** ✅ Content published to all 3 platforms

---

### Test 2.2: Publish to All 6 Platforms

**Setup:**
1. Ensure all 6 platforms are connected (Instagram, Facebook, Twitter, LinkedIn, YouTube, TikTok)
2. Navigate to **Social Publishing** page

**Steps:**
1. Enter content: `Lumae AI is now live on all major social platforms! 🌟 #AI #ContentMarketing #Automation`
2. Upload a video (for YouTube/TikTok)
3. Select all 6 platforms
4. Click **Publish to 6 Platforms**
5. Wait for completion

**Verification:**
- [ ] Success message shows "Published to 6 platforms"
- [ ] Content appears on all platforms within 2 minutes
- [ ] Video displays on YouTube and TikTok
- [ ] Images display on Instagram and Facebook
- [ ] Text posts appear on Twitter and LinkedIn

**Expected Result:** ✅ Content published to all 6 platforms

---

## Test Scenario 3: Character Limit Validation

**Objective:** Verify character limits are enforced per platform

### Test 3.1: Twitter Character Limit

**Setup:**
1. Navigate to **Social Publishing** page
2. Select **Twitter** platform

**Steps:**
1. Enter content longer than 280 characters:
   ```
   This is a very long tweet that exceeds the 280 character limit on Twitter. 
   It should trigger a warning message when I try to publish it. 
   The system should prevent me from publishing this content to Twitter.
   ```
2. Observe the warning message
3. Try to click **Publish**

**Verification:**
- [ ] Warning message appears: "Content exceeds Twitter's 280 character limit"
- [ ] Publish button is disabled
- [ ] Character count displays: "XXX characters"

**Expected Result:** ✅ System prevents publishing oversized content

---

### Test 3.2: Platform-Specific Limits

**Setup:**
1. Navigate to **Social Publishing** page

**Steps:**
1. Select multiple platforms with different limits
2. Enter content at 500 characters
3. Observe which platforms show warnings

**Verification:**
- [ ] Instagram shows warning (2200 char limit - OK)
- [ ] Facebook shows warning (63206 char limit - OK)
- [ ] Twitter shows warning (280 char limit - WARNING)
- [ ] LinkedIn shows warning (3000 char limit - OK)

**Expected Result:** ✅ Only Twitter shows warning

---

## Test Scenario 4: Media Upload

**Objective:** Verify media uploads work correctly

### Test 4.1: Single Image Upload

**Steps:**
1. Navigate to **Social Publishing** page
2. Click media upload area
3. Select a JPG/PNG image (< 10MB)
4. Verify preview appears
5. Select Instagram and Facebook
6. Click **Publish**

**Verification:**
- [ ] Image preview displays
- [ ] Image uploads successfully
- [ ] Image appears on Instagram
- [ ] Image appears on Facebook

**Expected Result:** ✅ Image published to both platforms

---

### Test 4.2: Multiple Media Upload

**Steps:**
1. Navigate to **Social Publishing** page
2. Upload 3 images
3. Select Instagram
4. Click **Publish**

**Verification:**
- [ ] All 3 images upload
- [ ] First image is used for Instagram (carousel not supported in this version)
- [ ] Image appears on Instagram

**Expected Result:** ✅ First image published to Instagram

---

### Test 4.3: Remove Media

**Steps:**
1. Upload an image
2. Click the X button to remove it
3. Verify it's removed from preview

**Verification:**
- [ ] Image is removed from preview
- [ ] Upload area resets to empty state

**Expected Result:** ✅ Media removal works

---

## Test Scenario 5: Error Handling

**Objective:** Verify error handling for various failure scenarios

### Test 5.1: Publish Without Content

**Steps:**
1. Navigate to **Social Publishing** page
2. Don't enter any content
3. Select a platform
4. Click **Publish**

**Verification:**
- [ ] Error message appears: "Please enter some content"
- [ ] Nothing is published

**Expected Result:** ✅ Error prevented

---

### Test 5.2: Publish Without Platform Selection

**Steps:**
1. Navigate to **Social Publishing** page
2. Enter content
3. Don't select any platform
4. Click **Publish**

**Verification:**
- [ ] Error message appears: "Please select at least one platform"
- [ ] Nothing is published

**Expected Result:** ✅ Error prevented

---

### Test 5.3: Publish to Disconnected Account

**Steps:**
1. Navigate to **Connected Accounts** page
2. Disconnect one platform
3. Go back to **Social Publishing**
4. Try to publish to the disconnected platform

**Verification:**
- [ ] Error message indicates account not connected
- [ ] Publish fails gracefully

**Expected Result:** ✅ Error handled gracefully

---

## Test Scenario 6: Performance

**Objective:** Verify system performance under load

### Test 6.1: Rapid Publishing

**Steps:**
1. Publish content to all 6 platforms
2. Immediately publish again to all 6 platforms
3. Repeat 3 times

**Verification:**
- [ ] No errors occur
- [ ] All posts are published
- [ ] No duplicate posts
- [ ] System remains responsive

**Expected Result:** ✅ System handles rapid publishing

---

### Test 6.2: Large Content

**Steps:**
1. Enter maximum allowed content (5000 characters)
2. Upload a large image
3. Select all platforms
4. Click **Publish**

**Verification:**
- [ ] Content publishes successfully
- [ ] No timeouts occur
- [ ] Posts appear on all platforms

**Expected Result:** ✅ System handles large content

---

## Test Scenario 7: Platform-Specific Features

**Objective:** Verify platform-specific functionality

### Test 7.1: Hashtags

**Steps:**
1. Enter content with hashtags: `#AI #ContentMarketing #Automation`
2. Publish to all platforms
3. Verify hashtags appear on each platform

**Verification:**
- [ ] Hashtags appear on Instagram
- [ ] Hashtags appear on Facebook
- [ ] Hashtags appear on Twitter
- [ ] Hashtags appear on LinkedIn

**Expected Result:** ✅ Hashtags preserved across platforms

---

### Test 7.2: Mentions

**Steps:**
1. Enter content with mentions: `Check out @lumae_ai for content automation`
2. Publish to Twitter and LinkedIn
3. Verify mentions are clickable

**Verification:**
- [ ] Mentions appear on Twitter
- [ ] Mentions appear on LinkedIn
- [ ] Mentions are clickable

**Expected Result:** ✅ Mentions preserved and clickable

---

## Final Verification Checklist

- [ ] Single platform publishing works (all 6 platforms)
- [ ] Multi-platform publishing works
- [ ] Character limits are enforced
- [ ] Media uploads work correctly
- [ ] Error handling works for all scenarios
- [ ] System performs well under load
- [ ] Platform-specific features work
- [ ] Posts appear on all platforms within 2 minutes
- [ ] No duplicate posts are created
- [ ] System remains responsive

---

## Deployment Readiness

Once all tests pass, the social publishing feature is ready for production:

✅ Single platform publishing verified
✅ Multi-platform publishing verified
✅ Character limit validation working
✅ Media uploads working
✅ Error handling verified
✅ Performance verified
✅ Platform-specific features working

**Status:** 🚀 Ready for production deployment
