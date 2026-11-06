# Verimate 开发日志

> 每次开发结束后在最上面追加一段：做了什么、线上是什么状态、还有什么没做 / 没决定。
> 约定、架构、规则写在 `AGENTS.md`；这里只记"发生了什么、走到哪了"。

> 这个仓库是**公开的**：这里不写学生姓名 / 邮箱等个人信息，也不写还没修好的安全问题细节（细节在本地和 Supabase 后台）。

---

## 2026-11-06：扫码后的首次打开动画（已推送）

### 你要的
- 学生扫海报二维码第一次打开网站时放一段动画：学生通过 Verimate 互相找到，再和喜欢的室友搬进新家。不要老套、不要像 AI 做的；尽全力做好。

### 做了什么
- 第一版（圆形头像 + 认证勾 + 三角屋顶小房子 + 爱心 + "94% match"）被否了，整个重做。
- 新版约 6.4 秒：海报的大字"征友启事" "Night owl looking for night owl." 被橙色一笔划掉 "looking for"，换成 "found" 并写出 Verimate 对勾；然后画出一张两室一卫公寓的建筑平面图（给 Slocum 建筑学院的学生看，也是找房的人最熟的图），两条动线从门廊一起走进各自的卧室，椅子变橙、两盏台灯同时亮起："3:00 AM. Both lights on."；图签写 "TENANTS 2 night owls, 1 cat"、"MATCHED BY ✓ Verimate"。最后图纸先移走、背景再淡出，露出问卷首页，logo 位置不动。
- 两轮独立评审（美术指导、动效、刚扫码的学生、代码）。第一轮后改了：logo 交接时跳 6px、结尾太赶、动画要等 React 加载完才出现（现在由 `<head>` 里的小脚本在第一帧前决定并开始）、从 Privacy 返回会重播、手指滑动会滚动下面的页面、Instagram 用户会看两遍、平面图比例 / 床的位置 / 没有浴室、换词时字漏到别的行、对勾像通用的"成功"弹跳图标、墙的画法、亮灯节奏、小屏幕。第二轮后改了：桌面滚动条出现时整列左移约 8px、从 Instagram 换到 Safari 再用 Google 登录回来会再播一遍（现在任何一次到过问卷页、`?intro=0`、已登录都算看过）、Skip 一开始就能按、后台标签页等切到前台再播、播放时下面的页面对读屏和 Tab 隐藏、礼品卡入场动画等露出来再播、Skip 后焦点到 Google 按钮、客厅加窗、浴室加洗手池、加视图标题。
- **晚些时候：你说"这是什么，再做一个，效果要更炫"。** 换成 v2：三个硬切场景，黑底大字砸屏 + 抖动 + 闪白 + 走马灯 → 橙底两张室友卡片相撞（冲击波、火花、放射光、旋转印章 "VERIFIED MATCH"、"MATCHED."）→ 黑底门 3D 打开、光爆开铺满屏幕、"MOVE IN." → 画面像双开门一样裂开露出首页。约 6.2 秒，第一次打开 / Skip / 减少动态效果 / 登录后不播这些规则都没变。旧的平面图版备份在这台电脑的临时目录，没有进仓库。
- **再晚些：你说 v2 的 "night owl found night owl" 让人看不懂，要讲 app 的主体。** 换成 v3：开头 "Your sublet is right around you." 砸进来 + 雷达波 → 校园附近的地图上四个互不认识的学生各说自己的情况（要出国、要找春季的房、要毕业、要找暑期的房），出国那位的空房租金从 $950 滚到 $3,800，"3 blocks apart. Never met." → Verimate 的对勾砸进来，给四个人都打上认证勾，两两连线，"Verimate connects them." → 转租卡片盖上 SUBLEASED，"$3,800 wasted" 划掉翻成 "saved" → 房子的窗户一扇扇亮起，光铺满屏幕，"Feel at home."。约 7.5 秒后裂开露出首页，其他规则都没变。
- **修了一个只在实时播放时出现的 bug**：你打开导出的 HTML，标语之后一直停在走马灯画面。原因是场景切换的动画在实时播放时差一点点走不到终点（浮点数误差），上一场景不消失、下一场景不出现；之前逐帧跳着截图检查看不出来。已修好，网站和导出的 `docs/brand/intro/verimate-intro.html`（单文件，双击就能播）都实时播放截图确认过。
- **开场动画 v4（"meeting point"）**：你说 v3 "很俗"，让我去网上找好看的参考、配色和字体不变。我让 5 个研究员分别去看大公司的品牌片、App 引导动画、获奖网站的开场、动效设计规范、地图和连线可视化，再出两个方向，由评审挑一个合并。
  - 结论很一致：v3 的放大砸字、抖动、闪白、背景大字走马灯、发光、光线、粒子、雷达波、橡皮章都是"廉价特效"。好的做法是：一张静止的浅色页面，文字从遮罩里升上来，一次只动一样东西，没有回弹，品牌色只在关键时刻出现，品牌标志本身就是高潮。
  - 主要参考：Headspace 首页（一句话里只换一个词）、Linear 和 Vercel 首页（小幅度进场、画线）、Apple 的 "hello" 手写动画（一笔画完）、GitHub 地球（一条弧线、一圈涟漪）、Airbnb 品牌片（标志自己画出来）、Monzo 的动效原则（不是装饰，是沟通）、Material / IBM Carbon / Apple 的动效规范（曲线和时长）。
  - 现在的样子：浅灰底上一排四个白色街区；"Your sublet is right around you." → 街区里的黑点是学生，"Three blocks apart. Never met." → 两个人各画一条橙线朝对方延伸，接成 Verimate 的对勾，"They meet on Verimate." → 要出国的人离开，空房间显示 $950/mo，找房的人搬进来，房间填满橙色，"No rent wasted. Money saved." → 房间加上屋顶变成房子，"Feels like home." → 对勾飞进首页左上角 logo，浅灰淡出露出首页。约 8 秒，规则（只播一次、可跳过、减少动态效果和已登录不播）不变，新增屏幕小于 344×530 时不播。
  - 手机、小屏手机、桌面都实时播放截图确认过，对勾落点和 logo 完全重合；单文件演示 `docs/brand/intro/verimate-intro.html` 已更新。还没在真 iPhone 上看过。
