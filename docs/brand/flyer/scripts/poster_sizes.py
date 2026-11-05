"""Campaign posters at any print size, with or without the QR code.

python3 -I poster_sizes.py <dir with qr.png> <figtree.ttf> <logo.png> <out prefix>
        <width in> <height in> <qr|noqr> "<headline>" [url] [highlight]

The highlight (default "sublet + roommate") is drawn in orange. Portrait sizes stack
everything in one column; landscape sizes put the headline and prize on the
left and the QR code (or the big URL) on the right. Writes <out>.png and
<out>.pdf at 300 dpi.
"""

import sys

from PIL import Image, ImageDraw, ImageFont

D, FONT, LOGO, OUT = sys.argv[1:5]
W_IN, H_IN = float(sys.argv[5]), float(sys.argv[6])
WITH_QR = sys.argv[7] == "qr"
HEADLINE = sys.argv[8]
URL = sys.argv[9] if len(sys.argv) > 9 else "verimateapp.com"
HIGHLIGHT = sys.argv[10] if len(sys.argv) > 10 else "sublet + roommate"

DPI = 300
W, H = round(W_IN * DPI), round(H_IN * DPI)
BG = (244, 244, 245)
INK = (17, 17, 17)
MUTED = (110, 110, 118)
BRAND = (248, 103, 46)  # Persimmon #F8672E
LINE = (222, 84, 26)
FRAME = (232, 92, 36)
WHITE = (255, 255, 255)
PORTRAIT = H > W
U = min(W, H) / DPI  # short side in inches; everything scales from it

img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)


def px(inches):
    return round(inches * DPI)


def font(size_px, weight):
    f = ImageFont.truetype(FONT, max(8, round(size_px)))
    f.set_variation_by_axes([weight])
    return f


def text_top(x, y, s, f, fill):
    """Draw text so its visible top sits at y; returns its advance width."""
    _, t, _, _ = d.textbbox((0, 0), s, font=f)
    d.text((x, y - t), s, font=f, fill=fill)
    return d.textlength(s, font=f)


def cap_height(f):
    _, t, _, b = d.textbbox((0, 0), "H", font=f)
    return b - t


# Headline words, with the highlight in orange.
def headline_words():
    i = HEADLINE.lower().find(HIGHLIGHT)
    parts = (
        [(HEADLINE, INK)]
        if i < 0
        else [
            (HEADLINE[:i], INK),
            (HEADLINE[i : i + len(HIGHLIGHT)], BRAND),
            (HEADLINE[i + len(HIGHLIGHT) :], INK),
        ]
    )
    return [(w, c) for text, c in parts for w in text.split()]


def wrap(words, f, width):
    space = d.textlength(" ", font=f)
    lines, line, used = [], [], 0
    for w, c in words:
        wl = d.textlength(w, font=f)
        if line and used + space + wl > width:
            lines.append(line)
            line, used = [], 0
        used += (space if line else 0) + wl
        line.append((w, c, wl))
    if line:
        lines.append(line)
    return lines, space


def fit_headline(width, max_h, max_size):
    """Largest size whose wrapped headline fits the box."""
    words = headline_words()
    size = max_size
    while size > 20:
        f = font(size, 750)
        lines, space = wrap(words, f, width)
        lh = round(size * 1.1)
        if lh * (len(lines) - 1) + size * 1.0 <= max_h:
            return f, lines, space, lh
        size -= 4
    raise SystemExit("headline doesn't fit")


def draw_headline(x, y, fitted):
    """Lines share a baseline, so short words like "a" and "+" sit right."""
    f, lines, space, lh = fitted
    baseline = y + cap_height(f)
    for line in lines:
        cx = x
        for w, c, wl in line:
            d.text((cx, baseline), w, font=f, fill=c, anchor="ls")
            cx += wl + space
        baseline += lh
    return baseline - lh + f.size * 0.28  # bottom of the last line, with descenders


