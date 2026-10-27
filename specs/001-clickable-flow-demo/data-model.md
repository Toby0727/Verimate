# Data Model: 全流程可点通的 Demo

> 本文件描述的是**示例世界**的数据形状，全部存在浏览器里（见 research R1）。字段和状态的划分有意贴近日后的真实数据，替换时可以直接作为建表的参考，但这一版**不建任何数据库表**。时间字段统一使用 ISO 字符串。

## 全局：DemoWorld

整个示例世界序列化后存在 `localStorage['verimate-demo-v1']`。

| 字段 | 说明 |
| --- | --- |
| `version` | 数据结构版本号。与代码中的版本号不一致时，自动重置为种子数据 |
| `seededAt` | 种子生成时间，所有相对时间都以它为基准 |
| `currentPersonaId` | 当前扮演的示例身份 |
| `viewAsFree` | 内部账号是否打开了"以免费用户身份查看" |
| `verifiedCountOverride` | `"below50"` 或 `"reached50"`，用于演示创始会员邀请（FR-004） |
| `accounts`、`verifications`、`profiles`、`messageRequests`、`conversations`、`blocks`、`sublets`、`buildings`、`matches`、`unlocks`、`memberships`、`reports`、`profileViews`、`alerts` | 以下各实体的集合 |
| `sentEmails` | 示例邮件提醒日志，只用于在界面上展示"此处会发送邮件"，不真实发送 |

## 规则常量

这些常量集中定义在 `lib/rules/constants.ts`，数值来自需求文档。

| 常量 | 值 | 说明 |
| --- | --- | --- |
| `SCHOOL_EMAIL_DOMAINS` | `syr.edu`、`esf.edu` | 以后扩展城市时，在这里加新学校的后缀 |
| `MIN_AGE` | 18 | 17 岁的已录取新生走例外 |
| `VERIFICATION_VALID_MONTHS` | 12 | |
| `ADMITTED_GRACE_AFTER_TERM_START_DAYS` | 60 | 开学 2 个月后，未补验学校邮箱的"已录取"标识失效 |
| `DAILY_REQUEST_LIMIT` | 10 | 会员也一样 |
| `REQUEST_EXPIRY_DAYS` | 14 | |
| `REQUEST_COOLDOWN_AFTER_DELETE_DAYS` | 30 | |
| `INACTIVE_AUTO_PAUSE_DAYS` | 30 | |
| `SUBLET_STALE_DAYS` | 30 | 超过 30 天没有更新，提醒发帖人确认 |
| `SUBLET_CONFIRM_GRACE_DAYS` | 7 | 提醒后 7 天内不确认，自动下架 |
| `WEEKLY_FREE_UNLOCKS` | 3 | |
| `TOP_MATCHES_MEMBER_ONLY` | 3 | **假设值**：需求文档只说"最高的几位"，这里取 3，可以调整 |
| `FOUNDING_THRESHOLD_VERIFIED` | 50 | |
| `FOUNDING_SEATS` | 30 | |
| `FOUNDING_MIN_ACCOUNT_AGE_DAYS` | 7 | |
| `BOOST_DAYS` | 7 | |
| `REPORT_SLA_HOURS` | 48 | |
| `PRICES` | 月订阅 $4.99；季票 $9.99 / 3 个月；7 天试用 | 只用于展示 |
| `FRAUD_KEYWORDS` | 手机号格式、`wechat`/`weixin`/`微信`、`instagram`/`ig`、`whatsapp`、`deposit`、`定金`、`押金`、`zelle`、`venmo`、`wire`、`transfer`、`转账` 等 | 由 `detectFraudSignals()` 使用 |

## 实体

### Persona（示例身份）

演示面板里可以切换的预设角色，指向一个 `Account`。"访客"不对应任何账号。

| id | 对应的账号状态 |
| --- | --- |
| `visitor` | 未登录 |
| `new-user` | 刚完成示例 Google 登录，还没填生日（用于从头走一遍入驻） |
| `student-free` | 在校生 ✓，免费用户，资料完整；有收到的请求，也有发出的请求 |
| `admitted-pending` | 已录取 · 审核中 |
| `admitted-17` | 17 岁，已录取 ✓ |
| `member-internal` | 内部账号，拥有全部会员功能，可以切换为免费视角 |
| `admin` | 团队管理员 |
| `expired` | 验证已过期 |
| `banned` | 被封号 |

### Account（账号）

