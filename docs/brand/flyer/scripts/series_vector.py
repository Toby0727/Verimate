"""The "personal ad" poster series as vector SVG (Illustrator-editable) and
300 dpi PNG + PDF for print, from one layout.

python3 -I series_vector.py <assets dir> <figtree.ttf> <logo.svg> <out dir>

<assets dir> needs qr.json (the QR module matrix, from qrcode.create) and the
logo PNGs from logo_variants.cjs (logo-light/-orange/-ink.png). Writes, per
poster, <out>/verimate-series-<slug>.svg/.png/.pdf, plus
<out>/verimate-series-board.svg: all seven 11x17 posters on one canvas, each
in its own named group, for Illustrator (Object > Artboards > Convert to
Artboards on the background rectangles gives one artboard per poster).

Text in the SVG stays live: install Figtree (the TTF above) before opening.
"""

import json
import re
import sys
from xml.sax.saxutils import escape

import zlib

from PIL import Image, ImageCms, ImageDraw, ImageFont

ASSETS, FONT, LOGO_SVG, OUT = sys.argv[1:5]
URL = "verimateapp.com"
TAGLINE = ["Building Syracuse's most complete", "sublet + roommate platform"]

DPI = 300
W, H = 11 * DPI, 17 * DPI
M = round(0.8 * DPI)
INK, WHITE, BRAND = "#111111", "#FFFFFF", "#F8672E"
RUST, TINT = "#BF4306", "#FDE9DF"
THEMES = {
    # bg, text, accent, quiet, kicker bg, kicker text, card, card text, card accent, ribbon, logo
    "light": ("#F4F4F5", INK, BRAND, "#6E6E76", BRAND, INK, BRAND, INK, INK, TINT, "light"),
    "orange": (BRAND, INK, WHITE, "#3A1808", INK, WHITE, INK, WHITE, BRAND, BRAND, "orange"),
    "ink": (INK, WHITE, BRAND, "#B0B0B8", BRAND, INK, BRAND, INK, INK, TINT, "ink"),
}
LOGO_FILLS = {  # mark, wordmark
    "light": (BRAND, INK),
    "orange": (INK, INK),
    "ink": (BRAND, WHITE),
}

POSTERS = [
    ("1-gym-rat", "light", "Find a roommate. Win a $50 gift card.",
     "Gym rat seeks [gym rat].",
     "Roommate matching for SU & ESF students who live like you."),
    ("2-night-owl", "ink", "Find a roommate. Win a $50 gift card.",
     "Night owl looking for [night owl].",
     "Find a roommate who's also up at 3am in studio."),
    ("3-clean-freak", "orange", "Find a roommate. Win a $50 gift card.",
     "Clean freak looking for [clean freak].",
     "Find a roommate who keeps the kitchen as clean as you do."),
    ("4-cat", "light", "Find a roommate. Win a $50 gift card.",
     "Girl with [cat] looking for roommate.",
     "Find roommates who are happy to live with pets."),
    ("5-lofi", "orange", "Find a roommate. Win a $50 gift card.",
     "[Lo-fi beats] or [total silence]? It matters.",
     "Know how they live before you sign the lease."),
    ("6-fifty", "light", "Sublets + roommates for SU & ESF students.",
     "How does signing up and getting [$50] sound?",
     "Join the waitlist in about a minute. Finish the survey to enter."),
    ("7-florence", "orange", "Find your sublet tenant. Win a $50 gift card.",
     "[Florence] in the spring? Your room shouldn't sit empty.",
     "Sublet it to a fellow SU student while you're away."),
]

_fonts = {}

# Only Figtree's named weights, so every export (and Illustrator) uses the
# same instances: Medium 500, SemiBold 600, Bold 700, ExtraBold 800.
STD_WEIGHTS = {550: 500, 650: 600, 750: 700}


def snap(weight):
    return STD_WEIGHTS.get(weight, weight)


def font(size, weight):
    weight = snap(weight)
    key = (round(size), weight)
    if key not in _fonts:
        f = ImageFont.truetype(FONT, max(8, round(size)))
        f.set_variation_by_axes([weight])
        _fonts[key] = f
    return _fonts[key]


_measure = ImageDraw.Draw(Image.new("RGB", (10, 10)))


def tw(s, size, weight):
    return _measure.textlength(s, font=font(size, weight))


