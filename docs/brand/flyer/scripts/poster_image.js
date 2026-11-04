// The poster as one full-slide image, so Figtree shows on any computer.
const pptxgen = require("pptxgenjs");
const [, , IMAGE, OUT, URL = "verimateapp.com"] = process.argv;
(async () => {
  const pres = new pptxgen();
  pres.defineLayout({ name: "TABLOID_LANDSCAPE", width: 17, height: 11 });
  pres.layout = "TABLOID_LANDSCAPE";
  pres.title = "Verimate waitlist poster";
  pres.addSection({ title: "Poster" });
  const s = pres.addSlide({ sectionTitle: "Poster" });
  s.background = { color: "F4F4F5" };
  s.addImage({
    path: IMAGE,
    x: 0,
    y: 0,
    w: 17,
    h: 11,
    objectName: "Poster",
    altText: `Verimate waitlist poster: Building the most complete sublet + roommate matching for off-campus living. Sign up to win a $50 Amazon gift card plus one month free. Scan the QR code or visit ${URL}; sign in with your @g.syr.edu account for a 5% better chance to win.`,
  });
  await pres.writeFile({ fileName: OUT });
  console.log("wrote", OUT);
})();
