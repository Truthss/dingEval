# 钉钉「日常报销」页面 — 桌面端响应式适配 设计规格

**日期**：2026-07-03
**目标版本**：v1.1（基于 v1.0 移动端，叠加桌面端适配）
**关联文档**：[`../../prd.md`](../../prd.md) · [`../../DESIGN.md`](../../DESIGN.md) · [`./2026-07-02-expense-reimburse-design.md`](./2026-07-02-expense-reimburse-design.md)
**定位**：本规格**只覆盖 v1.0 移动端 → v1.1 桌面端响应式**的差异部分；未提及内容沿用 v1.0 既有契约。

---

## 1. 目标与范围

### 1.1 目标

让 `/reimburse` 路由在 **PC Web 浏览器（≥ 960px 视口）** 下呈现钉钉桌面端风格的布局：

- 同一份组件代码、同一份 store、同一份路由，**不引入独立桌面端路由或重复组件**
- max-width 1200 居中、2 列对齐的表单布局、桌面端 NavBar 形态、桌面端浮动按钮面板
- 仅在桌面端补充 `:hover` 视觉反馈；不引入键盘可达 / 暗色模式 UI / 平板专属档

### 1.2 响应式策略

| 视口 | 行为 |
|---|---|
| `< 960px` | **移动端**（保持 v1.0 现状） |
| `≥ 960px` | **桌面端**：max-width 1200 居中、2 列网格、桌面端 NavBar、右下角浮动按钮面板 |
| `600–959px` | 跟随移动端（用户决策：只做两档，不做平板专属档） |

### 1.3 不在范围（与本规格无关）

- v1.0 已实现的全部业务逻辑（提交 / 校验 / 草稿 / Toast / ActionSheet / 流程 / 通知 / 发票状态 / 附件）
- 真实图片 / 发票识别 / 后端 API 对接
- 深色模式 UI 切换、键盘可达性、ARIA 增强
- 平板专属档（600–959px）布局优化
- 国际化 i18n
- 桌面端侧边栏 / 桌面端多页签 / 桌面端全局搜索

---

## 2. 技术栈增量

| 类别 | 选型 | 状态 |
|---|---|---|
| 适配 | `postcss-px-to-viewport` 开启 `mediaQuery: true`，双基准（移动 375 / 桌面 1200） | **修改** |
| 工具类 | `src/styles/base.css` 增补 `.desktop-container` / `.desktop-grid-2` | **新增** |

不引入新依赖。

---

## 3. 构建配置改造

### 3.1 `vite.config.ts` postcss 改造

```ts
pxToViewport({
  unitToConvert: 'px',
  viewportWidth: 375,           // 移动端基准（默认）
  unitPrecision: 5,
  propList: ['*'],
  viewportUnit: 'vw',
  fontViewportUnit: 'vw',
  selectorBlackList: ['.no-vw'],
  minPixelValue: 1,
  mediaQuery: true,             // ★ 关键：开启媒体查询内独立基准
  replace: true,
  exclude: [/node_modules\/(?!(vant|@vant)\/)/],
  landscape: false
})
```

> 触发机制：当 CSS 中存在 `@media (min-width: var(--bp-desktop)) { ... }` 时，postcss-px-to-viewport 会自动在该块内以 **1200px** 为基准换算 px。**断点值本身必须用 CSS 变量引用**（详见 §3.2），不能用裸 px。

### 3.2 断点值豁免规范

**所有 `@media` 断点值必须用 CSS 变量引用**，避免 px 数值被 postcss-px-to-viewport 错误地转换成 vw（导致媒体查询永远不命中或永远命中）。

```css
/* tokens.css */
:root { --bp-desktop: 960px; }

/* 任何 .vue / .css 文件中 */
@media (min-width: var(--bp-desktop)) { /* 安全：var() 不会被 postcss 转换 */ }
```

> **为什么不直接用 `selectorBlackList: ['.no-vw']` 给媒体查询加类？** 媒体查询是 `@media` 规则不是选择器，无法加类豁免；只有 `@media` 内的属性声明才被 postcss 处理，断点数值本身在 `@media (...)` 括号中需要规避。
>
> 本规格统一规范：所有断点 px 值 → `tokens.css` 中声明为 CSS 变量 → `@media` 用 `var(--bp-desktop)` 引用。

---

## 4. 样式基础设施

### 4.1 `src/styles/tokens.css` 增量