def cap(size, weight=700):
    _, t, _, b = _measure.textbbox((0, 0), "H", font=font(size, weight))
    return b - t


def rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


def mix(a, b, t):
    a, b = rgb(a), rgb(b)
    return "#%02X%02X%02X" % tuple(round(x + (y - x) * t) for x, y in zip(a, b))


class Canvas:
    """Records drawing ops; renders them to SVG or to a PIL image."""

    def __init__(self):
        self.ops = []

    def rect(self, x, y, w, h, fill, r=0, name=None):
        self.ops.append(("rect", x, y, w, h, fill, r, name))

    def ellipse(self, cx, cy, rx, ry, fill):
        self.ops.append(("ellipse", cx, cy, rx, ry, fill))

    def text(self, x, baseline, s, size, weight, fill, anchor="start"):
        self.ops.append(("text", x, baseline, s, size, weight, fill, anchor))

    def line(self, x, baseline, segments, size, weight):
        """One text object with colored segments [(text, color), ...]."""
        self.ops.append(("line", x, baseline, segments, size, weight))

    def logo(self, x, y, w, variant):
        self.ops.append(("logo", x, y, w, variant))

    def dashrect(self, x, y, w, h, stroke, width, r, dash, gap_):
        self.ops.append(("dashrect", x, y, w, h, stroke, width, r, dash, gap_))

    def curve(self, p0, p1, p2, p3, stroke, width):
        """Cubic Bezier stroke with round ends."""
        self.ops.append(("curve", p0, p1, p2, p3, stroke, width))

    def polygon(self, points, fill):
        self.ops.append(("polygon", points, fill))

    def qr(self, x, y, size, matrix):
        self.ops.append(("qr", x, y, size, matrix))

    def group(self, name):
        self.ops.append(("group", name))

    def end(self):
        self.ops.append(("end",))


# ---------- logo paths for SVG ----------
_logo = open(LOGO_SVG, encoding="utf-8").read()
_vb = [float(v) for v in re.search(r'viewBox="([^"]+)"', _logo).group(1).split()]
_mark = re.findall(r'd="([^"]+)"', _logo[_logo.index("<g") : _logo.index("</g>")])
_word = re.findall(r'd="([^"]+)"', _logo[_logo.index("</g>") :])
_mark_dx = float(re.search(r'translate\(([\d.]+)', _logo).group(1))


def svg_of(c, w=W, h=H):
    out = []
    for op in c.ops:
        k = op[0]
        if k == "rect":
            _, x, y, rw, rh, fill, r, name = op
            ident = f' id="{name}"' if name else ""
            out.append(f'<rect{ident} x="{x:.1f}" y="{y:.1f}" width="{rw:.1f}" height="{rh:.1f}" rx="{r:.1f}" fill="{fill}"/>')
        elif k == "ellipse":
            _, cx, cy, rx, ry, fill = op
            out.append(f'<ellipse cx="{cx:.1f}" cy="{cy:.1f}" rx="{rx:.1f}" ry="{ry:.1f}" fill="{fill}"/>')
        elif k == "text":
            _, x, b, s, size, weight, fill, anchor = op
            out.append(
                f'<text x="{x:.1f}" y="{b:.1f}" font-family="Figtree, sans-serif" font-size="{size:.1f}" '
                f'font-weight="{snap(weight)}" fill="{fill}" text-anchor="{anchor}">{escape(s)}</text>'
            )
        elif k == "line":
            _, x, b, segs, size, weight = op
            spans = "".join(f'<tspan fill="{c_}">{escape(t)}</tspan>' for t, c_ in segs)
            out.append(
                f'<text x="{x:.1f}" y="{b:.1f}" font-family="Figtree, sans-serif" font-size="{size:.1f}" '
                f'font-weight="{snap(weight)}">{spans}</text>'
            )
        elif k == "logo":
            _, x, y, lw, variant = op
            s = lw / _vb[2]
            mk, wd = LOGO_FILLS[variant]
            tx = x - _vb[0] * s
            out.append(f'<g id="logo" transform="translate({tx:.2f} {y:.2f}) scale({s:.4f})">')
            out.append(f'<g fill="{mk}" transform="translate({_mark_dx} 0)">' + "".join(f'<path d="{d}"/>' for d in _mark) + "</g>")
            out.append(f'<g fill="{wd}">' + "".join(f'<path d="{d}"/>' for d in _word) + "</g></g>")
        elif k == "qr":
            _, x, y, size, m = op
            n = m["size"]
            u = size / n
            d = "".join(
                f"M{x + col * u:.2f} {y + row * u:.2f}h{u:.2f}v{u:.2f}h-{u:.2f}z"
                for row in range(n)
                for col in range(n)
                if m["data"][row * n + col]
            )
            out.append(f'<path id="qr-code" d="{d}" fill="{INK}"/>')
        elif k == "dashrect":
            _, x, y, rw, rh, stroke, sw, r, dash, gap_ = op
            out.append(
                f'<rect id="link-sticker-placeholder" x="{x:.1f}" y="{y:.1f}" width="{rw:.1f}" height="{rh:.1f}" rx="{r:.1f}" '
                f'fill="none" stroke="{stroke}" stroke-width="{sw:.1f}" stroke-dasharray="{dash:.1f} {gap_:.1f}"/>'
            )
        elif k == "curve":
            _, p0, p1, p2, p3, stroke, sw = op
            out.append(
                f'<path id="arrow" d="M{p0[0]:.1f} {p0[1]:.1f} C{p1[0]:.1f} {p1[1]:.1f} {p2[0]:.1f} {p2[1]:.1f} {p3[0]:.1f} {p3[1]:.1f}" '
                f'fill="none" stroke="{stroke}" stroke-width="{sw:.1f}" stroke-linecap="round"/>'
            )
        elif k == "polygon":
            _, pts, fill = op
            out.append('<polygon points="' + " ".join(f"{a:.1f},{b:.1f}" for a, b in pts) + f'" fill="{fill}"/>')
        elif k == "group":
            out.append(f'<g id="{op[1]}">')
        elif k == "end":
            out.append("</g>")
    return "\n".join(out)


