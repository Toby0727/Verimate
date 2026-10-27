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

面向 Syracuse University / SUNY ESF 的已验证学生找室友平台（找室友为主线，转租资讯为辅）。当前是全流程可点通的示例 demo：所有页面和流程都能走通，但数据全是示例，只存在浏览器 `localStorage` 里；已接入 Supabase（尚未建表），真实功能后续逐条替换（见 `lib/demo/flow-status.ts`）。

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
- 尚未添加 `proxy.ts`（Next.js 16 中替代 middleware）。接入 Auth 时必须按 supabase skill / 官方 SSR 文档添加，用 `getClaims()` 刷新会话；服务端鉴权不要信任 `getSession()`。
- 新建表默认不会自动暴露给 Data API，需要显式 `GRANT` 并开启 RLS；涉及数据库的改动先加载 `supabase-postgres-best-practices` skill。
- `supabase/.temp/` 是 CLI 本地缓存，已忽略。

## 示例层约定

- 示例数据和示例操作只放在 `lib/demo/`，文件头注明"示例数据，替换为真实功能时删除"；组件通过 `useDemo()` 读数据（载入前返回 `null`，显示 `DemoSkeleton`），通过 `lib/demo/actions.ts` 改数据。
- 业务规则只写在 `lib/rules/`，不写在组件里。
- 每处示例内容都要能看出是示例（`SampleBadge`、`showSampleNotice()`、顶部示例横幅）；邮件、付款、上传、Google 登录、验证码都不会真实发生。
- 页面文件只输出静态外壳；动态路由不在顶层 `await params`，而是在 `<Suspense>` 里 `params.then(({ id }) => <X id={id} />)` 交给客户端组件。
- `AccessGate` / `BanGate` 只是演示用的前端拦截，不构成安全边界；接入真实功能时必须用服务端鉴权和 RLS。
- 视觉风格（颜色、字体等 token，在 `app/globals.css`）由产品负责人决定，当前是中性占位值。

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