```css
:root {
  /* ---------- Breakpoints ---------- */
  --bp-mobile-max: 959.98px;   /* 桌面端断点（小于此为移动端） */
  --bp-desktop: 960px;         /* 桌面端最小宽度 */

  /* ---------- Desktop Layout ---------- */
  --layout-max-width: 1200px;  /* 桌面端主内容最大宽度 */
  --layout-padding-x: 32px;    /* 桌面端容器左右内边距 */
  --layout-grid-gap-col: 24px; /* 桌面端 2 列列间距 */
  --layout-grid-gap-row: 16px; /* 桌面端 2 列行间距 */
}
```

### 4.2 `src/styles/base.css` 增量

```css
/* ---------- Desktop Container ---------- */
.desktop-container {
  /* 移动端：无样式（由父组件控制内边距） */
}

@media (min-width: var(--bp-desktop)) {
  .desktop-container {
    max-width: var(--layout-max-width);
    margin: 0 auto;
    padding: 0 var(--layout-padding-x);
  }

  .desktop-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: var(--layout-grid-gap-col);
    row-gap: var(--layout-grid-gap-row);
  }

  .desktop-grid-2--span-2 {
    grid-column: span 2;
  }
}
```

> `.desktop-grid-2` 移动端**不生效**（无 `display: grid` 规则）。`--span-2` 用于让单条明细或跨整行的字段占满两列。

---

## 5. 组件契约变更

### 5.1 原子层 `components/base/` — 新增 `size` prop

5 个原子组件统一增加 `size: 'sm' | 'md' = 'sm'`：

| 组件 | 新增 prop | sm（移动端默认） | md（桌面端默认） |
|---|---|---|---|
| `BaseButton` | `size?: 'sm' \| 'md' = 'sm'` | `min-height: 32px`、`padding: 8px 16px`、`font-size: 14px` | `min-height: 36px`、`padding: 10px 20px`、`font-size: 14px` |
| `BaseInput` | `size?: 'sm' \| 'md' = 'sm'` | `height: 36px`、`padding: 8px 12px`、`font-size: 17px` | `height: 40px`、`padding: 10px 14px`、`font-size: 14px` |
| `BaseTextarea` | `size?: 'sm' \| 'md' = 'sm'` | 继承 BaseInput sm，`min-height: 3 行` | 继承 BaseInput md，`min-height: 3 行` |
| `BaseSelect` | `size?: 'sm' \| 'md' = 'sm'` | 同 BaseInput | 同 BaseInput |
| `BaseDatePicker` | `size?: 'sm' \| 'md' = 'sm'` | 同 BaseInput | 同 BaseInput |

> **BaseField 不新增 size 变体**：v1.0 BaseField 是 Cell 模式（`display: flex; align-items: center; gap: 12px; min-height: 48px;`、label `min-width: 96px; font-size: 14px;`），移动端 / 桌面端视觉一致；BaseField 内的 BaseInput/BaseSelect/BaseDatePicker 单独传 `size` 即可。
>
> 当 BaseField 作为 `.desktop-grid-2` 的子项时，整个 cell（label + input 一行）作为 1 个 grid item；跨列用 `.desktop-grid-2--span-2` 类。

### 5.2 业务组件桌面端改造清单

| 组件 | 桌面端改造点 |
|---|---|
| `NavBar` | 容器加 `.desktop-container` 类；桌面端右侧加 **2 个独立 `BaseButton variant="ghost" size="md"`**，每按钮含 1 个 `DingIcon`：「搜索」「帮助」（点击 → Toast "该功能需要钉钉 App 端支持"）；两按钮在桌面端排成水平行，间距 4px |
| `ItemCard` | 桌面端内部 4 个字段（金额 / 费用发生日期 / 费用类型 / 费用说明）改为 `.desktop-grid-2` 布局：**金额独占整行（跨 2 列）**、**费用发生日期 + 费用类型同行（各占 1 列）**、**费用说明跨 2 列**；`InvoiceSubBlock` + `AttachmentBlock` 跨 2 列；删除按钮位置不变 |
| `BusinessFieldsSection` | 桌面端 5 个字段用 `.desktop-grid-2`：项目 + 客户同行、收款账户 + 企业主体同行、付款时间单行独占 |
| `OwnershipSection` | 桌面端 3 个字段用 `.desktop-grid-2`：归属人 + 归属部门同行、备注跨 2 列 |
| `FlowSection` | 桌面端 3 个字段（审批人 / 付款人 / 抄送人）保持单列堆叠（每行只有一个选择器，2 列无意义） |
| `NotifySection` | 桌面端保持单列堆叠（同上） |
| `BottomBar` | 桌面端改造为**右下角浮动面板**（见 §6） |
| `DingtalkFooter` | 不变（移动端 / 桌面端均贴底居中显示） |
| `TotalCard` | 桌面端取消 `margin: 12px 12px 0` 改用 `.page-main` 的 gap 控制间距；内部 3 列 actions 网格与字号保持移动端数值，桌面端宽度由父容器自然撑满 |
| `RelatedApply` | 不变（胶囊按钮在桌面端宽度自然） |
| `InvoiceBlock` | 不变（顶层独立卡片，单列堆叠视觉与桌面端无冲突） |