def bezier(p0, p1, p2, p3, n=60):
    pts = []
    for i in range(n + 1):
        t = i / n
        a, b, c_, d_ = (1 - t) ** 3, 3 * (1 - t) ** 2 * t, 3 * (1 - t) * t * t, t**3
        pts.append((a * p0[0] + b * p1[0] + c_ * p2[0] + d_ * p3[0], a * p0[1] + b * p1[1] + c_ * p2[1] + d_ * p3[1]))
    return pts


def pil_of(c, w=None, h=None):
    img = Image.new("RGB", (w or W, h or H), "#FFFFFF")
    d = ImageDraw.Draw(img)
    for op in c.ops:
        k = op[0]
        if k == "rect":
            _, x, y, rw, rh, fill, r, _ = op
            box = (round(x), round(y), round(x + rw), round(y + rh))
            if r:
                d.rounded_rectangle(box, radius=round(r), fill=fill)
            else:
                d.rectangle(box, fill=fill)
        elif k == "ellipse":
            _, cx, cy, rx, ry, fill = op
            d.ellipse((cx - rx, cy - ry, cx + rx, cy + ry), fill=fill)
        elif k == "text":
            _, x, b, s, size, weight, fill, anchor = op
            a = {"start": "ls", "end": "rs", "middle": "ms"}[anchor]
            d.text((x, b), s, font=font(size, weight), fill=fill, anchor=a)
        elif k == "line":
            _, x, b, segs, size, weight = op
            f = font(size, weight)
            for t, c_ in segs:
                d.text((x, b), t, font=f, fill=c_, anchor="ls")
                x += d.textlength(t, font=f)
        elif k == "logo":
            _, x, y, lw, variant = op
            logo = Image.open(f"{ASSETS}/logo-{variant}.png").convert("RGBA")
            logo = logo.resize((round(lw), round(logo.height * lw / logo.width)), Image.LANCZOS)
            img.paste(logo, (round(x), round(y)), logo)
        elif k == "dashrect":
            _, x, y, rw, rh, stroke, sw, r, dash, gap_ = op
            sw_ = round(sw)
            # straight edges as dashes, corners as solid arcs
            for (ax, ay, bx, by) in [(x + r, y, x + rw - r, y), (x + r, y + rh, x + rw - r, y + rh),
                                     (x, y + r, x, y + rh - r), (x + rw, y + r, x + rw, y + rh - r)]:
                length = ((bx - ax) ** 2 + (by - ay) ** 2) ** 0.5
                pos = 0.0
                while pos < length:
                    e = min(pos + dash, length)
                    d.line((ax + (bx - ax) * pos / length, ay + (by - ay) * pos / length,
                            ax + (bx - ax) * e / length, ay + (by - ay) * e / length), fill=stroke, width=sw_)
                    pos += dash + gap_
            for (cx_, cy_, a0) in [(x + r, y + r, 180), (x + rw - r, y + r, 270), (x + rw - r, y + rh - r, 0), (x + r, y + rh - r, 90)]:
                d.arc((cx_ - r, cy_ - r, cx_ + r, cy_ + r), a0, a0 + 90, fill=stroke, width=sw_)
        elif k == "curve":
            _, p0, p1, p2, p3, stroke, sw = op
            pts = bezier(p0, p1, p2, p3)
            d.line(pts, fill=stroke, width=round(sw), joint="curve")
            for px_, py_ in (pts[0], pts[-1]):
                d.ellipse((px_ - sw / 2, py_ - sw / 2, px_ + sw / 2, py_ + sw / 2), fill=stroke)
        elif k == "polygon":
            _, pts, fill = op
            d.polygon(pts, fill=fill)
        elif k == "qr":
            _, x, y, size, m = op
            n = m["size"]
            u = size / n
            for row in range(n):
                for col in range(n):
                    if m["data"][row * n + col]:
                        d.rectangle(
                            (round(x + col * u), round(y + row * u), round(x + (col + 1) * u) - 1, round(y + (row + 1) * u) - 1),
                            fill=INK,
                        )
    return img


