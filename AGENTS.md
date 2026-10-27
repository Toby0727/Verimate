<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Verimate

> 本文件是后续开发的文档起点。**每次开发推进（新增依赖、目录、约定、决策）都必须同步更新本文件**，保持与代码一致。

## 项目速览

面向 Syracuse University / SUNY ESF 的已验证学生转租平台。当前为 Next.js 骨架 + 占位首页，已接入 Supabase（尚未建表），业务功能尚未开发。

- `app/`：App Router 页面与布局
- `components/ui/`：shadcn/ui 组件（通过 CLI 添加，可直接修改）
- `lib/`：工具函数（`cn` 等）
- `lib/supabase/`：Supabase client（`client.ts` 浏览器端、`server.ts` 服务端、`env.ts` 环境变量校验）
- `legacy/`：旧版静态路演 demo（纯 HTML，冻结，仅作参考，不参与构建和 lint）
- `.specify/`、`.claude/skills/speckit-*`：spec-kit 规格驱动开发（`/speckit-specify` → `plan` → `tasks` → `implement`）
- `.claude/skills/supabase*`、`skills-lock.json`：Supabase 官方 agent skill（`npx skills add supabase/agent-skills` 安装，`npx skills update` 更新）

## 技术栈

- Next.js 16（App Router、Turbopack、Cache Components）+ React 19 + TypeScript
- Tailwind CSS v4 + shadcn/ui（`base-nova` 预设，Base UI）+ lucide-react 图标
- Supabase（`@supabase/supabase-js` + `@supabase/ssr`，精确锁定版本）
- Biome（格式化 + lint，替代 ESLint/Prettier）
- Vercel 部署（Toby 的 Hobby 团队）：项目最初按静态站创建，Framework Preset 为 “Other”，因此用 `vercel.json` 的 `"framework": "nextjs"` 覆盖，不要删除
- husky + lint-staged：提交前对暂存文件执行 `biome check --write`（格式化 + 安全修复），再全量 `tsc` 类型检查
- npm

## 常用命令

```bash
npm run dev        # 开发服务器 http://localhost:3000
npm run lint       # biome check
npm run typecheck  # next typegen && tsc --noEmit
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

## 注意事项

- 不需要关注 `npm audit`。
- 查询外部文档的顺序：
  1. 优先使用本地 skill（Supabase 相关用 `supabase` skill）；
  2. 没有对应 skill 时用 context7（`ctx7 library` → `ctx7 docs`），常用库的 library id 记录在下方；
  3. 前两者都无结果时再用网络搜索。
- 遇到业务决策或影响效果的技术决策，必须先和用户对齐方案。需要用户决策时，用易懂的非技术语言说明各方案及其业务影响，不要只给技术术语。

## Context7 Library IDs

| 库 | ID |
| --- | --- |
| Next.js | `/vercel/next.js` |
| Biome | `/biomejs/website` |
| shadcn/ui | `/shadcn-ui/ui` |
