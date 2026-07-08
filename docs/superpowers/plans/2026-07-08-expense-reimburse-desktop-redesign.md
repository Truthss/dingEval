# 钉钉「日常报销」桌面端重构 v1.2.1 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把桌面端（≥960px）按 DESIGN.md 重构为「side-nav + 居中表单 + sticky 汇总」的 3 列工作台，Mobile 不动。

**Architecture:** 纯 CSS 媒体查询驱动 + 2 个新组件 + 1 个 view 组合改造；不修改 store / composable / 业务流程。

**Tech Stack:** Vue 3 SFC + CSS scoped + postcss-px-to-viewport（375px 基准 + 桌面端 px 字面量）+ Pinia

**Spec:** `docs/superpowers/specs/2026-07-08-expense-reimburse-desktop-redesign-design.md`

## Plan Revisions（v1.2 → v1.2.1，codex-review 修复）

| # | 级别 | 修复项 | 落地位置 |
|---|---|---|---|
| 1 | P1 | 桌面端字号/阴影 token 在深色模式下被特异性反转 → 合并 light + dark 选择器到同一媒体查询 | Task 1 Step 2 |
| 2 | P2 | `tokens.css:104` 行号与"文件末尾"自相矛盾 → 改为描述性位置 | Task 1 Files |
| 3 | P2 | 新增 `--layout-navbar-offset` / `--layout-3col-*` token，统一 sticky top 与 3 列网格尺寸 | Task 1 Step 2 |
| 4 | P2 | SideNav `<a href="#">` 触发跳顶 → 改为 `<button type="button">` | Task 3 Step 2 |
| 5 | P2 | SideNav `<nav>` 嵌在 `<aside>` 内部 landmark 语义混乱 → 外层改 `<nav>`，内层改 `<ul>` | Task 3 Step 2 |
| 6 | P2 | SideNav / SummaryPanel `top: 72px` 硬编码两处 → 改用 `var(--layout-navbar-offset)` | Task 3 / Task 4 |
| 7 | P2 | SummaryPanel `useDraftStorage()` 在 saveDraft 内每次新建实例 → 提到 script 顶层复用 | Task 4 Step 2 |
| 8 | P2 | 忽略已存在的 layout token，硬编码 1320 / 16 / 24 → 改用 `--layout-3col-*` token | Task 6 Step 4 |
| 9 | P3 | 移除 `align-self: start` 父子两边重复声明 | Task 3 / Task 4 / Task 6 |
| 10 | P3 | SideNav / SummaryPanel 改用 additive `min-width: 960px` 媒体查询，与代码库其他文件一致 | Task 3 / Task 4 |
| 11 | P3 | 金额 `color: var(--color-error)`（红/橙）暗示错误 → 改 `var(--color-ink)` | Task 4 |
| 12 | P3 | Task 7 Check #12 `\|\| position === 'sticky'` 永远为真 → 只断言 `display: none` | Task 7 Step 3 |
| 13 | P2 | Task 6 padding 引用未定义的 `--layout-3col-padding-x` + 底部 52px 与 v1.1 的 96px 不一致 → 补充 `--layout-3col-padding-x: 16px` / `--layout-3col-padding-bottom: 96px` 两个 token | Task 1 Step 2 + Task 6 Step 4 |

> 修复后的 P0 / P1 阻塞项：**0**。P2 修复全部落到具体 step 内可执行；P3 已闭合。

## 并行执行图

```
Task 1: tokens.css 桌面端切换              [必经]
   ↓
   ├── Task 2: NavBar 桌面端 blur 改造
   ├── Task 3: SideNav 新组件               ┐
   ├── Task 4: SummaryPanel 新组件          ├ 4-way parallel
   └── Task 5: BottomBar 桌面端废除         ┘
                                       ↓
                                  Task 6: ExpenseReimburse.vue 3 列组合
                                       ↓
                                  Task 7: 综合验证（typecheck/test/build + 1440×900 端到端）
```

**subagent dispatch 策略**：
- Task 1：1 个 subagent（独立基线）
- Task 2/3/4/5：**1 批 4 并行 subagent**（无相互依赖，每个 task 文件独立）
- Task 6：1 个 subagent（依赖 2/3/4/5 全部完成）
- Task 7：1 个 subagent（依赖 6 完成，做最终验收）

## Global Constraints

- Node ≥ 20.19.0（package.json engines 锁版本）
- 验证基准：**仅 1440×900**（DESIGN.md Desktop 断点），Mobile/Tablet 不验证
- Mobile 完全不动（375×667 行为需保留 v1.1 现状）
- **不新增单测**（已确认 35 个测试覆盖 store/util/composable，重构不改这些层）
- 所有 px 字面量**不**经过 postcss-px-to-viewport 转换（用 `.no-vw` selectorBlackList 或写在 `:root` 的 token；现有 `propList: ['*', '!--*']` 配置已排除 CSS 变量，桌面端 token 写在 `:root` 内即可）
- 提交信息格式：`feat(scope): xxx` / `fix(scope): xxx` / `refactor(scope): xxx` / `docs(scope): xxx`
- 每个 task 独立 commit
- 颜色保持 ink/body/mute 透明度阶（DESIGN.md 强调），不重新定义
- 圆角与高度匹配：≤36 用 xs(4) / 36-72 用 sm(6) / >72 用 md(8)
- 阴影克制：默认 s / 悬浮 m / 模态 l，禁止自定义 blur 半径

