# 钉钉「日常报销」桌面端重构 v1.3

**日期**：2026-07-08
**状态**：设计中
**关联**：
- `DESIGN.md`（钉钉设计系统 dingtalk_common 主题）
- `prd.md`（日常报销字段功能定义）
- `docs/superpowers/specs/2026-07-02-expense-reimburse-design.md`（v1.1 移动端）
- `docs/superpowers/specs/2026-07-03-expense-reimburse-desktop-adaptation-design.md`（v1.2 桌面端适配）
- `docs/superpowers/specs/2026-07-08-expense-reimburse-desktop-redesign-design.md`（v1.2.1 桌面端重构，未实施）

---

## 1. 目标

完全清理前端 UI 内容，**从头构建桌面端单页应用**：

1. **删除移动端**：移除所有 `< 960px` 断点适配、postcss-px-to-viewport、@media 响应式
2. **删除原子组件层**：移除 12 个 Base* 组件
3. **重写前端业务层**：store → composable；composable/utils/mocks 全部推倒重写
4. **保留**：Python Flask API、钉钉集成（SSO/JSAPI/工作通知）、DESIGN.md token 体系、prd.md 字段功能
5. **新架构**：顶部头 + 单页长表单 + 锚点目录，居中 720px 布局
6. **验证基准**：1440×900

---

## 2. 设计决策摘要

| 决策点 | 选择 | 理由 |
|---|---|---|
| 范围 | 前端 UI + 业务层全重写；后端不动 | 题目要求"完全清理前端" |
| 视觉规范 | 沿用 DESIGN.md 钉钉设计 token | 与现有设计系统一致；避免重新调谐 |
| 断点 | 单尺寸 1440×900 | 明确"清除移动端" |
| 布局 | 顶部头 + 居中表单（无 SideNav） | 用户选定 |
| 表单组织 | 单页长表单 + 顶部锚点 | 用户选定 |
| 状态管理 | composable（reactive + computed + actions） | 不需要 Pinia 的多 store；单页面单实例 |
| 组件粒度 | 12 个业务组件，无 Base* 原子层 | 方案 A「极简」 |
| 测试 | composable 11 用例 + api 4 用例 | 核心业务路径覆盖 |
| 桌面端尺寸 | 1440×900 | 明确 |
| 适配宽度 | 不适配 <1280 / >1920 宽度 | 不做响应式 |

---

## 3. 文件清单

### 3.1 保留（完全不动）
| 路径 | 说明 |
|---|---|
| `api/` | Python Flask 端点（钉钉 SSO/JSAPI/工作通知） |
| `server.py` | Flask 入口 |
| `vercel.json` | Vercel 部署配置 |
| `requirements.txt` | Python 依赖 |
| `DESIGN.md` | 钉钉设计系统源文档 |
| `prd.md` | 复刻任务 PRD |
| `index.html` | 入口 HTML |
| `vitest.setup.ts` | 测试 setup |
| `tsconfig.json` / `tsconfig.node.json` | TS 配置 |
| `.gitignore` | Git 忽略 |

### 3.2 删除（清空）
| 路径 | 数量 | 说明 |
|---|---|---|
| `src/components/base/` | 12 | BaseActionSheet、BaseButton、BaseCapsule、BaseCard、BaseDatePicker、BaseField、BaseInput、BaseSelect、BaseTag、BaseTextarea、BaseToast、DingIcon |
| `src/components/expense/` | 15 | AttachmentBlock、BottomBar、BusinessFieldsSection、DingtalkFooter、FlowSection、InvoiceBlock、InvoiceSubBlock、ItemCard、NavBar、NotifySection、OwnershipSection、RelatedApply、SideNav、SummaryPanel、TotalCard |
| `src/composables/` | 7 | useActionSheet、useContactList、useDingtalkAuth、useDingtalkJsapi、useDraftRestore、useFormValidation、useToast |
| `src/stores/expense.ts` | 1 | Pinia store |
| `src/utils/draftStorage.ts` | 1 | 草稿存储 |
| `src/utils/money.ts` | 1 | 金额格式化 |
| `src/utils/id.ts` | 1 | ID 生成 |
| `src/mocks/` | 7 | accounts、categories、chats、customers、entities、persons、projects |
| `src/__tests__/` | 3 个目录，35 个用例 | composables / stores / utils 测试 |
| `src/styles/base.css` | 1 | 全部全局类（field/card/sub-block/chip/flow-list/add-btn...） |
| `src/types/expense.ts` | 1 | 类型定义（合并到 composable 内部） |
| `src/views/ExpenseReimburse.vue` | 1 | 主页面（重建） |
| `src/App.vue` | 1 | 重建 |

