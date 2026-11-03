<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Verimate

> 本文件是后续开发的文档起点。**每次开发推进（新增依赖、目录、约定、决策）都必须同步更新本文件**，保持与代码一致。
>
> 开发原则、MVP 边界与质量门禁见 [项目宪章](.specify/memory/constitution.md)（英文正式版，[中文译本](.specify/memory/constitution.zh-CN.md)），与本文件冲突时以宪章为准。

## 项目速览

面向 Syracuse University / SUNY ESF 的已验证学生找室友平台（找室友为主线，转租资讯为辅）。当前是全流程可点通的示例 demo：所有页面和流程都能走通，但数据全是示例，只存在浏览器 `localStorage` 里；已接入 Supabase（目前只有等候名单问卷一张表），真实功能后续逐条替换（见 `lib/demo/flow-status.ts`）。

### 等候名单问卷（线上首页，2026-11-03 上线）

verimate.org 首页 `/` 是真实的等候名单问卷，不是 demo：学生用 SU / ESF 学校 Google 账号登录，答 6 步问题（名字、性别、可选照片、年级和专业；预算可多选；地图选区域；study abroad 竖列并标月份；转租和找室友的学期表格；喝酒 / 抽烟 / 大麻 / Greek life / 宠物，每题带图标），全部答完即加入 waitlist 并参加 $50 Amazon 礼品卡抽奖（2026-11-30 截止，规则页 `/raffle-rules`）。

- 页面：`components/waitlist/waitlist-page.tsx`；步骤和完成判断是纯函数 `lib/rules/waitlist.ts`；选项和抽奖日期在 `lib/waitlist/options.ts`（改选项必须同步改数据库 check 约束）；读写在 `lib/waitlist/api.ts`。
- 数据：`public.waitlist_responses`（迁移文件按顺序在 SQL Editor 手动执行：`20261103070000_waitlist_responses.sql`，再 `20261103210000_waitlist_more_questions.sql` 加性别 / Greek life / 宠物并把预算改成数组；**先跑 SQL 再部署代码**，否则读写新列会报错），每个学生一行，每答一步保存一次，`completed_at` 不为空即抽奖资格。浏览器直接读写，RLS 只允许读写自己的行，且 email 必须等于登录 token 里的 email；check 约束只接受 `syr.edu` / `g.syr.edu` / `esf.edu`。团队在 Supabase Table Editor 查看和导出数据。
- "想住哪"一步是地图选区（`components/waitlist/area-map.tsx`，MapLibre GL `6.14.0` 精确锁定）：底图是 OpenFreeMap 的白色 positron 样式（免费、无需 key、可商用），加载后隐藏所有文字图层，只显示我们自己的区域名；SU / ESF 校区标红，点区域即选中，下方选项同步。MapLibre 的 worker 从 `public/vendor/maplibre-gl-worker-<版本>.mjs` 加载（升级 maplibre-gl 时要同步复制新文件并改 `WORKER_URL`）；CSP 已放行 `tiles.openfreemap.org` 和 `worker-src blob:`。区域和校区轮廓在 `lib/waitlist/map-shapes.ts`：SU 主校区和 South Campus 取自 OSM，ESF 和其他区域是手画的大致范围，不是官方边界。
- 照片（2026-11-03 决定）：第一步可选上传本人照片，上传即多一次抽奖机会（最多 2 次，`raffleEntries()`），规则页已写明。浏览器先重画成最长边 1280px 的 JPEG（去掉 EXIF 里的 GPS 位置）再上传到私有 bucket `waitlist-photos`，每人固定一个文件 `<user_id>/photo.jpg`；只有学校邮箱且已有问卷行的账号能上传，只能读写删自己的；前端用 1 小时有效的签名链接显示。抽奖时只有 storage 里真有这张照片才算加的那次。名字默认取 Google 账号姓名。
- 服务端说了算的字段：`created_at`、`updated_at`、`completed_at` 由触发器 `set_waitlist_server_fields()` 写，浏览器传什么都不算；`completed_at` 在全部答完时盖章，之后不变，2026-11-30 23:59（美东）后不再盖章（日期与 `RAFFLE` 同步）。`saveWaitlist()` 保存后读回 `completed_at`。名字和专业不能以 `= + - @` 开头（防导出 CSV 时被表格当公式执行）。
- 房源列表：选完区域后，地图下方列出这些区的公寓户型（月租、租期、总价、卧室、卫生间、面积），规则在 `lib/rules/listings.ts`，数据在 `lib/waitlist/listings.ts`，来源和调研笔记在 `docs/research/`。**目前关闭**（`LISTINGS_ENABLED = false`）：用户发现不少价格不对（如 The Standard 3 室实际约 $1,300），人工核对后再打开。
- 隐私政策 `/privacy`（2026-11-03 起是真实页面，不再是 demo 草稿）：也是 Google OAuth 同意屏幕上填的隐私政策链接，首页页脚有链接。改了收集的数据（`lib/waitlist/api.ts`）要同步改这页。公开联系邮箱是 `CONTACT_EMAIL`（`lib/waitlist/options.ts`）。承诺：删除请求 30 天内处理；没上线的话抽奖后 12 个月内删除。
- 个人 Gmail 登录会提示换学校账号；登录失败回到 `/?signin=failed`。
- demo 默认隐藏：`proxy.ts` 把 `/`、`/raffle-rules`、`/privacy`、`/auth/callback` 以外的路径都跳回首页；本地或路演要看 demo 时在 `.env` 设 `DEMO_ENABLED=true`，demo 首页在 `/demo`。`DemoBanner` 在问卷页面不显示。