| 字段 | 规则 |
| --- | --- |
| `id`、`displayName` | 显示名为"名 + 姓氏首字母"格式 |
| `googleEmail` | 示例值；邮件提醒的收件地址 |
| `birthDate` | 不满 18 岁且不是已录取路径的，禁止继续入驻 |
| `role` | `user`、`internal` 或 `admin` |
| `status` | `active`、`banned` 或 `deleted` |
| `createdAt`、`lastActiveAt` | 在资料上显示"注册时间"；`lastActiveAt` 用来判断 30 天自动暂停 |
| `emailNotifications` | 布尔值，默认开启 |
| `onboardingStep` | `birthday`、`path`、`verify`、`profile` 或 `done` |

### Verification（验证记录）

| 字段 | 规则 |
| --- | --- |
| `accountId` | |
| `type` | `student`、`admitted` 或 `graduate` |
| `schoolEmail` | 后缀必须在 `SCHOOL_EMAIL_DOMAINS` 中；同一邮箱在所有账号中**唯一** |
| `school` | `SU` 或 `ESF` |
| `status` | `pending`、`approved`、`rejected` 或 `expired` |
| `verifiedAt`、`expiresAt` | `expiresAt = verifiedAt + 12 个月` |
| `documentName` | 录取材料的文件名。审核结束后清空，界面显示"已删除，只保留审核结果"（FR-053） |

**状态流转**：
- 学校邮箱路径：输入正确的示例验证码后，直接变为 `approved`。
- 已录取路径：上传材料后为 `pending`，管理员处理后变为 `approved` 或 `rejected`。
- 到期：`approved` 变为 `expired`。
- 重新验证：`expired` 回到 `approved`。

**派生标识**：在校生 ✓ / 已录取 · 审核中 / 已录取 ✓ / 毕业生 / 验证已过期。

### Profile（室友资料）

| 部分 | 字段 |
| --- | --- |
| 必填 | `photo`、`displayName`、`school`、`standing`（年级，或已录取的入学学期）、`gender`、`budgetMin` / `budgetMax`、`moveInFrom` / `moveInTo`、`housingStatus`（`has-place` / `needs-place` / `group`，选 `group` 时再填 `groupHave` 和 `groupNeed`）、`sleep`、`cleanliness`、`smoking`、`pets` |
| 选填 | `major`、`languages[]`、`bio`、`buildingId`、`roommateGenderPref` |
| 详细问卷 | `guests`、`noise`、`cooking`、`study`、`sharing` 等；`aiMatchConsent`（布尔值） |
| 状态 | `searchStatus`（`active` 或 `paused`）、`pausedReason`（`manual` 或 `inactive`）、`showInBuilding`（布尔值，默认关闭）、`boostedUntil` |

**规则**：
- `isProfileComplete()`：必填项全部有值。
- `isListed()`：资料完整、`active`、验证有效、账号状态为 `active`。只有满足这一条，才会出现在列表、推荐和同楼列表中。
- 没有任何关于种族、宗教、国籍的字段。

### MessageRequest（消息请求）

| 字段 | 规则 |
| --- | --- |
| `id`、`fromId`、`toId` | |
| `message` | 只有一条，不能为空 |
| `context` | `{ type: 'profile' }` 或 `{ type: 'sublet', subletId }` |
| `status` | `pending`、`accepted`、`deleted` 或 `expired` |
| `createdAt`、`respondedAt` | |

**状态流转**：
- 接收方接受：`pending` 变为 `accepted`，并创建一个 `Conversation`。
- 接收方删除：`pending` 变为 `deleted`，发送方 30 天内不能再向这个人发。
- 接收方拉黑：`pending` 变为 `deleted`，同时创建一条 `Block`。
- 14 天没有处理：`pending` 变为 `expired`。

**发送前检查**（`canSendRequest()`）：
- 双方的资料都完整
- 双方之间没有拉黑关系
- 双方之间没有处于 `pending` 或 `accepted` 的请求
- 不在删除后的冷却期内
- 今天发出的请求少于 10 条

### Conversation（聊天）和 Message（消息）

- `Conversation`：`id`、`participantIds[2]`、`requestId`、`createdAt`。第一次进入聊天时，显示付款提醒（FR-028）。
- `Message`：`id`、`conversationId`、`senderId`、`body`、`sentAt`、`fraudSignals[]`。`fraudSignals` 不为空时，双方都会看到防骗提醒（FR-027），但消息照常发出。

### Block（拉黑）

`blockerId`、`blockedId`、`createdAt`。`isHiddenFor(viewer, target)` 对两个方向都生效。

### Sublet（转租帖）