### 3.3 新建（最终目录）
```
src/
├── App.vue                              # 极简壳：router-view + 全局挂载
├── main.ts                              # 入口：挂载 App、注册 router、注入 form
├── env.d.ts                             # Vue 模块声明
├── router/
│   └── index.ts                         # 单路由 /reimburse
├── styles/
│   ├── reset.css                        # 浏览器 reset
│   └── tokens.css                       # 钉钉桌面端 token
├── composables/
│   └── useExpenseForm.ts                # 唯一业务 composable
├── api/
│   ├── client.ts                        # fetch 封装 + 错误处理
│   └── contact.ts                       # 联系人/审批人/付款人 API
├── components/
│   ├── AppNavBar.vue                    # 顶部导航
│   ├── AppAnchorTabs.vue                # 锚点目录
│   ├── AppFooter.vue                    # 底部「提交 / 保存草稿」
│   ├── SectionCard.vue                  # 区段容器
│   ├── FormField.vue                    # 字段单元
│   ├── TextInput.vue                    # 文本输入
│   ├── MoneyInput.vue                   # 金额输入
│   ├── DatePicker.vue                   # 日期选择
│   ├── SelectPicker.vue                 # 单/多选弹层
│   ├── TextareaInput.vue                # 多行文本
│   ├── CapsuleButton.vue                # 胶囊按钮
│   ├── PersonChips.vue                  # 人员标签组
│   ├── FlowPicker.vue                   # 审批/付款/抄送
│   ├── RelatedApplyField.vue            # 关联申请单
│   ├── TotalCard.vue                    # 报销总额
│   ├── ItemListCard.vue                 # 明细列表
│   ├── InvoiceBlock.vue                 # 发票区
│   ├── OwnershipSection.vue             # 归属信息
│   ├── BusinessFieldsSection.vue        # 业务字段
│   └── NotifySection.vue                # 消息通知
├── views/
│   └── ExpenseReimburse.vue             # 主页面
└── __tests__/
    ├── useExpenseForm.spec.ts           # 11 个用例
    └── api.client.spec.ts               # 4 个用例
```

**总计**：1 个 composable、1 个 view、19 个组件、2 个 API 模块、2 个测试文件。

### 3.4 修改（少量）
| 路径 | 改动 |
|---|---|
| `package.json` | 删除 `postcss-px-to-viewport`、`@iconify-json/ic`、`@iconify/vue`、`@iconify/vue`；保留 Vue/Pinia/vitest 等 |
| `vite.config.ts` | 删除 postcss-px-to-viewport 插件；删除 alias 不变 |
| `docs/superpowers/specs/2026-07-08-expense-reimburse-desktop-redesign-design.md` | 保留为历史参考（v1.2.1 未实施，已被本设计取代） |

---

## 4. 信息架构

### 4.1 顶层布局
```
┌────────────────────────────────────────────────────────┐
│  AppNavBar (64px, sticky)                              │
│  [钉钉 Logo] 日常报销         [用户头像 ▾] [草稿] [提交] │
├────────────────────────────────────────────────────────┤
│  AppAnchorTabs (48px, sticky top:64px)                 │
│  关联申请  总额  明细  发票  归属  业务  通知  流程    │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌─────────── 居中表单区 (max-width 720px) ─────────┐  │
│  │  RelatedApplyField                              │  │
│  │  TotalCard                                      │  │
│  │  ItemListCard                                   │  │
│  │  InvoiceBlock                                   │  │
│  │  OwnershipSection                               │  │
│  │  BusinessFieldsSection                          │  │
│  │  NotifySection                                  │  │
│  │  FlowPicker                                     │  │
│  └─────────────────────────────────────────────────┘  │
│                                                        │
│  AppFooter (提交 / 保存草稿)                            │
└────────────────────────────────────────────────────────┘
```

### 4.2 区段锚点
8 个锚点对应 prd.md 字段：

| 锚点 ID | 名称 | 对应 prd.md 字段 |
|---|---|---|
| `#related` | 关联申请 | B. 关联申请单 |
| `#total` | 总额 | C. 报销总额卡片 |
| `#items` | 明细 | D. 报销明细 |
| `#invoice` | 发票 | E+G. 发票模块 |
| `#ownership` | 归属 | H. 归属信息与备注 |
| `#business` | 业务 | I. 扩展业务字段 |
| `#notify` | 通知 | J. 消息通知 |
| `#flow` | 流程 | K. 审批流程区域 |

### 4.3 NavBar 详情
- **高度**：64px
- **背景**：`rgba(255, 255, 255, 0.88)` + `backdrop-filter: blur(10px)` + hairline 底部描边
- **左侧**：钉钉 Logo（32×32）+ 「日常报销」标题（h2 20px / weight 500 / ink）
- **右侧**：
  - 用户头像下拉（32×32 圆形 / 鼠标悬停显示菜单「切换账号 / 退出」）
  - 「草稿」按钮（ghost 样式）
  - 「提交」按钮（primary 实心 / disabled 当 !isValid）
- **sticky**：`position: sticky; top: 0; z-index: var(--z-fixed);`

### 4.4 AnchorTabs 详情
- **高度**：48px
- **背景**：`var(--color-surface)` + 底部 hairline
- **对齐**：左对齐 `padding: 0 var(--space-2xl)`（与表单左边缘对齐）
- **单个 tab**：padding `0 var(--space-md)`，14px 文字
  - 默认：color `var(--color-body)`
  - hover：color `var(--color-ink)`
  - active：color `var(--color-primary)` + 底部 2px primary 下划线