- **v4 同日修改（按你的意见）**：
  - 黑点换成黑色小人（头 + 肩），要出国的人旁边有个行李箱。
  - "Abroad in spring" / "Needs a room" 改成更大的白色对话气泡，尾巴指着下面的人；认证对勾弹出时气泡晃一下。
  - 钱从右往左流：三枚 "$" 硬币从找房的人出发，沿两条线绕过对勾，流进左边她的房间，房间再填满橙色、找房的人搬进去。"$950/mo" 移到房间顶上，不和小人重叠。
  - 最后的房子比例改了：房间往两边变宽成房身（宽比高大），再落下一个 140px 宽、约 37° 的屋顶；原来那个又高又窄、屋顶很小的房子不要了。
  - 最后一句从 "Feels like home." 改成 "Find your match."。
  - 全长约 8.5 秒。单文件演示已重新导出。
- **加了音效**：网站开场动画有声音了（喇叭按钮在 Skip 左边；浏览器规定用户点过才能出声，所以扫码进来一般要点一下喇叭）。视频 `docs/brand/intro/verimate-intro.mp4` 改成逐帧渲染、结尾是 Verimate logo，网站结尾仍是首页。已推送。
- **改成每次打开网站都播**（你问登录后为什么没动画：原来每台设备只播一次，登录过的人也不播）。现在每个新标签页第一次打开 `/` 都播，登录过的人也播；同一个标签页里刷新或从 Google 登录回来不会再播，免得打断问卷。系统"减少动态效果"时不播，可 Skip。细节和坑见 `AGENTS.md` 的"首次打开动画"。
- 检查：在 390×844、390×664、375×548、360×560 和桌面宽度逐帧截图看过；实时走过：第一帧就出现（React 加载前）、自动结束后 Continue with Google 可点、logo 前后位置完全一致（手机和带滚动条的桌面都量过）、从 Privacy 返回不重播、第二次不播、`?intro=0` 之后再打开不播、已登录不播、减少动态效果不播、Tab 第一个是 Skip、Skip 后焦点到 Google 按钮、Instagram 里网址会加 `intro=0`。lint 和单元测试都过。
- 没在真 iPhone / Safari 上看过（这台电脑只有 Chromium），上线前用手机扫一次码看看。

