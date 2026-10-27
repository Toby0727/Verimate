# Research: 全流程可点通的 Demo

依据：[spec.md](./spec.md)、[docs/product-requirements.md](../../docs/product-requirements.md)、项目宪章，以及本地 Next.js 16.4 文档（`node_modules/next/dist/docs/`）。

## R1. 示例数据存在哪里、怎么保存

- **Decision**：
  - 全部示例数据和演示操作都在浏览器端运行，持久化到 `localStorage`。
  - 存储键带版本号：`verimate-demo-v1`。
  - 组件通过 React 的 `useSyncExternalStore` 订阅一个模块级 store。
  - "重置示例"会清空这个键，并重新载入种子数据。
- **Rationale**：
  - 满足 FR-006：刷新后保留，不同设备互不影响。
  - 不产生任何真实用户数据，也不需要后端、数据库或鉴权，开发成本最低（宪章 II）。
  - 示例世界完全隔离，不会和日后的真实数据混在一起（宪章 IV）。
- **Alternatives considered**：
  - **Supabase 建示例表**：需要建表、开启 RLS、写迁移。而且示例数据进入生产数据库，日后反而要清理，与"示例和真实明确区分"相冲突。
  - **Cookie 加 Server Functions**：在根布局读取 cookie，会让整站退出静态预渲染（Next 文档 `preventing-flash-before-hydration.md` 说明了这一点）。cookie 还有约 4KB 的容量限制，装不下示例世界。
  - **仅存在内存里**：刷新即丢失，违反 FR-006。

## R2. Cache Components 下客户端状态的渲染方式

- **Decision**：
  - 页面本身保持为同步的 Server Component，只负责输出静态外壳（标题、标签栏、布局）。
  - 所有依赖示例数据的内容放在 `'use client'` 组件里。
  - store 的 `getServerSnapshot` 返回 `null`，客户端载入完成前显示骨架屏，载入后渲染真实的示例状态。
- **Rationale**：
  - `next.config.ts` 已开启 `cacheComponents`，页面在构建时会被预渲染。示例数据只在浏览器里，服务端不可能知道。
  - 用"载入前显示骨架屏"可以避免水合不匹配，也不需要 Next 文档里的内联脚本技巧。那种技巧适用于主题这类单个值，不适合整个数据集。
- **Alternatives considered**：
  - **服务端快照直接用种子数据**：会出现"先闪一下初始数据，再跳成用户改过的数据"，演示时会让人困惑。

## R3. 动态路由（详情页）

- **Decision**：
  - 涉及的页面：`/roommates/[id]`、`/sublets/[id]`、`/messages/[id]`、`/admin/*/[id]`（如需要）。
  - 按照文档 `dynamic-routes.md` 中"Without generateStaticParams"一节的做法：页面不在顶层 `await params`，而是在 `<Suspense>` 内用 `params.then(({ id }) => <ClientDetail id={id} />)` 把 id 交给客户端组件。
  - 不使用 `generateStaticParams`。
- **Rationale**：
  - 用户在演示中新建的转租帖和聊天，id 只存在于浏览器，构建时无法列举。
  - 文档明确指出：开启 Cache Components 后，访问运行时 params 必须放在 Suspense 里，否则构建失败。
- **Alternatives considered**：
  - **只为种子数据写 `generateStaticParams`**：新建的帖子依然要走运行时路径，多一种情况，却没有收益。
  - **改用查询参数 `?id=`**：`useSearchParams` 同样要求 Suspense，而且 URL 语义更差。

## R4. 业务规则放在哪里

- **Decision**：
  - 所有业务规则写成纯函数，放在 `lib/rules/`，按领域分文件，并传入 `now` 参数以便测试时间类规则。
  - 涵盖的规则：学校邮箱和年龄校验、资料完整度、消息请求的上限、冷却期和过期、防骗关键词检测、可见性（拉黑、暂停、同楼、访客模糊）、转租帖的必填项、地址可见性和有效期、推荐的解锁配额、创始会员资格和名额、会员权益。
  - `lib/demo/` 中的 store 动作调用这些规则。
  - UI 组件只负责展示，并调用 store 动作。
- **Rationale**：
  - 宪章 III 要求核心业务规则不写死在 UI 组件里。
  - 日后把某条流程替换为真实功能时，同一批规则函数可以直接搬到 Server Function 里复用。示例层随之删除，规则不用重写。