def prize_card(x, y, w, h):
    r = round(h * 0.09)
    d.rounded_rectangle((x, y, x + w, y + h), radius=r, fill=BRAND)
    stub = round(h * 0.3)
    band = round(h * 0.22)
    lw = max(3, round(h / 300))
    d.line((x + w - stub, y, x + w - stub, y + h), fill=LINE, width=lw)
    d.line((x, y + band, x + w, y + band), fill=LINE, width=lw)
    inset = round(h * 0.035)
    d.rounded_rectangle(
        (x + inset, y + inset, x + w - inset, y + h - inset),
        radius=round(r * 0.7),
        outline=FRAME,
        width=max(2, lw - 1),
    )
    pad = round(h * 0.11)
    kf = font(h * 0.07, 700)
    text_top(x + pad, y + band * 0.42, "S I G N   U P   T O   W I N", kf, INK)
    # "$50" with a smaller "$", then "Amazon / gift card".
    nf, df, gf = font(h * 0.42, 800), font(h * 0.2, 500), font(h * 0.12, 650)
    top = y + band + h * 0.1
    dw = text_top(x + pad, top + h * 0.01, "$", df, INK)
    nx = x + pad + dw + h * 0.015
    nw = text_top(nx, top, "50", nf, INK)
    nh = cap_height(nf)
    gh = cap_height(gf)
    gx = nx + nw + h * 0.06
    text_top(gx, top + nh - 2 * gh - h * 0.05, "Amazon", gf, INK)
    text_top(gx, top + nh - gh, "gift card", gf, INK)
    ff, ef = font(h * 0.1, 700), font(h * 0.06, 500)
    text_top(x + pad, y + h - pad - cap_height(ff), "+ one month free account", ff, INK)
    ew = d.textlength("Ends Nov 30", font=ef)
    text_top(x + w - stub - pad * 0.6 - ew, y + h - pad - cap_height(ef), "Ends Nov 30", ef, INK)