---

## Task 1: tokens.css 桌面端 token 切换（基线任务，必须先做）

**Files:**
- Modify: `src/styles/tokens.css`（在 `:root` 块闭合 `}` 之后、`html[data-theme='dark']` 块之前插入新的桌面端 token 块；同时把 `--layout-3col-*` / `--layout-navbar-offset` 8 个新 token 加到 `:root` 块内「Desktop Layout」段末尾）

**Interfaces:**
- Consumes: DESIGN.md 桌面端字号阶梯（Body 14 / H1 24 / H2 20 / Subhead 15 / Description 13）+ 阴影分级
- Produces:
  - 6 个 token 变量在 `@media (min-width: 960px)` 内的桌面端值（**合并 `:root, html[data-theme='dark']` 选择器**，避免 dark 块特异性反转）
  - 8 个 layout token：`--layout-navbar-offset`（1 个）+ `--layout-3col-*`（7 个：max-width / gap / nav-width / form-width / summary-width / padding-x / padding-bottom）

**为什么先做**：所有桌面端视觉都依赖这 6 个字号/阴影 token + 8 个 layout token；其他 4 个并行 task 都需要这个基础就绪。

- [ ] **Step 1: 读取现有 tokens.css 确认 token 名称**

读 `src/styles/tokens.css:41-92` 确认以下 token 已存在：
- `--font-size-body`、`--font-size-h1`、`--font-size-h2`、`--font-size-description`
- `--shadow-s`、`--shadow-m`

读 `src/styles/tokens.css:98-103` 确认 Desktop Layout 段已存在：
- `--layout-max-width`、`--layout-padding-x`、`--layout-grid-gap-col`、`--layout-grid-gap-row`

- [ ] **Step 2: 在 :root 块 Desktop Layout 段末尾追加 8 个新 token**

在 `src/styles/tokens.css:103` 之前（`--layout-grid-gap-row: 16px;` 后面、`:root` 闭合 `}` 之前）追加：

```css
  /* ---------- 3 列布局（v1.2 桌面端重构） ---------- */
  --layout-navbar-offset: 72px;          /* NavBar 48 + 间距 24 */
  --layout-3col-max-width: 1320px;       /* 240 + 24 + 720 + 24 + 280 + 32 (padding) */
  --layout-3col-gap: 24px;               /* 居中表单与左右两列的间距 */
  --layout-3col-nav-width: 240px;        /* SideNav 列宽 */
  --layout-3col-form-width: 720px;       /* 居中表单列宽（minmax 上限） */
  --layout-3col-summary-width: 280px;    /* SummaryPanel 列宽 */
  --layout-3col-padding-x: 16px;         /* 容器水平内边距 */
  --layout-3col-padding-bottom: 96px;    /* 容器底部内边距（沿用 v1.1 的 96，给 DingtalkFooter 留白） */
```

- [ ] **Step 3: 在文件末尾、:root 块外、dark 块前插入桌面端 token 覆盖块**

> 定位方式（描述性，避开行号漂移）：在 `src/styles/tokens.css` 的 `:root { ... }` 闭合大括号（Step 2 插入 8 个新 token 之后的那一行 `}`）之后、`/* ===` 深色模式注释块之前插入；不要插到 `:root` 内部。

插入内容：

```css
/* ============================================================
 * 桌面端 Token 切换（DESIGN.md 桌面端字号 + 阴影分级）
 * 仅在 ≥960px 生效，Mobile 值不变
 *
 * 关键：`:root, html[data-theme='dark']` 合并选择器。
 * 若只写在 `:root` 内，dark 块（特异性 0,1,1 > :root 的 0,0,1）
 * 会"赢者通吃"，把 dark 模式下 desktop 字号反转回 mobile 值。
 * 合并选择器后两者同时被覆盖。
 * ============================================================ */
@media (min-width: 960px) {
  :root,
  html[data-theme='dark'] {
    /* 桌面端字号阶梯（DESIGN.md Typography Hierarchy） */
    --font-size-body: 14px;          /* Mobile 17 → Desktop 14 */
    --font-size-h1: 24px;            /* Mobile 20 → Desktop 24 */
    --font-size-h2: 20px;            /* Mobile 18 → Desktop 20 */
    --font-size-description: 13px;   /* Mobile 14 → Desktop 13 */
    /* --font-size-subhead 保持 15px 不变 */

    /* 桌面端阴影分级（适配大屏感知，y 偏移稍增 + 透明度稍降） */
    --shadow-s: 0px 2px 8px rgba(0, 0, 0, 0.08);
    --shadow-m: 0px 8px 24px rgba(0, 0, 0, 0.12);
  }
}
```

- [ ] **Step 4: 验证 typecheck + build**

```bash
pnpm typecheck
pnpm build
```

