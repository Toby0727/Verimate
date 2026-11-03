# Verimate 开发日志

> 每次开发结束后在最上面追加一段：做了什么、线上是什么状态、还有什么没做 / 没决定。
> 约定、架构、规则写在 `AGENTS.md`；这里只记"发生了什么、走到哪了"。

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
- [ ] 安全审查 #2 的结论和修复见下一段（11-03 晚）。

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
