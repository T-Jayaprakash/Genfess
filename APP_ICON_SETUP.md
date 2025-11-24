# App Icon Setup Instructions

To set up the app icon from your image:

## Option 1: Using the Setup Script (Recommended)

1. Place your icon image file (PNG format, square recommended) in the project root
2. Run the setup script:
   ```bash
   ./setup-app-icon.sh your-icon-image.png
   ```

**Note:** This requires ImageMagick to be installed:
- macOS: `brew install imagemagick`
- Linux: `sudo apt-get install imagemagick`
- Windows: Download from https://imagemagick.org/

## Option 2: Manual Setup

If you don't have ImageMagick, you can manually create the icons:

1. Create square versions of your icon in these sizes:
   - `mipmap-mdpi`: 48x48 px
   - `mipmap-hdpi`: 72x72 px
   - `mipmap-xhdpi`: 96x96 px
   - `mipmap-xxhdpi`: 144x144 px
   - `mipmap-xxxhdpi`: 192x192 px

2. Save them as:
   - `ic_launcher.png` (square icon)
   - `ic_launcher_round.png` (round icon)
   - `ic_launcher_foreground.png` (for adaptive icons, transparent background)

3. Place them in: `android/app/src/main/res/mipmap-*/`

## Option 3: Online Tool

You can use online tools like:
- https://icon.kitchen/ (Android Icon Generator)
- https://www.appicon.co/ (App Icon Generator)

Upload your image and download the Android icon pack, then extract to `android/app/src/main/res/`

## After Setup

After setting up the icons, rebuild the APK:
```bash
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug
```

