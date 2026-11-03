const sharp = require(process.argv[2] + "/node_modules/sharp");
const jsQR = require("jsqr");
(async () => {
  for (const width of [2550, 600, 300]) {
    const { data, info } = await sharp(process.argv[3]).resize({ width }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const code = jsQR(new Uint8ClampedArray(data), info.width, info.height);
    console.log(`scan at ${width}px wide:`, code ? code.data : "NOT FOUND");
  }
})();
