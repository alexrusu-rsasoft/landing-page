#!/usr/bin/env python3
"""Regenerates the "human behind the code" photos in the About section on /work-with-alex.

The originals live in assets-src/human-behind/ and are never deployed. Photos keep
their original framing (the page crops the portrait with object-cover to fit the text
beside it) and are written as AVIF + WebP at their rendered 1x-3x sizes into
public/human-behind/. To swap a photo, change it here and in about.ts.

Usage: python3 scripts/optimize-human-behind-images.py   (needs Pillow >= 11.3 for AVIF)
"""

from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SOURCE_DIR = ROOT / "assets-src" / "human-behind"
OUTPUT_DIR = ROOT / "public" / "human-behind"
WEBP_QUALITY = 72
AVIF_QUALITY = 52

# In the page the portrait renders up to ~360px wide and gallery photos up to ~360px, so
# 720 covers 2x there; 1200 is only fetched when a photo is opened in the lightbox.
FEATURE = "fountain"
FEATURE_WIDTHS = (400, 720, 960, 1200)

GALLERY = (
    "road-trip", "sailing", "dog", "home-office", "globe", "dubai",
    "suit", "vatican", "taormina", "laptop-view", "driving",
)
GALLERY_WIDTHS = (240, 480, 720, 1200)

def export(image: Image.Image, name: str, widths: tuple[int, ...]) -> None:
    for width in widths:
        if width > image.width:
            continue
        resized = image.resize((width, round(image.height * width / image.width)), Image.LANCZOS)
        for fmt, quality, ext in (("AVIF", AVIF_QUALITY, "avif"), ("WEBP", WEBP_QUALITY, "webp")):
            target = OUTPUT_DIR / f"{name}-{width}.{ext}"
            options = {"method": 6} if fmt == "WEBP" else {"speed": 2}
            resized.save(target, fmt, quality=quality, **options)
            print(f"{target.relative_to(ROOT)}  {resized.width}x{resized.height}  {target.stat().st_size / 1024:.1f} kB")

def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for stale in OUTPUT_DIR.iterdir():
        stale.unlink()
    for name in (FEATURE, *GALLERY):
        with Image.open(SOURCE_DIR / f"{name}.jpg") as image:
            oriented = ImageOps.exif_transpose(image).convert("RGB")
            export(oriented, name, FEATURE_WIDTHS if name == FEATURE else GALLERY_WIDTHS)

if __name__ == "__main__":
    main()