- **错误标识**：tab 右侧 6×6 红点 + 错误数量（仅当该区段有错误时显示）
- **sticky**：`position: sticky; top: 64px; z-index: var(--z-sticky);`
- **交互**：点击 → 平滑滚动（`scroll-behavior: smooth`）+ URL hash 更新

### 4.5 居中表单区
- **max-width**：720px
- **margin**：`0 auto`
- **padding**：`var(--space-2xl) 0 var(--space-3xl)`
- **字段间距**：区段间 `var(--space-xl)` (32px)，区段内字段间 `var(--space-md)` (16px)

### 4.6 AppFooter
- **背景**：`var(--color-surface)` + 顶部 hairline
- **位置**：`margin-top: var(--space-3xl)`（在表单下方）
- **按钮**：右对齐「保存草稿」(secondary) + 「提交」(primary, disabled 当 !isValid)

---

## 5. 视觉规范

### 5.1 tokens.css 桌面端 token
```css
:root {
  /* 颜色（DESIGN.md dingtalk_common） */
  --color-primary: #007FFF;
  --color-on-primary: #FFFFFF;
  --color-primary-hover: #0075EB;
  --color-primary-press: #006AD6;
  --color-secondary: #5AC8FA;
  --color-accent: #00B042;

  --color-canvas: #FFFFFF;
  --color-canvas-soft: #F2F2F6;
  --color-surface: #FFFFFF;
  --color-surface-press: #F6F6F6;
  --color-hairline: rgba(126, 134, 142, 0.16);
  --color-hairline-strong: rgba(126, 134, 142, 0.24);
  --color-overlay: rgba(0, 0, 0, 0.4);
  --color-overlay-hover: rgba(126, 134, 142, 0.16);
  --color-overlay-press: rgba(126, 134, 142, 0.24);

  --color-ink: #171A1D;
  --color-body: rgba(23, 26, 29, 0.6);
  --color-mute: rgba(23, 26, 29, 0.24);
  --color-stamp: rgba(23, 26, 29, 0.04);
  --color-link: #317EDD;

  --color-success: #00B042;
  --color-error: #FF5219;
  --color-warning: #FF9200;

  /* 字体（DESIGN.md 桌面端阶梯） */
  --font-family-base: "PingFang SC", "SF Pro Text", "Segoe UI", Roboto, "Microsoft YaHei", sans-serif;
  --font-family-mono: "SFMono-Regular", Menlo, Consolas, monospace;

  --font-size-tiny: 10px;
  --font-size-caption: 12px;
  --font-size-footnote: 13px;
  --font-size-body: 14px;        /* Desktop Body */
  --font-size-h4: 15px;
  --font-size-h3: 16px;
  --font-size-h2: 20px;
  --font-size-h1: 24px;
  --font-size-large-title: 32px;
  --font-size-display: 44px;

  --line-height-tight: 1.2;
  --line-height-snug: 1.4;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.6;

  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;

  /* 圆角（DESIGN.md） */
  --radius-none: 0px;
  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* 间距 */
  --space-xxs: 4px;
  --space-xs: 8px;
  --space-sm: 12px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 40px;
  --space-3xl: 64px;
  --space-section: 120px;

  /* 阴影（桌面端分级） */
  --shadow-s: 0px 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-m: 0px 8px 24px rgba(0, 0, 0, 0.12);
  --shadow-l: 0px 12px 32px rgba(0, 0, 0, 0.16);

  /* Z-Index */
  --z-base: 1;
  --z-sticky: 100;
  --z-fixed: 200;
  --z-popover: 800;
  --z-modal: 1000;
  --z-toast: 2000;

  /* 桌面端布局 */
  --layout-page-padding: 40px;
  --layout-form-max-width: 720px;
  --layout-navbar-height: 64px;
  --layout-tabs-height: 48px;
  --layout-input-height: 36px;
  --layout-button-height: 40px;
}
```

**删除项**：
- 移动端字号（`--font-size-subhead: 15px`、`--font-size-description: 14px`）
- 移动端 `font-size-body: 17px`（用桌面端 14px）
- 断点变量（`--bp-mobile-max`、`--bp-desktop`）
- 3 列布局变量（`--layout-3col-*`）
- `@media (min-width: 960px)` 桌面端 token 切换块
- `html[data-theme='dark']` 深色模式块

### 5.2 reset.css
**保留**：
- `box-sizing: border-box`
- `margin/padding 0`
- `font-family` / `line-height` / `color` / `background`
- `button` reset（cursor pointer / border 0 / background transparent）
- `input/textarea/select` reset
- `a` color link

**删除**：`.field`、`.card`、`.sub-block`、`.chip`、`.flow-list`、`.add-btn`、`.attach-row`、`.tag-pill`、`.total-card`、`.ding-footer`、`.related-pill`、`.add-detail-card`、`.card-in` 动画等所有全局类。

### 5.3 vite.config.ts 改动
**删除**：
```ts
import pxToViewport from 'postcss-px-to-viewport'

// 整个 pxToViewport({...}) 配置块
```

