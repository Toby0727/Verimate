"""Instagram story (1080 x 1920), no QR code.

python3 -I story.py <dir with logo.png> <figtree-latin.ttf> <output path without extension>
Keeps text out of the top and bottom ~250px, where Instagram draws its UI.
"""
import sys
from PIL import Image, ImageDraw, ImageFont

D, FONT, OUT = sys.argv[1:4]
W, H = 1080, 1920
M = 90
BG = (244, 244, 245)
INK = (17, 17, 17)
MUTED = (110, 110, 118)
BRAND = (248, 103, 46)  # Persimmon #F8672E
RUST = (191, 67, 6)  # #BF4306
WHITE = (255, 255, 255)
PINK = (250, 225, 229)


def font(size, weight):
    f = ImageFont.truetype(FONT, size)
    f.set_variation_by_axes([weight])
    return f


img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)


def text_top(x, y, s, f, fill):
    _, t, _, _ = d.textbbox((0, 0), s, font=f)
    d.text((x, y - t), s, font=f, fill=fill)
    return d.textlength(s, font=f)


# Logo
logo = Image.open(f"{D}/logo.png").convert("RGBA")
lw = 360
logo = logo.resize((lw, round(logo.height * lw / logo.width)), Image.LANCZOS)
img.paste(logo, (M, 240), logo)

# Slogan, four lines sized to the width
LINES = [
    [("Building the most", INK)],
    [("complete ", INK), ("sublet +", BRAND)],
    [("roommate", BRAND), (" matching", INK)],
    [("for off-campus living.", INK)],
]
size = 108
while True:
    sf = font(size, 700)
    widest = max(sum(d.textlength(s, font=sf) for s, _ in line) for line in LINES)
    if widest <= W - 2 * M:
        break
    size -= 2
y = 390
for line in LINES:
    x = M
    for s, c in line:
        x += text_top(x, y, s, sf, c)
    y += round(size * 1.12)

# Gift card
cx, cy, cw, ch = M, y + 44, W - 2 * M, 560
d.rounded_rectangle((cx, cy, cx + cw, cy + ch), radius=40, fill=BRAND)
lc = (222, 84, 26)
d.line((cx + cw - 130, cy, cx + cw - 130, cy + ch), fill=lc, width=3)
d.line((cx, cy + 168, cx + cw, cy + 168), fill=lc, width=3)
d.rounded_rectangle((cx + 16, cy + 16, cx + cw - 16, cy + ch - 16), radius=28,
                    outline=(232, 92, 36), width=2)
lf = font(36, 700)
text_top(cx + 52, cy + 46, "Sign up to find your sublease / roomie", lf, INK)
text_top(cx + 52, cy + 96, "and win a", lf, INK)
nf, df = font(200, 800), font(100, 500)
top = cy + 200
_, n_t, _, n_b = d.textbbox((0, 0), "50", font=nf)
dw = text_top(cx + 52, top + 6, "$", df, INK)
nx = cx + 52 + dw + 6
nw = text_top(nx, top, "50", nf, INK)
gf = font(50, 650)
_, g_t, _, g_b = d.textbbox((0, 0), "Amazon", font=gf)
gh = g_b - g_t
gx = nx + nw + 34
text_top(gx, top + (n_b - n_t) - 2 * gh - 18, "Amazon", gf, INK)
text_top(gx, top + (n_b - n_t) - gh, "gift card", gf, INK)
text_top(cx + 52, cy + ch - 120, "+ one month free account", font(46, 700), INK)
text_top(cx + 52, cy + ch - 56, "Ends Nov 30", font(28, 500), INK)

# Call to action
y = cy + ch + 44
text_top(M, y, "Join the waitlist at", font(44, 500), MUTED)
text_top(M, y + 64, "verimateapp.com", font(76, 800), INK)

# Sign-in policy
pf, pb = font(30, 500), font(30, 750)
y += 150
x = M
for s, f, c in [("Use your ", pf, MUTED), ("@g.syr.edu", pb, INK),
                (" account for a", pf, MUTED)]:
    x += text_top(x, y, s, f, c)
text_top(M, y + 44, "5% better chance to win.", pf, MUTED)

print("bottom of content", y + 80, "of", H, "(keep under ~1670)")
img.save(f"{OUT}.png")