# ---------- headline layout ----------
def headline_items(text, ink, accent):
    items = []
    for i, part in enumerate(re.split(r"[\[\]]", text)):
        if i % 2 and part.strip():
            items.append([part.strip(), accent])
        else:
            items += [[w, ink] for w in part.split()]
    glued = []
    for w, c in items:  # keep "?" "." attached to the word before
        if glued and re.fullmatch(r"[?.!,;:]+", w):
            glued[-1][0] += w
            glued[-1].append((w, c))
        else:
            glued.append([w, c])
    return glued


def wrap(items, size, width):
    space = tw(" ", size, 800)
    flat, split = [], False
    for it in items:
        if " " in it[0] and tw(it[0], size, 800) > width:
            parts = it[0].split()
            flat += [[p, it[1]] for p in parts[:-1]] + [[parts[-1], *it[1:]]]
            split = True
        else:
            flat.append(it)
    lines, line, used = [], [], 0
    for it in flat:
        wl = tw(it[0], size, 800)
        if line and used + space + wl > width:
            lines.append(line)
            line, used = [], 0
        used += (space if line else 0) + wl
        line.append(it)
    if line:
        lines.append(line)
    return lines, space, split


def fit_headline(items, width, height, max_size=None, step=6):
    def fit(allow_split):
        size = max_size or 2.2 * DPI
        while size > 20:
            lines, space, split = wrap(items, size, width)
            lh = size * 1.02
            if cap(size, 800) + lh * (len(lines) - 1) + size * 0.22 <= height and (allow_split or not split):
                return size, lines, space, lh
            size -= step
        raise SystemExit("headline doesn't fit")

    best, whole = fit(True), fit(False)
    return whole if whole[0] >= 0.85 * best[0] else best


def draw_headline(c, x, top, fitted):
    size, lines, space, lh = fitted
    base = top + cap(size, 800)
    for line in lines:
        segs = []
        for n, it in enumerate(line):
            text, color, *tails = it
            head = text[: len(text) - sum(len(t[0]) for t in tails)]
            pieces = [(("" if n == 0 else " ") + head, color)] + [(t, tc) for t, tc in tails]
            for t, tc in pieces:  # merge runs of the same color
                if segs and segs[-1][1] == tc:
                    segs[-1] = (segs[-1][0] + t, tc)
                else:
                    segs.append((t, tc))
        c.line(x, base, segs, size, 800)
        base += lh
    return base - lh + size * 0.22


