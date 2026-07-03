# 钉钉「日常报销」页面复刻 — 设计规格

**日期**：2026-07-02
**目标版本**：v1.0（完整复刻）
**关联文档**：[`../../prd.md`](../../prd.md) · [`../../DESIGN.md`](../../DESIGN.md)

---

## 1. 目标与范围

完整复刻钉钉移动端"日常报销"页面 `/reimburse`，所有可交互控件（日期/下拉/Toast/ActionSheet/选择人/添加发票等）使用 mock 数据走通完整交互链路；提交按钮触发表单校验与 mock 提交；保存草稿写入 localStorage 并支持恢复询问。

**不在范围**：
- 真实后端 API 对接（mock 即可）
- 真实图片 / 发票识别能力（仅计数）
- 深色模式 UI 切换（token 预留，UI 不暴露开关）
- 桌面端布局（仅做 375px 移动端）
- 国际化 i18n

---

## 2. 技术栈

| 类别 | 选型 | 状态 |
|---|---|---|
| 框架 | Vue 3.5 + TypeScript 5.6 | 已就位 |
| 构建 | Vite 6 | 已就位 |
| 路由 | vue-router 4 | 已就位 |
| 状态 | Pinia 2 | 已就位 |
| 样式 | tokens.css + scoped CSS | 已就位 |
| 适配 | postcss-px-to-viewport（375 基准） | 已就位 |
| 图标 | `@iconify/vue` + `@iconify-json/ic` | **新增** |
| 测试 | `vitest` + `@vue/test-utils` + `happy-dom` | **新增** |
| ID | `nanoid` | **新增** |

不引入 Vant / NutUI / Element 等 UI 组件库。

---

## 3. 目录结构

```
src/
├── main.ts
├── App.vue                          # 全局挂载 BaseToast / BaseActionSheet
├── env.d.ts
├── router/index.ts                  # 已有
├── stores/expense.ts                # 微调：增加 draft 恢复
├── types/expense.ts                 # ★ 提取类型
├── mocks/                           # ★ 新建
│   ├── categories.ts                # 费用类型 6 条
│   ├── projects.ts                  # 项目 5 条
│   ├── customers.ts                 # 客户 6 条
│   ├── accounts.ts                  # 收款账户 5 条
│   ├── entities.ts                  # 企业主体 4 条
│   ├── persons.ts                   # 人员 8 条（审批/付款/抄送共用）
│   └── chats.ts                     # 群聊 5 条
├── utils/                           # ★ 新建
│   ├── money.ts                     # 金额格式化
│   ├── id.ts                        # nanoid 包装
│   └── draftStorage.ts              # localStorage 草稿存取
├── composables/                     # ★ 新建
│   ├── useToast.ts                  # 全局 Toast 状态机
│   ├── useActionSheet.ts            # 全局 ActionSheet 状态机
│   ├── useFormValidation.ts         # 提交前校验 + 滚动定位
│   └── useDraftRestore.ts           # 进入页面草稿检测
├── components/
│   ├── base/                        # ★ 设计系统原子层（11 个）
│   │   ├── DingIcon.vue
│   │   ├── BaseButton.vue
│   │   ├── BaseCard.vue
│   │   ├── BaseField.vue
│   │   ├── BaseInput.vue
│   │   ├── BaseTextarea.vue
│   │   ├── BaseSelect.vue           # 弹层式选择器（基于 BaseActionSheet）
│   │   ├── BaseDatePicker.vue       # 自定义日历弹层（基于 BaseActionSheet）
│   │   ├── BaseCapsule.vue
│   │   ├── BaseTag.vue
│   │   ├── BaseToast.vue
│   │   └── BaseActionSheet.vue
│   └── expense/                     # ★ 业务组件（11 个）
│       ├── NavBar.vue
│       ├── RelatedApply.vue
│       ├── TotalCard.vue
│       ├── ItemCard.vue
│       ├── InvoiceSubBlock.vue       # 嵌入 ItemCard 的发票子块
│       ├── InvoiceBlock.vue          # 顶层独立发票卡片（全局状态）
│       ├── AttachmentBlock.vue       # 嵌入 ItemCard 的附件行
│       ├── OwnershipSection.vue
│       ├── BusinessFieldsSection.vue
│       ├── NotifySection.vue
│       ├── FlowSection.vue
│       ├── BottomBar.vue
│       └── DingtalkFooter.vue
├── views/
│   └── ExpenseReimburse.vue         # 重写为组合入口
├── styles/
│   ├── tokens.css                   # 已有
│   ├── base.css                     # 已有
│   └── reset.css                    # ★ 移动端基础 reset
└── __tests__/                       # ★ 新建
    ├── stores/expense.spec.ts
    ├── utils/money.spec.ts
    ├── utils/draftStorage.spec.ts
    └── composables/useFormValidation.spec.ts
```