- `docs/product-requirements.md`：产品需求定稿（2026-10-27 访谈），写规格前先读
- `specs/`：spec-kit 生成的功能规格，每个功能一个编号目录（当前：`001-clickable-flow-demo`，全流程可点通的示例 demo）
- `app/`：App Router 页面与布局
- `components/ui/`：shadcn/ui 组件（通过 CLI 添加，可直接修改）
- `components/<功能区>/`：按功能区划分的页面组件（`roommates/`、`sublets/`、`messages/`、`for-you/`、`membership/`、`me/`、`admin/` 等）；`components/shell/` 放标签栏、访问拦截、通用标签文案；`components/demo/` 放示例横幅、演示面板、`SampleBadge`
- `lib/`：工具函数（`cn` 等）
- `lib/rules/`：业务规则纯函数（验证、资料完整度、消息请求、防骗检测、可见性、转租、匹配、会员），每个文件配同名 `*.test.ts`。时间一律通过 `now` 参数传入。替换为真实功能时在服务端复用
- `lib/demo/`：**示例层**（种子数据、`localStorage` store、`useDemo()`、操作 `actions.ts`、示例身份、流程状态表），替换为真实功能时删除对应部分
- `lib/supabase/`：Supabase client（`client.ts` 浏览器端、`server.ts` 服务端、`env.ts` 环境变量校验）
- `public/sample/`：示例头像和房间照片（从 `legacy/img/` 复制，来源疑似 Unsplash 未核实，正式上线前需确认授权）
- `legacy/`：旧版静态路演 demo（纯 HTML，冻结，仅作参考，不参与构建和 lint；视觉风格不再参考它）
- `.specify/`、`.claude/skills/speckit-*`：spec-kit 规格驱动开发（`/speckit-specify` → `plan` → `tasks` → `implement`）
- `.claude/skills/supabase*`、`skills-lock.json`：Supabase 官方 agent skill（`npx skills add supabase/agent-skills` 安装，`npx skills update` 更新）

## 技术栈

