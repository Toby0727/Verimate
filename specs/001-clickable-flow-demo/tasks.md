---

description: "全流程可点通 Demo 的任务清单"
---

# Tasks: 全流程可点通的 Demo

**Input**: Design documents from `specs/001-clickable-flow-demo/`

**Prerequisites**: plan.md、spec.md、research.md、data-model.md、contracts/（routes.md、demo-store.md）、quickstart.md

**Tests**：
- plan.md 和宪章要求为核心业务逻辑写单元测试，所以每个 `lib/rules/*.ts` 都配一个同名的 `*.test.ts`（Vitest）。
- 页面交互不写自动化测试，由 quickstart.md 中的浏览器冒烟测试覆盖。

**Organization**：任务按用户故事分组。US1（演示框架）是其余故事的演示前提，见 Dependencies。

**通用约定**（适用于所有任务，不再逐条重复）：
- **界面**：英文文案；手机优先，内容最大宽度约 520px 并居中。
- **示例标注**：所有示例内容都放 `SampleBadge`。凡是"不会真实发生"的环节（邮件、付款、上传、Google 登录、验证码），都用 `showSampleNotice()` 提示。
- **组件分层**：
  - 依赖示例数据的组件都是 `'use client'` 组件，通过 `useDemo()` 读取数据；`useDemo()` 返回 `null` 时显示 `DemoSkeleton`。
  - 页面文件只输出静态外壳。动态路由不在顶层 `await params`，而是在 `<Suspense>` 中用 `params.then(({ id }) => <X id={id} />)` 传给客户端组件（research R3）。
- **业务规则**：只写在 `lib/rules/`，组件里不写；规则函数不读 `Date.now()`，时间由 `now` 参数传入。
- **示例层**：代码只放在 `lib/demo/`，文件头注释写明"示例数据，替换为真实功能时删除"。
- **Next.js 文档**：写代码前，先查 `node_modules/next/dist/docs/` 中对应的指南（AGENTS.md 要求）。

## Format: `[ID] [P?] [Story] Description`

- **[P]**：可以并行（不同文件，且不依赖未完成的任务）
- **[Story]**：所属的用户故事（US1 到 US7）

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**：测试框架、UI 组件、示例素材、品牌主题。

- [X] T001 安装开发依赖 `vitest` 和 `vite-tsconfig-paths`（`npm install -D vitest vite-tsconfig-paths`），并在 `package.json` 的 `scripts` 中加入 `"test": "vitest run"`
- [X] T002 创建 `vitest.config.mts`：`plugins: [tsconfigPaths()]`，`test.environment: 'node'`，`test.include: ['lib/**/*.test.ts']`
- [X] T003 [P] 用 `npx shadcn@latest add input label textarea select checkbox switch tabs dialog sheet avatar separator sonner` 把组件添加到 `components/ui/`。不要修改现有的 `button`、`badge`、`card`
- [X] T004 [P] 把 `legacy/img/` 中的人像（`p-*.jpg`、`u-chloe.jpg`、`u-ethan.jpg`、`u-jason.jpg`、`u-kevin.jpg`、`u-layla.jpg`、`u-mia.jpg`、`u-priya.jpg`）复制到 `public/sample/people/`，把房间照片（`r-*.jpg`、`u-kitchen.jpg`、`u-living.jpg`、`u-room-real.jpg`、`u-room-sofa.jpg`）复制到 `public/sample/rooms/`，并新建 `public/sample/README.md`，注明"示例素材，来源疑似 Unsplash 但未核实，正式上线前需确认授权"
- [X] T005 [P] 在 `app/globals.css` 中加入品牌主题变量：`--primary` 用品牌红 `#D81E28`（深色 `#A8151D`、浅色 `#FCE8E9`），新增 `--verified: #16A34A` 和 `--verified-tint: #E7F5EC`，并通过 Tailwind v4 的 `@theme` 暴露为 `bg-verified`、`text-verified` 等工具类

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**：示例世界的数据、store、通用规则和页面外壳。所有故事都依赖这一阶段。

**⚠️ CRITICAL**：这一阶段完成前，不能开始任何用户故事。

- [X] T006 在 `lib/rules/constants.ts` 中定义 data-model.md"规则常量"表中的全部常量，名称和数值一一对应：`SCHOOL_EMAIL_DOMAINS = ['syr.edu', 'esf.edu']`、`MIN_AGE = 18`、`VERIFICATION_VALID_MONTHS = 12`、`ADMITTED_GRACE_AFTER_TERM_START_DAYS = 60`、`DAILY_REQUEST_LIMIT = 10`、`REQUEST_EXPIRY_DAYS = 14`、`REQUEST_COOLDOWN_AFTER_DELETE_DAYS = 30`、`INACTIVE_AUTO_PAUSE_DAYS = 30`、`SUBLET_STALE_DAYS = 30`、`SUBLET_CONFIRM_GRACE_DAYS = 7`、`WEEKLY_FREE_UNLOCKS = 3`、`TOP_MATCHES_MEMBER_ONLY = 3`、`FOUNDING_THRESHOLD_VERIFIED = 50`、`FOUNDING_SEATS = 30`、`FOUNDING_MIN_ACCOUNT_AGE_DAYS = 7`、`BOOST_DAYS = 7`、`REPORT_SLA_HOURS = 48`、`PRICES`（月订阅 4.99、季票 9.99 / 3 个月、试用 7 天）、`FRAUD_KEYWORDS`
- [X] T007 [P] 在 `lib/demo/types.ts` 中按 data-model.md 定义 `DemoWorld` 及全部实体类型，枚举值必须照抄：
  - `Account.role`：`'user' | 'internal' | 'admin'`
  - `Account.status`：`'active' | 'banned' | 'deleted'`
  - `Account.onboardingStep`：`'birthday' | 'path' | 'verify' | 'profile' | 'done'`
  - `Verification.type`：`'student' | 'admitted' | 'graduate'`
  - `Verification.status`：`'pending' | 'approved' | 'rejected' | 'expired'`
  - `Profile.housingStatus`：`'has-place' | 'needs-place' | 'group'`
  - `Profile.searchStatus`：`'active' | 'paused'`
  - `Profile.pausedReason`：`'manual' | 'inactive'`
  - `MessageRequest.status`：`'pending' | 'accepted' | 'deleted' | 'expired'`
  - `MessageRequest.context`：`{ type: 'profile' } | { type: 'sublet', subletId }`
  - `Sublet.roomType`：`'private' | 'entire' | 'shared'`
  - `Sublet.status`：`'active' | 'stale' | 'subleased' | 'expired' | 'removed'`
  - `lease.status`：`'none' | 'pending' | 'verified' | 'rejected'`
  - `Building.kind`：`'building' | 'area'`
  - `Membership.kind`：`'free' | 'founding' | 'monthly' | 'season' | 'internal'`
  - `Report.target.type`：`'account' | 'sublet'`
  - `Report.status`：`'open' | 'resolved'`
  - `Report.resolution`：`'removed' | 'warned' | 'banned' | 'dismissed'`
  - `verifiedCountOverride`：`'below50' | 'reached50'`
  - Persona id：`'visitor' | 'new-user' | 'student-free' | 'admitted-pending' | 'admitted-17' | 'member-internal' | 'admin' | 'expired' | 'banned'`