---

## 4. 架构分层

```
┌─────────────────────────────────────────────────┐
│  views/ExpenseReimburse.vue  （组合 + 布局）   │
└─────────────────────────────────────────────────┘
              ↓ props/emit + useExpenseStore
┌─────────────────────────────────────────────────┐
│  components/expense/*  （业务组件）             │
│  NavBar / TotalCard / ItemCard / FlowSection …  │
└─────────────────────────────────────────────────┘
              ↓ 仅 props/emit
┌─────────────────────────────────────────────────┐
│  components/base/*  （设计系统原子层）          │
│  DingIcon / BaseField / BaseSelect / BaseToast…│
└─────────────────────────────────────────────────┘
              ↓ 全局单例
┌─────────────────────────────────────────────────┐
│  App.vue 中挂载 <BaseToast /> + <BaseActionSheet/>│
│  composables: useToast() / useActionSheet()     │
└─────────────────────────────────────────────────┘

stores/expense.ts ──┬──→ 所有组件（通过 useExpenseStore()）
                    ├──→ composables/useFormValidation（提交校验）
                    └──→ utils/draftStorage（草稿持久化）
```

**约束**：
- 业务组件**不直接操作 DOM**（除了 FlowSection 通过 ref 触发滚动）
- 原子层**不感知业务**，只暴露 props
- 单一数据源 = `useExpenseStore`，业务组件内不维护 local state

---

## 5. 组件契约

### 5.1 原子层 `components/base/`

| 组件 | Props | Emit | 行为要点 |
|---|---|---|---|
| `DingIcon` | `name: string`、`size?: number = 20`、`color?: string` | — | 包 `<Icon icon="ic:baseline-xxx" />`；缺 name 时渲染 `<span class="ding-icon--placeholder" />` |
| `BaseButton` | `variant?: 'primary' \| 'secondary' \| 'ghost' \| 'danger' = 'primary'`、`block?: boolean`、`loading?: boolean`、`disabled?: boolean` | `click` | 高度 32（内联）/ 44（block）；主按钮 hover/press 走 token；loading 态替换文字为旋转图标 |
| `BaseCard` | `padding?: 'sm' \| 'md' \| 'lg' = 'md'`、`elevated?: boolean = false` | — | 圆角 `--radius-md`；elevated 切换 shadow-s / shadow-m |
| `BaseField` | `label: string`、`required?: boolean`、`error?: string` | — | slot 默认承载 BaseInput/BaseSelect/BaseTextarea；error 非空时下方红字 + 红色边框 |
| `BaseInput` | `modelValue: string \| number \| null`、`type?: 'text' \| 'number' \| 'date' = 'text'`、`placeholder?: string`、`readonly?: boolean`、`inputmode?: string` | `update:modelValue` | native input 包装；number 类型自动 `v-model.number` |
| `BaseTextarea` | 同 BaseInput，附加 `rows?: number = 3` | `update:modelValue` | native textarea；`resize: vertical` |
| `BaseSelect` | `modelValue: string \| null`、`options: { value: string; label: string }[]`、`placeholder?: string` | `update:modelValue` | 弹层式选择器：点击触发 `BaseActionSheet` 弹出选项列表；选中后写回 modelValue 并自动关闭弹层；与钉钉原生"浮层 + 勾选"视觉一致 |
| `BaseDatePicker` | `modelValue: string \| null`（YYYY-MM-DD）、`placeholder?: string` | `update:modelValue` | 自定义日历弹层：点击触发 `BaseActionSheet` 弹出日历面板；支持上下月切换 / 当天高亮 / 已选高亮；选中后写回 modelValue 并自动关闭；不走 native `<input type="date">` 以确保视觉统一 |
| `BaseCapsule` | `icon?: string`、`placeholder?: string` | `click` | 虚线/实线两态；点击触发关联申请单 ActionSheet |
| `BaseTag` | `active?: boolean = false` | `click` | 用于 [无发票] / [待收发票] 互斥切换 |
| `BaseToast` | （无 props，由 `useToast()` 控制）| — | 内部 `<Teleport to="body">`；居中浮层 + 遮罩；支持 action / dismiss 按钮；单例 |
| `BaseActionSheet` | （无 props，由 `useActionSheet()` 控制）| `select(value)` | 内部 `<Teleport to="body">`；底部抽屉，200ms 滑入；点击选项后自动关闭；单例 |