### 5.3 不变更的组件

- `App.vue` / `main.ts` / `router/index.ts` / `stores/expense.ts` / `types/expense.ts` / `mocks/*` / `utils/*` / `composables/*` 全部**不动**
- `BaseField` / `BaseCapsule` / `BaseCard` / `BaseTag` / `BaseToast` / `BaseActionSheet` / `DingIcon` 不增加 size 变体（BaseField 走 Cell 模式两端视觉一致；其余为全局单例或视觉差异不明显）

---

## 6. BottomBar 浮动面板改造

### 6.1 形态定义

**移动端**（`< 960px`）：保持 v1.0 贴底吸底 + 左右两按钮 + safe-area 适配。

**桌面端**（`≥ 960px`）：右下角浮动面板（FAB 风格）：

| 维度 | 数值 |
|---|---|
| 位置 | `position: fixed; right: 32px; bottom: 32px;` |
| 容器 | `box-shadow: var(--shadow-m); border-radius: var(--radius-md); background: var(--color-canvas);` |
| 内部 | 上下堆叠两按钮（垂直排列），列宽 144px |
| 按钮高度 | 主按钮 / 次按钮均 40px（用 `size="md"`） |
| 间距 | 按钮间 8px，容器内边距 12px |
| 滚动行为 | 浮动面板**始终固定**在视口右下角；不随内容滚动消失 |
| 响应式切换 | 视口宽度跨越 960px 时瞬时切换形态，无动画过渡 |

### 6.2 草稿与提交交互

保持 v1.0 行为不变（保存草稿 → Toast + `useDraftStorage().save()`；提交 → `useFormValidation()`）。

### 6.3 不实现的能力

- 不实现面板收起 / 展开
- 不实现"返回顶部"等额外按钮
- 不跟随滚动条位置变化

---

## 7. ExpenseReimburse 主布局改造

### 7.1 模板结构变化

```vue
<template>
  <div class="reimburse-page">
    <NavBar />

    <main class="page-main desktop-container">
      <!-- 原有 section 顺序保持不变 -->
      <RelatedApply />
      <TotalCard :total="expense.totalAmount" />
      <ItemCard v-for="(item, index) in expense.items" ... />
      <button class="add-detail-card" ...>+ 添加报销明细</button>
      <InvoiceBlock />
      <OwnershipSection />
      <BusinessFieldsSection />
      <NotifySection />
      <FlowSection ref="flowSectionRef" />
      <DingtalkFooter />
    </main>

    <BottomBar :is-valid="expense.isValid" @submit="handleSubmit" />
  </div>
</template>
```

仅在 `.page-main` 上加 `.desktop-container` 类，其余结构零改动。

### 7.2 样式增量

```css
/* v1.0 原有 */
.page-main {
  display: flex;
  flex-direction: column;
}

/* 桌面端：容器由 .desktop-container 限制 max-width */
@media (min-width: var(--bp-desktop)) {
  .page-main {
    /* desktop-container 已提供 max-width + padding */
    /* 此处仅调整 section 之间的间距 */
    gap: 16px;
    padding-top: 24px;
    padding-bottom: 96px;   /* 为浮动按钮面板留出空间，避免遮挡 DingtalkFooter */
  }
  .add-detail-card {
    margin: 0;              /* 桌面端由 gap 控制 */
  }
}
```

### 7.3 滚动定位

`useFormValidation` 的 `firstErrorRef.scrollIntoView()` 在桌面端仍按 `block: 'center'` 工作；底部浮动按钮面板**不会遮挡**滚动目标（按钮在 fixed 层，错误字段仍在主内容流中）。

---

## 8. hover 反馈规范

### 8.1 总原则

- 仅桌面端（`@media (min-width: var(--bp-desktop))` 内）补充 `:hover` 视觉
- 移动端**不引入** `:hover` 样式，避免移动设备长按态被误识别
- hover 仅改变背景色 / 边框色，**不改变**元素大小、位置、圆角

### 8.2 元素 hover 规则表