def qr_block(cx, y, size):
    """White tile with the QR code, centred on cx; returns the bottom."""
    tile = size
    tx = round(cx - tile / 2)
    d.rounded_rectangle((tx, y, tx + tile, y + tile), radius=round(tile * 0.06), fill=WHITE)
    qs = round(tile * 0.85)
    qr = Image.open(f"{D}/qr.png").convert("RGB").resize((qs, qs), Image.NEAREST)
    img.paste(qr, (tx + (tile - qs) // 2, y + (tile - qs) // 2))
    lf, uf = font(tile * 0.075, 700), font(tile * 0.055, 500)
    ly = y + tile + tile * 0.06
    lw = d.textlength("Scan to join the waitlist", font=lf)
    text_top(cx - lw / 2, ly, "Scan to join the waitlist", lf, INK)
    uy = ly + cap_height(lf) + tile * 0.05
    uw = d.textlength(URL, font=uf)
    text_top(cx - uw / 2, uy, URL, uf, MUTED)
    return uy + cap_height(uf) * 1.3


def url_block(x, y, width, centred=False):
    """'Join the waitlist at' and the URL as big as the width allows."""
    lf = font(U * DPI * 0.04, 500)
    size = U * DPI * 0.12
    while d.textlength(URL, font=font(size, 800)) > width:
        size -= 4
    uf = font(size, 800)
    lw, uw = d.textlength("Join the waitlist at", font=lf), d.textlength(URL, font=uf)
    lx = x + (width - lw) / 2 if centred else x
    ux = x + (width - uw) / 2 if centred else x
    text_top(lx, y, "Join the waitlist at", lf, MUTED)
    uy = y + cap_height(lf) + size * 0.35
    text_top(ux, uy, URL, uf, INK)
    return uy + cap_height(uf) * 1.35


def sign_in_lines(x, y, width, centred):
    pf, pb = font(U * DPI * 0.024, 500), font(U * DPI * 0.024, 750)
    one = [("Sign in with your ", pf, MUTED), ("@g.syr.edu", pb, INK), (" account for a 5% better chance to win.", pf, MUTED)]
    two = [[("Sign in with your ", pf, MUTED), ("@g.syr.edu", pb, INK), (" account", pf, MUTED)], [("for a 5% better chance to win.", pf, MUTED)]]
    length = lambda parts: sum(d.textlength(t, font=f) for t, f, _ in parts)
    rows = [one] if length(one) <= width else two
    for parts in rows:
        cx = x + (width - length(parts)) / 2 if centred else x
        for t, f, c in parts:
            cx += text_top(cx, y, t, f, c)
        y += cap_height(pf) * 1.9
    return y


def fine_print(y, centred_x=None):
    f = font(U * DPI * 0.016, 500)
    s = f"No purchase necessary. Ends Nov 30, 2026. Rules: {URL}/raffle-rules"
    x = (W - d.textlength(s, font=f)) / 2 if centred_x is None else centred_x
    text_top(x, y, s, f, MUTED)


logo = Image.open(LOGO).convert("RGBA")
M = px(U * 0.08)

if PORTRAIT:
    lw = px(U * 0.3)
    logo = logo.resize((lw, round(logo.height * lw / logo.width)), Image.LANCZOS)
    img.paste(logo, (M, M), logo)
    inner = W - 2 * M
    head = fit_headline(inner, H * 0.25, U * DPI * 0.15)
    y = draw_headline(M, M + logo.height + px(U * 0.09), head)
    card_h = round(inner * 0.36)
    foot_y = H - M - px(U * 0.02)
    card_y = foot_y - px(U * 0.08) - card_h
    if WITH_QR:
        size = round(min(inner * 0.62, (card_y - y) * 0.74))
        block_h = size * 1.24
        qy = round(y + (card_y - y - block_h) / 2)
        qr_block(W / 2, qy, size)
    else:
        block_h = U * DPI * 0.2
        url_block(M, round(y + (card_y - y - block_h) / 2), inner, centred=True)
    prize_card(M, card_y, inner, card_h)
    sign_in_lines(M, card_y + card_h + px(U * 0.035), inner, centred=True)
    fine_print(foot_y + px(U * 0.02))
else:
    lw = px(U * 0.27)
    logo = logo.resize((lw, round(logo.height * lw / logo.width)), Image.LANCZOS)
    img.paste(logo, (M, M), logo)
    # Without a QR code the URL is the call to action, so it gets more room.
    col = round(W * (0.58 if WITH_QR else 0.5))
    right_x = M + col + px(U * 0.07)
    right_w = W - M - right_x
    card_h = round(col * 0.36)
    card_y = H - M - px(U * 0.06) - card_h
    head_y = M + logo.height + px(U * 0.08)
    head = fit_headline(col, card_y - px(U * 0.07) - head_y, U * DPI * 0.13)
    draw_headline(M, head_y, head)
    prize_card(M, card_y, col, card_h)
    fine_print(H - M + px(U * 0.005), centred_x=M)
    cx = right_x + right_w / 2
    if WITH_QR:
        size = round(min(right_w * 0.92, H * 0.55))
        block_h = size * 1.24 + px(U * 0.12)
        qy = round((H - block_h) / 2)
        bottom = qr_block(cx, qy, size)
    else:
        # The URL on a white tile, as heavy as the QR tile would be.
        pad = round(right_w * 0.07)
        tile_h = round(right_w * 0.4)
        ty = round((H - tile_h) / 2 - px(U * 0.04))
        d.rounded_rectangle((right_x, ty, right_x + right_w, ty + tile_h), radius=round(tile_h * 0.1), fill=WHITE)
        url_block(right_x + pad, ty + round(tile_h * 0.27), right_w - 2 * pad, centred=True)
        bottom = ty + tile_h
    sign_in_lines(right_x, bottom + px(U * 0.04), right_w, centred=True)

img.save(f"{OUT}.png", dpi=(DPI, DPI))
img.save(f"{OUT}.pdf", resolution=DPI)
print("ok", OUT.rsplit("/", 1)[-1], img.size)
