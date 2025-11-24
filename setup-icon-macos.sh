#!/bin/bash

# Script to set up app icon using macOS sips command
SOURCE_IMAGE="/Users/jayaprakash/Downloads/lastbench---anonymous-college-gossip-2/assets/lastbench_icon.png"

if [ ! -f "$SOURCE_IMAGE" ]; then
    echo "Error: Source image not found at $SOURCE_IMAGE"
    exit 1
fi

echo "Setting up app icon from $SOURCE_IMAGE..."

# Create icons for each density
echo "Creating mipmap-mdpi/ic_launcher.png (48x48)..."
sips -z 48 48 "$SOURCE_IMAGE" --out "android/app/src/main/res/mipmap-mdpi/ic_launcher.png" > /dev/null 2>&1
cp "android/app/src/main/res/mipmap-mdpi/ic_launcher.png" "android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png"
cp "android/app/src/main/res/mipmap-mdpi/ic_launcher.png" "android/app/src/main/res/mipmap-mdpi/ic_launcher_foreground.png"
echo "✓ Created icons for mipmap-mdpi"

echo "Creating mipmap-hdpi/ic_launcher.png (72x72)..."
sips -z 72 72 "$SOURCE_IMAGE" --out "android/app/src/main/res/mipmap-hdpi/ic_launcher.png" > /dev/null 2>&1
cp "android/app/src/main/res/mipmap-hdpi/ic_launcher.png" "android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png"
cp "android/app/src/main/res/mipmap-hdpi/ic_launcher.png" "android/app/src/main/res/mipmap-hdpi/ic_launcher_foreground.png"
echo "✓ Created icons for mipmap-hdpi"

echo "Creating mipmap-xhdpi/ic_launcher.png (96x96)..."
sips -z 96 96 "$SOURCE_IMAGE" --out "android/app/src/main/res/mipmap-xhdpi/ic_launcher.png" > /dev/null 2>&1
cp "android/app/src/main/res/mipmap-xhdpi/ic_launcher.png" "android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png"
cp "android/app/src/main/res/mipmap-xhdpi/ic_launcher.png" "android/app/src/main/res/mipmap-xhdpi/ic_launcher_foreground.png"
echo "✓ Created icons for mipmap-xhdpi"

echo "Creating mipmap-xxhdpi/ic_launcher.png (144x144)..."
sips -z 144 144 "$SOURCE_IMAGE" --out "android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png" > /dev/null 2>&1
cp "android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png" "android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png"
cp "android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png" "android/app/src/main/res/mipmap-xxhdpi/ic_launcher_foreground.png"
echo "✓ Created icons for mipmap-xxhdpi"

echo "Creating mipmap-xxxhdpi/ic_launcher.png (192x192)..."
sips -z 192 192 "$SOURCE_IMAGE" --out "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png" > /dev/null 2>&1
cp "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png" "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png"
cp "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png" "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png"
echo "✓ Created icons for mipmap-xxxhdpi"

echo ""
echo "App icon setup complete!"
echo "Icons have been created in android/app/src/main/res/mipmap-*/"