# ---------- gift card ----------
def gift_card(c, x, y, w, h, card, text, accent, ribbon):
    """A generic $50 gift card in the brand palette: no retailer logo."""
    r = h * 0.08
    c.group("gift-card")
    c.rect(x, y, w, h, card, r)
    band = h * 0.075
    vx = x + w * 0.72
    hy = y + h * 0.3
    c.rect(vx, y, band, h, ribbon)
    c.rect(x, hy, w, band, ribbon)
    # bow: two loops and a knot where the ribbons cross
    kx, ky = vx + band / 2, hy + band / 2
    loop = h * 0.11
    dark = mix(ribbon, card, 0.35)
    c.ellipse(kx - loop * 0.95, ky - loop * 0.15, loop, loop * 0.62, ribbon)
    c.ellipse(kx + loop * 0.95, ky - loop * 0.15, loop, loop * 0.62, ribbon)
    c.ellipse(kx - loop * 0.95, ky - loop * 0.15, loop * 0.45, loop * 0.26, dark)
    c.ellipse(kx + loop * 0.95, ky - loop * 0.15, loop * 0.45, loop * 0.26, dark)
    c.rect(kx - band * 0.75, ky - band * 0.75, band * 1.5, band * 1.5, mix(ribbon, card, 0.15), band * 0.4)
    pad = w * 0.075
    ls = h * 0.075
    c.text(x + pad, y + h * 0.17, "G I F T   C A R D", ls, 750, accent)
    big = h * 0.34
    c.text(x + pad, y + h * 0.75, "$50", big, 800, text)
    c.text(x + pad, y + h * 0.89, "Amazon gift card", h * 0.085, 650, text)
    c.end()


# ---------- one poster ----------
def poster(slug, theme, kicker, headline, sub, qr, with_qr=True):
    bg, txt, accent, quiet, kbg, ktxt, card, ctext, caccent, ribbon, logo_variant = THEMES[theme]
    c = Canvas()
    c.group(f"poster-{slug}")
    c.rect(0, 0, W, H, bg, name=f"artboard-{slug}")
    width = W - 2 * M

    # Header: logo left, tagline right.
    logo_w = 2.6 * DPI
    c.logo(M, M, logo_w, logo_variant)
    logo_h = logo_w * _vb[3] / _vb[2]
    ts = 0.19 * DPI
    for i, line in enumerate(TAGLINE):
        c.text(W - M, M + logo_h * 0.42 + i * ts * 1.35, line, ts, 600, quiet, "end")

    # Header band, full width: "Find a roommate. Win a $50 gift card." and
    # the deadline on the right; the text shrinks to fit the band.
    k_y = M + logo_h + 0.55 * DPI
    k_pad_x = 0.35 * DPI
    ends = "Ends Nov 30"
    ends_s = 0.24 * DPI
    room = width - 2 * k_pad_x - tw(ends, ends_s, 650) - 0.4 * DPI
    ks = 0.5 * DPI
    while tw(kicker, ks, 800) > room:
        ks -= 2
    k_h = max(ks * 2.0, 0.95 * DPI)
    c.group("header-band")
    c.rect(M, k_y, width, k_h, kbg, k_h * 0.22)
    c.text(M + k_pad_x, k_y + k_h / 2 + cap(ks, 800) / 2, kicker, ks, 800, ktxt)
    c.text(W - M - k_pad_x, k_y + k_h / 2 + cap(ends_s, 650) / 2, ends, ends_s, 650, ktxt, "end")
    c.end()

    # Bottom block: QR tile + gift card, a caption row, fine print.
    fine = 0.1 * DPI
    fine_y2 = H - M
    fine_y1 = fine_y2 - fine * 1.6
    cap_s = 0.24 * DPI
    if with_qr:
        caption_y = fine_y1 - 0.45 * DPI
        tile = (width - 0.35 * DPI) / (1 + 1.586)
        row_y = caption_y - cap_s * 2.6 - tile
        c.rect(M, row_y, tile, tile, WHITE, tile * 0.07)
        qs = tile * 0.82
        c.qr(M + (tile - qs) / 2, row_y + (tile - qs) / 2, qs, qr)
        card_x = M + tile + 0.35 * DPI
        gift_card(c, card_x, row_y, width - tile - 0.35 * DPI, tile, card, ctext, caccent, ribbon)
        c.text(M, caption_y - cap_s * 1.3, "Scan to join the waitlist", cap_s, 750, txt)
        c.text(M, caption_y, URL, cap_s * 0.92, 500, quiet)
        c.text(card_x, caption_y - cap_s * 1.3, "Win a $50 Amazon gift card", cap_s, 750, txt)
        c.text(card_x, caption_y, "+ one month free. Ends Nov 30.", cap_s * 0.92, 500, quiet)
    else:
        # No QR code: the URL is the call to action, on a white band, with
        # the gift card and the prize details underneath.
        card_h = 2.55 * DPI
        card_w = card_h * 1.586
        card_y = fine_y1 - 0.5 * DPI - card_h
        gift_card(c, M, card_y, card_w, card_h, card, ctext, caccent, ribbon)
        px_ = M + card_w + 0.4 * DPI
        big, small = 0.42 * DPI, 0.27 * DPI
        py = card_y + card_h * 0.22 + cap(big)
        for line, size_, weight, color in [
            ("Win a $50", big, 800, txt),
            ("Amazon", big, 800, txt),
            ("gift card", big, 800, txt),
        ]:
            c.text(px_, py, line, size_, weight, color)
            py += cap(big) * 1.45
        py += 0.12 * DPI
        for line in ["+ one month free.", "Ends Nov 30."]:
            c.text(px_, py, line, small, 550, quiet)
            py += cap(small) * 1.75
        bar_h = 1.45 * DPI
        row_y = card_y - 0.4 * DPI - bar_h
        c.group("url-band")
        c.rect(M, row_y, width, bar_h, WHITE, bar_h * 0.16)
        pad = 0.45 * DPI
        label_s = 0.27 * DPI
        url_s = 0.8 * DPI
        while tw(URL, url_s, 800) > width - 2 * pad:
            url_s -= 4
        c.text(M + pad, row_y + 0.25 * DPI + cap(label_s), "Join the waitlist at", label_s, 600, "#6E6E76")
        c.text(M + pad, row_y + bar_h - 0.28 * DPI, URL, url_s, 800, INK)
        c.end()
    c.text(M, fine_y1, f"No purchase necessary. Ends Nov 30, 2026. Rules: {URL}/raffle-rules", fine, 500, quiet)
    c.text(M, fine_y2, "Amazon is not a sponsor of this promotion. Image is illustrative.", fine, 500, quiet)

    # Headline fills the space between the kicker and the sub line.
    sub_s = 0.29 * DPI
    head_top = k_y + k_h + 0.5 * DPI
    sub_room = cap(sub_s) * 3.2 + 0.45 * DPI
    head_bottom_limit = row_y - 0.6 * DPI - sub_room
    fitted = fit_headline(headline_items(headline, txt, accent), width, head_bottom_limit - head_top)
    head_bottom = draw_headline(c, M, head_top, fitted)

    sub_lines, _, _ = wrap([[w, quiet] for w in sub.split()], sub_s, width)
    sy = head_bottom + 0.45 * DPI + cap(sub_s)
    for line in sub_lines:
        c.text(M, sy, " ".join(w for w, *_ in line), sub_s, 550, quiet)
        sy += cap(sub_s) * 1.8
    c.end()
    return c, round(fitted[0])