- [X] T008 [P] 在 `lib/rules/verification.ts` 中实现：
  - `isSchoolEmail(email)`：后缀属于 `SCHOOL_EMAIL_DOMAINS`，不区分大小写
  - `isEmailTaken(email, verifications)`："同一邮箱在所有账号中唯一"
  - `ageOn(birthDate, now)`
  - `canProceedWithAge(age, path)`：满 18 岁可以继续；17 岁仅限 `admitted` 路径
  - `isVerificationValid(v, now)`：`approved` 且 `now < expiresAt`，其中 `expiresAt = verifiedAt + 12 个月`
  - `badgeFor(verification, now)`：返回"在校生 ✓ / 已录取 · 审核中 / 已录取 ✓ / 毕业生 / 验证已过期"对应的枚举
- [X] T009 [P] 在 `lib/rules/verification.test.ts` 中为 T008 的每个函数写单元测试，包括：大写邮箱、`gmail.com`、已被绑定的邮箱、17 岁选 student 被拒、17 岁选 admitted 通过、到期前一天和到期当天
- [X] T010 [P] 在 `lib/rules/profile.ts` 中实现：
  - `missingRequiredFields(profile)`：必填项为 `photo`、`displayName`、`school`、`standing`、`gender`、`budgetMin`、`budgetMax`、`moveInFrom`、`moveInTo`、`housingStatus`、`sleep`、`cleanliness`、`smoking`、`pets`；当 `housingStatus === 'group'` 时，还要求 `groupHave` 和 `groupNeed`
  - `isProfileComplete(profile)`
  - `shouldAutoPause(account, now)`：`lastActiveAt` 距 `now` ≥ 30 天
  - `isListed(account, profile, verification, now)`：资料完整、`searchStatus === 'active'`、验证有效、账号 `status === 'active'`，且不满足自动暂停条件
- [X] T011 [P] 在 `lib/rules/profile.test.ts` 中为 T010 写单元测试，包括：`group` 状态缺 `groupNeed`、暂停、不活跃 30 天、验证过期、被封号
- [X] T012 [P] 在 `lib/rules/membership.ts` 中先实现 `entitlements(membership, viewAsFree)`：`internal`、`founding`、`monthly`、`season` 返回全部权益（`aiFull`、`alerts`、`boost`、`whoViewed`）；`free`，或 `internal` 且 `viewAsFree === true` 时，返回空集。在 `lib/rules/membership.test.ts` 中为它写测试
- [X] T013 在 `lib/demo/seed.ts` 中实现 `createSeedWorld(now): DemoWorld`，所有时间都相对于 `now` 生成，规模按 data-model.md"种子数据规模"一节：
  - 9 个 Persona 对应的账号，以及约 16 个示例室友资料（其中至少 1 个 `paused`、1 个 30 天不活跃、1 个资料不完整、1 个毕业生、1 个创始会员）
  - 约 10 条转租帖（含 `stale`、`subleased`、租约 `verified`、租约 `pending`，至少 1 条带 `exactAddress`）
  - 约 8 个雪城楼盘和片区（`kind` 为 `building` 或 `area`，`city: 'syracuse'`）
  - `student-free` 的 2 条收到的请求（其中 1 条创建于 15 天前、应判定为过期）、1 条发出的请求、1 段已经开始的聊天（内含一条带 `fraudSignals` 的消息）
  - 每个已列出的资料对 `student-free` 和 `member-internal` 的 `Match`（`score`、`oneLiner`、`reasons[]`）
  - 后台用的 2 份 `pending` 录取材料、1 份 `pending` 租约、2 条 `open` 举报
  - `verifiedCountOverride: 'below50'`；切到 `reached50` 时已用创始名额为 27
  - 照片路径指向 `public/sample/`
- [X] T014 在 `lib/demo/store.ts` 中实现模块级 store：
  - 键 `STORAGE_KEY = 'verimate-demo-v1'`，导出 `DEMO_VERSION`
  - `getSnapshot()` 从内存缓存读取，首次读取时从 `localStorage` 解析；解析失败或 `version` 不一致时，用 `createSeedWorld(new Date())` 重建
  - `getServerSnapshot()` 返回 `null`
  - `subscribe(listener)`
  - `setWorld(updater)`：写入内存和 `localStorage`，然后通知订阅者；所有 `localStorage` 访问都放在 try/catch 里
  - `resetWorld()`
- [X] T015 在 `lib/demo/use-demo.ts` 中实现 `useDemo()`：用 `useSyncExternalStore` 订阅 store，返回 `{ world, me, persona, membership, entitlements, actions }`，store 还没载入时返回 `null`；`entitlements` 由 T012 的规则计算
- [X] T016 在 `lib/demo/actions.ts` 中搭建动作模块：
  - 统一返回 `{ ok: true } | { ok: false, reason }`
  - 先实现框架动作：`switchPersona(id)`、`setViewAsFree(bool)`、`setVerifiedCount(value)`、`resetDemo()`
  - 实现内部工具 `recordSampleEmail(to, subject)`，往 `world.sentEmails` 追加一条记录
