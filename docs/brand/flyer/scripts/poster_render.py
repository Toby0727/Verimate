import sys
from PIL import Image, ImageDraw, ImageFont

D, FONT, LOGO, OUT = sys.argv[1:5]
URL = sys.argv[5] if len(sys.argv) > 5 else "verimateapp.com"  # text under the QR code
DPI = 300
W, H = 17 * DPI, 11 * DPI
BG = (244, 244, 245)
INK = (17, 17, 17)
MUTED = (110, 110, 118)
BRAND = (248, 103, 46)  # Persimmon #F8672E
RUST = (191, 67, 6)  # #BF4306
WHITE = (255, 255, 255)
PINK = (250, 225, 229)


def px(inches):
    return round(inches * DPI)


def font(pt, weight):
    f = ImageFont.truetype(FONT, round(pt * DPI / 72))
    f.set_variation_by_axes([weight])
    return f


img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)


def text_top(x, y, s, f, fill):
    """Draw text so its visible top sits at y."""
    _, t, _, _ = d.textbbox((0, 0), s, font=f)
    d.text((x, y - t), s, font=f, fill=fill)
    return d.textlength(s, font=f)


L = px(1.1)

# Logo
logo = Image.open(LOGO).convert("RGBA")
lw = px(3.3)
logo = logo.resize((lw, round(logo.height * lw / logo.width)), Image.LANCZOS)
img.paste(logo, (L, px(1.55)), logo)

# Slogan, three lines
sf = font(46, 700)
lines = [
    [("Building the most complete", INK)],
    [("sublet + roommate", BRAND), (" matching", INK)],
    [("for off-campus living", INK)],
]
y = px(2.95)
for line in lines:
    x = L
    for s, c in line:
        x += text_top(x, y, s, sf, c)
    y += px(0.66)

# Gift card
cx, cy, cw, ch = L, px(5.4), px(9.4), px(3.9)
d.rounded_rectangle((cx, cy, cx + cw, cy + ch), radius=px(0.28), fill=BRAND)
line_col = (222, 84, 26)
d.line((cx + cw - px(1.15), cy, cx + cw - px(1.15), cy + ch), fill=line_col, width=5)
d.line((cx, cy + px(0.82), cx + cw, cy + px(0.82)), fill=line_col, width=5)
d.rounded_rectangle((cx + px(0.12), cy + px(0.12), cx + cw - px(0.12), cy + ch - px(0.12)),
                    radius=px(0.2), outline=(232, 92, 36), width=3)
kf = font(18, 700)
text_top(cx + px(0.5), cy + px(0.33), "S I G N   U P   T O   W I N", kf, INK)

# "$" smaller and lighter, top-aligned with "50"
nf = font(140, 800)
df = font(70, 500)
top = cy + px(1.15)
_, n_t, _, n_b = d.textbbox((0, 0), "50", font=nf)
dx = cx + px(0.5)
dw = text_top(dx, top + px(0.05), "$", df, INK)
nx = dx + dw + px(0.06)
nw = text_top(nx, top, "50", nf, INK)
gf = font(36, 650)
gx = nx + nw + px(0.35)
num_h = n_b - n_t
_, g_t, _, g_b = d.textbbox((0, 0), "Amazon", font=gf)
gh = g_b - g_t
text_top(gx, top + num_h - 2 * gh - px(0.14), "Amazon", gf, INK)
text_top(gx, top + num_h - gh, "gift card", gf, INK)

ff = font(30, 700)
text_top(cx + px(0.5), cy + px(3.05), "+ one month free account", ff, INK)
ef = font(16, 500)
ew = d.textlength("Ends Nov 30", font=ef)
text_top(cx + cw - px(1.15) - px(0.35) - ew, cy + px(3.15), "Ends Nov 30", ef, INK)

# QR on a white tile
tile, tx, ty = px(5.0), px(11.2), px(1.55)
d.rounded_rectangle((tx, ty, tx + tile, ty + tile), radius=px(0.3), fill=WHITE)
qs = px(4.25)
qr = Image.open(f"{D}/qr.png").convert("RGB").resize((qs, qs), Image.NEAREST)
img.paste(qr, (tx + (tile - qs) // 2, ty + (tile - qs) // 2))


def centered(y, parts):
    total = sum(d.textlength(s, font=f) for s, f, _ in parts)
    x = tx + (tile - total) / 2
    for s, f, c in parts:
        x += text_top(x, y, s, f, c)


centered(ty + tile + px(0.35), [("Scan to join the waitlist", font(30, 700), INK)])
centered(ty + tile + px(0.98), [(URL, font(22, 500), MUTED)])
pf, pb = font(16, 500), font(16, 750)
centered(ty + tile + px(1.75), [("Sign in with your ", pf, MUTED), ("@g.syr.edu", pb, INK),
                                (" account", pf, MUTED)])
centered(ty + tile + px(2.08), [("for a 5% better chance to win", pf, MUTED)])

img.save(f"{OUT}.png", dpi=(DPI, DPI))
img.save(f"{OUT}.pdf", resolution=DPI)
print("ok", img.size)