### 注意
- `app/globals.css` 里同时有地图 `.pin` 样式等别的未提交改动，提交时分开暂存。
- 本地看：`npm run dev` 后打开 `/?preview=landing&intro`（这台电脑是 `http://localhost:3001/?preview=landing&intro`），刷新重播。

---

## 2026-11-06：团队后台加 Matches 板（已推送）

### 做了什么
- `/team` 新增"Matches"区：每个学期有多少人转租出去、多少人需要转租、多少人想找室友（横条图，点学期切换）。
- 转租连线图：需要转租的人连到同学期转租出去的人；对方的房子在他想住的区就是实线橙色，不知道在哪是虚线，在别的区是点线。点名字只看这个人的线。
- 室友配对：同学期、预算和区域都有交集的两个人，按生活习惯和共同爱好打分（0–100），写出原因（"Both night owls"、"3 hobbies in common"）和冲突（抽烟、宠物、作息相反）。
- 点任何名字，下面的名单会展开这个人的全部答案。
- 测试：单元测试 153 个全过（新增配对规则 9 个），lint、类型检查、生产构建都过；浏览器里在电脑和手机宽度都看过。

### 你需要做的
- [ ] 上线后打开 https://www.verimate.org/team 用真实数据看一下 Matches 区，配对不对劲就告诉 Claude。这次不用跑 SQL。

## 2026-11-05 中午：问卷加爱好页和"现在住哪"（紧急上线）

### 做了什么
- 问卷第 7 步（最后一步）"What are you into?"：29 个爱好，每个一个图标，点一下选中（橙色底 + 勾）；"Add your own"可以自己选图标、写名字，最多加 5 个。
- 第 5 步勾了"Sublet my place"的学期时，下面多一题"Where do you live now?"：可以自己写，也可以边打字边点已有公寓（51 栋，来自房源调研表）。
- 数据库迁移 v7（`supabase/migrations/20261105120000_waitlist_hobbies_and_home.sql`）：`hobbies`、`custom_hobbies`、`current_home` 三列和格式检查，`team_waitlist()` 多返回这三列。在本地临时 Postgres 里测过 16 种对 / 错的写入，全部按预期接受或拒绝。
- 团队后台显示爱好和现住址；隐私政策写明会收集这两项。
- 测试：单元测试 144 个全过，lint、类型检查、生产构建都过；手机尺寸走完整个问卷（含现住址建议和自定义爱好）。

### 你需要做的（顺序很重要）
- [ ] 在 Supabase SQL Editor 粘贴运行 v6 + v7（本地 `D:\projects\Roomie\WIP\11-5\run-in-supabase-v6-v7.sql` 是两段合在一起的，v6 重跑没关系）。
- [ ] 跑完告诉 Claude，再推到 `main`（这次推送也会带上海报和 v6 的两个提交）。

## 2026-11-05 凌晨：网站前端，按现在的流量来源改（未上线）

### 为什么
- 现在的报名主要从 Instagram 故事的链接进来，但 Instagram 自带浏览器里 Google 不让登录（Error 403: disallowed_useragent），点进来的人很可能直接卡住。
- 海报打的是作息、爱干净这些匹配点，问卷里却没有这几题；也不知道哪张海报带来了人。

