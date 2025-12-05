#!/usr/bin/env python3
"""
Icon Generator for Universal Flashcards PWA v3.0
Generates all required PNG icons from the favicon emoji
"""

from PIL import Image, ImageDraw, ImageFont
import os

# Icon sizes to generate
ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512]

# Create icons directory if it doesn't exist
ICONS_DIR = "icons"
os.makedirs(ICONS_DIR, exist_ok=True)

def create_icon(size, emoji="📚", bg_color="#667eea"):
    """Create a square icon with emoji and background color"""
    # Create image with background color
    img = Image.new('RGB', (size, size), bg_color)
    draw = ImageDraw.Draw(img)

    # Try to use a system font for emoji, or fall back to default
    try:
        # For emoji support, we need a font that supports Unicode emoji
        # On Windows: Segoe UI Emoji
        # On Linux: Noto Color Emoji or Symbola
        font_size = int(size * 0.7)  # 70% of icon size

        # Try different emoji fonts
        font_paths = [
            "/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf",  # Linux
            "C:/Windows/Fonts/seguiemj.ttf",  # Windows
            "/System/Library/Fonts/Apple Color Emoji.ttc",  # macOS
        ]

        font = None
        for font_path in font_paths:
            if os.path.exists(font_path):
                try:
                    font = ImageFont.truetype(font_path, font_size)
                    break
                except:
                    continue

        if font is None:
            # Fallback: create simple text-based icon
            font = ImageFont.load_default()
    except Exception as e:
        font = ImageFont.load_default()

    # Calculate text position to center it
    # For emoji, we'll create a simple centered design
    text = emoji

    try:
        # Get text bounding box
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]

        # Center the text
        x = (size - text_width) // 2
        y = (size - text_height) // 2

        # Draw the emoji/text
        draw.text((x, y), text, fill="white", font=font)
    except:
        # Fallback: draw a simple book-like shape
        margin = int(size * 0.15)
        draw.rectangle(
            [margin, margin, size - margin, size - margin],
            fill="white",
            outline="white",
            width=3
        )
        # Add book spine
        spine_x = size // 3
        draw.line(
            [(spine_x, margin), (spine_x, size - margin)],
            fill=bg_color,
            width=int(size * 0.05)
        )

    return img

def create_maskable_icon(size, emoji="📚", bg_color="#667eea"):
    """Create a maskable icon (safe zone in center)"""
    # Maskable icons need 20% safe zone padding
    safe_zone_size = int(size * 0.6)  # 60% of icon size for content
    padding = (size - safe_zone_size) // 2

    # Create image with background color
    img = Image.new('RGB', (size, size), bg_color)
    draw = ImageDraw.Draw(img)

    # Create content in safe zone
    try:
        font_size = int(safe_zone_size * 0.7)
        font = ImageFont.load_default()

        # Draw centered emoji/text
        text = emoji
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]

        x = (size - text_width) // 2
        y = (size - text_height) // 2

        draw.text((x, y), text, fill="white", font=font)
    except:
        # Fallback: draw simple shape in safe zone
        draw.rectangle(
            [padding, padding, size - padding, size - padding],
            fill="white",
            outline="white",
            width=3
        )

    return img

def main():
    print("=" * 60)
    print("Universal Flashcards PWA - Icon Generator")
    print("=" * 60)
    print()

    # Generate regular icons
    print("Generating regular icons...")
    for size in ICON_SIZES:
        icon = create_icon(size)
        filename = f"{ICONS_DIR}/icon-{size}x{size}.png"
        icon.save(filename, "PNG")
        print(f"  ✓ Created {filename}")

    # Generate maskable icon
    print("\nGenerating maskable icon...")
    maskable = create_maskable_icon(512)
    maskable_filename = f"{ICONS_DIR}/icon-maskable-512x512.png"
    maskable.save(maskable_filename, "PNG")
    print(f"  ✓ Created {maskable_filename}")

    print()
    print("=" * 60)
    print("Icon Generation Complete!")
    print("=" * 60)
    print(f"\nGenerated {len(ICON_SIZES) + 1} icons in ./{ICONS_DIR}/")
    print("\nNext steps:")
    print("1. Test locally: python3 -m http.server 8000")
    print("2. Open: http://localhost:8000/flashcard.html")
    print("3. Check Chrome DevTools > Application > Manifest")
    print()

if __name__ == "__main__":
    main()
