# Quick Setup Guide - Version 2.8.0

## What Was Fixed

### 1. ✅ Like Button Bug
**Problem**: Like button color disappeared after 2 seconds  
**Status**: FIXED ✓  
**No action needed** - works automatically

### 2. ✅ Version Management
**Problem**: Can't force users to update  
**Status**: IMPLEMENTED ✓  
**Action needed**: Set up server endpoint (see below)

---

## Server Setup (Required for Version Management)

You need to host a JSON file on your website to enable version checking.

### Step 1: Create the API Endpoint

Create a file at: `https://lastbench.in/api/version.json`

**Content:**
```json
{
    "latestVersion": "2.8.0",
    "minSupportedVersion": "2.8.0",
    "updateUrl": "https://lastbench.in/download",
    "forceUpdate": true,
    "message": "Critical bug fixes. Please update to continue."
}
```

### Step 2: Make It Accessible

Ensure the endpoint is:
- ✅ Publicly accessible (no authentication)
- ✅ Returns JSON content-type
- ✅ Allows CORS (cross-origin requests)

**Test it:**
```bash
curl https://lastbench.in/api/version.json
```

Should return the JSON.

### Step 3: Update Your Website Download Page

Make sure `https://lastbench.in/download` has the latest APK available for download.

---

## Build & Deploy New Version

### 1. Build the App

```bash
npm run build
npx cap sync android
cd android
./gradlew assembleRelease
```

APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

### 2. Upload APK

Upload the APK to your website's download page.

### 3. Update version.json

When you want to force all users to update, change the server's `version.json`:

```json
{
    "latestVersion": "2.8.0",
    "minSupportedVersion": "2.8.0",  // ← Users below this version must update
    "updateUrl": "https://lastbench.in/download",
    "forceUpdate": true,  // ← true = users cannot use app without updating
    "message": "Please update to the latest version"
}
```

---

## How Version Checking Works

1. User opens app
2. App checks `https://lastbench.in/api/version.json`
3. Compares their version with `minSupportedVersion`
4. If below minimum → Shows blocking update modal
5. If optional update → Shows dismissable modal
6. Checks happen max once per hour (cached)

---

## Testing

### Test 1: Force Update (Recommended First Test)

1. In your code, temporarily change `constants/version.ts`:
   ```typescript
   export const APP_VERSION = '2.0.0'; // Old version
   ```

2. On server, set `version.json`:
   ```json
   {
       "latestVersion": "2.8.0",
       "minSupportedVersion": "2.8.0",
       "updateUrl": "https://lastbench.in/download",
       "forceUpdate": true,
       "message": "Test message"
   }
   ```

3. Build and run app
4. You should see a blocking update modal
5. Cannot dismiss it
6. "Update Now" button goes to download URL

### Test 2: Optional Update

1. Set `forceUpdate: false` in server `version.json`
2. Run app
3. Should see update modal with "Later" button
4. Can dismiss and use app

### Test 3: No Update Needed

1. Match version in code to server
2. Run app
3. No modal should appear

---

## What Happens If Server Is Down?

The app works normally! Version checking:
- Is non-blocking
- Has graceful fallback
- Won't prevent app usage if server is unavailable

---

## Future Releases

When you release v2.9.0:

1. **Update Code:**
   ```typescript
   // constants/version.ts
   export const APP_VERSION = '2.9.0';
   ```

2. **Update package.json:**
   ```json
   {
     "version": "2.9.0"
   }
   ```

3. **Build New APK**

4. **Upload to Website**

5. **Update Server version.json:**
   ```json
   {
       "latestVersion": "2.9.0",
       "minSupportedVersion": "2.8.0",  // Keep old if compatible
       "updateUrl": "https://lastbench.in/download",
       "forceUpdate": false,  // or true if critical
       "message": "New features available!"
   }
   ```

---

## Important Files

- `constants/version.ts` - Change version here
- `package.json` - Keep in sync with version.ts
- Server: `https://lastbench.in/api/version.json` - Controls who needs to update

---

## Troubleshooting

**"Update modal not showing"**
- Check server endpoint is accessible
- Look at browser console for errors
- Clear localStorage and retry

**"Modal showing for correct version"**
- Verify `APP_VERSION` matches what's deployed
- Check server `version.json` values

**"Can't download update"**
- Verify APK is uploaded to `updateUrl`
- Test download link manually

---

## Summary

✅ Like button: Already fixed, no setup needed  
⚙️ Version management: Need to set up server endpoint  
📖 Full docs: See `docs/VERSION_MANAGEMENT.md`  
📝 Release notes: See `RELEASE_NOTES_2.8.0.md`

**Next Step:** Set up `https://lastbench.in/api/version.json` on your server!
