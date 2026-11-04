# Verimate image generation

How every Verimate graphic is made: the brand rules they share, what each one contains, and how to rebuild it. All of them are drawn by scripts in `docs/brand/flyer/scripts/` (no AI image model). That keeps text sharp, the font exact and the QR code scannable.

## Brand rules (apply to every graphic)

| Thing | Value |
|---|---|
| Font | **Figtree**, the site's font. Never substitute it. The TTF is `docs/brand/flyer/scripts/figtree-latin.ttf` (SIL Open Font License, weights 300–900) |
| Brand red (Crimson) | `#B8283A` for fills and the card; `#A1202F` for red text on light backgrounds |
| Ink | `#111111` for headlines and bold text |
| Muted text | `#6E6E76` |
| Background | `#F4F4F5` (light grey); cards and QR tiles are white `#FFFFFF` |
| Pink on red | `#FAE1E5` for small text on the red card |
| Logo | `docs/brand/final/verimate-logo.svg` / `.png` (Bold V in a crimson tile + "Verimate" wordmark). The square mark alone is `verimate-mark.*` |
| Buttons | Black pills; red is only an accent |
| Style | Editorial and plain: big headline, lots of space, one red card. No gradients, no stock icons, no illustrations, no "AI look" |

### Copy blocks

- **Slogan:** "Building the most complete **sublet + roommate** matching for off-campus living." ("sublet + roommate" in red)
- **Prize card** (red, rounded, thin ribbon lines and an inner frame like a printed gift card):
  - Label: "SIGN UP TO WIN" (flyer, poster) or "Sign up to find your sublease / roomie and win a" (Instagram story)
  - "$50" big, with the "$" smaller, lighter and top-aligned like a price tag
  - "Amazon gift card"
  - "+ one month free account"
  - "Ends Nov 30"
- **Sign-in line:** "Sign in with your **@g.syr.edu** account for a 5% better chance to win." (`@g.syr.edu` bold)
- **Link:** https://verimate.org (QR codes point here)

## The graphics

| File | Size | Use | Script |
|---|---|---|---|
| `docs/brand/flyer/verimate-flyer.png` / `.pdf` | US Letter portrait, 2550 × 3300 at 300 dpi | Printed flyer with a QR code | `flyer.py` |
| `docs/brand/flyer/verimate-poster.png` / `.pdf` | 17 × 11 in landscape, 5100 × 3300 at 300 dpi | Poster / last slide of a class deck, with a QR code | `poster_render.py` |
| `docs/brand/flyer/verimate-poster.pptx` | 17 × 11 in, one slide | The poster image filling the slide (an image on purpose, so Figtree shows on computers without it) | `poster_image.js` |
| `docs/brand/flyer/verimate-flyer-vercel.*`, `verimate-poster-vercel.*` | Same as above | Same flyer and poster, but the QR code and URL line use **verimate.vercel.app**, because SU's campus network blocks verimate.org (since 2026-11-03). Use these on campus until SU unblocks the domain | same scripts, with the URL arguments below |
| `docs/brand/flyer/verimate-ig-story.png` | 1080 × 1920 | Instagram story, **no QR code**; add a Link sticker to verimate.org over the URL | `story.py` |
| `docs/brand/final/verimate-logo.*`, `verimate-mark.*` | SVG + transparent PNG (2048 wide / 1024 square) | Logo and app icon | from `docs/brand/logo-options/` (08a Bold V) |

### Layouts

- **Flyer (portrait):** logo top left → slogan in three lines → QR code centred on a white rounded tile with "Scan to join the waitlist" and "verimate.org" under it → red prize card full width → sign-in line centred at the bottom.
- **Poster (landscape):** left column is logo, three-line slogan, then the red prize card. Right column is the QR tile, "Scan to join the waitlist", "verimate.org", then the two-line sign-in note.
- **Instagram story:** logo → four-line slogan → red prize card (two-line sign-up label) → "Join the waitlist at **verimate.org**" → sign-in line. All text stays between y ≈ 250 and y ≈ 1670 so Instagram's top bar and reply box don't cover it.

## Rebuild

```bash
# In any scratch folder
npm init -y && npm install --save-exact qrcode@1.5.4 jsqr@1.4.0 pptxgenjs@4.0.1
REPO=~/Desktop/verimate/Verimate; SCRIPTS=$REPO/docs/brand/flyer/scripts; FONT=$SCRIPTS/figtree-latin.ttf
node $SCRIPTS/assets.cjs $REPO .                 # qr.png (verimate.org) + logo.png
python3 -I $SCRIPTS/flyer.py . $FONT $REPO/docs/brand/flyer/verimate-flyer
python3 -I $SCRIPTS/poster_render.py . $FONT $REPO/docs/brand/final/verimate-logo.png $REPO/docs/brand/flyer/verimate-poster
NODE_PATH=./node_modules node $SCRIPTS/poster_image.js $REPO/docs/brand/flyer/verimate-poster.png $REPO/docs/brand/flyer/verimate-poster.pptx
python3 -I $SCRIPTS/story.py . $FONT $REPO/docs/brand/flyer/verimate-ig-story
node $SCRIPTS/scan.cjs $REPO $REPO/docs/brand/flyer/verimate-flyer.png   # QR self-test

# The -vercel versions: pass the QR link to assets.cjs and the URL line as the last argument
node $SCRIPTS/assets.cjs $REPO . https://verimate.vercel.app/
python3 -I $SCRIPTS/flyer.py . $FONT $REPO/docs/brand/flyer/verimate-flyer-vercel verimate.vercel.app
python3 -I $SCRIPTS/poster_render.py . $FONT $REPO/docs/brand/final/verimate-logo.png $REPO/docs/brand/flyer/verimate-poster-vercel verimate.vercel.app
NODE_PATH=./node_modules node $SCRIPTS/poster_image.js $REPO/docs/brand/flyer/verimate-poster-vercel.png $REPO/docs/brand/flyer/verimate-poster-vercel.pptx verimate.vercel.app
```

Needs Python 3 with Pillow, and Node. `sharp` comes from the repo's own `node_modules` (run `npm install` in the repo first).

### Checks before sharing a new version

1. **QR code:** `scan.cjs` must print the intended link (`https://verimate.org`, or `https://verimate.vercel.app/` for the -vercel versions) at full size and at 300 px wide.
2. **Font:** open the PNG and confirm it's Figtree, not a fallback.
3. **Story safe zone:** `story.py` prints "bottom of content"; keep it under ~1670.
4. **Copy:** dates, prize and percentages must match the official rules at https://www.verimate.org/raffle-rules.

## If you use an image model instead

Give it this brief, and still add the QR code and the exact text yourself afterwards. Models garble small text and QR codes.

> Minimal editorial poster on a light grey (#F4F4F5) background. Top left: the provided Verimate logo (crimson rounded square with a white bold V, then "Verimate" in black). Large bold geometric sans-serif headline (Figtree) in near-black #111111: "Building the most complete sublet + roommate matching for off-campus living", with "sublet + roommate" in crimson #B8283A. Below, one crimson rounded card styled like a printed gift card, with thin light ribbon lines and a faint inner border: small label "SIGN UP TO WIN", a large white "$50" with a smaller lighter "$", "Amazon gift card", and "+ one month free account". Lots of white space, no gradients, no icons, no illustrations, no people, flat and clean.