### 做了什么（都在本地，**没推到线上，没提交**）
- 应用内浏览器提示：Instagram / TikTok / Snapchat 等里打开首页时，Google 按钮换成"Open in Safari / Chrome to sign in"提示卡，带复制链接；Android 可以一键在 Chrome 打开。
- 分享预览图：在 iMessage、Instagram 私信、Facebook 里发 verimateapp.com 会显示 logo、"Find a roommate. Win a $50 gift card." 和礼品卡。
- 来源追踪：链接加 `?src=xxx` 就能记下这个人是从哪来的，团队后台多了"Where sign-ups came from"。
- 问卷第 6 步加了作息、整洁度、访客三题；隐私政策同步写明。
- 测试：单元测试 114 个全过（新增浏览器识别 8 个、来源和新题 4 个、来源统计 1 个），lint、类型检查、生产构建都过；浏览器里用手机尺寸走过 iPhone / Android 提示卡、问卷第 6 步、团队后台来源卡片。

### 你需要做的（顺序很重要）
- [ ] 看一下改动，没问题就让 Claude 提交。
- [ ] 在 Supabase SQL Editor 跑 `supabase/migrations/20261105000000_waitlist_habits_and_source.sql`（**先跑 SQL 再推代码**，否则保存问卷会因为新列不存在而失败）。会提示 destructive，是因为要 drop 再重建 `team_waitlist()`，不动学生数据。
- [ ] 然后让 Claude 推到 `main`。
- [ ] Instagram 故事的 Link sticker 改成 `https://verimateapp.com/?src=ig-story`；以后每个故事 / 海报用不同的 src（比如 `ig-story-florence`），后台就能比较效果。
- [ ] 想按海报统计的话，让 Claude 给每张海报换成带 src 的二维码（例如 `?src=slocum-gym-rat`）。
- [ ] 真机在 Instagram 里打开一次链接，确认看到提示卡、复制链接后在 Safari 能登录。

---

## 2026-11-04 晚：新 logo 和 Persimmon 色板

### 做了什么
- 新 logo：两笔圆润的橙色对勾，不带底块，旁边是黑色 "Verimate"。从用户给的图描成矢量，放在 `docs/brand/final/`（SVG + 透明 PNG），网站顶栏、浏览器标签图标都换了。
- 全站品牌色从 Crimson 换成 Persimmon：填充 `#F8672E`，橙色文字用锈色 `#BF4306`，浅色 `#FDE9DF`（浅色是照截图估的）。验证勾、开关、抽奖小标签、礼品卡、地图校区、彩纸都换了。
- 白字放在亮橙色上对比度只有 3:1，看不清，所以礼品卡上的字改成黑色，倒计时改成白色小块 + 黑字。
- 宣传单、海报（含 -vercel 备用版）、Instagram story 全部按新 logo 和颜色重新生成，二维码都扫过。

### 你需要做 / 决定的
- [ ] 浅色 `#FDE9DF` 是估的，有准确色值的话告诉 Claude。
- [ ] 礼品卡如果想要白字，需要把卡片换成锈色 `#BF4306`（白字 5.2:1），告诉 Claude 即可。
- [ ] Google Cloud 的 OAuth Branding 没上传 logo，不用改。

---

## 2026-11-04：主域名换成 verimateapp.com

### 为什么
- SU 校园网拦截 verimate.org（学校 DNS 说域名不存在）。新买的 `verimateapp.com` 在校园网下实测能打开，所以所有地方都换成它。

### 做了什么（代码）
- 隐私政策和抽奖规则里的域名改成 verimateapp.com。邀请链接本来就用当前域名，不用改。
- 宣传单、横版海报（PNG / PDF / PPTX）、Instagram story 全部重新生成，二维码指向 `https://verimateapp.com`，三个尺寸扫码测过。`-vercel` 版本留作备用（万一学校以后也拦新域名）。
- 生成脚本的默认网址改成 verimateapp.com。