Expected：两者都成功，无新增 error/warning。

- [ ] **Step 5: Commit**

```bash
git add src/styles/tokens.css
git commit -m "feat(tokens): desktop token switch at >=960px (font + shadow) + 3-col layout tokens"
```

---

## Task 2: NavBar 桌面端毛玻璃改造

**Files:**
- Modify: `src/components/expense/NavBar.vue:97-100`（替换现有 `@media (min-width: 960px)` 块）

**Interfaces:**
- Consumes: Task 1 产出的桌面端 token（`--color-hairline` 等）
- Produces: NavBar 在 Desktop 下的毛玻璃背景 + 升级 H2 字号

**为什么独立**：只动 NavBar 自己的样式块，与其他组件无交集。

- [ ] **Step 1: 读取 NavBar.vue 现有桌面端块**

读 `src/components/expense/NavBar.vue:97-100`，确认现有块内容为：
```css
@media (min-width: 960px) {
  .nav-bar__title { font-size: 18px; }
  .nav-bar__actions { display: flex; }
}
```

- [ ] **Step 2: 替换桌面端样式块**

将 `src/components/expense/NavBar.vue:97-100` 整块替换为：

```css
@media (min-width: 960px) {
  /* 毛玻璃背景（DESIGN.md blur.default-light 衍生） */
  .nav-bar {
    background: rgba(255, 255, 255, 0.88);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--color-hairline);
    box-shadow: none;
  }
  /* H2 桌面端字号（继承 Task 1 token） */
  .nav-bar__title { font-size: var(--font-size-h2); }   /* 20px */
  .nav-bar__actions { display: flex; }
}
```

- [ ] **Step 3: 验证 typecheck + build**

```bash
pnpm typecheck
pnpm build
```

Expected：成功。

- [ ] **Step 4: Commit**

```bash
git add src/components/expense/NavBar.vue
git commit -m "feat(navbar): desktop blur glass + H2 font size"
```

---

## Task 3: SideNav 新组件

**Files:**
- Create: `src/components/expense/SideNav.vue`

**Interfaces:**
- Consumes: `DingIcon` 组件（已存在 `src/components/base/DingIcon.vue`）
- Produces: 一个无 props / 无 emits 的纯展示组件；Mobile 端通过父组件 class `hidden-mobile` 隐藏

**为什么独立**：纯新增，与任何现有文件无交集；与 Task 4 平行开发。

- [ ] **Step 1: 确认 DingIcon 可用 icon name**

读 `src/components/base/DingIcon.vue` 确认它用 `@iconify-json/ic` 包（Material Icons baseline 集），前缀 `ic:baseline-`。

读 `src/components/expense/*.vue` 收集已经在用的 icon name（已确认可用）：
- `arrow-back` / `search` / `help` / `upload` / `description` / `qr-code-scanner` / `close` / `check`

SideNav 需要 2 个：
- Logo：`apps`（9 点网格，Material Icons 通用）
- 选中态对勾：`check`（已确认存在）

> 警告：**不要使用 `dingtalk` 这种业务专有 icon**——Material Icons 集里没有，会导致 `<Icon>` 渲染失败回退为空。

- [ ] **Step 2: 创建 SideNav.vue**

新建 `src/components/expense/SideNav.vue`，内容：

```vue
<script setup lang="ts">
import DingIcon from '../base/DingIcon.vue'
</script>

<template>
  <nav class="side-nav" aria-label="主导航">
    <!-- Logo + 品牌 -->
    <div class="side-nav__brand">
      <div class="side-nav__logo" aria-hidden="true">
        <DingIcon name="apps" :size="20" />
      </div>
      <div class="side-nav__brand-name">钉钉</div>
    </div>

    <div class="side-nav__divider" />

    <!-- 导航标题 -->
    <div class="side-nav__caption">导航</div>

    <!-- 导航项（仅 1 个；激活项用 button 而非 a，避免 href="# 跳顶） -->
    <ul class="side-nav__items">
      <li>
        <button
          type="button"
          class="side-nav__item side-nav__item--active"
          aria-current="page"
        >
          <span class="side-nav__item-icon" aria-hidden="true">
            <DingIcon name="check" :size="16" />
          </span>
          <span class="side-nav__item-label">日常报销</span>
        </button>
      </li>
    </ul>

    <!-- 底部版本号 -->
    <div class="side-nav__footer">v0.1.0</div>
  </nav>
</template>

<style scoped>
.side-nav {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-s);
  padding: var(--space-lg);
  display: none;                 /* Mobile 默认隐藏（additive media query） */
  flex-direction: column;
  min-height: 360px;
  position: sticky;
  top: var(--layout-navbar-offset);
}

.side-nav__brand {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}
.side-nav__logo {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  color: var(--color-on-primary);
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.side-nav__brand-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-ink);
}

.side-nav__divider {
  height: 1px;
  background: var(--color-hairline);
  margin: var(--space-xs) 0 var(--space-md) 0;
}

.side-nav__caption {
  font-size: var(--font-size-tiny);
  color: var(--color-mute);
  margin-bottom: var(--space-sm);
  letter-spacing: 0.5px;
}

.side-nav__items {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.side-nav__item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 8px 12px;
  border: 0;                    /* button 默认 border 需显式重置 */
  background: transparent;       /* button 默认 background 需显式重置 */
  border-radius: var(--radius-sm);
  text-decoration: none;
  color: var(--color-body);
  font-size: var(--font-size-body);
  font-family: inherit;          /* button 默认字体可能与 body 不同 */
  text-align: left;             /* button 默认 center，重置为左对齐 */
  width: 100%;
  transition: background 0.15s;
  cursor: default;
}
.side-nav__item:hover { background: var(--color-overlay-hover); }
.side-nav__item--active {
  background: rgba(0, 127, 255, 0.12);
  color: var(--color-primary);
  font-weight: 500;
}
.side-nav__item-icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.side-nav__footer {
  margin-top: auto;
  font-size: var(--font-size-tiny);
  color: var(--color-mute);
  padding-top: var(--space-md);
}

/* 桌面端才显示（与代码库其他组件一致的 additive 媒体查询） */
@media (min-width: 960px) {
  .side-nav { display: flex; }
}
</style>
```

