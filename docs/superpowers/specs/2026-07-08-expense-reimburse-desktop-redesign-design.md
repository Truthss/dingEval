# 钉钉「日常报销」桌面端重构设计 v1.2

**日期**：2026-07-08
**状态**：设计中
**关联**：`DESIGN.md`（钉钉设计系统 dingtalk_common 主题）

## 1. 目标

将钉钉「日常报销」页面桌面端（≥960px）按 `DESIGN.md` 重构为 3 列工作台形态：**左侧 240px side-nav + 中间 720px 居中表单 + 右侧 280px sticky 汇总面板**。Mobile 端保持原样不动。

> **不涉及**：业务流程、store、composable、mock、文案规范、单元测试、Mobile / Tablet 断点适配。

## 2. 设计决策摘要

| 决策点 | 选择 |
|---|---|
| 重构范围 | 只重做 Desktop (≥960px) |
| 核心布局 | 经典 3 列：side-nav + 表单 + sticky 汇总 |
| 表单组织 | 保持原 section 划分，内部 2 列对齐 |
| side-nav 内容 | 仅 1 个导航项「日常报销」+ Logo + 钉钉字样 |
| 视觉特性 | 克制启用：blur NavBar + shadow s→m + 桌面端字号阶梯 + card-interactive |
| 右侧汇总面板 | 总额 + 两按钮 + 提示 |
| BottomBar 桌面端 | 废除（FAB 样式删除，仅 Mobile 保留） |
| 验证基准 | 仅 1440×900 |

## 3. 文件清单

### 3.1 新增（2 个组件）

| 路径 | 职责 |
|---|---|
| `src/components/expense/SideNav.vue` | 桌面端左侧 240px 导航 |
| `src/components/expense/SummaryPanel.vue` | 桌面端右侧 280px sticky 汇总 |

### 3.2 改造（4 个文件）

| 路径 | 改动范围 |
|---|---|
| `src/styles/tokens.css` | 末尾追加 `@media (min-width: 960px)` 桌面端 token 切换块 |
| `src/components/expense/NavBar.vue` | Desktop 下启用 blur 毛玻璃 + 升级 H2 字号（17→18） |
| `src/components/expense/BottomBar.vue` | 删除 `@media (min-width: 960px)` 内所有样式块 |
| `src/views/ExpenseReimburse.vue` | 引入 3 列 wrapper，组合 SideNav + SummaryPanel |

### 3.3 完全不动

- 12 个 base 组件（`BaseButton` / `BaseInput` / `BaseSelect` / `BaseField` / `BaseCard` / `BaseTextarea` / `BaseDatePicker` / `BaseCapsule` / `BaseActionSheet` / `BaseTag` / `BaseToast` / `DingIcon`）
- 4 个 composable（`useToast` / `useDraftRestore` / `useFormValidation` / `useActionSheet`）
- 1 个 store（`expense.ts`）
- 3 个 util（`money` / `id` / `draftStorage`）
- 7 个 mock
- 4 套 35 个测试用例（`money` 11 / `draftStorage` 6 / `useFormValidation` 8 / `expense` 10）
- 9 个 expense 组件（NavBar / TotalCard / ItemCard / OwnershipSection / BusinessFieldsSection / NotifySection / FlowSection / RelatedApply / InvoiceBlock / DingtalkFooter / AttachmentBlock / InvoiceSubBlock 的本体；仅 NavBar 的桌面端样式 + BottomBar 的桌面端样式删除这两处改样式）
- 路由（`router/index.ts`）
- `App.vue` / `main.ts`

## 4. 视觉规范

### 4.1 桌面端 token 切换（仅在 `@media (min-width: 960px)` 内）

| Token | Mobile 值 | Desktop 值 |
|---|---|---|
| `--font-size-body` | 17px | **14px** |
| `--font-size-h1` | 20px | **24px** |
| `--font-size-h2` | 18px | **20px** |
| `--font-size-description` | 14px | **13px** |
| `--shadow-s` | `0px 1px 4px rgba(0,0,0,0.16)` | `0px 2px 8px rgba(0,0,0,0.08)` |
| `--shadow-m` | `0px 8px 24px rgba(0,0,0,0.16)` | `0px 8px 24px rgba(0,0,0,0.12)` |