- [X] T017 [P] 新建 `components/demo/sample-badge.tsx`（小号 "Sample" 徽标）、`components/demo/demo-skeleton.tsx`（骨架屏），以及 `components/demo/sample-notice.ts`：导出 `showSampleNotice(message)`，用 sonner toast 显示 "Sample: {message}"
- [X] T018 [P] 新建 `components/shell/verification-badge.tsx`：根据 `badgeFor()` 渲染 5 种验证标识，"已验证"用 `--verified` 绿色。再新建 `components/shell/page-header.tsx`
- [X] T019 新建 `components/shell/tab-bar.tsx`（5 个底部标签：Roommates → `/roommates`、For You → `/for-you`、Sublets → `/sublets`、Messages → `/messages`、Me → `/me`，当前标签高亮）和 `app/(app)/layout.tsx`（居中的手机宽度容器，底部是标签栏）
- [X] T020 新建 `components/shell/access-gate.tsx`（客户端守卫组件），参数 `require: 'signed-in' | 'verified-complete' | 'admin'`：
  - `banned` 身份：只渲染封号说明
  - 未满足 `verified-complete` 时：说明缺什么（未验证、验证过期、资料不完整），并给出跳转入口
  - 不是 `admin` 时：显示"无权访问"
  - 组件内注释："演示用途，不构成安全边界"

**Checkpoint**：`npm test` 通过；示例世界可以载入，在浏览器中刷新后数据还在。

---

## Phase 3: User Story 1 - 演示者切换身份走完整个产品 (Priority: P1) 🎯 MVP

**Goal**：始终可见的示例提示、演示面板（切换身份、切换 50 人开关、以免费视角查看、重置）、`/about-demo` 页、落地页。

**Independent Test**：任意页面都能看到示例横幅；依次切换 9 种身份，界面随之变化；操作后重置，回到初始状态；`/about-demo` 列出全部流程，状态都是 Sample。

- [X] T021 [P] [US1] 新建 `lib/demo/flow-status.ts`：列出 11 个功能区（登录、学校邮箱验证、填资料、室友列表与筛选、消息请求与聊天、转租浏览与发帖、为你推荐、同楼、会员与创始会员、我的、团队后台），每项都是 `{ name, status: 'sample' | 'live', note }`，这一版全部为 `'sample'`
- [X] T022 [US1] 新建 `components/demo/demo-banner.tsx`：固定在顶部的窄横幅 "Demo · Sample data, nothing here is real"，点击后打开演示面板
- [X] T023 [US1] 新建 `components/demo/demo-panel.tsx`（sheet）：
  - Persona 切换列表，9 种身份，每种附一句说明
  - "Verified users: below 50 / reached 50" 开关
  - 仅 `member-internal` 可见的 "View as free user" 开关
  - "Reset sample data" 按钮（需要二次确认）
  - 链接到 `/about-demo`
- [X] T024 [US1] 修改 `app/layout.tsx`：挂载 `DemoBanner` 和 sonner 的 `Toaster`；把 metadata 的 description 改为 "Verified roommate finding for SU & ESF students"
- [X] T025 [P] [US1] 新建 `app/about-demo/page.tsx`：按 `flow-status.ts` 逐条列出每条流程的状态，并说明示例数据只保存在当前浏览器里、可以重置
- [X] T026 [US1] 重写 `app/page.tsx` 为落地页：定位文案（找室友为主线、真实验证），按钮 "Sign in with Google (Sample)" 跳转到 `/sign-in`，"Browse as visitor" 跳转到 `/roommates`

**Checkpoint**：演示框架可以独立演示，SC-004 的示例标注在框架层面已经覆盖。

---

## Phase 4: User Story 2 - 新用户从访客走到完成入驻 (Priority: P1)

**Goal**：示例 Google 登录 → 生日 → 选择身份路径 → 学校邮箱验证或录取材料 → 必填资料 → 进入室友列表；访客能看到模糊预览；验证过期的用户可以重新验证。

**Independent Test**：以 `new-user` 身份分别走完在校生和已录取两条路径；16 岁选在校生被拦下，`gmail.com` 被拒，已被绑定的邮箱被拒，缺必填项时逐项提示；最终在 `/roommates` 中看到自己。

- [X] T027 [US2] 在 `lib/demo/actions.ts` 中实现入驻动作：
  - `startNewUser()`：切到 `new-user`，`onboardingStep = 'birthday'`
  - `submitBirthday(date)`
  - `choosePath(type)`：未满 18 岁时只允许 `admitted`，用 `canProceedWithAge` 判断
  - `verifySchoolEmail(email, code)`：用 `isSchoolEmail` 和 `isEmailTaken` 校验；示例验证码固定为 `123456`；通过后建立 `Verification`，`status: 'approved'`，`expiresAt = verifiedAt + 12 个月`
  - `submitAdmittedDocument(fileName)`：建立 `type: 'admitted'`、`status: 'pending'` 的记录
  - `saveRequiredProfile(fields)`：用 `missingRequiredFields` 校验，通过后 `onboardingStep = 'done'`
  - 每一步都推进 `onboardingStep`
- [X] T028 [P] [US2] 新建 `app/sign-in/page.tsx`：示例 Google 登录卡片，"Continue as new user" 调用 `startNewUser()` 并进入 `/onboarding/birthday`；页面上明确说明 "Sample sign-in, no Google account is connected"
- [X] T029 [P] [US2] 新建 `app/(onboarding)/layout.tsx`：居中的手机宽度容器加步骤进度条（Birthday / Path / Verify / Profile）。根据 `onboardingStep`，阻止直接跳到后面的步骤
- [X] T030 [P] [US2] 新建 `app/(onboarding)/onboarding/birthday/page.tsx` 和 `components/onboarding/birthday-form.tsx`
- [X] T031 [P] [US2] 新建 `app/(onboarding)/onboarding/path/page.tsx` 和 `components/onboarding/path-chooser.tsx`："Current SU/ESF student" 或 "Admitted, starting soon"；未满 18 岁时禁用 student 选项，并说明原因
- [X] T032 [P] [US2] 新建 `app/(onboarding)/onboarding/verify/page.tsx` 和 `components/onboarding/school-email-form.tsx`：
  - 先输入邮箱，再输入验证码；点"发送"时调用 `showSampleNotice('a code would be emailed — use 123456')`
  - 分别显示非学校邮箱、已被绑定、验证码错误的提示
  - 这个组件也用于 `expired` 身份的重新验证，成功后回到原来所在的页面