> 注意：上述 CSS 块中 `var(--space-xs)` 需根据实际 token 名替换。读 `src/styles/tokens.css:73-80` 确认：`--space-xxs / --space-xs / --space-sm / --space-md / --space-lg / --space-xl / --space-2xl / --space-3xl`。

- [ ] **Step 3: 验证 typecheck + build**

```bash
pnpm typecheck
pnpm build
```

Expected：成功。

- [ ] **Step 4: Commit**

```bash
git add src/components/expense/SideNav.vue
git commit -m "feat(sidenav): desktop 240px left navigation with logo + active item"
```

---

## Task 4: SummaryPanel 新组件

**Files:**
- Create: `src/components/expense/SummaryPanel.vue`

**Interfaces:**
- Consumes:
  - `useExpenseStore`（从 `@/stores/expense` 导入）
  - `useDraftStorage`（从 `@/utils/draftStorage` 导入）
  - `useToast`（从 `@/composables/useToast` 导入）
  - `formatMoney`（从 `@/utils/money` 导入）
  - `BaseButton`（从 `../base/BaseButton.vue` 导入）
- Produces:
  - Props: `total: number`、`isValid: boolean`
  - Emits: `(e: 'submit'): void`

**为什么独立**：纯新增，依赖的 store/util/composable 都已存在；与 Task 3 平行。

- [ ] **Step 1: 读取 BottomBar.vue 的保存草稿逻辑**

读 `src/components/expense/BottomBar.vue:1-27` 确认保存草稿实现：
```ts
const draft = expense.toDraft()
useDraftStorage().save(draft)
toast.show({ message: '已保存为草稿', type: 'success' })
```

> 注意：原 BottomBar 每次点击都 `useDraftStorage()` 重新调用一次（`src/utils/draftStorage.ts:47-49` 内部 `return draftStorage()` 每次都新建对象），是既存的小浪费。**SummaryPanel 应在 script 顶层调用一次并复用**，不顺手修 BottomBar（避免越界）。

- [ ] **Step 2: 创建 SummaryPanel.vue**

新建 `src/components/expense/SummaryPanel.vue`，内容：

```vue
<script setup lang="ts">
import BaseButton from '../base/BaseButton.vue'
import { useToast } from '@/composables/useToast'
import { useDraftStorage } from '@/utils/draftStorage'
import { useExpenseStore } from '@/stores/expense'
import { formatMoney } from '@/utils/money'

interface Props {
  total: number
  isValid: boolean
}

withDefaults(defineProps<Props>(), { total: 0, isValid: false })

const emit = defineEmits<{ (e: 'submit'): void }>()

const toast = useToast()
const expense = useExpenseStore()
const draftStorage = useDraftStorage()  // 顶层复用，saveDraft 内不再重复实例化

function saveDraft() {
  const draft = expense.toDraft()
  draftStorage.save(draft)
  toast.show({ message: '已保存为草稿', type: 'success' })
}

function submit() {
  emit('submit')
}
</script>

<template>
  <aside class="summary-panel" aria-label="报销汇总">
    <div class="summary-panel__label">报销总额</div>
    <div class="summary-panel__amount">
      <span class="summary-panel__symbol">¥</span>
      <span class="summary-panel__num">{{ formatMoney(total) }}</span>
    </div>

    <div class="summary-panel__divider" />

    <div class="summary-panel__actions">
      <BaseButton variant="secondary" size="md" block @click="saveDraft">保存草稿</BaseButton>
      <BaseButton
        variant="primary"
        size="md"
        block
        :disabled="!isValid"
        @click="submit"
      >提交</BaseButton>
    </div>

    <div class="summary-panel__hint">提交后将进入审批流程</div>
  </aside>
</template>

<style scoped>
.summary-panel {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-m);          /* card-elevated */
  padding: var(--space-lg);
  display: none;                        /* Mobile 默认隐藏（additive media query） */
  flex-direction: column;
  gap: var(--space-md);
  position: sticky;
  top: var(--layout-navbar-offset);
}

.summary-panel__label {
  font-size: var(--font-size-tiny);
  color: var(--color-body);
  letter-spacing: 0.5px;
}

.summary-panel__amount {
  display: flex;
  align-items: baseline;
  gap: 4px;
}
/* 金额用 ink 而非 error：error 色（红/橙）语义为"错误/危险"，
   报销总额是业务正向结果，用 error 会给用户"出错了"的负向暗示 */
.summary-panel__symbol {
  font-size: 18px;
  font-weight: 500;
  color: var(--color-ink);
}
.summary-panel__num {
  font-size: 32px;
  font-weight: 600;
  color: var(--color-ink);
  letter-spacing: -0.5px;
  font-variant-numeric: tabular-nums;
  font-family: var(--font-family-mono);
}

.summary-panel__divider {
  height: 1px;
  background: var(--color-hairline);
  margin: var(--space-xs) 0;
}

.summary-panel__actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.summary-panel__hint {
  font-size: var(--font-size-tiny);
  color: var(--color-mute);
  text-align: center;
  margin-top: var(--space-xs);
}

/* 桌面端才显示（与代码库其他组件一致的 additive 媒体查询） */
@media (min-width: 960px) {
  .summary-panel { display: flex; }
}
</style>
```