- **Alternatives considered**：
  - **规则写在组件里**：违反宪章 III，替换时要重写。
  - **引入 repository 或服务层抽象**：现在只有一个数据来源，属于过度设计（宪章 II）。

## R5. 单元测试框架

- **Decision**：
  - 使用 **Vitest** 和 `vite-tsconfig-paths`（解析 `@/` 别名），运行环境为 `node`。
  - 只测试 `lib/rules/` 下的纯函数，不装 jsdom 和 Testing Library。
  - 新增脚本 `npm test`（`vitest run`）。
- **Rationale**：
  - 宪章 Follow-up 要求"首次出现需要测试的核心业务逻辑时选型"，本功能就是这第一次。
  - Next 官方文档有 Vitest 指南；Vitest 原生支持 TypeScript，配置量最小。
  - 页面交互由宪章要求的浏览器冒烟测试覆盖，不需要组件测试。
- **Alternatives considered**：
  - **Jest**：需要额外的 TS 转译配置。
  - **Node 内置的 `node --test`**：零依赖，但解析 `@/` 路径别名需要额外处理。

## R6. 示例图片

- **Decision**：
  - 把 `legacy/img/` 下的人像（`p-*`、`u-*`）和房间照片（`r-*`、`u-room-*` 等）复制到 `public/sample/`，作为示例头像和房源照片。
  - 演示中"上传照片、录取材料、租约"的环节，让用户从示例图库里选一张，或者选一个本地文件但只记录文件名。界面提示"示例：真实版本将支持上传"。
- **Rationale**：
  - 现成素材，且已经用于路演。
  - 把图片转成数据 URL 存进 `localStorage`，很快会超出约 5MB 的配额。
- **Alternatives considered**：
  - **使用外部图床**：会多一个外部依赖，离线时也无法演示。
- **注意**：`legacy/` 里的图片疑似来自 Unsplash（文件名中带有时间戳形式的编号），来源未核实。在任何正式上线页面使用前，需要确认授权。

## R7. 示例标注和演示工具栏

- **Decision**：
  - 根布局放一个**始终可见的示例横幅**，文案如 "Demo · Sample data, nothing here is real"。
  - 横幅可以展开为**演示面板**，提供：切换示例身份、切换"已验证用户是否达到 50 人"、重置示例、链接到 `/about-demo`。
  - 每张示例卡片、示例匹配度和示例通知旁边，放一个统一的 `SampleBadge` 组件。
  - 在代码中，示例数据只出现在 `lib/demo/` 目录里，文件头注释写明"示例数据，替换为真实功能时删除"。
- **Rationale**：满足 FR-001、FR-002、FR-003、FR-004、FR-005、FR-007，以及宪章 IV。

## R8. 页面形态和组件

- **Decision**：
  - 手机优先：在电脑上内容居中显示，最大宽度约 520px，与旧 demo 一致。
  - 登录后的页面在 `app/(app)/` 路由组下共用一个带底部 5 个标签的布局。
  - 入驻流程在 `app/(onboarding)/` 下，后台在 `app/admin/` 下，各用独立布局。
  - UI 组件按需通过 `npx shadcn@latest add` 添加，预计包括 input、label、textarea、select、checkbox、switch、tabs、dialog、sheet、avatar、separator、sonner。
  - 品牌色参考旧 demo 的红色 `#D81E28` 和验证绿色 `#16A34A`，以主题变量的方式写入 `app/globals.css`。
- **Rationale**：沿用项目既定技术栈（宪章 II），视觉上与路演保持一致。

## R9. 示例中的"时间"

- **Decision**：
  - 种子数据中的时间都以"载入或重置时的当前时间"为基准生成相对时间，例如注册于 20 天前、请求发出于 15 天前。
  - 所有规则函数都显式接收 `now` 参数。
  - 会周期性重置的配额（每日请求数、每周解锁数）按日历日或周计算。
- **Rationale**：时间类规则用预置的示例状态展示（见规格 Assumptions），同时保证规则函数可测试。

## R10. 本功能不涉及的部分

- 不使用 Supabase：现有 client 保持不动。
- 不添加 `proxy.ts`。
- 不接入 Google OAuth、邮件发送、文件存储或付款。
- 不做真实的 AI 匹配计算。

以上全部在"逐条替换为真实功能"阶段，各自写新的规格。