# Every export is tagged sRGB, so viewers and printers don't guess the color
# space (untagged files showed the orange as brown in some viewers).
SRGB = ImageCms.ImageCmsProfile(ImageCms.createProfile("sRGB")).tobytes()


def save_pdf(img, path):
    """One-page PDF with the image in an ICCBased sRGB color space (Pillow's
    PDF writer drops the profile)."""
    nl = b"\n"
    w_pt, h_pt = img.width * 72 / DPI, img.height * 72 / DPI
    raw = zlib.compress(img.convert("RGB").tobytes(), 9)
    icc = zlib.compress(SRGB, 9)
    content = f"q {w_pt:.2f} 0 0 {h_pt:.2f} 0 0 cm /Im0 Do Q".encode()

    def stream(head, data):
        return head.encode() + nl + b"stream" + nl + data + nl + b"endstream"

    objs = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {w_pt:.2f} {h_pt:.2f}] "
        f"/Resources << /XObject << /Im0 4 0 R >> >> /Contents 6 0 R >>".encode(),
        stream(
            f"<< /Type /XObject /Subtype /Image /Width {img.width} /Height {img.height} "
            f"/ColorSpace [/ICCBased 5 0 R] /BitsPerComponent 8 /Filter /FlateDecode "
            f"/Length {len(raw)} >>",
            raw,
        ),
        stream(f"<< /N 3 /Alternate /DeviceRGB /Filter /FlateDecode /Length {len(icc)} >>", icc),
        stream(f"<< /Length {len(content)} >>", content),
    ]
    out = bytearray(b"%PDF-1.4" + nl + b"%\xe2\xe3\xcf\xd3" + nl)
    offsets = []
    for i, body in enumerate(objs, 1):
        offsets.append(len(out))
        out += f"{i} 0 obj".encode() + nl + body + nl + b"endobj" + nl
    xref = len(out)
    out += f"xref\n0 {len(objs) + 1}\n0000000000 65535 f \n".encode()
    out += b"".join(f"{o:010d} 00000 n \n".encode() for o in offsets)
    out += f"trailer\n<< /Size {len(objs) + 1} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF\n".encode()
    open(path, "wb").write(out)