- [ ] **Step 3: 验证 typecheck + build**

```bash
pnpm typecheck
pnpm build
```

Expected：成功。

- [ ] **Step 4: Commit**

```bash
git add src/components/expense/SummaryPanel.vue
git commit -m "feat(summary-panel): desktop sticky 280px right panel with total+actions"
```

---

## Task 5: BottomBar 桌面端废除

**Files:**
- Modify: `src/components/expense/BottomBar.vue:64-87`（删除整块 `@media (min-width: 960px)` 样式块）

**Interfaces:**
- Consumes: 无
- Produces: BottomBar 恢复为纯 Mobile 吸底组件；Desktop 下完全由 SummaryPanel 接管操作

**为什么独立**：只删一个 CSS 块，与其他文件无交集。

- [ ] **Step 1: 删除桌面端样式块 + 新增隐藏规则**

读 `src/components/expense/BottomBar.vue:64-87`，**删除**整段：

```css
/* 桌面端：右下角浮动面板，上下堆叠两按钮 */
@media (min-width: 960px) {
  .bottom-bar {
    position: fixed;
    right: 32px;
    bottom: 32px;
    left: auto;
    width: 144px;
    padding: 12px;
    background: var(--color-canvas);
    border: 1px solid var(--color-hairline);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-m);
  }
  .bottom-bar__inner {
    flex-direction: column;
    gap: 8px;
  }
  .bottom-bar__inner :deep(.base-btn--secondary),
  .bottom-bar__inner :deep(.base-btn--primary) {
    flex: none;
    width: 100%;
  }
}
```

然后在 `<style scoped>` 块**最末尾**（Mobile 样式后）新增一条桌面端隐藏规则：

```css
/* 桌面端隐藏：操作面板由 SummaryPanel 接管 */
@media (min-width: 960px) {
  .bottom-bar { display: none; }
}
```

> **为什么不放 ExpenseReimburse.vue 里**：BottomBar 的展示行为应内聚在自身组件里，避免 view 文件累积条件样式。

最终 `<style scoped>` 块应只包含：
- Mobile 吸底样式（原本就在）
- 新增的桌面端 `display: none` 规则

- [ ] **Step 2: 验证 typecheck + build**

```bash
pnpm typecheck
pnpm build
```

Expected：成功。

- [ ] **Step 3: Commit**

```bash
git add src/components/expense/BottomBar.vue
git commit -m "refactor(bottom-bar): remove desktop FAB styles (moved to SummaryPanel)"
```

---

## Task 6: ExpenseReimburse.vue 3 列组合（依赖 Task 2/3/4/5 全部完成）

**Files:**
- Modify: `src/views/ExpenseReimburse.vue:124-168`（替换 template 主体）+ `:201-204`（替换 style 桌面端块）

**Interfaces:**
- Consumes:
  - `SideNav`（Task 3 产出）
  - `SummaryPanel`（Task 4 产出，Props: `total: number, isValid: boolean`，Emits: `submit`）
  - 桌面端 token（Task 1 产出）
- Produces: 3 列布局的根模板 + 桌面端 grid 样式

**为什么在最后**：唯一同时引用 4 个并行 task 产出的文件，必须串行。

- [ ] **Step 1: 读取现有 ExpenseReimburse.vue 完整结构**

读 `src/views/ExpenseReimburse.vue:1-205` 完整文件，重点关注：
- `template` 第 124-168 行（main 容器）
- `style scoped` 第 201-204 行（桌面端媒体查询）
- `handleSubmit` 函数（提交逻辑，第 58-105 行）
- `setItemCardRef` 函数（ref 收集逻辑，第 112-121 行）

- [ ] **Step 2: 引入 SideNav + SummaryPanel**

在 `src/views/ExpenseReimburse.vue:7-18` 的 import 块末尾追加：

