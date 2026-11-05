// Logo PNGs for each poster background, from docs/brand/final/verimate-logo.svg:
//   logo-light.png   orange mark + black wordmark (light grey background)
//   logo-orange.png  black mark + black wordmark (orange background)
//   logo-ink.png     orange mark + white wordmark (black background)
// node logo_variants.cjs <repo> <out dir>
const fs = require("node:fs");
const sharp = require(`${process.argv[2]}/node_modules/sharp`);
const out = process.argv[3];
const svg = fs.readFileSync(
  `${process.argv[2]}/docs/brand/final/verimate-logo.svg`,
  "utf8",
);
const variants = {
  "logo-light": svg,
  "logo-orange": svg.replace('fill="#F8672E"', 'fill="#111111"'),
  "logo-ink": svg.replace('fill="#111111"', 'fill="#FFFFFF"'),
};
(async () => {
  for (const [name, s] of Object.entries(variants)) {
    await sharp(Buffer.from(s), { density: 1200 })
      .resize({ width: 2048 })
      .png()
      .toFile(`${out}/${name}.png`);
  }
  console.log("ok");
})();
