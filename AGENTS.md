<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Verimate

> 本文件是后续开发的文档起点。**每次开发推进（新增依赖、目录、约定、决策）都必须同步更新本文件**，保持与代码一致。

## 项目速览

面向 Syracuse University / SUNY ESF 的已验证学生转租平台。当前为空白 Next.js 骨架 + 占位首页，业务功能尚未开发。

- `app/`：App Router 页面与布局
- `components/ui/`：shadcn/ui 组件（通过 CLI 添加，可直接修改）
- `lib/`：工具函数（`cn` 等）
- `legacy/`：旧版静态路演 demo（纯 HTML，冻结，仅作参考，不参与构建和 lint）
- `.specify/`、`.claude/skills/speckit-*`：spec-kit 规格驱动开发（`/speckit-specify` → `plan` → `tasks` → `implement`）

## 技术栈

- Next.js 16（App Router、Turbopack、Cache Components）+ React 19 + TypeScript
- Tailwind CSS v4 + shadcn/ui（`base-nova` 预设，Base UI）+ lucide-react 图标
- Biome（格式化 + lint，替代 ESLint/Prettier）
- husky + lint-staged：提交前对暂存文件执行 `biome check --write`（格式化 + 安全修复），再全量 `tsc` 类型检查
- npm

## 常用命令

```bash
npm run dev        # 开发服务器 http://localhost:3000
npm run lint       # biome check
npm run typecheck  # next typegen && tsc --noEmit
npm run build
npx shadcn@latest add <component>
```

## 注意事项

- 不需要关注 `npm audit`。
- 查询外部文档的顺序：
  1. 优先使用本地 skill；
  2. 没有对应 skill 时用 context7（`ctx7 library` → `ctx7 docs`），常用库的 library id 记录在下方；
  3. 前两者都无结果时再用网络搜索。
- 遇到业务决策或影响效果的技术决策，必须先和用户对齐方案。需要用户决策时，用易懂的非技术语言说明各方案及其业务影响，不要只给技术术语。

## Context7 Library IDs

| 库 | ID |
| --- | --- |
| Next.js | `/vercel/next.js` |
| Biome | `/biomejs/website` |
| shadcn/ui | `/shadcn-ui/ui` |