**保留**：Vue 插件、alias、server proxy、build 配置、test 配置。

### 5.4 关键尺寸
| 元素 | 尺寸 | 来源 |
|---|---|---|
| 视口目标 | 1440 × 900 | 验证基准 |
| 页面左右内边距 | 40px | `--layout-page-padding` |
| NavBar 高度 | 64px | `--layout-navbar-height` |
| AnchorTabs 高度 | 48px | `--layout-tabs-height` |
| 表单 max-width | 720px | `--layout-form-max-width` |
| 区段间距 | 32px | `--space-xl` |
| 字段垂直间距 | 16px | `--space-md` |
| 主按钮高度 | 40px | `--layout-button-height` |
| 输入框高度 | 36px | `--layout-input-height` |
| 卡片内边距 | 24px | `--space-lg` |
| 卡片圆角 | 8px | `--radius-md` |
| 输入框圆角 | 4px | `--radius-xs` |
| 按钮圆角 | 6px | `--radius-sm` |
| 卡片阴影 | s | `--shadow-s` |
| 浮层阴影 | m | `--shadow-m` |
| 模态阴影 | l | `--shadow-l` |

> **所有 px 数值原样使用**，不再做 viewport 转换。

---

## 6. 组件规范

### 6.1 组件粒度（无原子层）
12 个 prd.md 字段 + 5 个核心控件 + 3 个壳组件 = 19 个组件。

| 组件 | 用途 | 关键 props | 关键 emits |
|---|---|---|---|
| `AppNavBar` | 顶部导航 | `user: { name, avatarUrl }` | `submit`, `saveDraft`, `logout` |
| `AppAnchorTabs` | 锚点目录 | `items: Anchor[]`, `errors: Record<string, number>` | `jump(id)` |
| `AppFooter` | 底部动作 | `isValid: boolean` | `submit`, `saveDraft` |
| `SectionCard` | 区段容器 | `id: string`, `title: string` | — |
| `FormField` | 字段单元 | `label: string`, `required: boolean`, `error?: string` | — |
| `TextInput` | 文本输入 | `modelValue: string`, `placeholder: string` | `update:modelValue` |
| `MoneyInput` | 金额输入 | `modelValue: number`, `placeholder: string` | `update:modelValue` |
| `DatePicker` | 日期选择 | `modelValue: string \| null` | `update:modelValue` |
| `SelectPicker` | 单/多选弹层 | `modelValue: string \| string[]`, `options: Option[]` | `update:modelValue` |
| `TextareaInput` | 多行文本 | `modelValue: string`, `rows: number` | `update:modelValue` |
| `CapsuleButton` | 胶囊按钮 | `label: string` | `click` |
| `PersonChips` | 人员标签组 | `modelValue: string[]`, `users: User[]` | `update:modelValue` |
| `FlowPicker` | 审批/付款/抄送 | `flow: { approverId, payerId, ccUserIds }`, `users: User[]` | `update:flow` |
| `RelatedApplyField` | 关联申请单 | `modelValue: string \| null`, `applies: Apply[]` | `update:modelValue` |
| `TotalCard` | 报销总额 | `total: number` | — |
| `ItemListCard` | 明细列表 | `items: Item[]`, `errors: ItemErrors` | `add`, `remove`, `update:items` |
| `InvoiceBlock` | 发票区 | `modelValue: Invoice[]` | `update:modelValue` |
| `OwnershipSection` | 归属信息 | `ownership: { owner, department, remark }` | `update:ownership` |
| `BusinessFieldsSection` | 业务字段 | `fields: BusinessFields` | `update:fields` |
| `NotifySection` | 消息通知 | `modelValue: string[]`, `users: User[]` | `update:modelValue` |

### 6.2 5 个核心控件规范

#### 6.2.1 `TextInput`
- 高度 36px
- 边框：`1px solid var(--color-hairline)`，聚焦切换为 `var(--color-primary)` + 2px 外发光 `0 0 0 2px rgba(0,127,255,0.12)`
- 圆角：`var(--radius-xs)` (4px)
- 内边距：`0 12px`
- 字号：14px / line-height 1.5
- 占位色：`var(--color-mute)`
- 错误态：边框 `var(--color-error)` + 错误文案 12px 下方
- 禁用态：背景 `var(--color-canvas-soft)` + 文字 `var(--color-mute)`

#### 6.2.2 `MoneyInput`
- 基于 `TextInput`，额外：
  - `inputmode="decimal"`，过滤非数字字符
  - 实时千分位格式化（输入时）
  - 失焦转回 number
  - `font-variant-numeric: tabular-nums`
  - 左侧「¥」前缀（12px / mute）

#### 6.2.3 `DatePicker`
- 基于 `<input type="date">`，自定义皮肤
- 高度 36px
- 右侧日历图标（16px，mute 色）
- 桌面端使用原生 picker（Chrome 96+ / Edge / Safari 14+）