### 5.2 业务组件 `components/expense/`

| 组件 | Props | 关键交互 |
|---|---|---|
| `NavBar` | — | 左侧返回按钮 + 居中标题"日常报销"；返回按钮点击 → `history.back()` 或 `router.back()` |
| `RelatedApply` | — | 渲染 `BaseCapsule`；点击 → `useToast().show('请在钉钉 App 端选择关联申请单')`（v1.0 不实现选择弹层） |
| `TotalCard` | `total: number` | 浅蓝渐变背景 + 红色 `32px` 大数字 + 3 个动作；动作点击 → `useToast().show('该功能需要钉钉 App 端支持')` |
| `ItemCard` | `item: ExpenseItem`、`index: number`、`removable: boolean` | 组合 BaseField + BaseInput/BaseSelect/BaseDatePicker/BaseTextarea + `InvoiceSubBlock` + 添加附件；右上"删除"仅 removable 时显示 |
| `InvoiceSubBlock` | `item: ExpenseItem` | 嵌入 ItemCard：标题"发票" + `+ 添加发票` 按钮（点击 → Toast）+ 提示文案 + 两个 BaseTag（无发票 / 待收发票）互斥切换 `item.invoiceStatus` |
| `InvoiceBlock` | — | 顶层独立卡片，结构与 InvoiceSubBlock 类似：section-title "发票" + `+ 添加发票` 按钮（点击 → Toast）+ 提示文案 + 全局 BaseTag（无发票 / 待收发票）切换 `expense.invoiceStatus`；与每条明细的 invoiceStatus 各自独立 |
| `AttachmentBlock` | `item: ExpenseItem` | 嵌入 ItemCard 底部行：纸质回形针图标 + `+ 添加附件` 按钮（点击 → Toast，v1.0 不实现真实上传） |
| `OwnershipSection` | — | 读 `expense.owner / department / remark`；owner/department 走 readonly 样式（来自当前用户登录态，不允许编辑） |
| `BusinessFieldsSection` | — | 5 个 BaseField（项目 / 客户 / 收款账户 / 企业主体 / 付款时间）；options 来自 mocks |
| `NotifySection` | — | "+ 添加" → `BaseActionSheet` 列出 chats；选中后追加 chip，已选中的从弹层选项中过滤；chip 支持单条删除 |
| `FlowSection` | — | 3 行（审批人 / 付款人(*) / 抄送人）；审批人 / 付款人 = 单选 BaseActionSheet；抄送人 = 多选 BaseActionSheet；行容器带 `ref` 用于错误时滚动定位 |
| `BottomBar` | — | "保存草稿" → `useDraftStorage().save()` + Toast；"提交" → `useFormValidation().validate()` 通过则 Toast + `expense.reset()` + 清草稿 |
| `DingtalkFooter` | — | 居中"蓝色方块 D + 钉钉"主标 + 副标题"AI 时代的工作方式" |