| 元素 | 默认态 | hover 态 |
|---|---|---|
| `BaseButton variant="primary"` | `var(--color-primary)` | `var(--color-primary-hover)` |
| `BaseButton variant="secondary"` | `var(--color-canvas)` + `1px solid var(--color-hairline-strong)` | `var(--color-surface-press)` |
| `BaseButton variant="ghost"` | `transparent` | `rgba(0, 127, 255, 0.04)` |
| `BaseSelect` | `var(--color-canvas)` + `1px solid var(--color-hairline)` | `1px solid var(--color-hairline-strong)` |
| `BaseDatePicker` | 同 BaseSelect | 同 BaseSelect |
| `NavBar` 返回按钮 | `transparent` | `rgba(126, 134, 142, 0.08)` |
| `BaseCapsule`（虚线态） | `1px dashed var(--color-hairline-strong)` | `1px dashed var(--color-primary)` + `color: var(--color-primary)` |
| `add-detail-card` | `var(--color-canvas)` | `rgba(0, 127, 255, 0.04)` |
| `BaseTag`（未选中） | `var(--color-canvas-soft)` | `var(--color-surface-press)` |

> 实现方式：各组件的 `<style scoped>` 中用 `@media (min-width: var(--bp-desktop)) { .x:hover { ... } }` 包裹；**不引入**全局 `:where(:hover)` 选择器，避免污染。

### 8.3 过渡动画

hover 过渡统一 `transition: background-color 0.15s, border-color 0.15s;`，**不**为 transform / box-shadow 添加过渡（克制原则）。

---

## 9. 字体与排版

### 9.1 桌面端字号微调

DESIGN.md 已规定桌面端 Body = 14px、移动端 Body = 17px。本规格采用**渐进策略**：

- 桌面端表单输入框、按钮：使用 `size="md"` 后自动落到 14px
- 桌面端大标题 / 数字：保持移动端 px 数值（如 `TotalCard` 红色 32px），因 postcss 媒体查询以 1200 基准转 vw，桌面端显示效果 ≈ 移动端在 375 视口下放大 3.2 倍 → **接近 32px**，视觉成立
- 桌面端不引入新的字号阶梯 token，避免破坏 v1.0 既有视觉系统

### 9.2 字体家族

沿用 `tokens.css` 中 `--font-family-base`，PC 浏览器自动回退到 `Segoe UI`（Windows）/ `SF Pro Text`（macOS）。

---

## 10. 验收与边界

### 10.1 验收命令

```bash
pnpm typecheck     # vue-tsc --noEmit
pnpm test          # vitest run
pnpm build         # 类型检查 + 生产构建
pnpm dev           # 浏览器目视
```

### 10.2 必须满足的验收点

**桌面端（≥ 960px）**：

- [ ] 视口 1440×900：主内容 max-width 1200 居中，左右各 120px 留白
- [ ] NavBar 高度 48px，宽度撑到 1200 居中，右侧显示「搜索 / 帮助」两图标按钮
- [ ] `ItemCard` 桌面端：金额单独一行，日期 + 费用类型同行，费用说明跨 2 列，发票子块 + 附件跨 2 列
- [ ] `BusinessFieldsSection` 桌面端：项目 + 客户同行、收款账户 + 企业主体同行、付款时间独占一行
- [ ] `OwnershipSection` 桌面端：归属人 + 归属部门同行、备注跨 2 列
- [ ] `BottomBar` 桌面端：右下角浮动面板，距离视口右下 32px，两按钮上下堆叠，列宽 144px，主按钮在次按钮下方
- [ ] 桌面端 hover：所有按钮、选择器、日期选择器、NavBar 返回、添加明细按钮、BaseCapsule 悬停有视觉变化
- [ ] 桌面端 hover 过渡 150ms 平滑，无卡顿
- [ ] 桌面端滚动到任意位置，浮动按钮面板始终可见

**移动端（< 960px）**：

- [ ] 375px 视口下页面与 v1.0 验收标准**完全一致**（v1.0 spec §12 所有项继续通过）
- [ ] 不出现任何桌面端样式（无 `.desktop-container` 容器效果、无 2 列布局、无浮动按钮）
- [ ] 不出现 hover 样式

**回归**：

- [ ] 提交 / 校验 / 草稿 / Toast / ActionSheet / 流程 / 通知 / 发票 / 附件全部行为与 v1.0 一致
- [ ] `pnpm typecheck` / `pnpm test` / `pnpm build` 全绿
- [ ] v1.0 已有单测（stores / utils / composables）**不修改、不删除**，继续通过

### 10.3 响应式切换行为

