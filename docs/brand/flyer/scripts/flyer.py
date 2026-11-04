import sys
from PIL import Image, ImageDraw, ImageFont

D = sys.argv[1]  # working dir with qr.png, logo.png
FONT = sys.argv[2]
OUT = sys.argv[3]
URL = sys.argv[4] if len(sys.argv) > 4 else "verimate.org"  # text under the QR code

W, H = 2550, 3300  # US letter at 300 dpi
M = 180
BG = (244, 244, 245)
INK = (17, 17, 17)
MUTED = (110, 110, 118)
RED = (184, 40, 58)
WHITE = (255, 255, 255)


def font(size, weight):
    f = ImageFont.truetype(FONT, size)
    f.set_variation_by_axes([weight])
    return f


img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)

# Logo
logo = Image.open(f"{D}/logo.png").convert("RGBA")
lw = 600
logo = logo.resize((lw, round(logo.height * lw / logo.width)), Image.LANCZOS)
img.paste(logo, (M, 200), logo)

# Slogan on three set lines, "sublet + roommate" in red.
hf = font(160, 700)
space = d.textlength(" ", font=hf)
LINES = [
    [("Building", INK), ("the", INK), ("most", INK), ("complete", INK)],
    [("sublet", RED), ("+", RED), ("roommate", RED), ("matching", INK)],
    [("for", INK), ("off-campus", INK), ("living.", INK)],
]
lines = [[(w, c, d.textlength(w, font=hf)) for w, c in line] for line in LINES]
for line in lines:
    assert sum(w for *_, w in line) + space * (len(line) - 1) <= W - 2 * M, line
y = 500
for line in lines:
    x = M
    for word, color, w in line:
        d.text((x, y), word, font=hf, fill=color)
        x += w + space
    y += 182

# QR code on a white tile, centered.
tile = 1000
qr_size = 850
ty = y + 140
tx = (W - tile) // 2
d.rounded_rectangle((tx, ty, tx + tile, ty + tile), radius=56, fill=WHITE)
qr = Image.open(f"{D}/qr.png").convert("RGB").resize((qr_size, qr_size), Image.NEAREST)
img.paste(qr, (tx + (tile - qr_size) // 2, ty + (tile - qr_size) // 2))
label = "Scan to join the waitlist"
lf = font(56, 650)
lwid = d.textlength(label, font=lf)
d.text(((W - lwid) / 2, ty + tile + 40), label, font=lf, fill=INK)
url = URL
uf = font(46, 500)
uwid = d.textlength(url, font=uf)
d.text(((W - uwid) / 2, ty + tile + 112), url, font=uf, fill=MUTED)

# $50 gift card
cy0 = ty + tile + 260
cy1 = cy0 + 540
d.rounded_rectangle((M, cy0, W - M, cy1), radius=56, fill=RED)
# fine ribbon lines and an inner frame, like the site's card
d.line((W - M - 230, cy0, W - M - 230, cy1), fill=(214, 120, 131), width=4)
d.line((M, cy0 + 128, W - M, cy0 + 128), fill=(214, 120, 131), width=4)
d.rounded_rectangle((M + 24, cy0 + 24, W - M - 24, cy1 - 24), radius=40,
                    outline=(200, 82, 96), width=3)
kf = font(40, 650)
d.text((M + 80, cy0 + 58), "S I G N   U P   T O   W I N", font=kf, fill=(250, 225, 229))
bf = font(250, 800)
# Measure the glyphs so "$50" sits between the label and the footer line.
top = cy0 + 150
# "$" smaller and lighter, aligned to the top of "50", like a price tag.
df = font(150, 500)
dx0, dy0, dx1, dy1 = d.textbbox((0, 0), "$", font=df)
bx0, by0, bx1, by1 = d.textbbox((0, 0), "50", font=bf)
d.text((M + 80 - dx0, top - 6 - dy0), "$", font=df, fill=WHITE)
nx = M + 80 + (dx1 - dx0) + 12
d.text((nx - bx0, top - by0), "50", font=bf, fill=WHITE)
gf = font(76, 600)
gx = nx + (bx1 - bx0) + 40
_, gy0, _, gy1 = d.textbbox((0, 0), "Amazon", font=gf)
baseline = top + (by1 - by0)
d.text((gx, baseline - 2 * (gy1 - gy0) - 28 - gy0), "Amazon", font=gf, fill=WHITE)
d.text((gx, baseline - (gy1 - gy0) - gy0), "gift card", font=gf, fill=WHITE)
ef = font(66, 700)
d.text((M + 80, cy1 - 128), "+ one month free account", font=ef, fill=WHITE)
nf = font(40, 500)
note = "Ends Nov 30"
d.text((W - M - 230 - 40 - d.textlength(note, font=nf), cy1 - 108), note, font=nf,
       fill=(250, 225, 229))

# Sign-in policy, one line
py = cy1 + 70
pf = font(46, 500)
pb = font(46, 750)
parts = [("Sign in with your ", pf, MUTED), ("@g.syr.edu", pb, INK),
         (" account for a 5% better chance to win.", pf, MUTED)]
total = sum(d.textlength(t, font=f) for t, f, _ in parts)
x = (W - total) / 2
for t, f, c in parts:
    d.text((x, py), t, font=f, fill=c)
    x += d.textlength(t, font=f)

print("bottom of content", py + 60, "of", H)
img.save(f"{OUT}.png", dpi=(300, 300))
img.save(f"{OUT}.pdf", resolution=300)
