"""All posters on one vector canvas, for an Illustrator-ready .ai/.pdf.

python3 -I ai_board.py <series dir> <static Figtree fonts dir> <out.html>

Lays the 11 x 17 print posters (QR) on top and the 1080 x 1920 Instagram
stories (no QR) below, at real size in points (72 pt = 1 in; a story is
1080 x 1920 pt, Illustrator's usual story artboard). Writes an HTML page
that embeds Figtree with @font-face, so a headless browser can print it to a
vector PDF with the font embedded. Each poster stays a named group.
"""

import glob
import re
import sys
from pathlib import Path

SERIES, FONT, OUT = sys.argv[1:4]
GAP, LABEL = 36, 90
POSTER = (792, 1224)  # 11 x 17 in
STORY = (1080, 1920)


def inner(path):
    s = Path(path).read_text(encoding="utf-8")
    vb = re.search(r'viewBox="([^"]+)"', s).group(1)
    body = s[s.index(">", s.index("<svg")) + 1 : s.rindex("</svg>")]
    return vb, body


def grid(files, size, top, canvas_w):
    w, h = size
    cols = 4
    out = []
    rows = [files[:cols], files[cols:]]
    for r, row in enumerate(rows):
        row_w = len(row) * w + (len(row) - 1) * GAP
        x = (canvas_w - row_w) / 2
        y = top + r * (h + GAP)
        for f in row:
            vb, body = inner(f)
            name = Path(f).stem
            out.append(
                f'<svg id="{name}" x="{x:.1f}" y="{y:.1f}" width="{w}" height="{h}" viewBox="{vb}" '
                f'xml:space="preserve" overflow="hidden">{body}</svg>'
            )
            x += w + GAP
    return "\n".join(out), top + len(rows) * h + (len(rows) - 1) * GAP


posters = sorted(glob.glob(f"{SERIES}/verimate-series-[0-9]-*-qr.svg"))
stories = sorted(glob.glob(f"{SERIES}/verimate-story-[0-9]-*-noqr.svg"))
assert len(posters) == 7 and len(stories) == 7, (len(posters), len(stories))

canvas_w = GAP + 4 * (STORY[0] + GAP)
y = GAP
label = lambda text, y_: (
    f'<text x="{GAP}" y="{y_ + 54}" font-family="Figtree, sans-serif" font-size="48" '
    f'font-weight="700" fill="#3A3A40">{text}</text>'
)
parts = [label("Print posters · 11 × 17 in · with QR code", y)]
y += LABEL
g, y = grid(posters, POSTER, y, canvas_w)
parts.append(g)
y += GAP * 2
parts.append(label("Instagram stories · 1080 × 1920 · link sticker, no QR code", y))
y += LABEL
g, y = grid(stories, STORY, y, canvas_w)
parts.append(g)
canvas_h = y + GAP

# FONT is a folder with static Figtree-Medium/-SemiBold/-Bold/-ExtraBold.ttf.
# Static weights (not the variable font) make the browser embed real
# TrueType fonts named Figtree-*, which Illustrator maps to an installed
# Figtree, so the text stays editable; the variable font would be embedded
# as Type 3 glyph drawings instead.
faces = "\n".join(
    f'@font-face {{ font-family: "Figtree"; src: url("{(Path(FONT) / f"Figtree-{name}.ttf").resolve().as_uri()}") '
    f'format("truetype"); font-weight: {lo} {hi}; }}'
    for name, lo, hi in [("Medium", 300, 549), ("SemiBold", 550, 649), ("Bold", 650, 749), ("ExtraBold", 750, 900)]
)
html = f"""<!doctype html>
<html><head><meta charset="utf-8">
<style>
{faces}
@page {{ size: {canvas_w}pt {canvas_h:.0f}pt; margin: 0; }}
html, body {{ margin: 0; padding: 0; }}
* {{ -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
svg {{ display: block; }}
/* xml:space is ignored in HTML; keep letter-spaced labels like 'G I F T' */
svg text {{ white-space: pre; }}
</style></head><body>
<svg xmlns="http://www.w3.org/2000/svg" width="{canvas_w}pt" height="{canvas_h:.0f}pt" viewBox="0 0 {canvas_w} {canvas_h:.0f}">
<rect width="{canvas_w}" height="{canvas_h:.0f}" fill="#E4E4E8"/>
{chr(10).join(parts)}
</svg></body></html>
"""
Path(OUT).write_text(html, encoding="utf-8")
print("canvas", canvas_w, "x", round(canvas_h), "pt =", round(canvas_w / 72, 1), "x", round(canvas_h / 72, 1), "in")