> 颜色 token（ink / body / mute / primary / surface 等）保持不变——DESIGN.md 强调"颜色即层级"靠透明度阶而非重新定义。

### 4.2 3 列布局

```
max-width: 1320px
margin: 0 auto
padding: 24px 16px 96px
display: grid
grid-template-columns: 240px minmax(0, 720px) 280px
gap: 24px
align-items: start
```

3 列背景均为 `var(--color-canvas-soft)`；内部白色卡片提供 z 轴高度差。

### 4.3 NavBar 桌面端改造

```css
@media (min-width: 960px) {
  .nav-bar {
    background: rgba(255, 255, 255, 0.88);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--color-hairline);
    box-shadow: none;
  }
  .nav-bar__title { font-size: 18px; }
}
```

> Firefox 78+ / Chrome / Safari / Edge 均支持 `backdrop-filter`，保留 `-webkit-` 前缀兜底老版 Safari。

### 4.4 SideNav 组件规范

- 容器：`<aside class="side-nav">`，圆角 `var(--radius-md)`，背景 `var(--color-surface)`，阴影 `var(--shadow-s)`
- padding：`var(--spacing.lg)` (24px)
- 内容：
  1. 头部：32x32 钉钉 Logo（用 `DingIcon name="dingtalk"` 或方形 placeholder）+ 「钉钉」字样（16px / weight 500 / ink）
  2. 分割线（hairline 1px）
  3. 导航标题「导航」（caption 12px / mute）
  4. 唯一 item「日常报销」：左侧对勾图标（primary 蓝色 16px），右侧文案（body-md 14px / primary 色），背景 `rgba(0, 127, 255, 0.12)`
  5. 底部留白 + 版本号「v0.1.0」（caption 10px / mute）
- Mobile 端：`<SideNav class="hidden-mobile" />`，`@media (max-width: 959.98px) { .hidden-mobile { display: none; } }`

### 4.5 SummaryPanel 组件规范

- 容器：`<aside class="summary-panel">`，圆角 `var(--radius-md)`，背景 `var(--color-surface)`，阴影 `var(--shadow-m)`（card-elevated）
- padding：`var(--spacing.lg)` (24px)
- 内容（自上而下）：
  1. 「报销总额」标签（caption 12px / body）
  2. 金额大数字：`¥ {{ formatMoney(total) }}`，**32px / weight 600 / error 红 / font-variant-numeric: tabular-nums**
  3. hairline 分割线
  4. 「保存草稿」按钮（secondary variant, block, size md）
  5. 「提交」按钮（primary variant, block, size md, disabled 当 !isValid）
  6. 提示文案「提交后将进入审批流程」（caption 12px / mute）
- 位置：`position: sticky; top: 72px; align-self: start;`
- 保存草稿逻辑：与 BottomBar 共用——直接调 `useExpenseStore` 的 `toDraft()` + `useDraftStorage().save()`，然后 toast 显示「已保存为草稿」
- 提交逻辑：emit `submit` 事件，由父组件 `ExpenseReimburse.vue` 的 `handleSubmit` 消费
- Mobile 端：`@media (max-width: 959.98px) { .summary-panel { display: none; } }`，由 BottomBar 兜底

### 4.6 BottomBar 改造

- **删除** `.bottom-bar` 内 `@media (min-width: 960px) { ... }` 整块（约 22 行）
- 保留移动端底部吸底两按钮实现不变
- 整个组件仍然存在并被 `ExpenseReimburse.vue` 引用，因为 Mobile 视图还需要

## 5. 接口契约

### 5.1 SideNav.vue

```ts
// Props: 无
// Emits: 无
// Consumes: 内部使用 DingIcon
```

### 5.2 SummaryPanel.vue

```ts
interface Props {
  total: number       // 报销总额（元）
  isValid: boolean    // 提交流程是否合法
}

defineEmits<{
  (e: 'submit'): void
}>()
```

- Consumes: `useExpenseStore`（调 `toDraft()`）、`useDraftStorage`（调 `save()`）、`useToast`（调 `show()`）
- Produces: emit `submit` 事件

