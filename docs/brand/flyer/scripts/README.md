# 宣传单 / 海报生成脚本

生成 `docs/brand/flyer/` 里的宣传单和横版海报。字体 `figtree-latin.ttf` 是 Figtree（SIL Open Font License，可随项目分发），和网站用的是同一套字体。

依赖：Python 3 + Pillow；Node + `qrcode@1.5.4`、`jsqr@1.4.0`、`pptxgenjs@4.0.1`（装在一个临时目录即可），以及仓库里已有的 `sharp`。

```bash
# 在一个临时目录里
npm init -y && npm install --save-exact qrcode@1.5.4 jsqr@1.4.0 pptxgenjs@4.0.1
REPO=~/Desktop/verimate/Verimate; SCRIPTS=$REPO/docs/brand/flyer/scripts
node $SCRIPTS/assets.cjs $REPO .                         # 生成 qr.png（指向 https://verimate.org）和 logo.png
python3 -I $SCRIPTS/flyer.py . $SCRIPTS/figtree-latin.ttf $REPO/docs/brand/flyer/verimate-flyer        # 竖版宣传单 PNG + PDF
python3 -I $SCRIPTS/poster_render.py . $SCRIPTS/figtree-latin.ttf $REPO/docs/brand/final/verimate-logo.png $REPO/docs/brand/flyer/verimate-poster   # 横版海报 PNG + PDF
NODE_PATH=./node_modules node $SCRIPTS/poster_image.js $REPO/docs/brand/flyer/verimate-poster.png $REPO/docs/brand/flyer/verimate-poster.pptx       # 海报整页图放进 PPTX
node $SCRIPTS/scan.cjs $REPO $REPO/docs/brand/flyer/verimate-flyer.png   # 扫码自检
```

海报的 PPTX 故意是整页图片：用户电脑没装 Figtree 时，PowerPoint 会把文字换成别的字体（用户要求不能换字体）。
