# Verimate image generation

How every Verimate graphic is made: the brand rules they share, what each one contains, and how to rebuild it. All of them are drawn by scripts in `docs/brand/flyer/scripts/` (no AI image model). That keeps text sharp, the font exact and the QR code scannable.

## Brand rules (apply to every graphic)

| Thing | Value |
|---|---|
| Font | **Figtree**, the site's font. Never substitute it. The TTF is `docs/brand/flyer/scripts/figtree-latin.ttf` (SIL Open Font License, weights 300–900) |
| Brand (Persimmon, since 2026-11-04) | `#F8672E` for fills, the card and the big orange headline words; `#BF4306` (rust) for small orange text on light backgrounds; `#FDE9DF` light tint for tags |
| Ink | `#111111` for headlines and bold text |
| Muted text | `#6E6E76` |
| Background | `#F4F4F5` (light grey); cards and QR tiles are white `#FFFFFF` |
| Text on orange | Always ink `#111111`. White on `#F8672E` is only 3:1, too faint for small text |
| Logo | `docs/brand/final/verimate-logo.svg` / `.png` (two-stroke orange check mark, no tile, + black "Verimate" wordmark). The mark alone is `verimate-mark.*` |
| Buttons | Black pills; orange is only an accent |
| Style | Editorial and plain: big headline, lots of space, one orange card. No gradients, no stock icons, no illustrations, no "AI look" |

### Copy blocks

- **Slogan:** "Building the most complete **sublet + roommate** matching for off-campus living." ("sublet + roommate" in orange)
- **Prize card** (orange `#F8672E`, black text, rounded, thin ribbon lines and an inner frame like a printed gift card):
  - Label: "SIGN UP TO WIN" (flyer, poster) or "Sign up to find your sublease / roomie and win a" (Instagram story)
  - "$50" big, with the "$" smaller, lighter and top-aligned like a price tag
  - "Amazon gift card"
  - "+ one month free account"
  - "Ends Nov 30"
- **Sign-in line:** "Sign in with your **@g.syr.edu** account for a 5% better chance to win." (`@g.syr.edu` bold)
- **Link:** https://verimateapp.com (QR codes point here; main domain since 2026-11-04, because SU's campus network blocks verimate.org)

## The graphics

| File | Size | Use | Script |
|---|---|---|---|
| `docs/brand/flyer/verimate-flyer.png` / `.pdf` | US Letter portrait, 2550 × 3300 at 300 dpi | Printed flyer with a QR code | `flyer.py` |
| `docs/brand/flyer/verimate-poster.png` / `.pdf` | 17 × 11 in landscape, 5100 × 3300 at 300 dpi | Poster / last slide of a class deck, with a QR code | `poster_render.py` |
| `docs/brand/flyer/verimate-poster.pptx` | 17 × 11 in, one slide | The poster image filling the slide (an image on purpose, so Figtree shows on computers without it) | `poster_image.js` |
| `docs/brand/flyer/verimate-flyer-vercel.*`, `verimate-poster-vercel.*` | Same as above | Same flyer and poster, but the QR code and URL line use **verimate.vercel.app**, because SU's campus network blocks verimate.org (since 2026-11-03). Kept as a backup in case SU's network ever blocks verimateapp.com too | same scripts, with the URL arguments below |
| `docs/brand/flyer/verimate-ig-story.png` | 1080 × 1920 | Instagram story, **no QR code**; add a Link sticker to verimateapp.com over the URL | `story.py` |
| `docs/brand/final/verimate-logo.*`, `verimate-mark.*` | SVG + transparent PNG (2048 wide / 1024 square) | Logo and app icon | traced from the 2026-11-04 logo image; older options in `docs/brand/logo-options/` |

| `docs/brand/flyer/campaign/verimate-poster-{11x17,22x17}-{qr,noqr}.png` / `.pdf` | 11 × 17 in portrait and 22 × 17 in landscape, 300 dpi | Campaign posters with the headline "Enter the most complete **sublet + roommate** matching system and win a $50 gift card.", with or without the QR code (no-QR shows verimateapp.com big) | `poster_sizes.py` (any size; headline is an argument) |

| `docs/brand/flyer/series/verimate-series-<n>-<slug>-qr.svg` / `.png` / `.pdf` and `verimate-series-board-qr.svg` | 11 × 17 in portrait, 300 dpi | The "personal ad" series for Slocum Hall: Gym rat, Night owl, Clean freak, Girl with cat, Lo-fi, "How does signing up and getting $50 sound?", Florence. The no-QR version is an Instagram story set instead (`verimate-story-<n>-<slug>-noqr.png` / `.svg`, 1080 x 1920, board `verimate-story-board-noqr.svg`): content stays between y 250 and 1650, and a dashed space marks where to drop the Instagram link sticker, with a "Click here" arrow pointing at it. Each has a kicker pill ("Find a roommate. Win $50."), the tagline "Building Syracuse's most complete sublet + roommate platform", the QR code and a generic $50 gift card drawn in our palette (no Amazon logo; the fine print says Amazon is not a sponsor). The SVGs are vector and open in Illustrator with live text (install Figtree first); the board puts all seven on one canvas, each in a named group | `series_vector.py` (copy is in its `POSTERS` list) + `logo_variants.cjs` |