- [X] T033 [P] [US2] 新建 `app/(onboarding)/onboarding/admitted/page.tsx` 和 `components/onboarding/admitted-upload.tsx`：文件选择只记录文件名，提示 "Sample: the file is not uploaded"；提交后显示"已录取 · 审核中"
- [X] T034 [US2] 新建 `components/profile/required-profile-form.tsx`：
  - 包含 T010 列出的全部必填项，生活习惯（`sleep`、`cleanliness`、`smoking`、`pets`）用快选按钮
  - 选择 `housingStatus: 'group'` 时，显示 `groupHave` 和 `groupNeed`
  - 头像从 `public/sample/people/` 示例图库中选择
  - 不提供种族、宗教、国籍字段
  - 提交失败时，逐项标出缺失的字段
- [X] T035 [US2] 新建 `app/(onboarding)/onboarding/profile/page.tsx`：使用 `required-profile-form`，完成后跳转到 `/roommates`
- [X] T036 [US2] 新建 `components/onboarding/visitor-preview.tsx`（模糊的室友卡片和转租卡片：照片模糊，只显示名字首字母，不显示联系入口；点击时提示 "Sign up and verify to see more"），并在落地页 `app/page.tsx` 中展示

**Checkpoint**：两条入驻路径都能走通；`admitted-pending` 的标识需要等 US7 的后台审核后才会变化，在那之前可以用 `admitted-17` 身份查看"已录取 ✓"的样子。

---

## Phase 5: User Story 3 - 找室友并建立联系 (Priority: P1)

**Goal**：室友列表和筛选、资料详情、消息请求（一条消息、每日上限、冷却期、过期）、接受、删除或拉黑、聊天、防骗提醒、示例邮件提醒。

**Independent Test**：在 `student-free` 和另一个身份之间完成"发请求 → 接受 → 聊天 → 触发防骗提醒"；删除和拉黑后，状态都符合规格；发第 11 条请求时被拦下。

- [X] T037 [P] [US3] 在 `lib/rules/fraud.ts` 中实现 `detectFraudSignals(text)`，返回 `('phone' | 'external-handle' | 'payment')[]`：
  - `phone`：识别北美号码格式和 11 位中国手机号
  - `external-handle`：识别 `wechat`、`weixin`、`微信`、`instagram`、`ig`、`whatsapp`、`@handle`
  - `payment`：识别 `deposit`、`定金`、`押金`、`zelle`、`venmo`、`wire`、`transfer`、`转账`、`paypal`、`cashapp`
- [X] T038 [P] [US3] 在 `lib/rules/fraud.test.ts` 中覆盖每一类命中、混合命中、正常消息不误报（例如 "I transferred schools"），并决定是否接受这种误报，在测试中写明
- [X] T039 [P] [US3] 在 `lib/rules/visibility.ts` 中实现 `isHiddenFor(viewerId, targetId, blocks)`（两个方向都生效）和 `isBlurredForVisitor(persona)`
- [X] T040 [P] [US3] 在 `lib/rules/requests.ts` 中实现：
  - `requestsSentToday(world, fromId, now)`：按日历日计算
  - `isRequestExpired(req, now)`：`pending` 且创建超过 14 天
  - `canSendRequest(world, fromId, toId, now)`：依次检查以下条件，返回对应的 `reason`：
    1. 发送方未验证：`'unverified'`
    2. 任一方资料不完整：`'incomplete'`
    3. 有拉黑关系：`'blocked'`
    4. 已有 `pending` 或 `accepted` 的请求：`'duplicate'`
    5. 被删除后 30 天内：`'cooldown'`
    6. 今天已发 ≥ 10 条：`'daily-limit'`
- [X] T041 [P] [US3] 在 `lib/rules/requests.test.ts` 和 `lib/rules/visibility.test.ts` 中，为 T039、T040 的每一种 `reason` 和边界写单元测试：第 10 条可以发、第 11 条被拦；冷却期第 29 天和第 31 天；第 13 天和第 15 天的过期判断
- [X] T042 [US3] 在 `lib/demo/actions.ts` 中实现：
  - `sendRequest(toId, message, context)`：调用 `canSendRequest`；消息为空时拒绝；成功后调用 `recordSampleEmail`
  - `acceptRequest(id)`：创建 `Conversation`，调用 `recordSampleEmail` 通知发送方
  - `deleteRequest(id)`
  - `blockFromRequest(id)`：删除请求，并创建 `Block`
  - `block(targetId)`
  - `sendMessage(conversationId, body)`：写入 `fraudSignals = detectFraudSignals(body)`
  - 读取 `world` 时，把已过期的 `pending` 请求视为 `expired`
- [X] T043 [P] [US3] 新建 `components/roommates/roommate-card.tsx`：头像、名字、验证标识、预算、入住时间、当前状态、生活习惯标签；访客时模糊显示；有"创始会员"荣誉标识时显示，样式和验证标识明显不同
- [X] T044 [P] [US3] 新建 `components/roommates/roommate-filters.tsx`：预算区间、入住日期、区域或楼、性别、生活习惯（`sleep`、`cleanliness`、`smoking`、`pets`）。不提供种族、宗教、国籍筛选；预留一个 "Same building" 选项的位置，由 US6 接入
- [X] T045 [US3] 新建 `components/roommates/roommate-list.tsx` 和 `app/(app)/roommates/page.tsx`：只列出 `isListed` 为真、且 `isHiddenFor` 为假的资料；没有结果时显示空状态，建议放宽条件；访客可以浏览模糊卡片
- [X] T046 [US3] 新建 `components/roommates/profile-detail.tsx` 和 `app/(app)/roommates/[id]/page.tsx`（params 按 research R3 处理）：
  - 显示全部资料、验证标识，以及 "Member since {createdAt}"
  - 匹配度区域先放一个模糊占位和 "Members only" 入口，由 US5 接入
  - "Send message request" 按钮
  - "…" 菜单中有 Block，Report 由 US7 接入
  - 访客点任何操作时，引导去注册
- [X] T047 [US3] 新建 `components/messages/request-composer.tsx`（dialog）：只允许填一条消息；发送成功后显示 "Waiting for reply"；失败时按 `reason` 显示对应的英文说明（例如 daily-limit 显示 "You can send 10 new requests a day"）；发送成功后调用 `showSampleNotice('an email would notify them')`
- [X] T048 [US3] 新建 `components/messages/inbox.tsx` 和 `app/(app)/messages/page.tsx`：三个 tab，Requests（收到的请求，过期的显示 "Expired"）、Sent（发出的请求及其状态）、Chats（聊天）
- [X] T049 [US3] 新建 `components/messages/request-detail.tsx` 和 `app/(app)/messages/requests/[id]/page.tsx`：
  - 显示发送方的资料摘要和唯一的那条消息
  - Accept 进入聊天；Delete 需要确认，并说明对方 30 天内不能再发；Block 需要确认
  - 回应一条已过期或已失效的请求时，提示请求已失效