- [ ] 视口从 1440 拖到 800：浮动按钮面板**瞬间消失**，BottomBar 切回贴底吸底（无动画）
- [ ] 视口从 800 拖到 1440：BottomBar 瞬间切到右下角浮动
- [ ] 切换瞬间已填写的数据**不丢失**

### 10.4 不进入验收

- 600–959px 平板专属档
- 深色模式 UI
- 键盘可达性 / Tab 焦点环 / ARIA
- 浮动按钮面板收起 / 展开
- 「搜索」「帮助」按钮的实际功能（v1.1 仅 Toast 占位）
- 桌面端侧边栏

---

## 11. 风险与缓解

| 风险 | 缓解 |
|---|---|
| `mediaQuery: true` 开启后，开发期 CSS SourceMap 出现 vw 数值，调试时不直观 | 在 `@media` 块内仍按 px 写源码，依赖 postcss 转换；如有调试需求临时改 `unitPrecision` 注释 |
| 桌面端 `max-width: 1200px` 在更宽屏（≥ 1440px）下两侧留白过大 | **接受**：与钉钉设计系统 §Layout "max-width 1200px 居中" 一致 |
| `BottomBar` 浮动面板在桌面端 800px 以下小窗口下被 NavBar 遮挡 | **不会发生**：960 才开始浮动；移动端仍是贴底 |
| `useFormValidation.scrollIntoView` 在桌面端可能将错误字段滚到浮动按钮面板后面 | 浮动面板宽 144px + 距右 32px，主内容最小宽度 1200 → 错误字段在主内容区中心，不会落到浮动面板范围；保持 `block: 'center'` 即可 |
| `BaseSelect` / `BaseDatePicker` 弹层 (`BaseActionSheet`) 在桌面端仍是底部抽屉，与桌面端视觉不符 | **接受**：v1.0 ActionSheet 是全局单例、跨组件复用，桌面端改造风险大；弹层内容占满屏幕底部反而让用户专注选择。如未来需要再迭代 |
| 桌面端 hover 在触屏设备（带触控的 PC）出现"幽灵 hover" | 接受：v1.1 明确目标场景是 PC Web 浏览器（鼠标交互为主） |
| `desktop-grid-2` 移动端不生效，但开发者可能误用导致内容丢列 | 文档化：所有 `.desktop-grid-2` 用法必须在 `<style scoped>` 中配 `@media` 包装；Code Review 检查 |

---

## 12. 实施顺序（建议）

**底层 → 业务 → 组合 → 验收**（4 轮）。

### 第 1 轮：基础设施（半天）

1. `vite.config.ts` 开启 `mediaQuery: true`
2. `tokens.css` 增补断点与布局 token
3. `base.css` 增补 `.desktop-container` / `.desktop-grid-2` 工具类
4. 浏览器手动验证：写一个临时 `<div class="desktop-container">` 验证 max-width 与网格生效

### 第 2 轮：Base 组件 size 变体（半天）

1. `BaseButton` / `BaseInput` / `BaseTextarea` / `BaseSelect` / `BaseDatePicker` 5 个原子组件增加 `size` prop（**BaseField 不加**，见 §5.1）
2. 每个组件在桌面端 `size="md"` 视觉对照 v1.0 设计
3. 桌面端 hover 反馈添加到 5 个原子组件

### 第 3 轮：业务组件改造（1 天）

按依赖顺序：

1. `NavBar`（最简单，先打通 `.desktop-container`）
2. `ItemCard`（最复杂，含 4 字段 + 子块 2 列布局）
3. `OwnershipSection` / `BusinessFieldsSection` / `FlowSection` / `NotifySection`（并行）
4. `BottomBar`（最后做浮动面板）

### 第 4 轮：组合 + 联调（半天）

1. `ExpenseReimburse.vue` 加 `.desktop-container` 到 `.page-main`
2. 各业务组件在桌面端显式传 `size="md"`
3. 跑 `pnpm typecheck && pnpm test && pnpm build` 全绿
4. Chrome DevTools 1440×900 视口逐项对照验收清单
5. Chrome DevTools 375×667 视口回归 v1.0 验收清单

---

## 13. 后续可选（v1.1 不做）

- 600–959px 平板专属档
- `BaseActionSheet` 桌面端改造为居中 Modal（替代底部抽屉）
- 浮动按钮面板收起态（仅显示主按钮图标）
- 桌面端 NavBar 接入真实搜索 / 帮助
- 键盘可达性 / 焦点环 / ARIA
- E2E 测试（Playwright 桌面端模拟）
