const QRCode = require("qrcode");
const sharp = require(process.argv[2] + "/node_modules/sharp");
const out = process.argv[3];
(async () => {
  // Optional 3rd arg: the URL the QR code opens (default https://verimate.org).
  const url = process.argv[4] || "https://verimate.org";
  await QRCode.toFile(`${out}/qr.png`, url, {
    errorCorrectionLevel: "M",
    margin: 0,
    width: 1000,
    color: { dark: "#111111", light: "#ffffff" },
  });
  const logo = `${process.argv[2]}/docs/brand/final/verimate-logo.svg`;
  await sharp(logo, { density: 1600 })
    .resize({ width: 820 })
    .png()
    .toFile(`${out}/logo.png`);
  console.log("ok");
})();