#### 6.2.4 `SelectPicker`
- 触发器：与 `TextInput` 样式一致
- 弹层：`position: absolute`，`min-width: 200px`，背景 `var(--color-surface)`，圆角 `var(--radius-md)`，阴影 `var(--shadow-m)`
- 选项行：高度 36px，padding `0 12px`，hover 背景 `var(--color-overlay-hover)`
- 选中态：左侧 primary 色对勾 + 文字 primary 色
- 多选模式：支持搜索框顶部、计数显示
- 定位：使用 `getBoundingClientRect` + 视口边缘检测（防溢出）
- 关闭：点击外部 / Esc 键

#### 6.2.5 `TextareaInput`
- 高度：3 行可拖拽扩大（`resize: vertical`）
- 边框：与 `TextInput` 一致
- 内边距：`8px 12px`
- 字号：14px / line-height 1.5
- 字符计数：右下角 caption 12px / mute

### 6.3 业务组件规范

#### 6.3.1 `SectionCard`
- 容器：`<section class="section-card">`，`background: var(--color-surface)`，`border-radius: var(--radius-md)`，`box-shadow: var(--shadow-s)`
- 内边距：`var(--space-lg)` (24px)
- 标题：h3 16px / weight 600 / ink，margin-bottom 16px
- 字段列表：垂直排列，间距 16px

#### 6.3.2 `TotalCard`
- 背景：`var(--color-canvas-soft)` 浅蓝底（不引入额外色，直接用 canvas-soft）
- 标签「报销总额」：caption 12px / body
- 数字：`¥ {{ total }}`，large-title 32px / weight 600 / **error 红**（遵循 prd.md「0.00 (红色，大号字体)」要求），`font-variant-numeric: tabular-nums`
- 功能入口：3 个 icon + 文字按钮（横向排列，gap 24px），hover 背景 `rgba(0, 127, 255, 0.04)`
  - 批量导入 / 导入随手记 / 发票识别（均为占位 UI，点击 toast「功能即将上线」）

#### 6.3.3 `ItemListCard`
- 头部：「报销明细 N」标题 + 「+ 添加报销明细」按钮
- 列表：每行 `ItemRow`，间距 16px
- 行内：金额 / 日期 / 类型 / 说明 / 发票子块 / 附件 / 删除按钮
- 至少保留 1 行
- 删除二次确认：popover「确定删除？」+「确定」/「取消」

#### 6.3.4 `FlowPicker`
- 三栏：审批人 / 付款人 / 抄送人
- 每栏：标题（h4 15px / weight 500）+ 选中人员 chips + 「+ 选择」按钮
- 弹出浮层：候选人员列表（来自 `/api/dd-users`），支持搜索
- 审批人 / 付款人：单选
- 抄送人：多选

---

## 7. 状态管理

### 7.1 useExpenseForm 接口
```ts
export function useExpenseForm() {
  // ---- 状态 ----
  const relatedApplyId = ref<string | null>(null)
  const items = ref<Item[]>([createEmptyItem()])
  const totalInvoiceStatus = ref<InvoiceStatus>('none')
  const ownership = reactive({
    owner: '陆晓锋',
    department: '播阳测试部门',
    remark: ''
  })
  const businessFields = reactive<BusinessFields>({
    projectId: null,
    customerId: null,
    accountId: null,
    entityId: null,
    payAt: null
  })
  const notifyUserIds = ref<string[]>([])
  const flow = reactive<Flow>({
    approverId: null,
    payerId: null,
    ccUserIds: []
  })
  const submitting = ref(false)
  const errors = reactive<ItemErrors>({})

  // ---- 计算 ----
  const totalAmount = computed(() =>
    items.value.reduce((sum, it) => sum + (it.amount || 0), 0)
  )
  const isValid = computed(() => validate().ok)

  // ---- 动作 ----
  function addItem(): void
  function removeItem(id: string): void
  function updateItem(id: string, patch: Partial<Item>): void
  function toDraft(): Draft
  function saveDraft(): void
  function restoreDraft(): boolean
  function clearDraft(): void
  function validate(): ValidationResult
  async function submit(): Promise<SubmitResult>
  function clearError(index: number, key: 'amount' | 'occurredAt' | 'category'): void
}

type Item = {
  id: string
  amount: number | null
  occurredAt: string | null  // ISO date
  category: string | null
  description: string
  invoiceIds: string[]
  attachmentIds: string[]
}

type Flow = {
  approverId: string | null
  payerId: string | null
  ccUserIds: string[]
}

type BusinessFields = {
  projectId: string | null
  customerId: string | null
  accountId: string | null
  entityId: string | null
  payAt: string | null
}

type ValidationResult = { ok: true } | { ok: false, errors: ItemErrors, payerMissing: boolean }

type ItemErrors = Record<number, { amount?: string, occurredAt?: string, category?: string }>
```

### 7.2 composable 内部模块
1. **状态定义**：reactive + ref
2. **计算属性**：`totalAmount`、`isValid`、`itemCount`
3. **草稿模块**：`toDraft` / `saveDraft` / `restoreDraft` / `clearDraft`（localStorage `dingeval-expense-draft`）
4. **校验模块**：`validate()` + 各字段验证函数
5. **提交模块**：`submit()` 调 `/api/dd-notify` + 调钉钉工作通知（后端统一处理）
6. **单项操作**：`addItem` / `removeItem` / `updateItem` / `clearError`

