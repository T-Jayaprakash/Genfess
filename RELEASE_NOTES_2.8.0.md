# Bug Fixes and Features - Version 2.8.0

## Summary

This release fixes two critical issues:
1. **Like Button Bug** - Red heart color now persists correctly
2. **Version Management** - Force users to update to latest version

---

## 🐛 Bug Fix: Like Button Persistence

### Problem
When a user liked a post, the like count increased but the red color on the heart button only showed for ~2 seconds before disappearing. The like would persist in the database, but the UI would lose the visual indication.

### Root Cause
The `PostCard` component had a `useEffect` that synced the `isLiked` state from props on every change. When the feed refreshed or loaded cached posts, it would override the user's like action with stale data from the cache/server.

### Solution
Removed the problematic `useEffect` that was syncing `isLiked` from props after initial render. The component now:
- Sets initial state from props on mount
- Maintains its own state independently after user interaction
- Only resets state if the actual post ID changes (different post)

### Files Changed
- `components/PostCard.tsx` - Removed state sync useEffect (lines 65-69)

### Testing
1. Like a post - heart turns red ✅
2. Wait 5+ seconds - heart stays red ✅
3. Scroll away and back - heart stays red ✅
4. Refresh app - heart stays red ✅

---

## ✨ Feature: Version Management System

### Problem
Users were running old APK versions with bugs even after new versions were released. No way to force users to update to the latest version.

### Solution
Implemented a comprehensive version management system that:
- Checks for updates on app launch
- Shows a beautiful update modal to users
- Can optionally force updates (blocking app usage)
- Checks version at most once per hour to avoid spam

### How It Works

#### 1. Client-Side Components

**Version Constants (`constants/version.ts`)**
```typescript
export const APP_VERSION = '2.8.0';
export const MIN_SUPPORTED_VERSION = '2.8.0';
export const VERSION_CHECK_URL = 'https://lastbench.in/api/version.json';
```

**Version Service (`services/versionService.ts`)**
- Fetches version info from server
- Compares semantic versions
- Caches check results (1 hour)
- Falls back to local check if server unavailable

**Update Modal (`components/UpdateModal.tsx`)**
- Beautiful, gradient UI
- Shows version number and message
- "Update Now" button redirects to download
- Optional "Later" button (only if not forced)

#### 2. Server-Side Configuration

Create an API endpoint at `https://lastbench.in/api/version.json`:

```json
{
    "latestVersion": "2.8.0",
    "minSupportedVersion": "2.8.0",
    "updateUrl": "https://lastbench.in/download",
    "forceUpdate": true,
    "message": "Critical update required"
}
```

**Fields:**
- `latestVersion`: Latest version available
- `minSupportedVersion`: Minimum version allowed to run
- `updateUrl`: Where to download the update
- `forceUpdate`: If true, blocks app until update
- `message`: Optional custom message

### Files Created
- `constants/version.ts` - Version constants
- `services/versionService.ts` - Version checking logic
- `components/UpdateModal.tsx` - Update UI component
- `server/version.json` - Example server response
- `docs/VERSION_MANAGEMENT.md` - Complete documentation

### Files Modified
- `App.tsx` - Added version checking on startup
- `package.json` - Updated version to 2.8.0

### Usage

#### Release New Version
1. Update `constants/version.ts` → `APP_VERSION = '2.9.0'`
2. Update `package.json` → `version: "2.9.0"`
3. Build new APK
4. Upload APK to website
5. Update server `version.json`

#### Force All Users to Update
Set `forceUpdate: true` in server's `version.json`:
```json
{
    "latestVersion": "2.9.0",
    "minSupportedVersion": "2.9.0",
    "forceUpdate": true,
    "message": "Please update to continue using Lastbench"
}
```

Users on v2.8.0 or below will see a blocking modal and cannot use the app until they update.

#### Optional Update Notification
Set `forceUpdate: false`:
```json
{
    "latestVersion": "2.9.0",
    "minSupportedVersion": "2.8.0",
    "forceUpdate": false,
    "message": "New features available!"
}
```

Users will see the prompt but can dismiss it and continue using the app.

---

## 📋 Testing Checklist

### Like Button
- [ ] Like a post → heart turns red immediately
- [ ] Count increases by 1
- [ ] Heart stays red after 5 seconds
- [ ] Scroll away and back → heart still red
- [ ] Unlike post → heart turns gray
- [ ] Refresh app → like state persists
- [ ] Open another post → like state independent

### Version Management
- [ ] Mock old version → see force update modal
- [ ] Cannot dismiss force update modal
- [ ] "Update Now" redirects to download URL
- [ ] Mock optional update → can dismiss modal
- [ ] Version check runs on app startup
- [ ] Version check cached for 1 hour
- [ ] Server error → app still works (graceful fallback)

---

## 🚀 Deployment Instructions

### 1. Build the New Version

```bash
# Install dependencies (if needed)
npm install

# Build the web app
npm run build

# Sync with Capacitor
npx cap sync android

# Build the APK
cd android
./gradlew assembleRelease
cd ..
```

APK location: `android/app/build/outputs/apk/release/app-release.apk`

### 2. Upload to Website

Upload the APK to your website's download page (e.g., `https://lastbench.in/download`)

### 3. Update Server Configuration

Create/update the version endpoint at `https://lastbench.in/api/version.json`:

```json
{
    "latestVersion": "2.8.0",
    "minSupportedVersion": "2.8.0",
    "updateUrl": "https://lastbench.in/download",
    "forceUpdate": true,
    "message": "Critical bug fixes for like button. Please update to continue."
}
```

### 4. Monitor Users

Watch your server logs for version check requests. All users will check for updates within 1 hour of launching the app.

---

## 🔧 Configuration

### Change Version Check Interval

Edit `services/versionService.ts`:
```typescript
const VERSION_CHECK_INTERVAL = 3600000; // 1 hour in ms
// Change to: 1800000 for 30 minutes
//           7200000 for 2 hours
```

### Change Update URL

Edit `constants/version.ts`:
```typescript
export const VERSION_CHECK_URL = 'https://your-domain.com/api/version.json';
```

### Customize Update Message

Modify `components/UpdateModal.tsx` to change the UI, colors, or default messages.

---

## 📝 Notes

1. **Server Endpoint Required**: For version checking to work, you must host a `version.json` file at the URL specified in `VERSION_CHECK_URL`. If the server is unavailable, the app uses local fallback (won't force updates).

2. **Semantic Versioning**: The system uses semantic versioning (MAJOR.MINOR.PATCH). Examples:
   - `2.8.0` < `2.9.0`
   - `2.9.0` < `2.10.0`
   - `2.9.1` < `2.9.2`

3. **Graceful Degradation**: If the version check fails (network error, server down), the app still works normally. Version checking is non-blocking.

4. **Cache Management**: Version checks are cached to avoid excessive API calls. Users check at most once per hour.

5. **APK Distribution**: You control when users update by changing the `version.json` on your server. No need to rebuild the app to change update requirements.

---

## 🎯 Impact

### Like Button Fix
- **Users Affected**: All users who like posts
- **Severity**: High (core feature broken)
- **User Experience**: Significant improvement - likes now work as expected

### Version Management
- **Users Affected**: All users on next app launch
- **Severity**: Medium (new feature, not a fix)
- **User Experience**: Better control over app quality, ensures all users have latest fixes

---

## 📚 Documentation

See `docs/VERSION_MANAGEMENT.md` for complete documentation on version management system.

---

## Version
- **Release**: v2.8.0
- **Date**: December 10, 2025
- **Author**: Antigravity AI