### 你需要做的（按顺序，顺序错了会登录失败）
- [ ] Supabase → Authentication → URL Configuration：Redirect URLs **加上** `https://verimateapp.com/**` 和 `https://www.verimateapp.com/**`（旧的先别删），保存。
- [ ] 同一页把 Site URL 改成 `https://www.verimateapp.com`，保存。
- [ ] Vercel → Domains：`www.verimateapp.com` 是主域名（已连好，`verimateapp.com` 已经跳到它）；把 `verimate.org` 和 `www.verimate.org` 改成 308 跳到 `www.verimateapp.com`。
- [ ] 校园网下用手机试一遍：打开 verimateapp.com → Google 登录 → 回到问卷；再打开 `/team` 看能不能登录。
- [ ] 已经贴出去的旧宣传单（verimate.org）在校园网下打不开，换成新的。
- [ ] 给 ITS 的邮件不急了；之后想让 verimate.org 也能在校园网打开再发。

---

## 2026-11-04：团队后台加"删除账号"

### 做了什么
- `/team` 里展开某个人，最下面有 **Delete account**。弹窗里要输入对方的邮箱才能点 **Delete forever**。
- 删除会去掉全部内容：登录账号、所有答案、照片、邀请码、抽奖资格。对方以后再用 Google 登录就是新账号。团队账号（包括自己）删不了。
- 每次删除在数据库里留一条记录（`private.team_deletions`）：谁删的、什么时候、那个人有没有答完 / 有没有照片。不存姓名和邮箱，用来证明抽奖公平。
- 顺手修了：团队名单加上 `hpang05@g.syr.edu`（SU 的 Google 账号是这个，不是 `@syr.edu`，之前因此进不去）；"没有权限"页面的句子不再被拆成三行。
- 本地用示例数据测过：邮箱没输对时按钮不能点，删除后名单和总数立刻更新。

### 你需要做 / 决定的
- [ ] 在 Supabase SQL Editor 跑 `supabase/migrations/20261104040000_team_delete_account.sql`（没跑之前点删除只会提示先跑 SQL，不会删任何东西）。
- [ ] 第一次真删之前，建议先拿一个自己的测试 Gmail 登录一次，再在 `/team` 里删掉它，确认流程正常。

---

## 2026-11-04 凌晨：团队后台 /team

### 做了什么
- 新增团队后台 `https://www.verimate.org/team`（校园网下用 `https://verimate.vercel.app/team`）：用 Google 登录，只有团队名单里的账号能看到数据（目前只有你一个人）。
- 能看到：总账号数、答完进入抽奖的人数、答到一半的人数、只登录没答的人数、学校 / 个人账号、照片数、被邀请人数；最近 14 天每天新增柱状图；最近动态（谁登录、谁开始答、谁答完）；每个人的名单，点开看全部答案、照片、邀请码、谁邀请的、抽奖权重和中奖概率。每分钟自动刷新。
- 权限在数据库里判断（`public.team_waitlist()` + `private.team_admins` 名单），网页本身不是安全边界。没有用 secret key。
- 本地用示例数据测过电脑和手机布局；单元测试、类型检查、lint、生产构建都通过。

### 你需要做 / 决定的
- [ ] 在 Supabase SQL Editor 跑 `supabase/migrations/20261104030000_team_dashboard.sql`。没跑之前 `/team` 只显示"One setup step left"，不影响问卷。
- [ ] 跑完后用 hpang05@syr.edu 登录 `/team`，确认能看到真实名单。
- [ ] 要加队友时告诉 Claude 他们的 Google 邮箱。

---

## 2026-11-03 夜：学校网打不开 verimate.org，换用 vercel.app 二维码

