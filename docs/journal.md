# Verimate 开发日志

> 每次开发结束后在最上面追加一段：做了什么、线上是什么状态、还有什么没做 / 没决定。
> 约定、架构、规则写在 `AGENTS.md`；这里只记"发生了什么、走到哪了"。

> 这个仓库是**公开的**：这里不写学生姓名 / 邮箱等个人信息，也不写还没修好的安全问题细节（细节在本地和 Supabase 后台）。

---

## 2026-11-03 夜：学校网打不开 verimate.org，换用 vercel.app 二维码

### 发生了什么
- 在 SU 校园网（Wi-Fi / 有线）下打不开 verimate.org，用手机流量可以。**网站本身没问题**：公共 DNS（8.8.8.8、1.1.1.1）都能解析到 Vercel，直接连 Vercel 返回 200。
- 问题出在学校的 DNS（`ns3.syr.edu`）：它对 `verimate.org` 和 `www.verimate.org` 回答"域名不存在"，而且这个回答是学校自己的服务器（`ns1.syr.edu`）签发的，不是 .org 注册局，说明是学校故意拦截。推测原因是域名刚注册（11 月初），被当成新域名过滤了（没有得到 ITS 确认）。
- 影响：在校园网下扫宣传单 / 海报二维码的学生都会打不开。`https://verimate.vercel.app` 在校园网下能正常打开。

### 做了什么
- 新做了一套宣传单和海报，二维码和下面那行网址都改成 `verimate.vercel.app`：`docs/brand/flyer/verimate-flyer-vercel.*`、`verimate-poster-vercel.*`。原来的 `verimate.org` 版本不动，学校放行后换回去用。三个尺寸（原图 / 600px / 300px）都扫码测过。
- 生成脚本（`assets.cjs`、`flyer.py`、`poster_render.py`、`poster_image.js`）改成可以传网址参数，不传时默认还是 `verimate.org`。命令见 `docs/brand/IMAGE_GENERATION.md`。

### 你需要做 / 决定的
- [ ] 给 SU ITS（help@syr.edu）发邮件，申请放行 `verimate.org` 和 `www.verimate.org`（草稿已写好，由你自己发）。
- [ ] 已经贴出去的旧宣传单在校园网下打不开，考虑换成 -vercel 版本。
- [ ] 学校放行后，确认校园网能打开，再换回 `verimate.org` 版本。

---

## 2026-11-03 晚：Instagram story、安全审查 #2

### 做了什么
- **Instagram story 图** `docs/brand/flyer/verimate-ig-story.png`：1080×1920，没有二维码。红卡上写 "Sign up to find your sublease / roomie and win a $50 Amazon gift card + one month free account"。发的时候在 verimate.org 那行上面加一个 Link sticker。
- **图片生成说明** `docs/brand/IMAGE_GENERATION.md`：品牌规则、每张图的版式、重新生成的命令、自检清单。
- **英文版今日工作记录** `docs/worklog/2026-11-03.md`。
- **报名**：截至 11-03 17:31，3 人答完问卷进入抽奖（都是学校账号），2 个账号只登录没答。名单在 Supabase → Table Editor → `waitlist_responses`。
- **安全审查 #2**：没有严重问题，任何人都读不到别人的数据。
  - **已上线（只改代码）**：
    - 生产环境的会话 cookie 加 `Secure`
    - 加 `Permissions-Policy`
    - 留学数据格式异常时页面不会崩溃
    - 邀请链接里的码保存后会清掉
    - 失效的邀请码会自动去掉
    - 隐私政策和抽奖规则的措辞已更正
  - **数据库加固（v5）**：已写好并在本地测过，**还没在线上跑**，文件是 `supabase/migrations/20261104020000_waitlist_security_review_2.sql`。内容包括：
    - 学校账号的认定更严格
    - 抽奖截止后锁定邀请码
    - 数据检查更严格
    - 以后新建的表默认不对外开放
  - **配套前端改动**在分支 `001-clickable-flow-demo` 上，还没进 `main`。**顺序：先在 SQL Editor 跑 v5，再把分支推到 `main`。**