### 7.3 跨组件共享
- 在 `App.vue` 创建 `form = useExpenseForm()`，通过 `provide('expenseForm', form)` 注入
- 子组件用 `inject<ReturnType<typeof useExpenseForm>>('expenseForm')` 获取
- 避免 Pinia 依赖，状态生命周期与组件树一致

### 7.4 草稿机制
- **写入**：500ms debounce（用 `useDebounceFn` from `@vueuse/core`，或手写 setTimeout）
- **存储**：`localStorage[expense-draft]` = JSON.stringify(toDraft())
- **恢复**：页面加载时检测，若有草稿 → 弹 Toast「检测到上次未提交的草稿，是否恢复？」+「恢复」/「丢弃」按钮（2.5s 自动消失）
- **清除**：提交成功后 / 用户主动「丢弃」/ 7 天过期
- **错误处理**：try/catch 静默失败，不阻塞主流程

### 7.5 校验规则
| 字段 | 规则 |
|---|---|
| `items[].amount` | 必填 > 0 |
| `items[].occurredAt` | 必填，ISO date |
| `items[].category` | 必填 |
| `flow.payerId` | 必填 |
| `flow.approverId` | 选填 |
| `flow.ccUserIds` | 选填 |
| 其他字段 | 选填 |

---

## 8. 数据流与 API

### 8.1 单向数据流
```
ExpenseReimburse.vue (View)
  ↓ use + provide
useExpenseForm (composable)
  ↓ fetch
api/client.ts → /api/dd-*
  ↓ HTTP
Python Flask API
```

### 8.2 API 边界
| 端点 | 调用方 | 用途 |
|---|---|---|
| `GET /api/dd-users` | `api/contact.ts` → `FlowPicker`、`NotifySection` | 拉取审批人/付款人/抄送人候选列表 |
| `POST /api/dd-notify` | `useExpenseForm.submit()` | 提交后发钉钉工作通知（异步，不影响主流程） |
| `POST /api/dd-upload` | `InvoiceBlock`、`AttachmentBlock`（占位） | 发票 / 附件上传（仅 UI 展示） |

### 8.3 api/client.ts 接口
```ts
export class NetworkError extends Error {
  constructor(message = '网络错误') { super(message); this.name = 'NetworkError' }
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiGet<T>(path: string): Promise<T>
export async function apiPost<T>(path: string, body: unknown): Promise<T>
export async function ddNotify(payload: { useridList: string[], title: string, content: string, jumpUrl?: string }): Promise<void>
export async function ddUsers(): Promise<User[]>
```

错误处理：
- `fetch` reject → 抛 `NetworkError`
- 响应非 2xx → 抛 `ApiError` 携带 status + response body
- 业务方通过 `try/catch` 捕获并 toast 显示

---

## 9. 交互与错误处理

### 9.1 关键交互
| 场景 | 行为 |
|---|---|
| 锚点点击 | 平滑滚动到对应区段 + URL hash 更新 + AnchorTabs 高亮切换 |
| 滚动监听 | `IntersectionObserver` 阈值 0.5 + 100ms 节流，更新当前区段高亮 |
| 字段聚焦 | 边框从 hairline → primary + 1px + 2px 外发光 |
| 字段失焦 | 必填项为空时红边框 + 错误文案（12px error 色） |
| 添加明细 | 列表末尾追加 ItemRow，自动聚焦到金额输入 |
| 删除明细 | 当 items.length > 1 显示删除按钮；点击二次确认（popover） |
| 人员选择 | 弹层（`SelectPicker` 多选模式），支持搜索 |
| 草稿恢复 | 启动时检测 → Toast「检测到草稿，是否恢复？」+「恢复」/「丢弃」 |
| 提交成功 | Toast「已提交报销单 · 总额 ¥X.XX」+ 清空草稿 + 触发钉钉工作通知（异步） |
| 提交失败 | Toast「提交失败，请重试」+ 保留草稿 |

### 9.2 错误处理矩阵
| 错误类型 | 来源 | 表现 | 恢复策略 |
|---|---|---|---|
| 必填项缺失 | 前端校验 | 字段红框 + 错误文案 | 用户补全后实时清除 |
| 金额非法 | 前端校验 | 错误文案「请输入正确的金额」 | 用户修正 |
| 日期非法 | 前端校验 | 错误文案「请选择有效日期」 | 用户修正 |
| API 网络错误 | fetch reject | Toast「网络错误，请重试」 | 保留草稿，可重试 |
| 钉钉免登失败 | 启动时 | 静默忽略 | 不影响表单填写 |
| 后端 5xx | API 响应 | Toast「服务异常，请稍后重试」 | 保留草稿 |
| 草稿损坏 | JSON.parse 失败 | 静默忽略 + 清除损坏草稿 | 重新填写 |