- [X] T050 [US3] 新建 `components/messages/chat-view.tsx` 和 `app/(app)/messages/[id]/page.tsx`：
  - 首次进入时，置顶显示 "Never pay before you've seen the place in person"
  - 带有 `fraudSignals` 的消息下方，双方都显示防骗提醒卡片，但消息照常显示
  - 当前身份是 `admitted-17` 时，额外常驻一条更醒目的安全提示

**Checkpoint**：找室友这条主线（P1）完整可以演示。US1、US2、US3 合起来就是 MVP。

---

## Phase 6: User Story 4 - 浏览和发布转租帖 (Priority: P2)

**Goal**：转租列表和筛选、详情（建立联系后才显示精确地址）、联系发帖人、发帖（必填项、声明、示例照片、可选租约）、我的帖子（标记已转出、确认是否还有效）。

**Independent Test**：浏览、筛选、打开详情，确认看不到地址；联系发帖人并被接受后，能看到地址；发帖时缺必填项被拦下；填完后发帖，确认显示"租约审核中"；标记已转出后，帖子从列表中消失。

- [X] T051 [P] [US4] 在 `lib/rules/sublets.ts` 中实现：
  - `missingSubletFields(fields)`：必填为 `area` 或 `buildingId`、`rent`、`startDate`、`endDate`（"必须晚于 startDate"）、`roomType`、`furnished`、`photos[]`（"至少 1 张"）、`roommatesInfo`、`onLeaseDeclared`（"必须为 true"）
  - `subletStatusAt(sublet, now)`：
    - 已经是 `subleased` 或 `removed` 的，保持原状态
    - `endDate` 已过：`expired`
    - `staleNotifiedAt` 之后 7 天仍未确认：`expired`
    - `updatedAt` 距 `now` ≥ 30 天：`stale`
    - 其他情况：`active`
  - `isSubletListed(sublet, now)`：状态为 `active` 或 `stale`
  - 发帖资格：已验证即可，毕业生在验证有效期内也可以
- [X] T052 [P] [US4] 在 `lib/rules/visibility.ts` 中加入 `canSeeExactAddress(viewerId, sublet, conversations)`：发帖人本人，或者和发帖人之间有 `accepted` 的会话
- [X] T053 [P] [US4] 在 `lib/rules/sublets.test.ts` 中为 T051 写单元测试，并在 `lib/rules/visibility.test.ts` 中为 T052 追加测试：缺单个必填项、日期倒置、第 29 天和第 30 天、提醒后第 7 天、已过 `endDate`、已转出
- [X] T054 [US4] 在 `lib/demo/actions.ts` 中实现：
  - `createSublet(fields)`：用 `missingSubletFields` 校验；上传了租约时，设 `lease.status = 'pending'`
  - `markSubleased(id)`
  - `confirmStillAvailable(id)`：刷新 `updatedAt`，清空 `staleNotifiedAt`
  - 联系发帖人：复用 `sendRequest`，`context: { type: 'sublet', subletId }`
- [X] T055 [P] [US4] 新建 `components/sublets/sublet-card.tsx` 和 `components/sublets/sublet-filters.tsx`（筛选项：区域或楼、价格区间、日期、房型、是否带家具）；租约状态标识显示 "Lease verified" 或 "Lease under review"；访客时模糊显示
- [X] T056 [US4] 新建 `app/(app)/sublets/page.tsx`：只列出 `isSubletListed` 的帖子，并排除 `isHiddenFor` 的发帖人；页面上有 "Post a sublet" 入口
- [X] T057 [US4] 新建 `components/sublets/sublet-detail.tsx` 和 `app/(app)/sublets/[id]/page.tsx`：照片、价格、日期、房型、室友情况；精确地址由 `canSeeExactAddress` 控制，不满足时显示 "Exact address shown after you connect"；"Contact poster" 打开 `request-composer`（`context` 为 sublet）
- [X] T058 [US4] 新建 `components/sublets/sublet-form.tsx` 和 `app/(app)/sublets/new/page.tsx`：
  - 包含 T051 列出的全部必填项
  - 照片从 `public/sample/rooms/` 中多选
  - 必须勾选 "I'm on the lease or a roommate on it"
  - 可以上传租约，只记录文件名，并提示 "Sample: the file is not uploaded"
  - 当前身份是 `admitted-17` 时，显示醒目的安全提示
  - 需要 `access-gate` 的 `verified-complete`
- [X] T059 [US4] 新建 `app/(app)/me/sublets/page.tsx`：
  - 列出当前用户的帖子及其状态
  - 每条帖子都有 "Mark as subleased" 按钮
  - `stale` 状态的帖子显示 "Still available? Confirm within 7 days" 和 "Confirm" 按钮
  - 显示租约审核状态

**Checkpoint**：转租板块可以独立演示；租约变为"已核验"需要 US7 的后台审核。

---

## Phase 7: User Story 5 - 为你推荐与会员 (Priority: P2)

**Goal**：免费用户和会员看到的"为你推荐"不同、资料页上的匹配度区域、会员页（权益和示例价格）、创始会员邀请（50 人、30 个名额、资格条件）、会员专属功能（新提醒、置顶、谁看过我）、内部账号的免费视角。

**Independent Test**：免费用户解锁 3 人，第 4 人和排名前 3 的人都被拦下；切换到会员身份后全部可见；切到 `reached50` 后，符合条件的人看到邀请、不符合的人看到还缺哪些条件；领取直到名额满；选择付费方案只有示例提示。

- [X] T060 [P] [US5] 在 `lib/rules/matching.ts` 中实现：
  - `rankedMatches(world, viewerId)`：只包含 `isListed`、未被拉黑、且双方都 `aiMatchConsent` 的人，按 `score` 降序排列
  - `unlocksThisWeek(unlocks, viewerId, now)`：周一 0 点重置
  - `canUnlock(world, viewerId, targetId, now)`：排名前 `TOP_MATCHES_MEMBER_ONLY` 位返回 `'top-member-only'`；本周已解锁 ≥ 3 次返回 `'weekly-limit'`；没有同意 AI 匹配返回 `'no-consent'`