---

## 6. 数据流与 Store

### 6.1 Store 增强

`stores/expense.ts` 在现有基础上新增：

```ts
// 新增：草稿序列化 / 恢复
function toDraft(): ExpenseDraft { /* 序列化所有字段 */ }
function restoreFromDraft(draft: ExpenseDraft): void
function clearDraft(): void  // 提交成功后调用
```

```ts
// 新增：派生 computed
const hasAnyAmount = computed(() =>
  items.value.some(item => (item.amount ?? 0) > 0)
)
const isValid = computed(() =>
  hasAnyAmount.value && payer.value !== null
)
```

### 6.2 类型定义 `types/expense.ts`

```ts
export type InvoiceStatus = 'none' | 'pending' | 'received'
export type CategoryValue = 'travel' | 'meal' | 'office' | 'entertain' | 'communication' | 'other'

export interface ExpenseItem {
  id: string
  amount: number | null
  occurredAt: string
  category: CategoryValue | null
  description: string
  invoiceStatus: InvoiceStatus
  attachmentCount: number
}

export interface ExpenseDraft {
  version: 1
  savedAt: number
  items: ExpenseItem[]
  relatedApplyId: string | null
  remark: string
  project: string | null
  customer: string | null
  payeeAccount: string | null
  entity: string | null
  payAt: string | null
  notifyChats: string[]
  approver: string | null
  payer: string | null
  cc: string[]
  invoiceStatus: InvoiceStatus  // 顶层全局发票状态（与 items[i].invoiceStatus 各自独立）
}
```

### 6.3 Mock 数据规范

每个 `mocks/*.ts` 导出 4-8 条同构数据：

```ts
export interface OptionItem { value: string; label: string; description?: string }
export const categories: OptionItem[] = [...]
```

`persons` 同时被 approvers / payers / cc 共用（UI 层去重显示）；`chats` 用于"发送到聊天"。

### 6.4 写入策略

- 所有表单字段 `v-model` 直接绑 store
- 下拉 / 日期通过 `update:modelValue` 写回
- 流程节点 ActionSheet `select` 事件直接写 store

---

## 7. 表单校验

### 7.1 校验规则

`composables/useFormValidation.ts` 暴露 `validate(): { ok: boolean; firstErrorRef?: Ref<HTMLElement> }`：

| 规则 | 错误标识 | 错误文案 |
|---|---|---|
| 每条明细的 amount > 0 | `items[i].amount` | "请输入第 N 条的报销金额" |
| 每条明细的 occurredAt 必填 | `items[i].occurredAt` | "请选择第 N 条的费用日期" |
| 每条明细的 category 必填 | `items[i].category` | "请选择第 N 条的费用类型" |
| 付款人必填 | `payer` | "请选择付款人" |

> 业务字段（项目/客户/账户/主体/付款时间）和全局发票状态 v1.0 **不参与必填校验**（与原型保持一致），用户可先提交再补填。流程节点中只有付款人打 `*` 必填。

### 7.2 错误反馈

**仅滚动定位**（按用户决策）：
- 校验失败时，`firstErrorRef.scrollIntoView({ behavior: 'smooth', block: 'center' })`
- 对应 `BaseField` 自动切到 error 态（红字 + 红边框 + 抖动 0.4s）
- **不**弹 Toast 列表

### 7.3 字段错误态清除

- 字段值变更时（`watch`），若新值有效，对应 error 清除
- 提交按钮在 `isValid === true` 时高亮可点，否则 disabled

---

## 8. 草稿持久化

### 8.1 存储

- key: `dingeval:expense:draft`
- value: `JSON.stringify(expense.toDraft())`
- 写入时机：点击"保存草稿"
- 清除时机：提交成功后 `expense.clearDraft()`

### 8.2 恢复

`composables/useDraftRestore.ts` 在 `ExpenseReimburse.vue` 的 `onMounted` 调用：

