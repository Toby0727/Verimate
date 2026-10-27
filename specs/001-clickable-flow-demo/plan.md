# Implementation Plan: 全流程可点通的 Demo

**Branch**: `001-clickable-flow-demo` | **Date**: 2026-10-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-clickable-flow-demo/spec.md`

## Summary

把 [docs/product-requirements.md](../../docs/product-requirements.md) 中的 11 个功能区全部搭成可以点通的页面，使用明确标注为示例的数据。

- **示例世界**：完全运行在浏览器里，存在 `localStorage` 中，用演示面板切换身份、切换世界状态、重置。
- **业务规则**：写成纯函数放在 `lib/rules/`，并配有单元测试。日后逐条替换为真实功能时，这些规则可以直接复用。
- **页面**：使用 Next.js 16 App Router。所有内容都在客户端组件里渲染，页面本身只输出静态外壳，以适配已开启的 Cache Components。

## Technical Context

**Language/Version**: TypeScript 5，React 19.3，Next.js 16.4（App Router、Turbopack、Cache Components 已开启）

**Primary Dependencies**：
- 现有：Tailwind CSS v4、shadcn/ui（base-nova / Base UI）、lucide-react
- 新增：按需添加的 shadcn 组件
- 新增开发依赖：`vitest`、`vite-tsconfig-paths`

**Storage**：浏览器 `localStorage`，键为 `verimate-demo-v1`。这一版不使用 Supabase，不建任何表。

**Testing**：
- Vitest：只测 `lib/rules/` 下的纯函数，环境为 `node`。
- 宪章要求的检查：lint、typecheck、build。
- 内置浏览器冒烟测试：按 [quickstart.md](./quickstart.md) 的步骤执行。

**Target Platform**：手机浏览器优先，电脑上内容居中显示；部署在现有的 Vercel 项目。

**Project Type**：单一 Next.js Web 应用。

**Performance Goals**：常规 Web 体验即可，没有特殊指标。页面切换不需要等待网络。

**Constraints**：
- 示例世界的大小必须在 `localStorage` 约 5MB 的配额之内，所以图片只用 `public/sample/` 下的静态文件，不存数据 URL。
- 构建时不能出现"在 Suspense 之外访问运行时数据"的错误。
- 375px 宽度下不能出现横向滚动。

**Scale/Scope**：
- 大约 35 个路由（见 [contracts/routes.md](./contracts/routes.md)）。
- 9 种示例身份。
- 种子数据规模见 [data-model.md](./data-model.md)。

所有技术未知项都已在 [research.md](./research.md) 中解决，没有遗留的 NEEDS CLARIFICATION。

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原则 | 评估 | 结论 |
| --- | --- | --- |
| **I. 核心用户路径优先** | 用户明确要求覆盖全部 11 个功能区，包括会员和团队后台，所以不属于"为未验证需求提前开发"。真实收费、AI 计算、邮件发送等都留到以后，这一版只做示例。 | ✅ |
| **II. 简单、成熟的方案** | 不建后端、不建数据库、不引入状态管理库。只用 React 自带的 `useSyncExternalStore` 加 `localStorage`，以及现有的 shadcn 组件。规则是普通函数，没有服务层或 repository 抽象。 | ✅ |
| **III. 为商业化保留演进路径** | 偏离：身份、会员状态、权限这一版都在浏览器的示例状态里，没有用 Supabase Auth、Postgres 或 RLS。缓解措施：这些全是示例（宪章 IV 允许）；业务规则独立于 UI，放在 `lib/rules/`；数据模型贴近日后的真实结构。替换为真实功能时，必须改用平台原生机制。 | ⚠️ 已说明理由，见 Complexity Tracking |
| **IV. 模拟与真实明确区分** | 所有页面都有示例横幅，每处示例内容都有 `SampleBadge`；示例代码只放在 `lib/demo/`，文件头带注释；`/about-demo` 页逐条列出每条流程的状态；邮件、付款、上传环节都明确提示"不会真实发生"。 | ✅ |
| **V. 安全与数据正确性不打折** | 不接触真实账号或数据，不新增密钥，不新增数据库表。后台的访问守卫只是演示用途，在契约中明确写了"不构成安全边界"。日后替换为真实功能时，必须用服务端鉴权（`getClaims()`）和 RLS 重新实现。 | ✅ |
| **质量门禁** | lint、typecheck、build、`lib/rules/` 单元测试，以及 quickstart 中的 19 项浏览器冒烟测试。 | ✅ |
| **AGENTS.md 同步** | 实现时 MUST 在 AGENTS.md 中登记：新增的 Vitest 和 `npm test`、`lib/demo/`、`lib/rules/`、`public/sample/`、新增的 shadcn 组件、示例层的约定。同时满足宪章中"首次选定测试框架"的 Follow-up。 | 实现阶段执行 |

**Phase 1 设计后复核**：data-model 和契约没有引入新的复杂度，结论与上表相同。

## Project Structure

### Documentation (this feature)

```text
specs/001-clickable-flow-demo/
├── spec.md
├── plan.md              # 本文件
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1：验证和冒烟测试步骤
├── contracts/
│   ├── routes.md        # 页面、路由和访问规则
│   └── demo-store.md    # 示例 store 动作和规则函数的契约
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2（/speckit-tasks 生成，本命令不创建）
```

### Source Code (repository root)

```text
app/
├── layout.tsx                 # 加入示例横幅和演示面板
├── page.tsx                   # 落地页，替换现在的占位首页
├── about-demo/page.tsx
├── terms/page.tsx
├── privacy/page.tsx
├── sign-in/page.tsx
├── (onboarding)/
│   ├── layout.tsx
│   └── onboarding/{birthday,path,verify,admitted,profile}/page.tsx
├── (app)/
│   ├── layout.tsx             # 底部 5 个标签
│   ├── roommates/page.tsx, roommates/[id]/page.tsx
│   ├── for-you/page.tsx
│   ├── sublets/page.tsx, sublets/[id]/page.tsx, sublets/new/page.tsx
│   ├── messages/page.tsx, messages/[id]/page.tsx, messages/requests/[id]/page.tsx
│   └── me/page.tsx, me/{profile,questionnaire,sublets,membership,settings}/page.tsx
└── admin/
    ├── layout.tsx
    └── page.tsx, {admissions,leases,reports,buildings,founding}/page.tsx

