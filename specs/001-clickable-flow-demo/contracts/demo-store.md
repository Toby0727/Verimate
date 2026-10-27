# Contract: 示例 store 与规则函数

页面组件只通过这两层访问数据和规则。日后把某条流程替换为真实功能时：
- 对应的 store 动作改为调用 Server Function；
- `lib/rules/` 中的规则函数保持不变，在服务端复用；
- `lib/demo/` 中对应的部分随之删除。

## `lib/demo/`（示例层）

所有文件头都注明"示例数据，替换为真实功能时删除"。

| 模块 | 职责 |
| --- | --- |
| `seed.ts` | `createSeedWorld(now): DemoWorld`，按 data-model 中的"种子数据规模"生成示例世界，所有时间都相对于 `now` |
| `store.ts` | 模块级 store：从 `localStorage` 读写（键为 `verimate-demo-v1`，版本号不一致时重置），提供 `subscribe` 和 `getSnapshot`；`getServerSnapshot` 返回 `null` |
| `use-demo.ts` | `useDemo()` 返回 `{ world, me, persona, entitlements, actions } \| null`，为 `null` 时表示还没载入，组件显示骨架屏 |
| `actions.ts` | 所有会修改示例世界的动作。每个动作先调用对应的规则函数，不通过时返回 `{ ok: false, reason }` 供界面提示，通过时更新世界状态 |

**动作清单**（与用户故事对应）：

- **演示框架**：`switchPersona(id)`、`setViewAsFree(bool)`、`setVerifiedCount('below50' | 'reached50')`、`resetDemo()`
- **入驻**：`startNewUser()`、`submitBirthday(date)`、`choosePath(type)`、`verifySchoolEmail(email, code)`、`submitAdmittedDocument(fileName)`、`saveRequiredProfile(fields)`
- **资料**：`updateProfile(fields)`、`saveQuestionnaire(answers, consent)`、`setSearchStatus('active' | 'paused')`、`setShowInBuilding(bool)`、`setEmailNotifications(bool)`、`deleteAccount()`
- **联系**：`sendRequest(toId, message, context)`、`acceptRequest(id)`、`deleteRequest(id)`、`blockFromRequest(id)`、`block(targetId)`、`sendMessage(conversationId, body)`
- **转租**：`createSublet(fields)`、`markSubleased(id)`、`confirmStillAvailable(id)`
- **推荐与会员**：`unlockMatch(targetId)`、`claimFounding()`、`choosePlan('monthly' | 'season')`。`choosePlan` 只返回示例提示，不改变会员资格
- **举报**：`report(target, reason, note)`
- **后台**：`reviewVerification(id, 'approved' | 'rejected')`、`reviewLease(subletId, 'verified' | 'rejected')`、`resolveReport(id, resolution)`、`addBuilding(name, kind)`、`toggleBuilding(id)`

**副作用**：凡是需求中会"发邮件"的动作（收到新请求、请求被接受），都会往 `sentEmails` 追加一条记录，并在界面上提示"Sample: an email would be sent"。

## `lib/rules/`（业务规则，纯函数，单元测试覆盖）

所有函数都不读取 `Date.now()`，时间一律通过 `now` 参数传入。

| 文件 | 函数 |
| --- | --- |
| `constants.ts` | data-model 中"规则常量"一节列出的全部常量 |
| `verification.ts` | `isSchoolEmail(email)`、`isEmailTaken(email, verifications)`、`ageOn(birthDate, now)`、`canProceedWithAge(age, path)`、`badgeFor(verification, now)`、`isVerificationValid(v, now)` |
| `profile.ts` | `missingRequiredFields(profile)`、`isProfileComplete(profile)`、`isListed(account, profile, verification, now)`、`shouldAutoPause(account, now)` |
| `requests.ts` | `canSendRequest(world, fromId, toId, now)`，返回 `{ ok } \| { ok: false, reason: 'incomplete' \| 'blocked' \| 'duplicate' \| 'cooldown' \| 'daily-limit' \| 'unverified' }`；`requestsSentToday(...)`、`isRequestExpired(req, now)` |
| `fraud.ts` | `detectFraudSignals(text)`，返回命中类别（`phone`、`external-handle`、`payment`）的数组 |
| `visibility.ts` | `isHiddenFor(viewerId, targetId, blocks)`、`canSeeExactAddress(viewerId, sublet, conversations)`、`isBlurredForVisitor(...)`、`buildingMembers(world, buildingId, viewerId)` |
| `sublets.ts` | `missingSubletFields(fields)`、`subletStatusAt(sublet, now)`、`isSubletListed(sublet, now)` |
| `matching.ts` | `rankedMatches(world, viewerId)`、`unlocksThisWeek(unlocks, viewerId, now)`、`canUnlock(world, viewerId, targetId, now)`，返回 `{ ok } \| { ok: false, reason: 'top-member-only' \| 'weekly-limit' \| 'no-consent' }` |
| `membership.ts` | `entitlements(membership, viewAsFree)`、`foundingEligibility(world, accountId, now)`，返回 `{ eligible, missing[] }`；`foundingSeatsLeft(world)` |

## 不变量（测试和冒烟测试时核对）

- 任何列表、推荐、同楼列表中，都不会出现被拉黑方、暂停的用户、资料不完整的用户、验证失效的用户或被封号的用户。
- 免费用户永远看不到排名前 `TOP_MATCHES_MEMBER_ONLY` 位的身份信息。
- 示例世界之外不发生任何网络写入：没有真实邮件、没有真实付款、没有真实上传。