### 9.3 可达性
- **键盘**：Tab 顺序按视觉顺序；Enter 提交表单区；Esc 关闭弹层
- **焦点**：`focus-visible` 时所有交互元素显示 2px primary 外发光
- **ARIA**：输入框 `<label for>` 关联；弹层 `role="dialog"` + `aria-modal="true"` + 标题 `aria-labelledby`；必填字段 `aria-required="true"`
- **色彩对比**：所有文字 ≥ 4.5:1（DESIGN.md token 已保证）

### 9.4 性能
- **草稿写入**：500ms debounce
- **浮层搜索**：200ms debounce
- **滚动监听**：100ms 节流
- **虚拟列表**：明细超过 50 行时启用（不实现，预留扩展点）

---

## 10. 测试策略

### 10.1 范围
| 层 | 是否测 | 用例数 |
|---|---|---|
| `useExpenseForm` composable | **必须** | 11 |
| `api/client.ts` | **必须** | 4 |
| 组件渲染 | **跳过** | — |
| 端到端 | **跳过** | 人工验收 |

### 10.2 工具
- **Vitest** + **happy-dom** + **@vue/test-utils**（保留）

### 10.3 useExpenseForm 测试用例（11 项）
1. `addItem()` 后 `items.length` 增加且新行含默认空字段
2. `removeItem(id)` 后 `items.length` 减少
3. `updateItem(id, { amount: 100 })` 正确更新
4. `totalAmount` 等于所有 item.amount 之和
5. `validate()` 在 items[0].amount 缺失时返回 errors
6. `validate()` 在 items[0].occurredAt 缺失时返回 errors
7. `validate()` 在 items[0].category 缺失时返回 errors
8. `validate()` 在 flow.payerId 缺失时返回 payerMissing=true
9. `validate()` 在所有必填项填写时返回 `{ ok: true }`
10. `toDraft()` 序列化所有状态为 plain object
11. `submit()` 成功时调 fetch 并 clearDraft

### 10.4 api/client.ts 测试用例（4 项）
1. `apiGet()` 解析 2xx 响应
2. `apiPost()` 序列化 body 并解析响应
3. `fetch` reject 时抛 `NetworkError`
4. 非 2xx 响应抛 `ApiError` 携带 status

### 10.5 运行命令
```bash
pnpm test           # vitest run
pnpm test:watch     # 持续监听
pnpm typecheck      # vue-tsc --noEmit
pnpm build          # vue-tsc + vite build
```

---

## 11. 验收标准

### 11.1 自动化（必须 100% 通过）
- `pnpm typecheck` → 0 errors
- `pnpm test` → 15 tests passed（composable 11 + api 4）
- `pnpm build` → 成功

### 11.2 Chrome DevTools 1440×900 端到端（20 项）

**布局（6 项）**
1. NavBar 高度 64px，含 Logo + 标题 + 头像下拉 + 草稿 + 提交按钮
2. NavBar sticky top:0 + 毛玻璃生效
3. AnchorTabs 显示 8 个锚点，高亮当前可见区段
4. AnchorTabs sticky top:64px
5. 居中表单区 max-width 720px，左右内边距 40px
6. AppFooter 提交 + 保存草稿按钮存在

**表单字段（9 项，按 prd.md 全字段）**
7. 关联申请单胶囊按钮「+ 请选择」可点
8. 报销总额卡片：浅蓝底 + ¥ 数字 + 3 个功能入口
9. 报销明细 1：金额 / 日期 / 类型 / 说明 / 发票子块 / 附件 / 删除按钮
10. 「+ 添加报销明细」追加新行并自动聚焦金额
11. 全局发票区 + 状态标签
12. 归属信息：归属人 / 归属部门 / 备注
13. 业务字段：项目 / 客户 / 收款账户 / 企业主体 / 付款时间
14. 消息通知：「+ 添加」+ 人员 chips
15. 流程：审批人 / 付款人 / 抄送人 三栏

**交互（5 项）**
16. 锚点点击平滑滚动 + URL hash 更新
17. 提交校验：缺必填项时弹错误，定位到错误字段，AnchorTabs 角标显示数量
18. 草稿恢复：刷新页面后弹 Toast「检测到草稿，是否恢复？」+「恢复」可恢复
19. 提交成功：Toast「已提交报销单 · 总额 ¥X.XX」+ 触发钉钉工作通知
20. 必填项红星 `*` 显示正确，字段聚焦时边框变 primary + 外发光

### 11.3 Out of Scope（明确不做）
- 移动端 / 平板适配（任何 <1280 宽度）
- 暗色模式
- 4K 屏（≥2560）适配
- IE11 / 老 Safari 兼容
- 附件真实上传（占位 UI）
- 多借据 / 关联申请单复杂流程
- 国际化 i18n
- 主题切换 UI
- 引入 side-nav / 抽屉 / 汉堡菜单
- 引入 UI 组件库（Naive UI / Element Plus / Ant Design Vue）
- 引入 Tailwind / UnoCSS

---

## 12. 风险与缓解