```ts
import SideNav from '@/components/expense/SideNav.vue'
import SummaryPanel from '@/components/expense/SummaryPanel.vue'
```

- [ ] **Step 3: 替换 template 主体**

将 `src/views/ExpenseReimburse.vue:125-167` 替换为：

```vue
<template>
  <div class="reimburse-page">
    <NavBar />

    <div class="reimburse-layout">
      <SideNav />

      <main class="page-main">
        <RelatedApply />

        <TotalCard :total="expense.totalAmount" />

        <ItemCard
          v-for="(item, index) in expense.items"
          :key="item.id"
          :item="item"
          :index="index"
          :removable="expense.items.length > 1"
          :errors="errors[index] || {}"
          :ref="(el) => setItemCardRef(el, index)"
          @remove="expense.removeItem"
          @clear-error="(k) => clearItemError(index, k)"
        />

        <button
          type="button"
          class="add-detail-card"
          @click="expense.addItem"
        >
          + 添加报销明细
        </button>

        <InvoiceBlock />

        <OwnershipSection />

        <BusinessFieldsSection />

        <NotifySection />

        <FlowSection ref="flowSectionRef" />

        <DingtalkFooter />
      </main>

      <SummaryPanel
        :total="expense.totalAmount"
        :is-valid="expense.isValid"
        @submit="handleSubmit"
      />
    </div>

    <BottomBar :is-valid="expense.isValid" @submit="handleSubmit" />
  </div>
</template>
```

> 不再传 `class="reimburse-layout__nav"` / `reimburse-layout__summary`：Step 4 的 grid 改用 `align-items: start` 在容器层统一管理，不再需要子元素带 grid 专属 class（删除冗余 class 避免误导）。

- [ ] **Step 4: 替换 style 桌面端块**

将 `src/views/ExpenseReimburse.vue:201-204` 替换为：

```css
@media (min-width: 960px) {
  .reimburse-layout {
    display: grid;
    grid-template-columns:
      var(--layout-3col-nav-width)
      minmax(0, var(--layout-3col-form-width))
      var(--layout-3col-summary-width);
    gap: var(--layout-3col-gap);
    align-items: start;             /* 统一管理 sticky 子元素的对齐 */
    max-width: var(--layout-3col-max-width);
    margin: 0 auto;
    padding: var(--space-lg) var(--layout-3col-padding-x) var(--layout-3col-padding-bottom);
  }
  /* 移除重复的 align-self: start：sticky 组件自身已管理 top offset，
     grid 容器只需要 align-items: start，子元素按内容顶部对齐 */

  .page-main { gap: 16px; padding: 0; background: transparent; }
  .add-detail-card { margin: 0; }
}
```

> 重要 token 说明（来自 Task 1）：
> - `--layout-3col-nav-width: 240px`、`--layout-3col-summary-width: 280px`：左右两列硬宽度
> - `--layout-3col-form-width: 720px`：居中表单列宽上限（用 `minmax(0, 720px)` 避免内容撑爆）
> - `--layout-3col-gap: 24px`：列间距
> - `--layout-3col-max-width: 1320px`：grid 容器最大宽度（240 + 24 + 720 + 24 + 280 + 32 padding = 1320）
> - `--layout-3col-padding-x: 16px` / `--layout-3col-padding-bottom: 96px`：容器内边距（96 沿用 v1.1 .page-main 的 bottom，给 DingtalkFooter 留白）
>
> 注意：原 `.reimburse-page` 的 `background: var(--color-canvas-soft)` 在 Mobile / Desktop 下都生效（保持原状），3 列布局内的 section 由各自组件的 card 背景提供白色。`.page-main` 在桌面端需把 `background: transparent` 显式覆盖（Mobile 下无背景）。

- [ ] **Step 5: 验证 typecheck + build + test**

```bash
pnpm typecheck
pnpm test
pnpm build
```

Expected：
- typecheck: 0 errors
- test: 4 files / 35 tests passed
- build: 成功

- [ ] **Step 6: Commit**

```bash
git add src/views/ExpenseReimburse.vue
git commit -m "feat(reimburse-view): 3-column desktop layout (sidenav + form + summary panel)"
```

---

## Task 7: 综合验证（typecheck / test / build + Chrome DevTools 1440×900 端到端）

**Files:**
- Modify: `.superpowers/sdd/progress.md`（追加 v1.2 段）

**Interfaces:**
- Consumes: 全部 6 个 task 的产出
- Produces: 验证报告 + progress.md 追加

- [ ] **Step 1: 三绿验证**

```bash
pnpm typecheck
pnpm test
pnpm build
```

Expected：
- typecheck: 0 errors
- test: 4 files / 35 tests passed
- build: 成功（如有 119 modules / 5 chunks 与 v1.1 不同的数字，记录即可）

- [ ] **Step 2: Chrome DevTools 启动并打开 1440×900**

用 `chrome-devtools_new_page` 打开 dev server（`pnpm dev` 已在跑），设置 viewport 为 1440×900：

```bash
# 在另一个 shell 中启动 dev server（如果还没启动）
pnpm dev
```

然后用 `chrome-devtools_resize_page` 设置 1440×900，导航到首页。