def svg_doc(body, w, h):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="{w / DPI}in" height="{h / DPI}in" '
        f'viewBox="0 0 {w} {h}">\n{body}\n</svg>\n'
    )


# ---------- Instagram story, no QR code ----------
SW, SH = 1080, 1920
# Instagram covers about the top 250 px (profile, progress bar) and the
# bottom ~270 px (reply bar); everything stays between these.
SAFE_TOP, SAFE_BOTTOM = 250, 1650
SM = 72


def story(slug, theme, kicker, headline, sub):
    """Story version: same copy, and a dashed space for the Instagram link
    sticker with an arrow and "Click here" pointing at it."""
    bg, txt, accent, quiet, kbg, ktxt, card, ctext, caccent, ribbon, logo_variant = THEMES[theme]
    c = Canvas()
    c.group(f"story-{slug}")
    c.rect(0, 0, SW, SH, bg, name=f"artboard-story-{slug}")
    width = SW - 2 * SM

    logo_w = 300
    c.logo(SM, SAFE_TOP, logo_w, logo_variant)
    logo_h = logo_w * _vb[3] / _vb[2]
    for i, line in enumerate(TAGLINE):
        c.text(SW - SM, SAFE_TOP + logo_h * 0.42 + i * 30, line, 23, 600, quiet, "end")

    # Header band
    k_y = SAFE_TOP + logo_h + 46
    ends, ends_s, k_pad = "Ends Nov 30", 24, 30
    room = width - 2 * k_pad - tw(ends, ends_s, 650) - 30
    ks = 44
    while tw(kicker, ks, 800) > room:
        ks -= 1
    k_h = 92
    c.group("header-band")
    c.rect(SM, k_y, width, k_h, kbg, 22)
    c.text(SM + k_pad, k_y + k_h / 2 + cap(ks, 800) / 2, kicker, ks, 800, ktxt)
    c.text(SW - SM - k_pad, k_y + k_h / 2 + cap(ends_s, 650) / 2, ends, ends_s, 650, ktxt, "end")
    c.end()

    # Bottom up: fine print, link sticker space + arrow, gift card row.
    fine = 19
    fine2 = SAFE_BOTTOM
    fine1 = fine2 - 28
    c.text(SM, fine1, f"No purchase necessary. Ends Nov 30, 2026. Rules: {URL}/raffle-rules", fine, 500, quiet)
    c.text(SM, fine2, "Amazon is not a sponsor of this promotion. Image is illustrative.", fine, 500, quiet)

    ph_w, ph_h = 600, 150
    ph_y = fine1 - 60 - ph_h
    border = quiet
    c.group("link-sticker")
    c.dashrect(SM, ph_y, ph_w, ph_h, border, 4, 28, 18, 12)
    lbl = "Instagram link sticker here"
    c.text(SM + ph_w / 2, ph_y + ph_h / 2 + cap(26, 600) / 2, lbl, 26, 600, border, "middle")
    c.end()

    # "Click here" above-right, with a hand-drawn arrow into the sticker space.
    cs = 56
    c.group("click-here")
    tx_right = SW - SM
    t_base = ph_y - 36
    c.text(tx_right, t_base, "Click here", cs, 800, accent, "end")
    t_w = tw("Click here", cs, 800)
    start = (tx_right - t_w * 0.55, t_base + 22)
    end_ = (SM + ph_w + 22, ph_y + ph_h * 0.55)
    c1 = (start[0] - 10, start[1] + 110)
    c2 = (end_[0] + 140, end_[1] + 10)
    c.curve(start, c1, c2, end_, accent, 9)
    # arrowhead along the end tangent
    dx, dy = end_[0] - c2[0], end_[1] - c2[1]
    ln = (dx * dx + dy * dy) ** 0.5
    ux, uy = dx / ln, dy / ln
    hl, hw = 34, 20
    tip = (end_[0] + ux * 8, end_[1] + uy * 8)
    base = (tip[0] - ux * hl, tip[1] - uy * hl)
    c.polygon([tip, (base[0] - uy * hw, base[1] + ux * hw), (base[0] + uy * hw, base[1] - ux * hw)], accent)
    c.end()

    # Gift card row
    card_h = 230
    card_w = card_h * 1.586
    card_y = t_base - cap(cs, 800) - 70 - card_h
    gift_card(c, SM, card_y, card_w, card_h, card, ctext, caccent, ribbon)
    px_ = SM + card_w + 36
    big, small = 40, 26
    py = card_y + card_h * 0.2 + cap(big)
    for line in ["Win a $50", "Amazon", "gift card"]:
        c.text(px_, py, line, big, 800, txt)
        py += cap(big) * 1.45
    py += 10
    for line in ["+ one month free.", "Ends Nov 30."]:
        c.text(px_, py, line, small, 550, quiet)
        py += cap(small) * 1.75

    # Headline between the band and the sub line.
    sub_s = 30
    head_top = k_y + k_h + 50
    sub_room = cap(sub_s) * 3.4 + 40
    limit = card_y - 60 - sub_room
    fitted = fit_headline(headline_items(headline, txt, accent), width, limit - head_top, max_size=170, step=2)
    head_bottom = draw_headline(c, SM, head_top, fitted)
    sub_lines, _, _ = wrap([[w, quiet] for w in sub.split()], sub_s, width)
    sy = head_bottom + 40 + cap(sub_s)
    for line in sub_lines:
        c.text(SM, sy, " ".join(w for w, *_ in line), sub_s, 550, quiet)
        sy += cap(sub_s) * 1.8
    c.end()
    return c, round(fitted[0])


