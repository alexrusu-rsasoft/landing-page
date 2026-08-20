#!/usr/bin/env python3
"""Regenerates the hero carousel's web assets from the full-resolution originals.

The originals (6000-9500px wide, several MB each) live in assets-src/ and are
never deployed. This writes the responsive WebP variants the hero's srcset
points at into public/hero-carousel/.

Usage: python3 scripts/optimize-hero-images.py   (needs Pillow)
"""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE_DIR = ROOT / "assets-src" / "hero-carousel"
OUTPUT_DIR = ROOT / "public" / "hero-carousel"
WIDTHS = (640, 960, 1440, 1920, 2560)
QUALITY = 74

def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for source in sorted(SOURCE_DIR.glob("*.jpg")):
        with Image.open(source) as image:
            image = image.convert("RGB")
            for width in WIDTHS:
                if width > image.width:
                    continue
                height = round(image.height * width / image.width)
                target = OUTPUT_DIR / f"{source.stem}-{width}.webp"
                image.resize((width, height), Image.LANCZOS).save(
                    target, "WEBP", quality=QUALITY, method=6
                )
                print(f"{target.relative_to(ROOT)}  {target.stat().st_size // 1024} kB")

if __name__ == "__main__":
    main()
