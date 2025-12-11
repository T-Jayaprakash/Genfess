# Version Management System

This document explains how to use the version management system to enforce app updates.

## Overview

The app now includes an automatic version checking system that:
- Checks for updates when the app starts
- Shows an update modal to users
- Can force users to update (blocking app usage until they update)
- Prevents issues with incompatible app versions

## How It Works

### 1. Version Constants (`constants/version.ts`)

```typescript
export const APP_VERSION = '2.8.0';
export const MIN_SUPPORTED_VERSION = '2.8.0';
export const VERSION_CHECK_URL = 'https://lastbench.in/api/version.json';
```

- **APP_VERSION**: Current version of the app (update this when releasing)
- **MIN_SUPPORTED_VERSION**: Minimum version that still works (older versions are blocked)
- **VERSION_CHECK_URL**: Server endpoint that returns version info

### 2. Server Endpoint (`/api/version.json`)

The server should host a JSON file at the URL specified in `VERSION_CHECK_URL`:

```json
{
    "latestVersion": "2.8.0",
    "minSupportedVersion": "2.8.0",
    "updateUrl": "https://lastbench.in/download",
    "forceUpdate": true,
    "message": "This version includes important bug fixes. Please update to continue."
}
```

**Fields:**
- `latestVersion`: Latest available version
- `minSupportedVersion`: Minimum version users must have
- `updateUrl`: Where users should go to download the update
- `forceUpdate`: If true, blocks the app until user updates
- `message`: Optional custom message to show users

### 3. Version Checking Logic

The app checks for updates:
- On app startup (after authentication)
- Maximum once per hour (configurable in `versionService.ts`)

If the user's version is below `minSupportedVersion`, they **must** update.

## How to Release a New Version

Follow these steps when releasing a new version:

### Step 1: Update Version Numbers

1. Update `constants/version.ts`:
   ```typescript
   export const APP_VERSION = '2.9.0'; // New version
   export const MIN_SUPPORTED_VERSION = '2.8.0'; // Can stay same or update
   ```

2. Update `package.json`:
   ```json
   {
     "version": "2.9.0"
   }
   ```

### Step 2: Build the APK

```bash
# Build the web app
npm run build

# Sync with Capacitor
npx cap sync

# Build Android APK
cd android
./gradlew assembleRelease
```

The APK will be in: `android/app/build/outputs/apk/release/app-release.apk`

### Step 3: Upload APK to Your Website

Upload the new APK to your website at the download URL (e.g., `https://lastbench.in/download`)

### Step 4: Update Server version.json

Update the `version.json` file on your server:

```json
{
    "latestVersion": "2.9.0",
    "minSupportedVersion": "2.8.0",
    "updateUrl": "https://lastbench.in/download",
    "forceUpdate": false,  // true if update is mandatory
    "message": "New features available! Update to enjoy them."
}
```

**Important:** 
- If `forceUpdate: true`, users with older versions won't be able to use the app until they update
- If `forceUpdate: false`, users can dismiss the update prompt and continue using the app

## Forcing Updates

### When to Force an Update

Force updates when:
- Critical security fixes are needed
- Backend API changes break old versions
- Major bugs in old versions
- Database schema changes

### How to Force an Update

Set `forceUpdate: true` and update `minSupportedVersion` in the server's `version.json`:

```json
{
    "latestVersion": "2.9.0",
    "minSupportedVersion": "2.9.0",  // Users below this must update
    "updateUrl": "https://lastbench.in/download",
    "forceUpdate": true,
    "message": "Critical security update required. Please update immediately."
}
```

Users on version 2.8.0 or below will see a modal they cannot dismiss until they update.

## Testing Version Checking

### Test Force Update Flow

1. Set current version to something low (e.g., `2.0.0`) in `constants/version.ts`
2. Set server `version.json` with higher `minSupportedVersion` (e.g., `2.8.0`)
3. Launch the app - you should see a blocking update modal
4. The user cannot dismiss it (no "Later" button)

### Test Optional Update Flow

1. Set `forceUpdate: false` in server `version.json`
2. Set `latestVersion` higher than `APP_VERSION`
3. Launch the app - you should see an update modal with "Later" button
4. User can dismiss and continue using the app

## Version Comparison

The system uses semantic versioning (MAJOR.MINOR.PATCH):

```
2.8.0 < 2.9.0
2.9.0 < 2.10.0
2.9.1 < 2.10.0
```

## Troubleshooting

### Users not seeing update prompt

1. Check if `VERSION_CHECK_URL` is accessible
2. Verify server is returning valid JSON
3. Check browser console for errors
4. Clear localStorage (version check is cached for 1 hour)

### Update modal showing incorrectly

1. Verify `APP_VERSION` in `constants/version.ts` matches `package.json`
2. Check server `version.json` values
3. Look at console logs during app startup

### Users can't download update

1. Verify `updateUrl` in `version.json` is correct
2. Ensure APK is uploaded and accessible
3. Test the download link manually

## Example Workflow

### Scenario: Bug Fix Release

1. Fix the bug in code
2. Update version: `2.8.0` → `2.8.1`
3. Build new APK
4. Upload APK to website
5. Update server `version.json`:
   ```json
   {
       "latestVersion": "2.8.1",
       "minSupportedVersion": "2.8.0",
       "updateUrl": "https://lastbench.in/download",
       "forceUpdate": false,
       "message": "Bug fixes and improvements"
   }
   ```
6. Users will see optional update prompt

### Scenario: Critical Security Fix

1. Fix the security issue
2. Update version: `2.8.1` → `2.9.0`
3. Build new APK
4. Upload APK to website
5. Update server `version.json`:
   ```json
   {
       "latestVersion": "2.9.0",
       "minSupportedVersion": "2.9.0",
       "updateUrl": "https://lastbench.in/download",
       "forceUpdate": true,
       "message": "Critical security update required"
   }
   ```
6. All users must update before using the app

## Files Modified

- `constants/version.ts` - Version constants
- `services/versionService.ts` - Version checking logic
- `components/UpdateModal.tsx` - Update UI
- `App.tsx` - Integration with app lifecycle
- `package.json` - App version metadata
- `server/version.json` - Server version configuration (example)

## Summary

This system gives you full control over app versions:
- **Soft updates**: Notify users but let them continue
- **Hard updates**: Block app usage until user updates
- **Flexible deployment**: Update server config without releasing new app
- **User-friendly**: Clear, beautiful update prompts