- Next.js 16（App Router、Turbopack、Cache Components）+ React 19 + TypeScript
- Tailwind CSS v4 + shadcn/ui（`base-nova` 预设，Base UI）+ lucide-react 图标
- 视觉：字体用 Figtree（界面）+ Newsreader（资料问答卡，`font-serif`），颜色等 token 在 `app/globals.css`；风格由产品负责人决定，见 `docs/product-requirements.md`"形式与页面 → 视觉风格"，不沿用 `legacy/`
- Supabase（`@supabase/supabase-js` + `@supabase/ssr`，精确锁定版本）
- Biome（格式化 + lint，替代 ESLint/Prettier）
- Vitest：只测 `lib/rules/` 下的纯函数（`node` 环境，用 Vite 原生的 `resolve.tsconfigPaths` 解析 `@/`），页面交互靠浏览器冒烟测试
- Vercel 部署（Toby 的 Hobby 团队）：Framework Preset 为 Next.js；`vercel.json` 中的 `"framework": "nextjs"` 与之一致，作为兜底保留（会覆盖后台设置，防止后台被误改导致构建去找 `public` 目录而失败）。PR 预览部署已关闭 Vercel Authentication，非团队成员也能打开
- husky + lint-staged：提交前对暂存文件执行 `biome check --write`（格式化 + 安全修复），再全量 `tsc` 类型检查
- npm

## 常用命令

```bash
npm run dev        # 开发服务器 http://localhost:3000
npm run lint       # biome check
npm run typecheck  # next typegen && tsc --noEmit
npm test           # vitest run（lib/rules 单元测试）
npm run build
npx shadcn@latest add <component>
npx supabase login                                        # Supabase CLI 登录（一次即可）
npx supabase db query --linked --project-ref <ref> "<sql>" # 直接对远程数据库执行 SQL
```

## Supabase

- 项目 ref：`cuwenjxpuiirncxwbmyc`（URL `https://cuwenjxpuiirncxwbmyc.supabase.co`），Postgres 17。
- 环境变量（模板见 `.env.example`，本地值在 `.env`，已被 git 忽略）：
  - `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`：可公开，会打包进浏览器端。
  - `SECRET_KEY`：Supabase secret key（`sb_secret_...`），绕过 RLS，**只能在服务端使用，绝不能加 `NEXT_PUBLIC_` 前缀**，需在控制台 Project Settings → API Keys 获取后手动填入。
- 用法：Client Component 用 `@/lib/supabase/client` 的 `createClient()`；Server Component / Server Function / Route Handler 用 `@/lib/supabase/server` 的 `await createClient()`，每个请求新建，不要放全局变量。
- 根目录 `proxy.ts`（Next.js 16 中替代 middleware）调用 `lib/supabase/proxy.ts` 的 `updateSession()`，每个请求用 `getClaims()` 刷新会话 cookie；只刷新不拦截（demo 允许未登录浏览），未配置 Supabase 环境变量时直接跳过。服务端鉴权不要信任 `getSession()`。
- Google 登录（已真实接入）：`components/onboarding/google-sign-in.ts` 调 `signInWithOAuth` → Google → Supabase → `app/auth/callback/route.ts`（`exchangeCodeForSession`）→ `/auth/finish`（`GoogleFinish` 读取真实姓名和邮箱，调用 `actions.startGoogleUser()` 写入示例世界，继续引导流程）；失败跳 `/auth/error`。删除账号时同时 `signOut()`。
  - Google Cloud OAuth client（Web application）的 Authorized redirect URI 是 `https://cuwenjxpuiirncxwbmyc.supabase.co/auth/v1/callback`，JavaScript origins 是 `http://localhost:3000` 和 Vercel 域名。
  - Supabase 控制台 Authentication → URL Configuration 的 Redirect URLs 需包含 `http://localhost:3000/**` 和 Vercel 域名 `/**`，否则登录后会跳回 Site URL。
  - 学校 Google 账号（`SCHOOL_GOOGLE_DOMAINS`：`syr.edu`、`g.syr.edu`、`esf.edu`，规则函数 `schoolOfGoogleAccount()`）登录即视为学校邮箱已验证：`startGoogleUser()` 直接写入"在校生"验证，生日一步之后跳过选择路径和验证码，直接到填资料。未满 18 岁仍须走录取材料路径。其他 Google 账号照常走学校邮箱验证码（仍是示例）。
  - Google 账号目前只用于登录，还没有建表，登录后的资料、验证等仍是示例数据，只存在 `localStorage`；验证状态只在前端，不构成安全边界，接入真实功能时要在服务端根据 Google 返回的邮箱重新判断。