qr = json.load(open(f"{ASSETS}/qr.json"))
gap, cols = round(0.5 * DPI), 4
BW = gap + cols * (W + gap)
BH = gap + 2 * (H + gap)
# Print set: 11 x 17 with the QR code.
board = []
for i, spec in enumerate(POSTERS):
    c, size = poster(*spec, qr, with_qr=True)
    name = f"verimate-series-{spec[0]}-qr"
    open(f"{OUT}/{name}.svg", "w", encoding="utf-8").write(svg_doc(svg_of(c), W, H))
    img = pil_of(c)
    img.save(f"{OUT}/{name}.png", dpi=(DPI, DPI), icc_profile=SRGB)
    save_pdf(img, f"{OUT}/{name}.pdf")
    row, col = divmod(i, cols)
    bx = gap + col * (W + gap) + (0 if row == 0 else (W + gap) // 2)
    by = gap + row * (H + gap)
    board.append(f'<g transform="translate({bx} {by})">\n{svg_of(c)}\n</g>')
    print("ok", name, size, "px headline")
open(f"{OUT}/verimate-series-board-qr.svg", "w", encoding="utf-8").write(
    svg_doc(f'<rect width="{BW}" height="{BH}" fill="#BEBEC4"/>\n' + "\n".join(board), BW, BH)
)

# Instagram stories, no QR code: a space for the link sticker instead.
def svg_px(body, w, h):
    return f'<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="{w}" height="{h}" viewBox="0 0 {w} {h}">\n{body}\n</svg>\n'


sgap = 60
SBW, SBH = sgap + cols * (SW + sgap), sgap + 2 * (SH + sgap)
board = []
for i, spec in enumerate(POSTERS):
    c, size = story(*spec)
    name = f"verimate-story-{spec[0]}-noqr"
    open(f"{OUT}/{name}.svg", "w", encoding="utf-8").write(svg_px(svg_of(c), SW, SH))
    pil_of(c, SW, SH).save(f"{OUT}/{name}.png", icc_profile=SRGB)
    row, col = divmod(i, cols)
    bx = sgap + col * (SW + sgap) + (0 if row == 0 else (SW + sgap) // 2)
    by = sgap + row * (SH + sgap)
    board.append(f'<g transform="translate({bx} {by})">\n{svg_of(c)}\n</g>')
    print("ok", name, size, "px headline")
open(f"{OUT}/verimate-story-board-noqr.svg", "w", encoding="utf-8").write(
    svg_px(f'<rect width="{SBW}" height="{SBH}" fill="#BEBEC4"/>\n' + "\n".join(board), SBW, SBH)
)
print("boards done")