```ts
const draft = useDraftStorage().load()
if (draft) {
  useToast().show({
    message: '检测到未提交的草稿，是否恢复？',
    type: 'info',
    duration: 0,                  // 不自动消失
    action: { label: '恢复', onClick: () => expense.restoreFromDraft(draft) },
    dismiss: { label: '丢弃' }
  })
}
```

> Toast 增加 `action` / `dismiss` 槽位，按钮点击后调用对应回调再关闭。

---

## 9. 关键交互细节

### 9.1 Toast / ActionSheet 单例

- `App.vue` 中仅引用一次：`<BaseToast />` + `<BaseActionSheet />`
- 两个组件内部用 `<Teleport to="body">` 渲染浮层，避免被父组件 `overflow: hidden` 裁剪
- `useToast()` / `useActionSheet()` 用 module-level `ref` 维护单例状态
- 完整 API：
  ```ts
  useToast().show({
    message: string,
    type?: 'info' | 'success' | 'error',
    duration?: number,        // 默认 2000；0 表示不自动消失
    action?: { label: string; onClick: () => void }   // 草稿恢复用
    dismiss?: { label: string; onClick?: () => void } // 自定义关闭按钮
  })
  useActionSheet().open({
    title?: string,
    options: OptionItem[],
    onSelect: (value: string | null) => void
  })
  ```

### 9.2 总价卡 3 个动作

点击后**仅 Toast**：

| 动作 | Toast 文案 |
|---|---|
| 批量导入 | "该功能需要钉钉 App 端支持" |
| 导入随手记 | "该功能需要钉钉 App 端支持" |
| 发票识别 | "该功能需要钉钉 App 端支持" |

### 9.3 添加发票 / 附件

v1.0 **不实现真实选择 / 上传**，所有"添加"按钮统一弹 Toast：

| 按钮 | Toast 文案 |
|---|---|
| `InvoiceSubBlock` / `InvoiceBlock` 的"+ 添加发票" | "该功能需要钉钉 App 端支持" |
| `AttachmentBlock` 的"+ 添加附件" | "该功能需要钉钉 App 端支持" |

发票状态通过 BaseTag 互斥切换（无发票 / 待收发票）控制，不维护张数计数。每条明细的 `invoiceStatus` 与顶层 `expense.invoiceStatus` 各自独立。

### 9.4 流程节点交互

| 节点 | 选项来源 | 多/单选 |
|---|---|---|
| 审批人 | persons（去重） | 单选 |
| 付款人 | persons（去重） | 单选 |
| 抄送人 | persons | 多选（chip 列表展示，支持移除） |

### 9.5 通知到聊天

点击"+ 添加"→ ActionSheet 列出 chats → 单选 → chip 展示，支持单条移除。

### 9.6 移除明细

最后一条不可移除（按钮不渲染）。

### 9.7 深色模式

token 预留 `<html data-theme="dark">` 切换，但 UI 不暴露开关，**不进入验收**。

---

## 10. 测试策略

**业务逻辑单测 + UI 视觉验收**（按用户决策）。

### 10.1 单测覆盖

`vitest` + `happy-dom`：

| 文件 | 覆盖点 |
|---|---|
| `__tests__/stores/expense.spec.ts` | addItem / removeItem / 边界（最后一条不可删） / totalAmount / hasAnyAmount / isValid / toDraft ↔ restoreFromDraft 往返 |
| `__tests__/utils/money.spec.ts` | 千分位 / 保留 2 位 / 负数 / 0 / null |
| `__tests__/utils/draftStorage.spec.ts` | save / load / clear；JSON 损坏时安全降级 |
| `__tests__/composables/useFormValidation.spec.ts` | 7 条规则的命中场景 / firstErrorRef 正确性 |

### 10.2 UI 视觉验收

不写组件级单测，靠 `pnpm dev` + Chrome DevTools mobile 模拟器目视：
- 截图与 PRD 描述逐项对照
- 浅色模式 / 默认字号 / iOS safe-area