- 安全头在 `next.config.ts` 的 `headers()`：CSP（不用 script nonce，否则 Cache Components 下所有页面变动态）、`nosniff`、`Referrer-Policy`。新增外部图片、接口或脚本域名时要同步加进 CSP，否则会被浏览器拦下。`proxy.ts` 的 matcher 不按扩展名跳过（否则 `/roommates/a.png` 能绕过 demo 拦截）。
- 新建表默认不会自动暴露给 Data API，需要显式 `GRANT` 并开启 RLS；涉及数据库的改动先加载 `supabase-postgres-best-practices` skill。
- `supabase/.temp/` 是 CLI 本地缓存，已忽略。

## 示例层约定

- 示例数据和示例操作只放在 `lib/demo/`，文件头注明"示例数据，替换为真实功能时删除"；组件通过 `useDemo()` 读数据（载入前返回 `null`，显示 `DemoSkeleton`），通过 `lib/demo/actions.ts` 改数据。
- 业务规则只写在 `lib/rules/`，不写在组件里。
- 每处示例内容都要能看出是示例（`SampleBadge`、`showSampleNotice()`、顶部示例横幅）；邮件、付款、上传、验证码都不会真实发生（Google 登录是真实的，见上方 Supabase 一节）。手机号 / 邮箱登录按钮暂时从登录卡片隐藏（2026-11-03 决定）：短信要付费且需 A2P 10DLC 注册；邮箱登录需先接自定义 SMTP（如 Resend），Supabase 自带邮件服务只发给项目成员。
- 页面文件只输出静态外壳；动态路由不在顶层 `await params`，而是在 `<Suspense>` 里 `params.then(({ id }) => <X id={id} />)` 交给客户端组件。
- `AccessGate` / `BanGate` 只是演示用的前端拦截，不构成安全边界；接入真实功能时必须用服务端鉴权和 RLS。
- 视觉风格（颜色、字体等 token，在 `app/globals.css`）由产品负责人决定。当前按 2026-10-27 认可的样稿实现：浅灰底、无描边白卡（`rounded-xl bg-card`）、黑色胶囊按钮、实心红色验证勾和开关（`verified-fill`，2026-11-03 起由绿色改为 Crimson `#b8283a`，文字用更深的 `#a1202f`；token 名仍叫 `verified-*`；按钮和选中状态保持黑色，2026-11-03 确认）、次要数字用 `text-faint`，唯一的彩色是 AI 匹配卡渐变（`.match-glow`）。不加别的品牌色。
- Logo（2026-11-03 定稿）：08a Bold V，Crimson 方块里一个白色粗体对称 V，旁边是 Figtree Bold 转成轮廓的 "Verimate"。页面里用 `components/brand/logo.tsx`（内联 SVG），浏览器标签图标是 `app/icon.svg`（`proxy.ts` matcher 已放行）。全部候选方案、竞品调研和预览页在 `docs/brand/logo-options/`（`index.html`）。
- 尺寸按真实 390pt 手机：正文约 15px，标签页大标题 26px，页边距 16px。

## 注意事项

- 不需要关注 `npm audit`。
- 查询外部文档的顺序：
  1. 优先使用本地 skill（Supabase 相关用 `supabase` skill）；
  2. 没有对应 skill 时用 context7（`ctx7 library` → `ctx7 docs`），常用库的 library id 记录在下方；
  3. 前两者都无结果时再用网络搜索。
- 内置浏览器窗格隐藏时 `requestAnimationFrame` 不触发，直接打开动态详情页（如 `/roommates/[id]`）会一直停在骨架屏；这是测试环境限制，用页内链接跳转测试即可。
- 遇到业务决策或影响效果的技术决策，必须先和用户对齐方案。需要用户决策时，用易懂的非技术语言说明各方案及其业务影响，不要只给技术术语。

## Context7 Library IDs

| 库 | ID |
| --- | --- |
| Next.js | `/vercel/next.js` |
| Biome | `/biomejs/website` |
| shadcn/ui | `/shadcn-ui/ui` |