### 发生了什么
- 在 SU 校园网（Wi-Fi / 有线）下打不开 verimate.org，用手机流量可以。**网站本身没问题**：公共 DNS（8.8.8.8、1.1.1.1）都能解析到 Vercel，直接连 Vercel 返回 200。
- 问题出在学校的 DNS（`ns3.syr.edu`）：它对 `verimate.org` 和 `www.verimate.org` 回答"域名不存在"，而且这个回答是学校自己的服务器（`ns1.syr.edu`）签发的，不是 .org 注册局，说明是学校故意拦截。推测原因是域名刚注册（11 月初），被当成新域名过滤了（没有得到 ITS 确认）。
- 影响：在校园网下扫宣传单 / 海报二维码的学生都会打不开。`https://verimate.vercel.app` 在校园网下能正常打开。

### 做了什么
- 新做了一套宣传单和海报，二维码和下面那行网址都改成 `verimate.vercel.app`：`docs/brand/flyer/verimate-flyer-vercel.*`、`verimate-poster-vercel.*`。原来的 `verimate.org` 版本不动，学校放行后换回去用。三个尺寸（原图 / 600px / 300px）都扫码测过。
- 生成脚本（`assets.cjs`、`flyer.py`、`poster_render.py`、`poster_image.js`）改成可以传网址参数，不传时默认还是 `verimate.org`。命令见 `docs/brand/IMAGE_GENERATION.md`。

### 你需要做 / 决定的
- [ ] 给 SU ITS（help@syr.edu）发邮件，申请放行 `verimate.org` 和 `www.verimate.org`（草稿已写好，由你自己发）。
- [ ] 已经贴出去的旧宣传单在校园网下打不开，考虑换成 -vercel 版本。
- [ ] 学校放行后，确认校园网能打开，再换回 `verimate.org` 版本。

---

## 2026-11-03 晚：Instagram story、安全审查 #2

### 做了什么
- **Instagram story 图** `docs/brand/flyer/verimate-ig-story.png`：1080×1920，没有二维码。红卡上写 "Sign up to find your sublease / roomie and win a $50 Amazon gift card + one month free account"。发的时候在 verimate.org 那行上面加一个 Link sticker。
- **图片生成说明** `docs/brand/IMAGE_GENERATION.md`：品牌规则、每张图的版式、重新生成的命令、自检清单。
- **英文版今日工作记录** `docs/worklog/2026-11-03.md`。
- **报名**：截至 11-03 17:31，3 人答完问卷进入抽奖（都是学校账号），2 个账号只登录没答。名单在 Supabase → Table Editor → `waitlist_responses`。
- **安全审查 #2**：没有严重问题，任何人都读不到别人的数据。
  - **已上线（只改代码）**：
    - 生产环境的会话 cookie 加 `Secure`
    - 加 `Permissions-Policy`
    - 留学数据格式异常时页面不会崩溃
    - 邀请链接里的码保存后会清掉
    - 失效的邀请码会自动去掉
    - 隐私政策和抽奖规则的措辞已更正
  - **数据库加固（v5）**：已写好并在本地测过，**还没在线上跑**，文件是 `supabase/migrations/20261104020000_waitlist_security_review_2.sql`。内容包括：
    - 学校账号的认定更严格
    - 抽奖截止后锁定邀请码
    - 数据检查更严格
    - 以后新建的表默认不对外开放
  - **配套前端改动**在分支 `001-clickable-flow-demo` 上，还没进 `main`。**顺序：先在 SQL Editor 跑 v5，再把分支推到 `main`。**

### 你需要做 / 决定的
- [ ] 在 SQL Editor 跑 v5，然后让 Claude 把分支推到 `main`。
- [ ] Supabase → Authentication → URL Configuration：确认 Redirect URLs 只有我们自己的地址，没有宽泛的通配符。
- [ ] 开奖前按本地的开奖流程核对：账号去重、照片和邀请只算截止前的。
- [ ] 删除用户时，Storage 里的照片要一起删掉。

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
- [x] 安全审查 #2：见上面 "11-03 晚" 一段。

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