### 5.3 ExpenseReimburse.vue 模板结构

```vue
<template>
  <div class="reimburse-page">
    <NavBar />

    <div class="reimburse-layout">
      <SideNav class="reimburse-layout__nav" />

      <main class="page-main">
        <RelatedApply />
        <TotalCard :total="expense.totalAmount" />
        <ItemCard v-for="(item, index) in expense.items" :key="item.id" ... />
        <button class="add-detail-card" @click="expense.addItem">+ 添加报销明细</button>
        <InvoiceBlock />
        <OwnershipSection />
        <BusinessFieldsSection />
        <NotifySection />
        <FlowSection ref="flowSectionRef" />
        <DingtalkFooter />
      </main>

      <SummaryPanel
        class="reimburse-layout__summary"
        :total="expense.totalAmount"
        :is-valid="expense.isValid"
        @submit="handleSubmit"
      />
    </div>

    <BottomBar :is-valid="expense.isValid" @submit="handleSubmit" />
  </div>
</template>
```

> `handleSubmit` 逻辑完全不变，仍由 `ExpenseReimburse.vue` 拥有。

## 6. 验收标准

### 6.1 自动化

- `pnpm typecheck` → 0 errors
- `pnpm test` → 4 files / 35 tests passed（不新增）
- `pnpm build` → 成功

### 6.2 Chrome DevTools 1440×900 端到端（13 项）

1. 3 列骨架存在，列宽 240 / 720 / 280
2. max-width 1320px 居中
3. SideNav 显示「钉钉」+「日常报销」选中态
4. NavBar 毛玻璃生效（`backdrop-filter: blur(10px)`）
5. TotalCard 居中显示
6. ItemCard 桌面端 grid 2 列
7. AddDetailButton 存在
8. OwnershipSection / BusinessFieldsSection 桌面端 2 列
9. NotifySection / FlowSection 单列
10. DingtalkFooter 存在
11. SummaryPanel sticky，top 72px
12. SummaryPanel 总额（32px error 红）/ 保存草稿 / 提交 / 提示全部可见
13. BottomBar 桌面端不显示

### 6.3 Mobile 375×667 回归（保留 v1.1 的 10 项）

### 6.4 提交流程

桌面端填金额 200 + 日期 2026-07-08 + 费用类型 transport + 付款人 → 提交 → Toast "已提交报销单 · 总额 ¥200.00"。

## 7. 不做事项（Out of Scope）

- 不引入 side-nav 多导航项
- 不启用 AI 渐变 / 商业化色块 / 商业化付费版本色块
- 不新增单测
- 不动文案规范（DESIGN.md Appendix A）
- 不动 Mobile / Tablet（仅 1440×900 验证）
- 不改 store / composable / 业务流程
- 不引入 side-nav 折叠 / 抽屉 / 汉堡菜单
- 不引入主题切换 UI

## 8. 风险与缓解

| ID | 风险 | 缓解 |
|---|---|---|
| R1 | Firefox 78+ 之前不支持 `backdrop-filter` | 加 `-webkit-backdrop-filter` 前缀 |
| R2 | grid 子项内容过长可能撑爆列宽 | `minmax(0, 720px)` 强制收窄 |
| R3 | token 切换影响 35 个测试的渲染结果 | 测试只测 store / util / composable，不渲染组件，安全 |
| R4 | SummaryPanel 与 BottomBar 的「保存草稿」逻辑重复 | 直接复用同一 store + storage + toast 调用 |
| R5 | NavBar 毛玻璃在弱 GPU 上掉帧 | 桌面端特有，移动端仍 solid 背景，性能压力小 |

## 9. 设计自审（brainstorming spec self-review）

- ✅ 无 TBD / TODO
- ✅ 内部一致：所有 token、列宽、字号、圆角、阴影均给出确切值
- ✅ 范围聚焦：单次实现计划，单一子系统
- ✅ 歧义消解：「克制启用」「不做事项」明确列出
- ✅ 与 v1.1 兼容：Mobile 完全不动，store / composable / 测试不破坏
