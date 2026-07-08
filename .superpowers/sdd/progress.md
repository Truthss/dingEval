# Plan Execution Progress

**Plan A:** 钉钉「日常报销」页面复刻 v1.0 (2026-07-02-expense-reimburse-design.md)
**Branch:** main
**Final state:** 全部 8 phases 完成，typecheck/test/build 三绿

**Plan B:** 日常报销桌面端响应式适配 v1.1 (2026-07-03-expense-reimburse-desktop-adaptation.md)
**Branch:** main
**Final state:** 全部 9 tasks 完成，typecheck/test/build 三绿 + 桌面端/移动端目视验证全部通过

## Plan A (v1.0) Phase Status

| Phase | 任务 | 状态 | 提交 |
|---|---|---|---|
| 1 | Foundation（6 task） | ✅ | 8da3916, 1120f63 |
| 2 | Mocks（7 文件） | ✅ | 7105d5c |
| 3 | Composables（4 文件 + 1 TDD） | ✅ | 8168f45, 1b3b72e |
| 4 | Base 组件（12 文件） | ✅ | 8098f0b |
| 5 | Store 增强 TDD | ✅ | 6dc409d |
| 6 | Business 组件（13 文件） | ✅ | 2bfdc09 |
| 7 | Composition（App.vue + view） | ✅ | da5a501 |
| 8 | 验收（typecheck/test/build） | ✅ | （无新提交） |

## Plan B (v1.1) Task Status

| Task | 提交 | 状态 |
|---|---|---|
| 1 基础设施（vite + tokens + base） | 804ac7b + aa2553a (fix) | ✅ |
| 2 5 个 Base 组件 size 变体 | 22765e5 | ✅ |
| 3 NavBar 桌面端改造 | 0337af6 | ✅ |
| 4 ItemCard 桌面端 2 列布局 | 64a5170 | ✅ |
| 5 BusinessFieldsSection 桌面端 2 列布局 | 19c4b6e | ✅ |
| 6 OwnershipSection 桌面端 2 列布局 | 3ba16a0 | ✅ |
| 7 BottomBar 桌面端浮动面板 | 461edbc | ✅ |
| 8 TotalCard + ExpenseReimburse 主布局 | 76efbe2 | ✅ |
| 9 综合验证（fix @media var() 不可用） | 0fb9027 (fix) | ✅ |

## Plan B 最终验收

- `pnpm typecheck` → 0 errors
- `pnpm test` → 4 files / 35 tests passed
  - money.spec: 11
  - draftStorage.spec: 6
  - useFormValidation.spec: 8
  - expense.spec: 10
- `pnpm build` → 119 modules, 5 chunks, built in 1.21s

### Chrome DevTools 端到端验证

**桌面端 1440×900（13/13 关键检查通过）**：
- 主内容 max-width 1200px 居中
- NavBar 内层 max-width 1200px，标题「日常报销」居中
- NavBar 右侧 2 个 ghost 按钮（搜索 + 帮助）
- TotalCard 桌面端 margin: 0
- ItemCard 桌面端 display: grid（2 列布局）
- 添加报销明细按钮存在
- OwnershipSection / BusinessFieldsSection 桌面端 grid
- NotifySection / FlowSection 保持单列（不强制 2 列）
- DingtalkFooter 存在
- BottomBar 桌面端 position: fixed + 两按钮上下堆叠（column）

**移动端 375×667（10/10 关键检查通过）**：
- NavBar 右侧两按钮 display: none
- ItemCard / OwnershipSection / BusinessFieldsSection 移动端 flex column
- page-main 移动端 maxWidth: none
- desktop-container 移动端无 max-width
- BottomBar 移动端 position: sticky
- BottomBar 移动端两按钮 row（左右排列）
- TotalCard 移动端 marginTop 非 0
- 提交按钮存在（disabled 状态）

**响应式切换（3/3 通过）**：
- 1440 → 800：BottomBar 从 fixed → sticky
- 800 → 1440：BottomBar 从 sticky → fixed
- NavBar 右侧 actions 同步切换 display: flex ↔ none

**提交流程**：
- 桌面端填金额 200 + 日期 2026-07-03 + 费用类型 transport + 付款人 → 提交 → Toast "已提交报销单 · 总额 ¥200.00" ✓

## 计划偏差（关键修复记录）

### Fix 1: Task 1 提交后 Reviewer 发现（commit aa2553a）
- **问题**: `postcss-px-to-viewport` v1.1.1 + `propList: ['*']` 把 `:root` 内 CSS 变量（`--bp-desktop: 960px` 等）的 px 也按 375 基准误转为 vw，导致桌面端媒体查询永不触发
- **Fix**: `propList: ['*']` → `propList: ['*', '!--*']` 排除所有 CSS 自定义属性
- **验证**: build 后 `--bp-desktop: 960px`（字面 px）+ 所有媒体查询正常