- [ ] **Step 3: 13 项关键检查**

用 `chrome-devtools_evaluate_script` 执行以下检查函数，验证 Desktop 3 列布局：

```js
() => {
  const checks = []

  // 1. 3 列骨架存在
  const layout = document.querySelector('.reimburse-layout')
  const computed = layout ? getComputedStyle(layout) : null
  const cols = computed ? computed.gridTemplateColumns.split(' ').map(parseFloat) : []
  checks.push({ name: '3 列骨架', ok: cols.length === 3, detail: cols.join(' / ') })

  // 2. 列宽 240 / 720 / 280
  checks.push({
    name: '列宽 240/720/280',
    ok: Math.abs(cols[0] - 240) < 1 && Math.abs(cols[1] - 720) < 1 && Math.abs(cols[2] - 280) < 1,
    detail: cols.join(' / ')
  })

  // 3. max-width 1320px（来自 --layout-3col-max-width）
  checks.push({ name: 'max-width 1320', ok: computed?.maxWidth === '1320px' })

  // 4. SideNav 存在且显示「日常报销」
  const sidenav = document.querySelector('.side-nav')
  const sidenavText = sidenav?.textContent || ''
  checks.push({ name: 'SideNav 存在', ok: !!sidenav, detail: sidenavText.slice(0, 30) })
  checks.push({ name: 'SideNav 含日常报销', ok: sidenavText.includes('日常报销') })
  checks.push({ name: 'SideNav 选中态', ok: !!document.querySelector('.side-nav__item--active') })

  // 5. NavBar 毛玻璃
  const nav = document.querySelector('.nav-bar')
  const navStyle = nav ? getComputedStyle(nav) : null
  checks.push({
    name: 'NavBar 毛玻璃',
    ok: navStyle?.backdropFilter?.includes('blur') || navStyle?.webkitBackdropFilter?.includes('blur'),
    detail: navStyle?.backdropFilter
  })

  // 6. TotalCard 居中
  const total = document.querySelector('.total-card')
  checks.push({ name: 'TotalCard 存在', ok: !!total })

  // 7. ItemCard 2 列
  const itemGrid = document.querySelector('.item-card__grid')
  const itemDisplay = itemGrid ? getComputedStyle(itemGrid).display : null
  checks.push({ name: 'ItemCard grid', ok: itemDisplay === 'grid' })

  // 8. AddDetailButton
  checks.push({ name: 'AddDetail 按钮', ok: !!document.querySelector('.add-detail-card') })

  // 9. SummaryPanel sticky
  const summary = document.querySelector('.summary-panel')
  const summaryStyle = summary ? getComputedStyle(summary) : null
  checks.push({
    name: 'SummaryPanel sticky',
    ok: summaryStyle?.position === 'sticky' && summaryStyle?.top === '72px'   // --layout-navbar-offset 解析后等于 72px
  })

  // 10. SummaryPanel 含提交按钮
  checks.push({
    name: 'SummaryPanel 提交按钮',
    ok: !!summary?.querySelector('button')
  })

  // 11. SummaryPanel 含「提交后将进入审批流程」
  checks.push({
    name: 'SummaryPanel 提示文案',
    ok: summary?.textContent?.includes('提交后将进入审批流程') || false
  })

  // 12. BottomBar 桌面端隐藏（仅断言 desktop 期望的 display: none；
  //     原版的 `|| position === 'sticky'` 在 mobile 也成立、永远为真，弱校验已修复）
  const bottom = document.querySelector('.bottom-bar')
  const bottomStyle = bottom ? getComputedStyle(bottom) : null
  checks.push({
    name: 'BottomBar 桌面端不显示',
    ok: bottomStyle?.display === 'none'
  })

  // 13. DingtalkFooter 存在
  checks.push({ name: 'DingtalkFooter', ok: !!document.querySelector('.dingtalk-footer, [class*="footer"]') })

  return checks
}
```

所有 checks 应当 `ok: true`。

- [ ] **Step 4: Mobile 回归（375×667）**

用 `chrome-devtools_resize_page` 切到 375×667，跑以下检查：

```js
() => {
  const checks = []
  // SideNav 隐藏
  const sidenav = document.querySelector('.side-nav')
  checks.push({ name: 'SideNav Mobile 隐藏', ok: getComputedStyle(sidenav).display === 'none' })
  // SummaryPanel 隐藏
  const summary = document.querySelector('.summary-panel')
  checks.push({ name: 'SummaryPanel Mobile 隐藏', ok: getComputedStyle(summary).display === 'none' })
  // BottomBar 吸底
  const bottom = document.querySelector('.bottom-bar')
  const bs = getComputedStyle(bottom)
  checks.push({ name: 'BottomBar Mobile 吸底', ok: bs.position === 'sticky' })
  // ItemCard 单列
  const itemGrid = document.querySelector('.item-card__grid')
  checks.push({ name: 'ItemCard Mobile 单列', ok: getComputedStyle(itemGrid).display === 'flex' })
  return checks
}
```

所有 checks 应当 `ok: true`。

- [ ] **Step 5: 提交流程**