### 10.3 验收命令

```bash
pnpm typecheck     # vue-tsc --noEmit
pnpm test          # vitest run
pnpm build         # 类型检查 + 生产构建
pnpm dev           # 浏览器目视
```

---

## 11. 实施顺序

**底层 → 业务 → 组合**（3 轮）。

### 第 1 轮：基础设施 + 原子层

1. 安装依赖（@iconify/vue / @iconify-json/ic / vitest / @vue/test-utils / happy-dom / nanoid）
2. 写 `types/expense.ts` / `utils/money.ts` / `utils/id.ts` / `utils/draftStorage.ts`
3. 写 `mocks/*.ts`（7 个文件）
4. 写 `styles/reset.css`
5. 写 11 个 `components/base/*.vue`（按表格顺序）
6. 写 `composables/useToast.ts` / `useActionSheet.ts`
7. 写 `App.vue` 挂载 Toast / ActionSheet 单例
8. 写 `__tests__/utils/money.spec.ts` / `__tests__/utils/draftStorage.spec.ts`（**TDD：先写测试**）

### 第 2 轮：业务层

1. 写 `composables/useFormValidation.ts` + 单测（**TDD**）
2. 写 `composables/useDraftRestore.ts`
3. 增强 `stores/expense.ts`（toDraft / restoreFromDraft / clearDraft / hasAnyAmount / isValid）
4. 写 `__tests__/stores/expense.spec.ts`（**TDD**）
5. 写 11 个 `components/expense/*.vue`

### 第 3 轮：组合 + 联调

1. 重写 `views/ExpenseReimburse.vue`（组合所有业务组件）
2. 接入 `onMounted` → `useDraftRestore()`
3. 联调：填写一条明细 → 保存草稿 → 刷新 → 恢复 → 提交
4. 视觉验收：375 模拟器逐项对照 PRD
5. 跑 `pnpm typecheck && pnpm test && pnpm build` 全绿

---

## 12. 验收标准

**必须全部满足**才能认为完成：

- [ ] `pnpm typecheck` 通过
- [ ] `pnpm test` 全绿，覆盖率 ≥ 70%（业务逻辑）
- [ ] `pnpm build` 产出 dist
- [ ] 375px 视口下页面与 PRD 章节 1-12 描述一致
- [ ] 添加 / 删除明细正常，总价实时更新
- [ ] 提交按钮在 `isValid === true` 时高亮
- [ ] 校验失败：第一个错误字段滚动居中 + 红框抖动
- [ ] 保存草稿 → 刷新 → Toast 询问 → 恢复字段完整
- [ ] 提交成功后表单清空 + 草稿被清除
- [ ] 流程节点单/多选行为符合 9.4 节
- [ ] 通知到聊天 chip 可移除
- [ ] 添加发票 / 附件按钮点击均弹"需要钉钉 App 端支持"Toast
- [ ] 三个总价卡动作仅 Toast 提示

---

## 13. 风险与边界

| 风险 | 缓解 |
|---|---|
| `BaseToast` / `BaseActionSheet` 被父级 `overflow: hidden` 裁剪 | 内部统一 `<Teleport to="body">` |
| `postcss-px-to-viewport` 把 0.5px 也转成 vw | 媒体查询 / hairline border 用 `.no-vw` 豁免 |
| 自定义日历弹层与 iOS / Android 系统日历控件差异 | 全部走自绘日历面板，避免平台差异；接受首次进入需等待一帧动画 |
| Pinia store 在测试中污染 | 每个 spec 用 `setActivePinia(createPinia())` 隔离 |
| Iconify 离线环境失效 | `@iconify-json/ic` 在 build 时打入 bundle，无需联网 |

---

## 14. 后续可选

（v1.0 不做，留口子）

- 深色模式 UI 开关（token 已就绪）
- 字段级权限 / 流程分支
- 真实图片上传（`BaseInput` 升级 `type="file"`）
- E2E 测试（Playwright）
- 国际化（vue-i18n）
