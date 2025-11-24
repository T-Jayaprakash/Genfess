#!/bin/bash

# Script to set up app icon from a source image
# Usage: ./setup-app-icon.sh <source-image.png>

if [ -z "$1" ]; then
    echo "Usage: ./setup-app-icon.sh <source-image.png>"
    echo "Example: ./setup-app-icon.sh icon.png"
    exit 1
fi

SOURCE_IMAGE="$1"

if [ ! -f "$SOURCE_IMAGE" ]; then
    echo "Error: Source image '$SOURCE_IMAGE' not found!"
    exit 1
fi

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "Error: ImageMagick is required but not installed."
    echo "Install it with: brew install imagemagick (macOS) or apt-get install imagemagick (Linux)"
    exit 1
fi

echo "Setting up app icon from $SOURCE_IMAGE..."

# Android icon sizes
declare -A SIZES=(
    ["mipmap-mdpi"]=48
    ["mipmap-hdpi"]=72
    ["mipmap-xhdpi"]=96
    ["mipmap-xxhdpi"]=144
    ["mipmap-xxxhdpi"]=192
)

# Create icons for each density
for folder in "${!SIZES[@]}"; do
    size=${SIZES[$folder]}
    echo "Creating $folder/ic_launcher.png (${size}x${size})..."
    
    # Create square icon with rounded corners
    convert "$SOURCE_IMAGE" \
        -resize "${size}x${size}" \
        -background white \
        -gravity center \
        -extent "${size}x${size}" \
        "android/app/src/main/res/$folder/ic_launcher.png"
    
    # Create round icon
    convert "$SOURCE_IMAGE" \
        -resize "${size}x${size}" \
        -background white \
        -gravity center \
        -extent "${size}x${size}" \
        \( +clone -alpha extract -draw "fill black polygon 0,0 0,$size $size,$size $size,0 fill white circle $size,$size $size,0" \( +clone -flip \) -compose Multiply -composite \( +clone -flop \) -compose Multiply -composite \) \
        -alpha off -compose CopyOpacity -composite \
        "android/app/src/main/res/$folder/ic_launcher_round.png"
    
    # Create foreground (for adaptive icons)
    convert "$SOURCE_IMAGE" \
        -resize "${size}x${size}" \
        -background transparent \
        -gravity center \
        -extent "${size}x${size}" \
        "android/app/src/main/res/$folder/ic_launcher_foreground.png"
done

echo "App icon setup complete!"
echo "Icons have been created in android/app/src/main/res/mipmap-*/"