1. 切回 1440×900
2. 在第一个 ItemCard 的金额输入框填 `200`
3. 选日期 `2026-07-08`
4. 选费用类型 `transport`
5. 在 FlowSection 选付款人
6. 点击 SummaryPanel 的「提交」按钮
7. 验证 Toast 显示「已提交报销单 · 总额 ¥200.00」

- [ ] **Step 6: 追加 progress.md**

在 `.superpowers/sdd/progress.md` 末尾追加：

```markdown

## Plan C (v1.2.1) 日常报销桌面端重构 2026-07-08
**Plan**: 2026-07-08-expense-reimburse-desktop-redesign.md
**Branch**: main
**Final state**: 全部 7 tasks 完成，typecheck/test/build 三绿 + 1440×900 端到端 13/13 + Mobile 回归 4/4 + v1.2.1 codex-review 12 项修复全部闭合

### Plan C Task Status
| Task | 提交 | 状态 |
|---|---|---|
| 1 tokens.css 桌面端切换 + 3 列 layout token | (本批次) | ✅ |
| 2 NavBar 桌面端 blur | (本批次) | ✅ |
| 3 SideNav 新组件（v1.2.1 改 button/nav） | (本批次) | ✅ |
| 4 SummaryPanel 新组件（v1.2.1 顶层 useDraftStorage / ink 色） | (本批次) | ✅ |
| 5 BottomBar 桌面端废除 | (本批次) | ✅ |
| 6 ExpenseReimburse 3 列组合（v1.2.1 用 layout token） | (本批次) | ✅ |
| 7 综合验证 | (无新提交) | ✅ |

### 关键变更
- 新增 2 个组件：SideNav (240px 左) + SummaryPanel (280px 右 sticky)
- 改造 4 个文件：tokens.css / NavBar.vue / BottomBar.vue / ExpenseReimburse.vue
- 桌面端 3 列布局：side-nav + 居中表单 + sticky 汇总
- 视觉克制升级：blur NavBar / shadow s→m / 字号阶梯 / card-interactive
- v1.2.1：合并 :root + dark 选择器防止 token 反转；新增 8 个 layout token；SideNav 改 button 元素 + landmark 语义
- 不动：Mobile / store / composable / 35 个测试
```

- [ ] **Step 7: 最终 commit（如有未提交改动）**

```bash
git status
git add .superpowers/sdd/progress.md
git commit -m "docs(sdd): v1.2 desktop redesign plan C complete"
```

---

## Self-Review

1. **Spec coverage**：
   - ✅ Spec §4.1 token 切换 → Task 1
   - ✅ Spec §4.2 3 列布局 → Task 6
   - ✅ Spec §4.3 NavBar blur → Task 2
   - ✅ Spec §4.4 SideNav → Task 3
   - ✅ Spec §4.5 SummaryPanel → Task 4
   - ✅ Spec §4.6 BottomBar 废除 → Task 5
   - ✅ Spec §5 接口契约 → Task 3/4/6
   - ✅ Spec §6 验收 → Task 7

2. **Placeholder scan**：
   - ✅ 无 TBD / TODO
   - ✅ 全部代码块含具体 token 名 + 数值
   - ✅ 验证命令 + 期望输出明确

3. **Type consistency**：
   - ✅ SummaryPanel Props: `total: number, isValid: boolean` 在 Task 4 定义，Task 6 消费时签名一致
   - ✅ SideNav 无 Props/Emits，Task 6 仅作为子组件挂载（无 class 透传）
   - ✅ `handleSubmit` 事件签名与 Task 4 emit 一致

4. **并行可行性**：
   - ✅ Task 1 → Task 2/3/4/5 无相互依赖
   - ✅ Task 3 (SideNav) 与 Task 4 (SummaryPanel) 无共享文件
   - ✅ Task 2 (NavBar) 与 Task 5 (BottomBar) 不同文件
   - ✅ Task 6 在 Task 2/3/4/5 全部完成后串行
   - ✅ Task 7 在 Task 6 完成后串行

5. **风险覆盖**：
   - ✅ R1 backdrop-filter 兼容 → Task 2 加 `-webkit-` 前缀
   - ✅ R2 grid 撑爆 → Task 6 用 `minmax(0, var(--layout-3col-form-width))`
   - ✅ R3 token 切换影响测试 → 已确认 35 个测试不渲染组件
   - ✅ R4 SummaryPanel 草稿逻辑 → Task 4 复用 BottomBar 同套 store/storage/toast

6. **v1.2.1 codex-review 修复（见顶部 Plan Revisions 表）**：
   - ✅ P1 桌面端 token 深色模式反转 → Task 1 Step 3 合并选择器
   - ✅ P2 SideNav 语义（href="#" / nav 嵌套）→ Task 3 Step 2
   - ✅ P2 sticky top 与 3 列布局硬编码 → Task 1 Step 2 新增 token，Task 3/4/6 引用
   - ✅ P2 useDraftStorage 重复实例化 → Task 4 Step 2 顶层复用
   - ✅ P3 align-self 冗余 / 反向媒体查询 / 金额 error 色 / Check #12 弱校验 → 全部闭合