- [X] T061 [P] [US5] 在 `lib/rules/membership.ts` 中加入：
  - `foundingSeatsLeft(world)`：`FOUNDING_SEATS` 减去已用名额
  - `foundingEligibility(world, accountId, now)`，返回 `{ eligible, missing[] }`。`missing` 的取值：
    - `'threshold'`：世界状态不是 `reached50`
    - `'verified'`：未验证
    - `'profile'`：资料不完整
    - `'questionnaire'`：问卷未完成
    - `'account-age'`：注册不满 7 天
    - `'reports'`：有被处理过的举报，即结果为 `warned`、`removed` 或 `banned`
    - `'seats'`：已用名额 ≥ 30
- [X] T062 [P] [US5] 在 `lib/rules/matching.test.ts` 和 `lib/rules/membership.test.ts` 中为 T060、T061 写单元测试：第 3 次解锁可以、第 4 次被拦；解锁排名第 1 被拦；跨周重置；`missing` 的每一项分别单独命中；名额为 29 和 30 时的结果
- [X] T063 [US5] 在 `lib/demo/actions.ts` 中实现：
  - `unlockMatch(targetId)`：调用 `canUnlock`
  - `claimFounding()`：调用 `foundingEligibility`；成功后建立 `kind: 'founding'` 的会员资格，`endsAt` 为学期结束日，`lifetimeDiscount` 为季票 5 折
  - `choosePlan(kind)`：只返回示例提示，不改变会员资格
  - `boostProfile()`：设 `boostedUntil = now + 7 天`
  - 查看他人资料时，写入一条 `ProfileView`
- [X] T064 [US5] 新建 `components/for-you/for-you-list.tsx` 和 `app/(app)/for-you/page.tsx`：
  - 顶部显示 "N strong matches for you"
  - 免费用户：卡片显示分数和 `oneLiner`，头像和名字模糊；可解锁的卡片上有 "Unlock (x of 3 left this week)" 按钮；排名前 3 的卡片显示 "Members only"；被拦下时引导到 `/me/membership`
  - 会员：全部可见，并显示完整的 `reasons`
  - 所有分数旁边都放 `SampleBadge`
- [X] T065 [US5] 新建 `components/for-you/match-panel.tsx`，并接入 US3 的 `components/roommates/profile-detail.tsx` 替换占位：免费用户看到模糊的分数和理由区域，以及 "Members only" 按钮；会员看到分数和完整理由
- [X] T066 [US5] 新建 `components/membership/membership-page.tsx` 和 `app/(app)/me/membership/page.tsx`：
  - 列出四项权益，并标出当前用户已解锁的
  - 价格卡片：Monthly $4.99、Season pass $9.99 / 3 months（标注为推荐）、7-day free trial；点击时调用 `showSampleNotice('no payment is taken')`
  - 创始会员区块：显示资格（把 `missing` 翻译成可读的英文清单）、剩余名额、领取按钮；名额已满时提示 "All 30 founding spots are taken"，并引导到付费方案
  - 创始会员说明 "Free until end of semester, then lifetime 50% off the season pass"
- [X] T067 [US5] 新建 `components/membership/founding-invite.tsx`（dialog），挂载到 `app/(app)/layout.tsx`：当 `reached50`、当前身份符合条件且还没领取时，自动弹出一次（关闭的状态记录在 `world` 里）
- [X] T068 [US5] 新建 `components/membership/member-perks.tsx`：
  - "Who viewed me" 列表
  - "Boost my profile for 7 days" 按钮；置顶期间，资料在室友列表中排在前面（修改 US3 的 `roommate-list.tsx` 排序）
  - "New match alerts"：示例提醒列表，附 `showSampleNotice('an email would be sent')`
  - 免费用户看到锁定状态和升级入口
- [X] T069 [US5] 会员标识的可见性：会员标识只在当前用户自己的 `/me` 和 `/me/membership` 中显示，`roommate-card` 和 `profile-detail` 中不显示会员标识（只显示创始会员荣誉标识）。确认 `member-internal` 打开 `viewAsFree` 后，T064 到 T068 的所有组件都按免费用户渲染

**Checkpoint**：推荐和会员都可以独立演示；"谁看过我"和"置顶"在 US6 的 `/me` 页面中有入口。

---

## Phase 8: User Story 6 - "我的"、同楼与隐私设置 (Priority: P3)

**Goal**：`/me` 总页、编辑资料、详细问卷（同意用于 AI 匹配）、"正在找 / 暂停"、同楼显示开关和同楼筛选、邮件提醒开关、删除账号、用户协议和隐私政策。

**Independent Test**：编辑资料、填写问卷；暂停后从列表中消失；开启同楼显示后，在同楼筛选中看到自己；删除账号后回到未登录状态。

- [X] T070 [P] [US6] 在 `lib/rules/visibility.ts` 中加入 `buildingMembers(world, buildingId, viewerId)`：只返回 `showInBuilding === true`、`isListed`、且未被拉黑的人；当 viewer 未验证时返回空数组。在 `lib/rules/visibility.test.ts` 中追加对应的测试
- [X] T071 [US6] 在 `lib/demo/actions.ts` 中实现：
  - `updateProfile(fields)`：必填项仍用 `missingRequiredFields` 校验
  - `saveQuestionnaire(answers, consent)`
  - `setSearchStatus(status)`
  - `setShowInBuilding(bool)`
  - `setEmailNotifications(bool)`
  - `deleteAccount()`：移除当前用户的资料、帖子、请求、会话，并把账号标为 `deleted`，然后切到 `visitor`
- [X] T072 [US6] 新建 `app/(app)/me/page.tsx` 和 `components/me/me-hub.tsx`：
  - 头像、验证标识、会员状态（仅本人可见）
  - "Looking / Paused" 开关；自动暂停时说明 "Paused after 30 days of inactivity"
  - 入口：Edit profile、Questionnaire、My sublets、Membership、Settings，以及 `member-perks`
  - `expired` 身份时，显示重新验证的入口，跳到 `/onboarding/verify`
