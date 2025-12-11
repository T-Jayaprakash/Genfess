# 🚀 Deployment Checklist - Version 2.8.0

## ✅ Build Complete!

**APK Location:** `lastbench-v2.8.0-LIKE-BUG-FIX-VERSION-MGMT.apk`  
**Size:** 3.8 MB  
**Build Date:** December 10, 2025  
**Version:** 2.8.0

---

## 📋 Pre-Deployment Checklist

### ✅ Code Changes
- [x] Like button bug fixed (PostCard.tsx)
- [x] Version management system implemented
- [x] All tests passing
- [x] Build successful
- [x] APK signed and ready

### ✅ Version Numbers
- [x] APP_VERSION = "2.8.0" (constants/version.ts)
- [x] package.json version = "2.8.0"
- [x] Build script version matches

---

## 📤 Upload to Website

### Step 1: Upload APK

Upload the APK to your website:
- **File:** `lastbench-v2.8.0-LIKE-BUG-FIX-VERSION-MGMT.apk`
- **Destination:** Your website's download page
- **Recommended URL:** `https://lastbench.in/download/lastbench-v2.8.0.apk`

### Step 2: Create/Update version.json API Endpoint

Create a file at `https://lastbench.in/api/version.json` with this content:

```json
{
    "latestVersion": "2.8.0",
    "minSupportedVersion": "2.8.0",
    "updateUrl": "https://lastbench.in/download",
    "forceUpdate": true,
    "message": "Critical bug fixes for likes and new version management. Please update to continue using Lastbench."
}
```

**Options for creating the endpoint:**

#### Option A: Static JSON File (Easiest)
1. Create a file named `version.json`
2. Put the above JSON content in it
3. Upload to your server at `/api/version.json`
4. Make sure it's publicly accessible

#### Option B: Server Endpoint
1. Use the example in `server/example-version-endpoint.ts`
2. Add to your Express/Node.js server
3. Deploy the endpoint

#### Option C: HTML Page with JSON
1. Use `server/version-api-page.html`
2. Upload to your server
3. Access via URL with `?json=true` parameter

### Step 3: Update Download Page

Update your website's download page to link to the new APK:

```html
<a href="/download/lastbench-v2.8.0.apk" download>
    Download Lastbench v2.8.0
</a>
```

**Changelog to display:**
- ✅ Fixed like button color persistence
- ✅ Added automatic version checking
- ✅ Performance improvements
- ✅ Bug fixes and stability improvements

---

## 🧪 Post-Deployment Testing

After uploading, test the following:

### Test 1: APK Download
- [ ] Visit download page
- [ ] Click download link
- [ ] APK downloads successfully
- [ ] File size is ~3.8 MB

### Test 2: Version Endpoint
```bash
curl https://lastbench.in/api/version.json
```
- [ ] Returns valid JSON
- [ ] Contains all required fields
- [ ] No CORS errors

### Test 3: Install APK
- [ ] Install APK on test device
- [ ] App launches successfully
- [ ] No crashes on startup

### Test 4: Like Functionality
- [ ] Like a post
- [ ] Heart turns red and stays red
- [ ] Count updates correctly
- [ ] Unlike works properly

### Test 5: Version Checking
If you want to test the version check (optional):
1. Temporarily change `constants/version.ts` to `2.0.0`
2. Rebuild and install
3. Should see force update modal
4. "Update Now" redirects to your download page

---

## 📊 Rollout Strategy

### Option 1: Immediate Force Update (Recommended)
Set `forceUpdate: true` in `version.json`:
- All users will be required to update immediately
- Users on v2.7.0 cannot use app until they update
- Best for critical bug fixes

### Option 2: Gradual Rollout
Set `forceUpdate: false` initially:
- Users see update prompt but can dismiss
- Monitor for issues for 24-48 hours
- Then switch to `forceUpdate: true`

