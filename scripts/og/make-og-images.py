#!/usr/bin/env python3
"""Reproducible Open Graph images for electiontracker.au.

  python3 scripts/og/make-og-images.py

Writes (1200x630 JPG):
  site/public/images/og-electiontracker-2026.jpg  site-wide og:image / twitter:image
  site/public/images/og-survey.jpg                 'Have your say' survey promo, edited
                                                   in place: URL strip redrawn as
                                                   survey.oze.au (idempotent)
  og-image.jpg/png, og-survey.png, og-survey-1200.png  legacy copies of the above
Needs Pillow. Uses Inter if installed, else DejaVu Sans / Pillow default.
Copy is taken from site/src/pages/index.astro and site/src/lib/site.mjs.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
IMG = ROOT / "site" / "public" / "images"
W, H = 1200, 630

NAVY = (11, 31, 58)       # logo disc
NAVY_DEEP = (7, 21, 40)
GOLD = (201, 162, 39)     # logo tick / ring
TEAL = (62, 160, 168)     # logo "ELECTION" / bars
PAPER = (251, 250, 247)   # --paper
SAND = (206, 199, 184)    # --rule-strong
PLUM = (91, 58, 110)      # --accent

FONT_CANDIDATES = [
    "/usr/share/fonts/truetype/sand-box/google/Inter/Inter-VariableFont_opsz,wght.ttf",
    "/Library/Fonts/Inter-VariableFont_opsz,wght.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
]


def font(size, weight="Bold"):
    for p in FONT_CANDIDATES:
        if Path(p).exists():
            f = ImageFont.truetype(p, size)
            try:
                f.set_variation_by_name(weight)
            except Exception:
                pass
            return f
    return ImageFont.load_default(size)


def site_card():
    im = Image.new("RGB", (W, H), NAVY_DEEP)
    d = ImageDraw.Draw(im)
    # vertical gradient navy -> deep navy
    for y in range(H):
        t = y / H
        c = tuple(int(NAVY[i] * (1 - t) + NAVY_DEEP[i] * t) for i in range(3))
        d.line([(0, y), (W, y)], fill=c)
    # faint grid on the right (echoes the logo's map grid)
    for x in range(720, W, 40):
        d.line([(x, 0), (x, H)], fill=(20, 44, 76))
    for y in range(0, H, 40):
        d.line([(720, y), (W, y)], fill=(20, 44, 76))
    # plum + gold accent rules
    d.rectangle([0, 0, W, 10], fill=PLUM)
    d.rectangle([0, 10, W, 14], fill=GOLD)

    logo = Image.open(IMG / "aet-logo-512.png").convert("RGBA").resize((380, 380), Image.LANCZOS)
    im.paste(logo, (770, 125), logo)

    x = 72
    d.text((x, 92), "INDEPENDENT · SOURCED · AUSTRALIA-WIDE", font=font(22, "SemiBold"), fill=TEAL)
    d.text((x, 142), "Australian", font=font(70, "ExtraBold"), fill=PAPER)
    d.text((x, 222), "Election Tracker", font=font(70, "ExtraBold"), fill=PAPER)
    d.rectangle([x, 320, x + 96, 326], fill=GOLD)
    tf = font(36, "Medium")
    d.text((x, 356), "Australian elections,", font=tf, fill=SAND)
    d.text((x, 402), "one evidence trail.", font=tf, fill=SAND)
    d.text((x, 478), "Candidates · parties · policies · poll averages", font=font(24, "Regular"), fill=(170, 186, 206))
    d.text((x, 540), "electiontracker.au", font=font(30, "Bold"), fill=GOLD)
    out = IMG / "og-electiontracker-2026.jpg"
    im.save(out, "JPEG", quality=88, optimize=True, progressive=True)
    return out


def survey_card():
    src = IMG / "og-survey.jpg"
    im = Image.open(src).convert("RGB").resize((W, H), Image.LANCZOS)
    d = ImageDraw.Draw(im)
    # Panel colour sampled from the navy column; blank the old URL strip.
    panel = im.getpixel((W - 20, 600))
    box = (676, 500, W - 12, 568)
    d.rectangle(box, fill=panel)
    f = font(44, "Bold")
    text = "survey.oze.au"
    tw = d.textlength(text, font=f)
    cx = 928
    d.text((cx - tw / 2, 508), text, font=f, fill=(244, 238, 222))
    out = IMG / "og-survey.jpg"
    im.save(out, "JPEG", quality=88, optimize=True, progressive=True)
    return out


def legacy_copies(card, survey):
    """Keep older URLs valid: og-image.* now carry the site card, and the
    og-survey PNG variants match the corrected survey promo."""
    c, s = Image.open(card), Image.open(survey)
    c.save(IMG / "og-image.jpg", "JPEG", quality=88, optimize=True, progressive=True)
    c.save(IMG / "og-image.png", optimize=True)
    s.save(IMG / "og-survey.png", optimize=True)
    s.save(IMG / "og-survey-1200.png", optimize=True)
    return [IMG / n for n in ("og-image.jpg", "og-image.png", "og-survey.png", "og-survey-1200.png")]


if __name__ == "__main__":
    card, survey = site_card(), survey_card()
    for p in [card, survey, *legacy_copies(card, survey)]:
        print(p.relative_to(ROOT), Image.open(p).size)