- [X] T073 [P] [US6] 新建 `app/(app)/me/profile/page.tsx`：复用 `required-profile-form`，并加上选填部分 `components/profile/optional-profile-fields.tsx`（`major`、`languages`、`bio`、`buildingId` 楼名选择器、`roommateGenderPref`）
- [X] T074 [P] [US6] 新建 `components/profile/building-picker.tsx`：只列出 `active` 的楼盘和片区，最后一项为 "Other"
- [X] T075 [P] [US6] 新建 `app/(app)/me/questionnaire/page.tsx` 和 `components/profile/questionnaire-form.tsx`：问题包括 `guests`、`noise`、`cooking`、`study`、`sharing`，以及 "Allow Verimate to use this for AI matching" 同意开关
- [X] T076 [P] [US6] 新建 `app/(app)/me/settings/page.tsx`：
  - 邮件提醒开关，说明发到 Google 登录邮箱
  - "Show me in my building's list" 开关，默认关闭，附隐私说明
  - Terms 和 Privacy 的链接
  - "Delete account" 按钮：二次确认，删除后跳转到 `/`
- [X] T077 [US6] 在 US3 的 `components/roommates/roommate-filters.tsx` 中接入 "Same building" 筛选，使用 `buildingMembers`；当前用户没有选楼时，提示先在资料里选楼
- [X] T078 [P] [US6] 新建 `app/terms/page.tsx` 和 `app/privacy/page.tsx`：示例草稿，带 `SampleBadge`。用户协议写明平台只提供信息和联系渠道、不参与交易、不担保房源、举报 48 小时内处理；隐私政策写明可以随时删除账号，审核材料在审核完成后删除

**Checkpoint**："我的"相关功能和同楼功能都可以独立演示。

---

## Phase 9: User Story 7 - 举报与团队后台 (Priority: P3)

**Goal**：用户可以举报人或帖子；后台包括概览、录取材料审核、租约审核、举报队列、楼盘列表、创始会员名额；后台的操作结果同步到普通用户界面。

**Independent Test**：举报一条帖子 → 切到 `admin` 下架 → 切回，确认帖子消失；在后台通过一份录取材料，确认对应用户的标识发生变化；非管理员访问 `/admin` 显示"无权访问"。

- [X] T079 [US7] 在 `lib/demo/actions.ts` 中实现：
  - `report(target, reason, note)`：新建 `status: 'open'` 的举报
  - `reviewVerification(id, decision)`：通过时设 `approved`、`verifiedAt = now`、`expiresAt = verifiedAt + 12 个月`；无论通过还是拒绝，都清空 `documentName`
  - `reviewLease(subletId, decision)`：设 `verified` 或 `rejected`，并清空 `documentName`
  - `resolveReport(id, resolution)`：`removed` 时，对应帖子的 `status` 设为 `removed`；`banned` 时，对应账号的 `status` 设为 `banned`
  - `addBuilding(name, kind)`
  - `toggleBuilding(id)`
  - 所有后台动作都要求当前身份是 `admin`
- [X] T080 [P] [US7] 新建 `components/report/report-dialog.tsx`：理由选择（Scam、Fake profile、Harassment、Inappropriate、Other）和备注；提交后提示 "We'll review within 48 hours"。接入 `profile-detail.tsx` 和 `sublet-detail.tsx` 的 "…" 菜单
- [X] T081 [US7] 新建 `app/admin/layout.tsx`：使用 `access-gate`，参数为 `require="admin"`；侧边或顶部导航包括 Overview、Admissions、Leases、Reports、Buildings、Founding
- [X] T082 [P] [US7] 新建 `app/admin/page.tsx`：显示待审核的录取材料、待审核的租约、待处理的举报数量，以及创始会员已用名额
- [X] T083 [P] [US7] 新建 `app/admin/admissions/page.tsx` 和 `components/admin/review-queue.tsx`：逐条显示申请人和文件名，提供 Approve 和 Reject；处理后显示 "Document deleted — only the result is kept"
- [X] T084 [P] [US7] 新建 `app/admin/leases/page.tsx`：复用 `review-queue`，调用 `reviewLease`
- [X] T085 [P] [US7] 新建 `app/admin/reports/page.tsx` 和 `components/admin/report-queue.tsx`：显示被举报对象、理由、举报时间和 "Due in {48h 倒计时}"，操作为 Remove、Warn、Ban、Dismiss
- [X] T086 [P] [US7] 新建 `app/admin/buildings/page.tsx`：楼盘和片区列表，支持新增（name、kind）和停用；停用后不再出现在 `building-picker` 中
- [X] T087 [P] [US7] 新建 `app/admin/founding/page.tsx`：显示已用名额 / 30 和领取名单，并标明当前世界状态（`below50` 或 `reached50`）

**Checkpoint**：所有用户故事都可以独立演示，跨故事的闭环（录取审核、租约审核、举报下架）全部打通。

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**：边界情况、示例标注覆盖、文档、质量门禁。

- [X] T088 逐项核对 spec.md 的 Edge Cases，补齐遗漏：
  - 绑定已被使用的邮箱
  - `expired` 身份不能发帖或联系
  - `admitted-17` 的安全提示
  - 30 天不活跃自动暂停的说明
  - 回应已失效的请求
  - 拉黑后，对方在列表、推荐、同楼、转租中都不出现
  - 筛选无结果时的空状态
  - 刷新后数据保留
  - `banned` 身份只看到封号说明
  - 所有表单错误都给出可读的提示
- [X] T089 [P] 走查所有页面，确认每一处示例内容都有 `SampleBadge` 或示例提示（SC-004）
- [X] T090 [P] 走查所有主要流程，确认没有死路，也没有不起作用的按钮（SC-001）；所有标签和返回按钮都有去处
- [X] T091 [P] 更新 `AGENTS.md`：
  - 技术栈中加入 Vitest，常用命令中加入 `npm test`
  - 项目速览中登记 `lib/rules/`（业务规则纯函数，配单元测试）、`lib/demo/`（示例层，替换为真实功能时删除）、`public/sample/`（示例素材，授权待确认）、`components/` 下新增的子目录
  - 写明示例层的约定：示例代码只放在 `lib/demo/`，组件通过 `useDemo()` 访问数据
  - 项目速览中"当前为占位首页"的描述改为"全流程示例 demo"
- [X] T092 运行 `npm run lint`、`npm run typecheck`、`npm test`、`npm run build`，修复所有错误。`build` 中不能出现"在 Suspense 之外访问运行时数据"的报错
- [X] T093 用内置浏览器在 375px 宽度下，按 `specs/001-clickable-flow-demo/quickstart.md` 执行 19 项冒烟测试，并在电脑宽度下复查第 19 项。修复发现的问题，在交付说明中逐项写明结果，以及哪些是示例、哪些是真实可用

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup（Phase 1）**：没有依赖。
- **Foundational（Phase 2）**：依赖 Setup，阻塞所有用户故事。
- **US1（Phase 3）**：依赖 Foundational。它提供演示面板（切换身份），是其余故事做独立测试的前提，所以应该最先完成。
- **US2 到 US7（Phase 4 到 9）**：依赖 Foundational 和 US1；彼此之间的依赖如下。
- **Polish（Phase 10）**：依赖所有故事完成。

