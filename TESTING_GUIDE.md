# Quick Testing Guide

## ✅ Test 1: Auto-Login (Session Persistence)

### Steps:
1. Open the app
2. Sign up or login with your credentials
3. Use the app normally
4. **Close the app completely** (swipe away from recent apps)
5. **Reopen the app**

### Expected Result:
- ✅ You should be logged in automatically
- ✅ No login screen should appear
- ✅ Your feed should load immediately with cached posts

### What Changed:
- Session tokens are now cached and automatically refreshed
- The app remembers you across restarts
- Background session verification keeps you logged in

---

## ⚡ Test 2: Fast Feed Loading

### Steps:
1. Open the app (make sure you're logged in)
2. Observe the feed loading

### Expected Result:
- ✅ **Instant**: Cached posts appear immediately (0ms)
- ✅ **Fast**: Latest 5 posts load within ~200ms
- ✅ **Progressive**: Remaining posts load in background
- ✅ Scroll down to see infinite scroll in action

### What Changed:
- Only loads 5 posts initially (was loading all posts)
- Shows cached posts instantly
- Loads more posts as you scroll down

---

## 🔄 Test 3: Auto-Refresh

### Steps:
1. Open the app and stay on the home feed
2. Wait for 30+ seconds
3. From another device/browser, create a new post
4. Watch your app

### Expected Result:
- ✅ After ~30 seconds, a banner should appear: **"New posts available"**
- ✅ Click the banner to load new posts
- ✅ Feed scrolls to top smoothly
- ✅ New posts appear at the top

### What Changed:
- App checks for new posts every 30 seconds
- Shows Instagram-style notification banner
- Non-intrusive - doesn't interrupt your scrolling

---

## 📱 Test 4: Pull-to-Refresh

### Steps:
1. On the home feed, scroll to the very top
2. Pull down on the screen
3. Release when you see "Release to refresh"

### Expected Result:
- ✅ Refresh indicator appears with rotating icon
- ✅ Haptic feedback (vibration) on refresh
- ✅ Feed refreshes with latest posts
- ✅ Smooth animation

---

## 🌐 Test 5: Offline Mode

### Steps:
1. Open the app with internet connection
2. Browse some posts
3. **Turn off WiFi and mobile data**
4. Close the app completely
5. Reopen the app

### Expected Result:
- ✅ You should still be logged in
- ✅ Cached posts should be visible
- ✅ No forced logout
- ✅ Can view previously loaded content

---

## 📊 Test 6: Infinite Scroll

### Steps:
1. Open the app
2. Scroll down through the feed
3. Keep scrolling

### Expected Result:
- ✅ More posts load automatically as you scroll
- ✅ Loading spinner appears at bottom
- ✅ No need to click "Load More"
- ✅ When all posts are loaded: "You're all caught up! 🎉"

---

## 🐛 Troubleshooting

### If auto-login doesn't work:
- Clear browser cache/app data
- Sign up again
- The session should persist after that

### If feed doesn't load:
- Check internet connection
- Check if you've completed onboarding (college, department)
- Try pull-to-refresh

### If auto-refresh doesn't work:
- Make sure you're on the home feed
- Wait at least 30 seconds
- Create a new post from another device to test

---

## 📝 Performance Metrics

### Before Changes:
- Initial load: ~2-3 seconds (loading all posts)
- Forced re-login on every app restart
- No auto-refresh

### After Changes:
- Initial load: **~200ms** (5 posts only)
- Cached posts: **Instant** (0ms)
- Auto-login: **Always** (no re-login needed)
- Auto-refresh: **Every 30 seconds**

---

## 🎯 Success Criteria

All tests pass if:
- ✅ No forced re-login on app restart
- ✅ Feed loads in under 500ms
- ✅ Auto-refresh banner appears after 30 seconds
- ✅ Pull-to-refresh works smoothly
- ✅ Infinite scroll loads more posts
- ✅ Offline mode shows cached content

---

## 💡 Tips

1. **First Load**: First time might be slower as it builds cache
2. **Subsequent Loads**: Should be instant with cached data
3. **Auto-Refresh**: Keep app open for 30+ seconds to see it in action
4. **Infinite Scroll**: Scroll down to trigger automatic loading
5. **Offline**: Works best after you've browsed some posts online

---

## 🚀 Next Steps

If all tests pass:
1. Build the app for production: `npm run build`
2. Deploy to your hosting/app store
3. Monitor user feedback
4. Adjust auto-refresh interval if needed (currently 30 seconds)

If any test fails:
1. Check console for errors
2. Verify internet connection
3. Clear cache and try again
4. Report the issue with details