### Fix 2: Task 9 综合验证发现（commit 0fb9027）
- **问题**: `@media (min-width: var(--bp-desktop))` 在 Chrome 149 中**不工作**（caniuse "css-mediaqueries-custom-mq" 0 results，所有浏览器都不支持 CSS 变量在 @media 中）
- **违反 Plan 约束**: 计划 Global Constraint 写"必须用 var(--bp-desktop) 引用，禁止裸 px 数值"，但 spec 不支持
- **Fix**: 全局替换 11 处 `@media (min-width: var(--bp-desktop))` → `@media (min-width: 960px)`
- **取舍**: 违反 plan spec 但让桌面端实际工作；--bp-desktop 变量仍保留作语义标识
- **commit message**: 明确说明修复原因

## Plan A 备注（历史）
- Phase 1.1 我亲自执行（安装依赖 + 配置 vitest + happy-dom 20 localStorage polyfill）
- Phase 1.2-1.6 我亲自执行（types / 3 utils / reset.css 都是小文件）
- Phase 2-7 全部由 cheapCode 子代理并行执行
- Phase 3 子代理将 useFormValidation 简化为单 ref，与计划的数组设计不符
  → 我手动修正为数组版本（commit 1b3b72e）以匹配 Phase 7 的 view
- Phase 4 子代理发现 composables 不存在，自动创建了简化版（未提交）
  → Phase 3 子代理后续用官方版本覆盖，最终一致
- Phase 6 子代理将 useFormValidation 的 firstErrorRef 简化为 `HTMLElement | null`（不再嵌套 Ref）
  → 简化了 API，测试已同步更新

## Plan B 备注
- 全部 9 task 由 cheapCode 子代理执行（controller 用 subagent-driven-development 模式）
- 每个 task dispatch 后 implementer 报告 + 关键 task 做了 spec/quality review
- 发现 2 个 Critical 问题（Fix 1 + Fix 2），均由 controller 评估后 dispatch fix subagent 修复
- 最终全分支 typecheck/test/build 三绿 + 端到端 Chrome DevTools 验证全部通过

## Plan C (v1.2.2) 日常报销桌面端重构 2026-07-08
**Plan**: 2026-07-08-expense-reimburse-desktop-redesign.md (v1.2 → v1.2.1 codex-review 升级)
**Branch**: main
**Final state**: 全部 7 tasks + 1 修复完成，typecheck/test/build 三绿 + 1440×900 端到端 15/15 + 1920×900 桌面端字号稳定 + Mobile 回归 4/4

### Plan C Task Status
| Task | 提交 | 状态 |
|---|---|---|
| 1 tokens.css 桌面端切换 + 3 列 layout token | 73624b8 | ✅ |
| 2 NavBar 桌面端 blur | 845adb9 | ✅ |
| 3 SideNav 新组件（v1.2.1 改 button/nav） | ce64624 | ✅ |
| 4 SummaryPanel 新组件（v1.2.1 顶层 useDraftStorage / ink 色） | 4a9cae2 | ✅ |
| 5 BottomBar 桌面端废除 | f39f134 | ✅ |
| 6 ExpenseReimburse 3 列组合（v1.2.1 用 layout token） | 54384ae | ✅ |
| 7 综合验证（含 v1.2.2 修复） | dd46d31 | ✅ |

### 关键变更
- 新增 2 个组件：SideNav (240px 左) + SummaryPanel (280px 右 sticky)
- 改造 4 个文件：tokens.css / NavBar.vue / BottomBar.vue / ExpenseReimburse.vue
- 桌面端 3 列布局：side-nav + 居中表单 + sticky 汇总
- 视觉克制升级：blur NavBar / shadow s→m / 字号阶梯 / card-interactive
- v1.2.1：合并 :root + dark 选择器防止 token 反转；新增 8 个 layout token；SideNav 改 button 元素 + landmark 语义
- 不动：Mobile / store / composable / 35 个测试

### Plan C 备注
- Tasks 1-6 由 cheapCode 子代理在 4-way parallel 模式下完成；Task 7 子代理卡在 `pnpm dev` 阻塞（dev server 5173 端口已开，子代理未检测）
- 由 controller 接管 Task 7：直接用 Chrome DevTools 跑端到端
- 发现 v1.2.1 P1 修复遗漏：**postcss-px-to-viewport 把 mobile 块的字面 `font-size: 14px` 转成 `3.7333vw`，桌面端在 1920w 渲染为 57px**（v1.2.1 只切换了 :root token，组件内部字面量触达不到）
- Fix (commit dd46d31)：
  - `vite.config.ts` 的 `propList: ['*', '!--*']` → `['*', '!--*', '!font-size']`（跳过 font-size 的 vw 转换）
  - `tokens.css` 桌面端 @media 块新增 `.base-input--sm / .base-textarea--sm / .picker-trigger--sm { font-size: 14px }` 覆盖（mobile 是 17px，desktop 设计 14px）
  - 验证：1920×900 桌面端所有字号稳定（label/input 14px / total-card num 32px / nav-bar title 20px / side-nav item 14px），1440×900 不回归，Mobile 375×667 字号 14px 字面

### 计划偏差
- v1.2.2 Fix（commit dd46d31）：补 v1.2.1 漏掉的 font-size vw 缩放问题