| ID | 风险 | 影响 | 缓解 |
|---|---|---|---|
| R1 | 重写后 35 个旧测试全部失效 | 看起来覆盖率下降 | 实际是 100% 重写，按新 composable 11 + api 4 重测 |
| R2 | `SelectPicker` 桌面端弹层定位复杂 | 滚动/缩放时浮层错位 | 手写 `getBoundingClientRect` + 视口边缘检测；预留 Floating UI 扩展点 |
| R3 | 锚点 + 滚动 + 高亮同步可能掉帧 | 1440×900 性能压力 | `IntersectionObserver` + 100ms 节流 |
| R4 | 单页长表单用户迷失位置 | UX 问题 | AnchorTabs 高亮 + 错误角标 + 滚动进度条（可选） |
| R5 | localStorage 配额/隐私模式 | 草稿失效 | try/catch 静默失败，不阻塞主流程 |
| R6 | Pinia 删除后跨组件共享状态变难 | 多组件共享 form 实例 | `provide/inject` 注入 `useExpenseForm()` |
| R7 | DESIGN.md token 删除移动端值后，未来要加移动端需补全 | 文档/技术债 | 在 tokens.css 顶部注释说明：「此为桌面端 v1.3，移动端 token 见 git history」 |
| R8 | 钉钉联系人 API 失败时无法选人 | 流程节点无法填 | UI 显示「暂无可选人员」+ 让用户手动输入员工号（兜底） |
| R9 | AppNavBar 用户头像数据来源 | 用户无数据时显示空白 | 头像默认显示当前 owner 名字（`'陆晓锋'` 首字符）；未来后端提供 `GET /api/dd-me` 时切换为真实用户 |
| R10 | 删除 SideNav / BottomBar 后，左侧导航缺失 | 多页面扩展受限 | 单一页面无影响；未来加页面时引入 vue-router 多路由 + 顶部 tabs |

---

## 13. 设计自审（brainstorming spec self-review）

### 13.1 占位扫描
- ✅ 无 TBD / TODO
- ✅ 所有尺寸、颜色、token、组件 props/emits 都给出确切值
- ✅ 文件清单 100% 明确

### 13.2 内部一致性
- ✅ 视觉规范（§5）与组件规范（§6）一致：所有组件都引用 tokens.css
- ✅ 状态管理（§7）与数据流（§8）一致：composable → api → 后端
- ✅ 验收标准（§11）与组件规范（§6）一一对应：20 项验证覆盖 19 个组件
- ✅ Out of Scope（§11.3）与决策（§2）一致：明确不做的事都在两份文档中声明

### 13.3 范围检查
- ✅ 单一子系统（前端 UI 重构）
- ✅ 单次实现计划可完成（19 组件 + 1 composable + 1 view + 2 测试）
- ✅ 不需要拆解为子项目

### 13.4 歧义检查
- ✅ "完全重写" 范围明确：UI + 前端业务层；保留后端 + 设计 token
- ✅ "桌面端" 范围明确：1440×900，不做响应式
- ✅ "沿用钉钉设计系统" 范围明确：颜色 / 字号 / 间距 / 圆角 / 阴影 token 不变
- ✅ "沿用 prd.md 字段" 范围明确：19 个组件对应 19 个字段区块
- ✅ 总金额颜色：沿用 prd.md「0.00 (红色，大号字体)」要求，使用 error 红 `--color-error` (`#FF5219`)，与 v1.1 保持一致

### 13.5 兼容性
- ✅ 与后端 Python Flask API 兼容：调用端点不变
- ✅ 与钉钉集成兼容：JSAPI / SSO / 工作通知由后端处理，前端只调 API
- ✅ 与 DESIGN.md token 兼容：仅删除移动端值与断点
- ✅ 与 prd.md 字段兼容：1:1 字段对应

---

## 14. 附录 A — 旧版本保留

以下文档保留作为历史参考，不被本设计取代（仅作记录）：

- `docs/superpowers/specs/2026-07-02-expense-reimburse-design.md` — v1.1 移动端
- `docs/superpowers/specs/2026-07-03-expense-reimburse-desktop-adaptation-design.md` — v1.2 桌面端适配
- `docs/superpowers/specs/2026-07-08-expense-reimburse-desktop-redesign-design.md` — v1.2.1 桌面端重构（未实施）

## 15. 附录 B — 与 v1.2.1 的关键差异

| 维度 | v1.2.1（未实施） | v1.3（本设计） |
|---|---|---|
| 范围 | 仅重构 UI（保留 store/composable/utils/mocks） | UI + 前端业务层全重写 |
| 状态管理 | Pinia 保留 | composable 替代 Pinia |
| 布局 | 3 列（SideNav + 表单 + SummaryPanel） | 顶部头 + 居中表单 |
| 断点 | ≥960px 触发桌面端 | 单一 1440×900，无响应式 |
| 锚点 | 无 | 顶部 AnchorTabs |
| 提交按钮 | SummaryPanel sticky + BottomBar | NavBar 右上 + AppFooter |
| 草稿 | 独立 composable | 内置在 useExpenseForm |
| 校验 | 独立 composable | 内置在 useExpenseForm |
| 测试 | 35 个旧测试不破坏 | 全部重写（composable 11 + api 4） |