### User Story Dependencies

- **US2（入驻）**：只依赖 US1。录取材料的审核闭环需要 US7 才能完整演示。
- **US3（找室友）**：只依赖 US1。
- **US4（转租）**：联系发帖人复用 US3 的 `request-composer` 和 `sendRequest`，所以依赖 US3。租约审核闭环需要 US7。
- **US5（推荐与会员）**：T065 修改 US3 的 `profile-detail.tsx`，T068 修改 US3 的 `roommate-list.tsx`，所以依赖 US3。
- **US6（我的）**：T073 复用 US2 的 `required-profile-form`，T077 修改 US3 的 `roommate-filters.tsx`，所以依赖 US2 和 US3。
- **US7（后台）**：T080 修改 US3 的 `profile-detail.tsx` 和 US4 的 `sublet-detail.tsx`，所以依赖 US3 和 US4。

### Within Each User Story

- 先写规则函数和它的测试（`lib/rules/*`），再写 store 动作（`lib/demo/actions.ts`），最后写组件和页面。
- `lib/demo/actions.ts` 是共用文件，各故事中修改它的任务不能并行。

### Parallel Opportunities

- **Setup**：T003、T004、T005 可以并行。
- **Foundational**：T007 到 T012 可以并行（规则文件和类型文件互不依赖），之后 T013 到 T016 依次进行，T017 和 T018 可以并行。
- **US1 完成之后**：两人可以分头推进。比如一人做 US2 再做 US6，另一人做 US3、US4、US5，最后一起做 US7。
- **各故事内部**：标了 [P] 的规则、测试和独立页面可以并行。

---

## Parallel Example: User Story 3

```bash
# 先并行写规则和测试：
Task: "T037 detectFraudSignals in lib/rules/fraud.ts"
Task: "T039 isHiddenFor / isBlurredForVisitor in lib/rules/visibility.ts"
Task: "T040 canSendRequest in lib/rules/requests.ts"
Task: "T038 / T041 unit tests in lib/rules/*.test.ts"

# 动作（T042）完成后，再并行写独立组件：
Task: "T043 roommate-card in components/roommates/roommate-card.tsx"
Task: "T044 roommate-filters in components/roommates/roommate-filters.tsx"
```

## Parallel Example: User Story 7

```bash
# T079 和 T081 完成后，后台的各个页面可以并行：
Task: "T082 app/admin/page.tsx"
Task: "T083 app/admin/admissions/page.tsx"
Task: "T085 app/admin/reports/page.tsx"
Task: "T086 app/admin/buildings/page.tsx"
Task: "T087 app/admin/founding/page.tsx"
```

---

## Implementation Strategy

### MVP First（US1 + US2 + US3，三个 P1 故事）

1. 完成 Phase 1 Setup 和 Phase 2 Foundational。
2. 完成 US1（演示框架）→ **验证**：横幅、身份切换、重置都正常。
3. 完成 US2（入驻）和 US3（找室友与联系）→ **验证**：quickstart 第 1 到 8 项。
4. 到这里，"找室友"主线已经可以对外演示。

### Incremental Delivery

1. 加入 US4（转租）→ 验证 quickstart 第 13、14 项。
2. 加入 US5（推荐与会员）→ 验证第 9 到 12 项。比赛演示的亮点在这里。
3. 加入 US6（我的、同楼）→ 验证第 15 项。
4. 加入 US7（后台）→ 验证第 4、16、17 项的闭环。
5. 完成 Polish → 跑完全部 19 项和质量门禁。

每完成一个故事，都可以单独提交、单独演示，不破坏前面的故事。

### 之后逐条替换为真实功能

每次替换一条流程时：
- 为它写新的规格；
- 规则函数（`lib/rules/`）直接在服务端复用；
- 删掉 `lib/demo/` 中对应的部分；
- 把 `flow-status.ts` 中对应的项改为 `'live'`。

---

## Notes

- [P] 表示不同文件、且不依赖未完成的任务。
- 每个任务或每组相关任务完成后提交一次。提交前，husky 会自动运行 Biome 和 tsc。
- 不要把示例数据写进组件；不要在组件中写业务规则。
- 本功能不修改 `lib/supabase/`，不添加 `proxy.ts`，不建任何数据库表。

---

## 实现备注（与原任务描述的差异）

- **T001 / T002**：Vite 已原生支持 `resolve.tsconfigPaths`，所以没有保留 `vite-tsconfig-paths` 插件，`vitest.config.mts` 直接用原生选项。
- **T005**：实现期间规格改为"视觉风格不参考旧 demo，由产品负责人决定"。`app/globals.css` 保留了 `--primary-tint`、`--verified`、`--verified-tint` 这几个主题变量，但取值改为中性占位值，没有用旧 demo 的品牌红和验证绿。
- **T007**：领域实体类型放在 `lib/rules/types.ts`（规则函数也要用，替换为真实功能时不随示例层删除），`lib/demo/types.ts` 只放 `DemoWorld`、示例身份等示例层类型。
- **新增文件**：
  - `lib/demo/personas.ts`：示例身份表
  - `lib/demo/selectors.ts`：示例世界的查询工具
  - `lib/demo/sample-media.ts`：示例图片列表
  - `lib/rules/time.ts`：时间工具
  - `lib/rules/test-fixtures.ts`：单元测试用的数据构造函数
  - `components/shell/labels.ts`、`components/shell/choice-chips.tsx`：通用文案和快选按钮
  - `components/onboarding/browse-as-visitor.tsx`：落地页"以访客身份浏览"按钮
- **默认身份**：示例世界默认是"访客"，打开链接看到的是真实的访客视角；落地页的"Browse as visitor"会切回访客。
- **BanGate**：`(app)` 布局额外加了一层封号拦截，被封号的身份在主应用里任何页面都只看到封号说明（对应 Edge Cases）。
- **choosePlan()**：不改变任何状态，只让界面显示"示例：不会收取任何费用"。
