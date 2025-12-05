# Icon Generation Guide

## Required Icons for PWA

You need to generate the following icons from your logo/favicon:

### Icon Sizes Needed:
- `icon-72x72.png` - Android small icon
- `icon-96x96.png` - Android medium icon
- `icon-128x128.png` - Standard icon
- `icon-144x144.png` - Windows tile
- `icon-152x152.png` - iOS icon
- `icon-192x192.png` - **Required** - Android home screen
- `icon-384x384.png` - High-res icon
- `icon-512x512.png` - **Required** - Splash screen
- `icon-maskable-512x512.png` - Android adaptive icon

## Quick Generation Methods:

### Method 1: Online Tool (Easiest)
1. Visit: https://www.pwabuilder.com/imageGenerator
2. Upload your `favicon.svg` or a 512x512 PNG
3. Download all generated icons
4. Extract to this `icons/` folder

### Method 2: Using ImageMagick (Command Line)
```bash
# Install ImageMagick first
# Ubuntu/Debian: sudo apt-get install imagemagick
# macOS: brew install imagemagick
# Windows: choco install imagemagick

# Generate all sizes from SVG
for size in 72 96 128 144 152 192 384 512; do
    convert ../favicon.svg -resize ${size}x${size} icon-${size}x${size}.png
done

# Create maskable icon (with padding)
convert ../favicon.svg -resize 400x400 -gravity center -extent 512x512 icon-maskable-512x512.png
```

### Method 3: Using Photoshop/GIMP
1. Open `favicon.svg` in your image editor
2. Export/Save As PNG for each required size
3. Name files exactly as shown above

### Method 4: Online Favicon Generator
1. Visit: https://realfavicongenerator.net/
2. Upload your favicon
3. Download the generated package
4. Extract icons to this folder

## Icon Requirements:

### Standard Icons (icon-*.png)
- Simple, clear design
- No padding
- Fills entire canvas
- Background: Your theme color (#667eea)

### Maskable Icon (icon-maskable-512x512.png)
- Same design as standard icons
- **Add 20% padding** on all sides
- Safe zone: Keep important elements in center 80%
- Background: Solid color (no transparency)

## Testing Icons:
1. Open `manifest.json`
2. Verify all icon paths are correct
3. Test in Chrome DevTools > Application > Manifest
4. Use Lighthouse PWA audit

## Current Status:
- ⏳ Icons not yet generated
- 📝 This guide created
- 🎯 Follow one of the methods above to generate icons

## Quick Test Icon (Temporary):
If you want to test PWA features before creating proper icons, you can use the existing favicon.svg by adding to manifest.json:
```json
{
  "src": "favicon.svg",
  "sizes": "any",
  "type": "image/svg+xml",
  "purpose": "any"
}
```

This will work for testing, but you should generate proper PNG icons for production.
