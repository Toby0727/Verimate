"""Link preview image (Open Graph), 1200 x 630, for app/opengraph-image.png.

python3 -I og_image.py <dir with logo-light.png> <figtree.ttf> <out.png>

What iMessage, Instagram DMs and Facebook show when someone shares
verimateapp.com: the logo, the campaign line and the $50 gift card, in the
Persimmon palette. Tagged sRGB.
"""

import sys

from PIL import Image, ImageCms, ImageDraw, ImageFont

D, FONT, OUT = sys.argv[1:4]
W, H = 1200, 630
BG, INK, BRAND, MUTED, TINT = "#F4F4F5", "#111111", "#F8672E", "#6E6E76", "#FDE9DF"


def font(size, weight):
    f = ImageFont.truetype(FONT, size)
    f.set_variation_by_axes([weight])
    return f


img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)
M = 72

logo = Image.open(f"{D}/logo-light.png").convert("RGBA")
lw = 250
logo = logo.resize((lw, round(logo.height * lw / logo.width)), Image.LANCZOS)
img.paste(logo, (M, M), logo)

# Campaign line, two lines, "$50" in orange.
hf = font(66, 800)
y = 210
for parts in [[("Find a roommate.", INK)], [("Win a ", INK), ("$50", BRAND), (" gift card.", INK)]]:
    x = M
    for text, color in parts:
        d.text((x, y), text, font=hf, fill=color, anchor="ls")
        x += d.textlength(text, font=hf)
    y += 78
d.text((M, y + 14), "Sublets + roommates for SU & ESF students.", font=font(32, 500), fill=MUTED, anchor="ls")
# URL pill
uf = font(30, 700)
url = "verimateapp.com"
pw = d.textlength(url, font=uf) + 56
d.rounded_rectangle((M, H - M - 64, M + pw, H - M), radius=32, fill=INK)
d.text((M + 28, H - M - 32), url, font=uf, fill="#FFFFFF", anchor="lm")

# Gift card on the right, tilted slightly for life.
cw, ch = 340, 215
card = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
c = ImageDraw.Draw(card)
c.rounded_rectangle((0, 0, cw - 1, ch - 1), radius=22, fill=BRAND)
band = 18
vx, hy = round(cw * 0.72), round(ch * 0.3)
c.rectangle((vx, 0, vx + band, ch), fill=TINT)
c.rectangle((0, hy, cw, hy + band), fill=TINT)
kx, ky = vx + band // 2, hy + band // 2
for sx in (-1, 1):
    c.ellipse((kx + sx * 26 - 26, ky - 22, kx + sx * 26 + 26, ky + 10), fill=TINT)
c.rounded_rectangle((kx - 14, ky - 14, kx + 14, ky + 14), radius=8, fill="#FBD3C0")
c.text((26, 36), "G I F T   C A R D", font=font(15, 750), fill=INK, anchor="ls")
c.text((24, 160), "$50", font=font(74, 800), fill=INK, anchor="ls")
c.text((26, 192), "Amazon gift card", font=font(19, 650), fill=INK, anchor="ls")
card = card.rotate(-6, resample=Image.BICUBIC, expand=True)
shadow = Image.new("RGBA", card.size, (0, 0, 0, 0))
shadow.paste((191, 67, 6, 70), (0, 0), card.split()[3])
cx, cy = W - M - card.width + 20, (H - card.height) // 2 + 10
img.paste(shadow, (cx + 10, cy + 18), shadow)
img.paste(card, (cx, cy), card)

d.text((W - M, H - M - 10), "Ends Nov 30. No purchase necessary.", font=font(20, 500), fill=MUTED, anchor="rs")

srgb = ImageCms.ImageCmsProfile(ImageCms.createProfile("sRGB")).tobytes()
img.save(OUT, icc_profile=srgb, optimize=True)
print("ok", OUT)