components/
├── ui/                        # shadcn 组件（按需添加）
├── demo/                      # 示例横幅、演示面板、SampleBadge、骨架屏
├── shell/                     # 底部标签栏、页头
├── onboarding/
├── roommates/
├── for-you/
├── sublets/
├── messages/
├── me/
└── admin/

lib/
├── utils.ts                   # 现有
├── supabase/                  # 现有，本功能不改动
├── rules/                     # 业务规则纯函数，每个文件配一个同名 .test.ts
│   ├── constants.ts
│   └── verification.ts, profile.ts, requests.ts, fraud.ts, visibility.ts, sublets.ts, matching.ts, membership.ts
└── demo/                      # 示例层（替换为真实功能时删除对应部分）
    ├── types.ts               # DemoWorld 和各实体的类型
    ├── seed.ts
    ├── store.ts
    ├── use-demo.ts
    └── actions.ts

public/sample/                 # 从 legacy/img 复制的示例头像和房间照片
vitest.config.mts
```

**Structure Decision**：
- 单一 Next.js 应用，沿用现有的 `app/`、`components/`、`lib/` 约定。
- 页面按路由组划分：公共页面、入驻（onboarding）、主应用（app）、后台（admin）。
- 组件按功能区放在 `components/<功能区>/`。
- 规则和示例层分别放在 `lib/rules/` 和 `lib/demo/`，替换某条流程时只需要动对应的部分。
- 页面文件只输出静态外壳，加上用 Suspense 包裹的客户端组件；动态路由的 params 按 research R3 的方式处理。

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --- | --- | --- |
| 宪章 III：身份、会员、权限暂时放在浏览器的示例状态里，而不是 Supabase Auth、Postgres 或 RLS | 这一版的目标是用示例数据把全流程点通（用户明确要求），而且示例与真实必须严格分开（宪章 IV） | 直接用 Supabase：要提前把全部表、RLS 和 OAuth 做完，等于一次性做完真实版本，与"先点通、再逐条替换"的交付方式相冲突；示例数据进入生产数据库，日后还要清理 |