| 字段 | 规则 |
| --- | --- |
| `id`、`authorId` | 发帖人必须已验证。毕业生在验证有效期内也可以发 |
| 必填 | `area` 或 `buildingId`、`rent`、`startDate`、`endDate`（必须晚于 `startDate`）、`roomType`（`private` / `entire` / `shared`）、`furnished`、`photos[]`（至少 1 张）、`roommatesInfo`、`onLeaseDeclared`（必须为 `true`） |
| `exactAddress` | 只有已经和发帖人建立联系的人能看到（`canSeeExactAddress()`） |
| `lease` | `{ documentName, status: 'none' / 'pending' / 'verified' / 'rejected' }` |
| `status` | `active`、`stale`、`subleased`、`expired` 或 `removed` |
| `createdAt`、`updatedAt`、`staleNotifiedAt` | |

**状态流转**：
- 超过 30 天没有更新：`active` 变为 `stale`，提醒发帖人确认。
- 发帖人确认还有效：`stale` 回到 `active`。
- 提醒后 7 天内不确认：`stale` 变为 `expired`。
- 发帖人标记已转出：变为 `subleased`。
- 过了 `endDate`：变为 `expired`。
- 管理员下架：变为 `removed`。

**规则**：列表中只显示状态为 `active` 或 `stale` 的帖子。

### Building（楼盘 / 片区）

`id`、`name`、`kind`（`building` 或 `area`）、`city`（目前都是 `syracuse`）、`active`。由团队后台维护，列表最后有一个"其他"选项。

### Match（匹配结果，示例）

- 字段：`viewerId`、`targetId`、`score`（0 到 100）、`oneLiner`、`reasons[]`。全部是预置的示例值。
- 只有在双方都同意 `aiMatchConsent`、并且对方当前在列表中时才显示。
- **推荐排序**：按 `score` 从高到低。
- **免费用户**：排名前 `TOP_MATCHES_MEMBER_ONLY` 位不能解锁（`canUnlock()`）。

### Unlock（解锁记录）

`viewerId`、`targetId`、`unlockedAt`。本周已解锁的数量 ≥ 3 时，不能再解锁（周一 0 点重置）。

### Membership（会员资格）

| 字段 | 规则 |
| --- | --- |
| `accountId` | |
| `kind` | `free`、`founding`、`monthly`、`season` 或 `internal` |
| `startedAt`、`endsAt` | 创始会员的 `endsAt` 为学期结束日 |
| `lifetimeDiscount` | 仅创始会员有 |

**规则**：
- `entitlements(kind, viewAsFree)`：返回已解锁的权益，包括 AI 完整内容、新提醒、置顶、谁看过我。`internal` 加上 `viewAsFree` 时，按免费用户计算。
- `foundingEligibility(account, world)`：同时满足以下条件时可以领取，否则返回还缺哪些条件：
  - 世界状态为 `reached50`
  - 已验证
  - 资料完整
  - 问卷完成
  - 注册满 7 天
  - 没有被处理过的举报
  - 已用名额少于 30
- **会员标识**：只对本人可见。"创始会员"荣誉标识对他人可见。

### ProfileView（谁看过我）和 Alert（新提醒）

- `ProfileView`：`viewerId`、`targetId`、`viewedAt`。会员可以看到"谁看过我"列表。
- `Alert`：示例的"有新的符合条件的室友或转租帖"通知，只对会员显示，并附带"示例：此处会发送邮件"的标注。

### Report（举报）

| 字段 | 规则 |
| --- | --- |
| `id`、`reporterId` | |
| `target` | `{ type: 'account' / 'sublet', id }` |
| `reason`、`note` | |
| `status` | `open` 或 `resolved` |
| `resolution` | `removed`、`warned`、`banned` 或 `dismissed` |
| `createdAt`、`resolvedAt` | 界面显示"48 小时内处理" |

**处理结果**：
- `removed`：对应的转租帖变为 `removed`。
- `banned`：对应账号的 `status` 变为 `banned`。
- 有任何被处理过的举报（结果为 `warned`、`removed` 或 `banned`），都会让创始会员资格不满足。

## 种子数据规模

- 约 16 个示例室友资料：覆盖不同预算、日期、生活习惯、楼盘，以及暂停、不活跃、未完成等各种状态。
- 约 10 条示例转租帖：包括 `stale`、`subleased`、已核验、审核中等状态。
- 约 8 个楼盘和片区，作为占位。
- `student-free` 名下预置：2 条收到的请求，其中一条已过期；1 条发出的请求；1 段已经开始的聊天，内含一条触发防骗提醒的消息。
- 后台预置：2 份待审核的录取材料、1 份待审核的租约、2 条待处理的举报。
- 已用的创始会员名额：示例状态为 `reached50` 时设为 27，方便演示"名额将满"和"名额已满"。