| `docs/brand/flyer/series/verimate-all-posters.ai` (same file as `.pdf`) | 62.5 × 92.8 in canvas | Every poster in one Illustrator file: the seven 11 × 17 QR posters on top, the seven 1080 × 1920 pt stories below. Vector throughout (no images), fonts embedded as Figtree-Medium / -SemiBold / -Bold / -ExtraBold so text stays editable once Figtree is installed | `ai_board.py` builds an HTML page from the SVGs with the static fonts in `scripts/fonts-static/`; print it with headless Edge/Chrome `--print-to-pdf`, then copy to `.ai` |

### Layouts

- **Flyer (portrait):** logo top left → slogan in three lines → QR code centred on a white rounded tile with "Scan to join the waitlist" and "verimateapp.com" under it → red prize card full width → sign-in line centred at the bottom.
- **Poster (landscape):** left column is logo, three-line slogan, then the red prize card. Right column is the QR tile, "Scan to join the waitlist", "verimateapp.com", then the two-line sign-in note.
- **Instagram story:** logo → four-line slogan → red prize card (two-line sign-up label) → "Join the waitlist at **verimateapp.com**" → sign-in line. All text stays between y ≈ 250 and y ≈ 1670 so Instagram's top bar and reply box don't cover it.

## Rebuild

```bash
# In any scratch folder
npm init -y && npm install --save-exact qrcode@1.5.4 jsqr@1.4.0 pptxgenjs@4.0.1
REPO=~/Desktop/verimate/Verimate; SCRIPTS=$REPO/docs/brand/flyer/scripts; FONT=$SCRIPTS/figtree-latin.ttf
node $SCRIPTS/assets.cjs $REPO .                 # qr.png (verimateapp.com) + logo.png
python3 -I $SCRIPTS/flyer.py . $FONT $REPO/docs/brand/flyer/verimate-flyer
python3 -I $SCRIPTS/poster_render.py . $FONT $REPO/docs/brand/final/verimate-logo.png $REPO/docs/brand/flyer/verimate-poster
NODE_PATH=./node_modules node $SCRIPTS/poster_image.js $REPO/docs/brand/flyer/verimate-poster.png $REPO/docs/brand/flyer/verimate-poster.pptx
python3 -I $SCRIPTS/story.py . $FONT $REPO/docs/brand/flyer/verimate-ig-story
# Campaign posters: <width in> <height in> <qr|noqr> "<headline>"
python3 -I $SCRIPTS/poster_sizes.py . $FONT $REPO/docs/brand/final/verimate-logo.png $REPO/docs/brand/flyer/campaign/verimate-poster-11x17-qr 11 17 qr "Enter the most complete sublet + roommate matching system and win a \$50 gift card."
node $SCRIPTS/scan.cjs $REPO $REPO/docs/brand/flyer/verimate-flyer.png   # QR self-test

# The -vercel versions: pass the QR link to assets.cjs and the URL line as the last argument
node $SCRIPTS/assets.cjs $REPO . https://verimate.vercel.app/
python3 -I $SCRIPTS/flyer.py . $FONT $REPO/docs/brand/flyer/verimate-flyer-vercel verimate.vercel.app
python3 -I $SCRIPTS/poster_render.py . $FONT $REPO/docs/brand/final/verimate-logo.png $REPO/docs/brand/flyer/verimate-poster-vercel verimate.vercel.app
NODE_PATH=./node_modules node $SCRIPTS/poster_image.js $REPO/docs/brand/flyer/verimate-poster-vercel.png $REPO/docs/brand/flyer/verimate-poster-vercel.pptx verimate.vercel.app
```

Needs Python 3 with Pillow, and Node. `sharp` comes from the repo's own `node_modules` (run `npm install` in the repo first).

### Checks before sharing a new version

1. **QR code:** `scan.cjs` must print the intended link (`https://verimateapp.com`, or `https://verimate.vercel.app/` for the -vercel versions) at full size and at 300 px wide.
2. **Font:** open the PNG and confirm it's Figtree, not a fallback.
3. **Story safe zone:** `story.py` prints "bottom of content"; keep it under ~1670.
4. **Copy:** dates, prize and percentages must match the official rules at https://verimateapp.com/raffle-rules.

## If you use an image model instead

Give it this brief, and still add the QR code and the exact text yourself afterwards. Models garble small text and QR codes.

> Minimal editorial poster on a light grey (#F4F4F5) background. Top left: the provided Verimate logo (an orange #F8672E two-stroke check mark, then "Verimate" in black). Large bold geometric sans-serif headline (Figtree) in near-black #111111: "Building the most complete sublet + roommate matching for off-campus living", with "sublet + roommate" in orange #F8672E. Below, one orange #F8672E rounded card styled like a printed gift card, with thin light ribbon lines and a faint inner border: small label "SIGN UP TO WIN", a large black "$50" with a smaller lighter "$", "Amazon gift card", and "+ one month free account". Lots of white space, no gradients, no icons, no illustrations, no people, flat and clean.