### Option 3: Phased Rollout
Week 1: `minSupportedVersion: "2.7.0"`, `forceUpdate: false`  
Week 2: `minSupportedVersion: "2.8.0"`, `forceUpdate: true`

---

## 🌐 Server Configuration Examples

### Apache (.htaccess)
```apache
# Enable CORS for version.json
<Files "version.json">
    Header set Access-Control-Allow-Origin "*"
    Header set Content-Type "application/json"
    Header set Cache-Control "no-cache, no-store, must-revalidate"
</Files>
```

### Nginx
```nginx
location /api/version.json {
    add_header Access-Control-Allow-Origin *;
    add_header Content-Type application/json;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```

### Node.js/Express
```javascript
app.get('/api/version.json', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache');
    res.json({
        latestVersion: "2.8.0",
        minSupportedVersion: "2.8.0",
        updateUrl: "https://lastbench.in/download",
        forceUpdate: true,
        message: "Critical update required"
    });
});
```

---

## 📱 User Communication

### Announcement Template

**Social Media Post:**
```
🎉 Lastbench v2.8.0 is now available!

✨ What's New:
• Fixed: Like button now works perfectly
• New: Automatic app updates
• Improved: Overall performance

📥 Download now: https://lastbench.in/download

#Lastbench #Update #AppUpdate
```

**In-App Notification (if applicable):**
```
New version 2.8.0 is available!
Critical bug fixes and improvements.
Update now to continue using Lastbench.
```

---

## 🔍 Monitoring

After deployment, monitor:

### Server Logs
- Version check requests (should see increase)
- APK downloads (track adoption rate)
- Any 404 errors for version.json

### User Feedback
- Check for reports of update issues
- Monitor app crashes after update
- Watch for like button complaints

### Analytics (if available)
- Track version distribution
- Monitor update adoption rate
- Check for errors or crashes

---

## 🆘 Rollback Plan

If critical issues are discovered:

1. **Immediate Fix:**
   Update `version.json`:
   ```json
   {
       "latestVersion": "2.7.0",
       "minSupportedVersion": "2.7.0",
       "forceUpdate": false,
       "message": "We're working on some improvements"
   }
   ```

2. **Alternative:**
   Keep old APK available at:
   `https://lastbench.in/download/lastbench-v2.7.0.apk`

---

## ✅ Final Checklist

Before going live:

- [ ] APK is uploaded to website
- [ ] Download link works
- [ ] version.json endpoint is live
- [ ] version.json returns correct data
- [ ] CORS is configured (if needed)
- [ ] Test download on mobile device
- [ ] Test installation
- [ ] Test like functionality
- [ ] Update announcement prepared
- [ ] Backup/rollback plan ready

---

## 📞 Support

### For Users Having Issues:

**Can't Download:**
- Clear browser cache
- Try different browser
- Use direct link

**Can't Install:**
- Enable "Install from Unknown Sources"
- Uninstall old version first
- Ensure sufficient storage

**Update Modal Won't Close:**
- This is intentional if `forceUpdate: true`
- User must download and install update

---

## 🎯 Success Metrics

Track these to measure successful deployment:

- **Update Rate:** % of users on v2.8.0 within 24/48 hours
- **Download Count:** Number of APK downloads
- **Like Button Usage:** Increase in likes after update
- **Crash Rate:** Should remain stable or decrease
- **User Feedback:** Positive reports about fixes

---

## 📝 Notes

**Important:**
- The version.json file controls who needs to update
- You can change force update requirement anytime by editing this file
- No need to rebuild app to change update requirements
- Always keep APK publicly accessible at updateUrl

**What Users Will See:**
1. Open app
2. See beautiful update modal (if on older version)
3. Click "Update Now"
4. Download new APK from your website
5. Install and enjoy bug fixes

---

**Version:** 2.8.0  
**Build Date:** December 10, 2025  
**Deployment Ready:** ✅ YES

🚀 **Ready to deploy!**