### 你需要做 / 决定的
- [ ] 在 SQL Editor 跑 v5，然后让 Claude 把分支推到 `main`。
- [ ] Supabase → Authentication → URL Configuration：确认 Redirect URLs 只有我们自己的地址，没有宽泛的通配符。
- [ ] 开奖前按本地的开奖流程核对：账号去重、照片和邀请只算截止前的。
- [ ] 删除用户时，Storage 里的照片要一起删掉。

---

## 2026-11-02 ~ 11-03：Google 登录 + 等候名单问卷上线

### 现在线上是什么状态（11-03 晚）

- **网站**：https://www.verimate.org（`verimate.org` 会 308 跳到 `www`）。首页就是等候名单问卷，demo 在生产环境隐藏。Vercel 从 `main` 自动部署；工作分支 `001-clickable-flow-demo` 和 `main` 内容一致（每次都是 `git push origin HEAD:main`，PR #3 也因此算已合并）。
- **Supabase**（项目 ref `cuwenjxpuiirncxwbmyc`）：
  - 4 个迁移**都已在线上跑过**，按顺序：`20261103070000_waitlist_responses` → `20261103210000_waitlist_more_questions` → `20261104000000_waitlist_abroad_and_years` → `20261104010000_waitlist_personal_accounts`。
  - Authentication：Google 开、**Email 关**（防止别人用学生邮箱乱注册 / 刷邮件）。
  - URL Configuration：Site URL `https://www.verimate.org`；Redirect URLs `https://www.verimate.org/**`、`https://verimate.vercel.app/**`、`http://localhost:3000/**`。
- **Vercel 环境变量**（Production，类型 Config）：`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`。**不要**设 `DEMO_ENABLED`、`SECRET_KEY`。
- **Google Cloud**：OAuth client `674808297939-…`，Google Auth Platform → Audience 已 **Publish（In production）**；Branding 填了 app 名、支持邮箱、主页、隐私政策 `https://www.verimate.org/privacy`。**没上传 logo**（上传会触发好几天的品牌审核）。
- **报名情况**（11-03 17:31）：3 人答完问卷进入抽奖（都是 @g.syr.edu），另有 2 个个人 Gmail 只登录没答。
- **Claude 的数据库令牌**：Supabase 受限令牌 `claude-verimate-db`（只有 Verimate 项目的 Database 读写，**7 天后自动失效，约 11-10**），存在这台 Mac 的 Supabase CLI 里。想提前收回：https://supabase.com/dashboard/account/tokens 删掉。注意：Claude Code 的安全检查不让 Claude 直接对线上库执行写操作，改表结构仍需要你在 SQL Editor 手动跑。

### 做了什么（按时间）

**11-02 夜 ~ 11-03 凌晨：真实 Google 登录**
- 接入 Supabase Google OAuth（PKCE），学校 Google 账号登录即视为学生已验证；手机号 / 邮箱登录按钮先隐藏。
- 在 Google Cloud 建 OAuth client、在 Supabase 配好 provider 和回调地址；买了 verimate.org（Vercel）。

**11-03 上午：等候名单问卷（首页）**
- 6 步问卷 + $50 Amazon 礼品卡抽奖（11-30 截止，`/raffle-rules`），每答一步就存到 `public.waitlist_responses`（RLS：每人只能读写自己那一行）。
- 第 3 步"想住哪"做成地图选区。
- 第 1 步加名字和可选照片，照片多一次抽奖机会。
- **安全审查 #1** 后的修复：`completed_at` 等时间由数据库触发器决定（防倒填 / 截止后报名）；照片只能存一张、只能本人读写；CSP / nosniff / Referrer-Policy；proxy 不再按扩展名放行（`/roommates/a.png` 曾能绕过 demo 拦截）。
- 爬了 Syracuse 公寓和户型数据（`docs/research/`）做"区域房源列表"——**用户发现价格不准（如 The Standard 3 室实际约 $1,300），列表已关闭**（`LISTINGS_ENABLED = false`）。

**11-03 下午：品牌**
- 全站主色从绿色改成 Crimson `#B8283A`，按钮保持黑色。
- 选定 logo **08a Bold V**（红色方块 + 白色粗体 V）。所有候选、竞品调研、预览页在 `docs/brand/logo-options/`；定稿文件在 `docs/brand/final/`（SVG + 透明 PNG）；网站顶栏和浏览器标签图标已换。
- 发布真实隐私政策 `/privacy`（联系邮箱 hpang05@syr.edu）。

**11-03 下午 ~ 傍晚：问卷迭代**
- 第 1 步：性别；年级加 5th year、Grad 1st–3rd year、PhD；可选邀请码。
- 第 2 步：预算可多选。
- 地图换成 MapLibre + OpenFreeMap 白色底图，隐藏所有街道文字。
- 第 4 步 study abroad：竖列，标月份和时长；可选多个学期，每个学期选一个目的地（SU 的 LA / NYC / DC、SU Abroad 五个中心、合作项目城市、Semester at sea，来源 suabroad.syr.edu）。
- 第 5 步：学期 × 需求的表格；第 4 步选的目的地会显示在对应学期，并自动勾上"Sublet my place"。
- 第 6 步：加 Greek life、宠物，每题配图标（Hinge 风格）。
- 完成页：头像、名字、年级 · 专业、认证标签；不再显示邮箱；撒彩纸。
- 首页：标语 "Building the most complete sublet + roommate matching for off-campus living."，承诺加入 waitlist 首月免费；礼品卡按秒倒计时、扫光、抖动；排版改成标题 + 登录按钮在第一屏，下面礼品卡和 01/02/03 福利。
- **邀请码**：每人一个 6 位码，完成页可复制 / 分享 `verimate.org/?ref=CODE`；朋友用学校账号答完，你 +10%。
- **个人 Google 账号也能参加**；文案只推荐 `@g.syr.edu`（ESF 学生通过 SU NetID 也有）；学校账号 +5% 中奖概率。中奖权重 = 条目（答完 1 + 照片 1）×（1 + 5% 学校账号 + 10% × 邀请人数）。
- 照片上传前可以拖动 / 缩放裁剪（圆形取景，只上传 640×640）。

**11-03 傍晚：物料**
- 竖版宣传单（Letter，PNG + PDF）和横版海报（17×11，PPTX + PNG + PDF），都在 `docs/brand/flyer/`；生成脚本和字体在 `docs/brand/flyer/scripts/`（见那里的 README）。二维码都扫测过，指向 https://verimate.org。
- 给 Tyler 写了邮件草稿，请他把海报放到当天课件最后一页（邮件由你自己发）。

### 还没做 / 还没决定

- [ ] **大麻那道题**要不要保留（安全审查提醒：对未满 21 岁是自报违法，数据泄露风险最大）。目前保留。
- [ ] **邀请加成没有上限**（邀请 50 人 = 6 倍），要不要设上限。
- [ ] **"首月免费"是对用户的承诺**，上线后要兑现；宣传单写的 "+ one month free account" 读起来像只有中奖才有，可考虑改成 "for everyone"。
- [ ] 房源列表的价格要人工核对后才能重新打开（`lib/waitlist/listings.ts` 的 `LISTINGS_ENABLED`）。
- [ ] 真机测一遍：手机上照片裁剪的手指拖动 / 双指缩放；第 4 步多学期目的地；完成页邀请码。
- [ ] 海报目前是 17×11（约 3:2）；放进 16:9 课件会有白边，需要的话再出一个 16:9 版本。
- [ ] Google client secret 曾在聊天里出现过，正式推广前建议在 Google Cloud 轮换，再更新到 Supabase 的 Google provider。
- [x] 安全审查 #2：见上面 "11-03 晚" 一段。

### 在另一台设备上继续

```bash
git clone https://github.com/Toby0727/Verimate.git   # 或 git pull
cd Verimate && git checkout main && npm install
cp .env.example .env    # 填 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
npm run dev             # http://localhost:3000
```

- `.env` 不在仓库里。两个值都是公开的：URL 是 `https://cuwenjxpuiirncxwbmyc.supabase.co`，publishable key 在 Supabase → Project Settings → API Keys（`sb_publishable_…`）。
- 本地预览（只在 `npm run dev` 下有效，不连数据库）：`/?preview` 已登录的学校账号、`/?preview=personal` 个人账号、`/?preview=landing` 未登录首页。
- 看报名数据：Supabase → Table Editor → `waitlist_responses`（可导出 CSV；导出的文件别长期放在个人电脑上）。
- 改表结构：新写一个 `supabase/migrations/<时间戳>_<名字>.sql`，**先在 SQL Editor 跑，再推代码**，否则读写新列会报错。
