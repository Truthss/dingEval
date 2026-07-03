# 日常报销桌面端响应式适配 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让 `/reimburse` 路由在 ≥ 960px 视口下呈现钉钉桌面端风格布局（max-width 1200 居中 + 2 列对齐表单 + 浮动按钮面板），同时保持 < 960px 移动端 v1.0 行为完全不变。

**Architecture:** 单一组件代码 + `postcss-px-to-viewport` `mediaQuery: true` 双基准（375 / 1200）+ CSS 变量断点 + `.desktop-container` / `.desktop-grid-2` 工具类 + 5 个 Base 组件 `size` prop + 各业务组件 scoped `@media` 块。同一份 store / 路由 / 业务逻辑全程不动。

**Tech Stack:** Vue 3.5 + TypeScript 5.6 + Vite 6 + postcss-px-to-viewport（开启 mediaQuery）+ vitest

## Global Constraints

> 这些约束来自 spec §1 §2 §3 §5 §8 §10，**每个 task 的实现必须隐式满足**：

- **响应式断点**：`< 960px` 移动端（保持 v1.0），`≥ 960px` 桌面端；**无 600-959 平板专属档**
- **断点变量**：所有 `@media` 断点必须用 `var(--bp-desktop)` 引用，**禁止裸 px 数值进媒体查询**
- **postcss 配置**：`vite.config.ts` 中 `mediaQuery: true` 必须开启；`mediaQuery` 块内 px 自动以 1200 为基准转换
- **样式隔离**：桌面端样式**必须**用 `@media (min-width: var(--bp-desktop)) { ... }` 包裹在原 `<style scoped>` 中，**禁止**新增全局桌面端选择器
- **size prop**：5 个 Base 组件（Button / Input / Textarea / Select / DatePicker）桌面端显式传 `size="md"`，移动端默认 `size="sm"` 不传
- **hover 反馈**：仅桌面端补充 `:hover` 视觉，移动端**禁止** hover 样式
- **基线**：v1.0 验收清单（`docs/superpowers/specs/2026-07-02-expense-reimburse-design.md` §12）必须 100% 继续通过
- **业务逻辑零侵入**：store / router / mocks / utils / composables / types 全部**不动**
- **回归测试**：v1.0 已有单测（`src/__tests__/`）**不修改、不删除**，继续通过

## 文件结构

| 文件 | 操作 | 职责 |
|---|---|---|
| `vite.config.ts` | 修改 | 开启 `postcss-px-to-viewport` 的 `mediaQuery: true` |
| `src/styles/tokens.css` | 修改 | 新增 `--bp-desktop` / `--layout-*` 布局 token |
| `src/styles/base.css` | 修改 | 新增 `.desktop-container` / `.desktop-grid-2` 工具类 |
| `src/components/base/BaseButton.vue` | 修改 | 新增 `size` prop + 桌面端 hover |
| `src/components/base/BaseInput.vue` | 修改 | 新增 `size` prop |
| `src/components/base/BaseTextarea.vue` | 修改 | 新增 `size` prop |
| `src/components/base/BaseSelect.vue` | 修改 | 新增 `size` prop + 桌面端 hover |
| `src/components/base/BaseDatePicker.vue` | 修改 | 新增 `size` prop + 桌面端 hover |
| `src/components/expense/NavBar.vue` | 修改 | 加 `.desktop-container` + 桌面端右侧两按钮 |
| `src/components/expense/ItemCard.vue` | 修改 | 桌面端 2 列布局 |
| `src/components/expense/BusinessFieldsSection.vue` | 修改 | 桌面端 2 列布局 |
| `src/components/expense/OwnershipSection.vue` | 修改 | 桌面端 2 列布局 |
| `src/components/expense/BottomBar.vue` | 修改 | 桌面端浮动面板 |
| `src/components/expense/TotalCard.vue` | 修改 | 桌面端取消 `margin: 12px 12px 0` |
| `src/views/ExpenseReimburse.vue` | 修改 | `.page-main` 加 `.desktop-container` 类 + 桌面端 padding / gap |

**不动的文件**：`App.vue` / `main.ts` / `router/index.ts` / `stores/expense.ts` / `types/expense.ts` / `mocks/*` / `utils/*` / `composables/*` / 5 个 mocks / `__tests__/*` / `RelatedApply.vue` / `InvoiceBlock.vue` / `InvoiceSubBlock.vue` / `AttachmentBlock.vue` / `FlowSection.vue` / `NotifySection.vue` / `DingtalkFooter.vue` / `BaseField.vue` / `BaseCapsule.vue` / `BaseCard.vue` / `BaseTag.vue` / `BaseToast.vue` / `BaseActionSheet.vue` / `DingIcon.vue`

---


## Task 1: 基础设施（构建配置 + 样式 token + 工具类）

**Files:**
- Modify: ite.config.ts:14-33（postcss 块内加 mediaQuery: true）
- Modify: src/styles/tokens.css:93（在 :root { ... } 块末尾、关闭大括号前插入新 token）
- Modify: src/styles/base.css（在文件末尾追加 .desktop-container 与 .desktop-grid-2）

**Interfaces:**
- Consumes: 无（基础设施任务）
- Produces:
  - ite.config.ts 中 mediaQuery: true（下游所有桌面端 CSS 依赖此）
  - CSS 变量 --bp-desktop / --layout-max-width / --layout-padding-x / --layout-grid-gap-col / --layout-grid-gap-row
  - 工具类 .desktop-container（max-width 1200 居中）、.desktop-grid-2（2 列网格）、.desktop-grid-2--span-2（跨 2 列）

- [ ] **Step 1.1: 改 vite.config.ts 开启 mediaQuery**

修改 ite.config.ts 的 pxToViewport({...}) 调用，在第 26 行 mediaQuery: false, 改为 mediaQuery: true,：

`	s
// vite.config.ts 第 14-33 行，替换为：
  css: {
    postcss: {
      plugins: [
        autoprefixer(),
        pxToViewport({
          unitToConvert: 'px',
          viewportWidth: 375,
          unitPrecision: 5,
          propList: ['*'],
          viewportUnit: 'vw',
          fontViewportUnit: 'vw',
          selectorBlackList: ['.no-vw'],
          minPixelValue: 1,
          mediaQuery: true,
          replace: true,
          exclude: [/node_modules\/(?!(vant|@vant)\/)/],
          landscape: false
        })
      ]
    }
  },
`

- [ ] **Step 1.2: tokens.css 增补断点 + 布局 token**

修改 src/styles/tokens.css，在 :root { ... } 块的最末尾（--z-toast: 2000; 之后、第 93 行的 } 之前）插入：

`css
  /* ---------- Breakpoints ---------- */
  --bp-mobile-max: 959.98px;
  --bp-desktop: 960px;

  /* ---------- Desktop Layout ---------- */
  --layout-max-width: 1200px;
  --layout-padding-x: 32px;
  --layout-grid-gap-col: 24px;
  --layout-grid-gap-row: 16px;
`

- [ ] **Step 1.3: base.css 增补工具类**

修改 src/styles/base.css，在文件末尾（ { ... } 之后）追加：

`css
/* ============================================================
 * 桌面端响应式工具类（断点 ≥ 960px 生效）
 * 移动端不输出任何 display: grid，避免误用
 * ============================================================ */

.desktop-container {
  /* 移动端无样式 */
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
`

- [ ] **Step 1.4: 跑 typecheck 确认基础设施无破坏**

Run: pnpm typecheck
Expected: PASS（无新增类型错误）。如有报错，优先检查 ite.config.ts 的 TypeScript 类型。

- [ ] **Step 1.5: 跑测试确认基础设施无破坏**

Run: pnpm test --run
Expected: 4 个测试文件全绿（stores / utils × 2 / composables）。

- [ ] **Step 1.6: 提交基础设施**

`ash
git add vite.config.ts src/styles/tokens.css src/styles/base.css
git commit -m "feat(responsive): add desktop breakpoint + mediaQuery dual viewport basis"
`

---


## Task 2: 5 个 Base 原子组件 size 变体 + 桌面端 hover

**Files:**
- Modify: src/components/base/BaseButton.vue
- Modify: src/components/base/BaseInput.vue
- Modify: src/components/base/BaseTextarea.vue
- Modify: src/components/base/BaseSelect.vue
- Modify: src/components/base/BaseDatePicker.vue

**Interfaces:**
- Consumes: Task 1 产出的 --bp-desktop 变量
- Produces: 5 个组件均新增 size?: 'sm' | 'md' = 'sm' prop，**桌面端**使用 size="md" 时：
  - BaseButton：min-height: 36px; padding: 10px 20px;（与 v1.0 移动端 32px 区分）
  - BaseInput / Textarea / Select / DatePicker：height: 40px; padding: 10px 14px; font-size: 14px;（与 v1.0 移动端 36px / 17px 区分）
  - 桌面端 hover 反馈（仅 BaseButton / BaseSelect / BaseDatePicker）

### Task 2.1: BaseButton 加 size + 桌面端 hover

- [ ] **Step 2.1.1: 完整覆盖 BaseButton.vue**

把 src/components/base/BaseButton.vue 完整替换为以下内容：

`ue
<script setup lang="ts">
import DingIcon from './DingIcon.vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
  block?: boolean
  loading?: boolean
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'sm',
  block: false,
  loading: false,
  disabled: false
})

const emit = defineEmits<{ (e: 'click', event: MouseEvent): void }>()

function onClick(e: MouseEvent) {
  emit('click', e)
}
</script>

<template>
  <button
    type="button"
    :class="['base-btn', ase-btn--, ase-btn--, { 'base-btn--block': block, 'base-btn--loading': loading }]"
    :disabled="disabled || loading"
    @click="onClick"
  >
    <DingIcon v-if="loading" name="progress-activity" :size="16" class="base-btn__spinner" />
    <slot />
  </button>
</template>

<style scoped>
.base-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.15s, border-color 0.15s, color 0.15s;
  border: 0;
  cursor: pointer;
}
.base-btn--sm { min-height: 32px; padding: 8px 16px; }
.base-btn--md { min-height: 36px; padding: 10px 20px; }
.base-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.base-btn--block { display: flex; width: 100%; height: 44px; }
.base-btn--primary {
  background: var(--color-primary);
  color: var(--color-on-primary);
}
.base-btn--primary:hover:not(:disabled) { background: var(--color-primary-hover); }
.base-btn--primary:active:not(:disabled) { background: var(--color-primary-press); }
.base-btn--secondary {
  background: var(--color-canvas);
  color: var(--color-ink);
  border: 1px solid var(--color-hairline-strong);
}
.base-btn--secondary:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.base-btn--ghost {
  background: transparent;
  color: var(--color-primary);
  border: 0;
  padding: 8px 12px;
}
.base-btn--ghost.base-btn--md { padding: 10px 12px; }
.base-btn--ghost:hover:not(:disabled) { background: rgba(0, 127, 255, 0.06); }
.base-btn--danger {
  background: var(--color-error);
  color: var(--color-on-primary);
}
.base-btn--danger:hover:not(:disabled) { background: #EB4B17; }
.base-btn--loading { color: transparent; position: relative; }
.base-btn__spinner {
  position: absolute;
  animation: spin 0.8s linear infinite;
  color: currentColor;
}
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

/* 桌面端 hover 视觉强化：secondary 显式加深背景色 */
@media (min-width: var(--bp-desktop)) {
  .base-btn--secondary:hover:not(:disabled) {
    background: var(--color-surface-press);
  }
}
</style>
`

### Task 2.2: BaseInput 加 size

- [ ] **Step 2.2.1: 完整覆盖 BaseInput.vue**

把 src/components/base/BaseInput.vue 完整替换为：

`ue
<script setup lang="ts">
interface Props {
  modelValue: string | number | null
  type?: 'text' | 'number'
  placeholder?: string
  readonly?: boolean
  inputmode?: string
  align?: 'left' | 'right'
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  readonly: false,
  inputmode: '',
  align: 'right',
  size: 'sm'
})

const emit = defineEmits<{ (e: 'update:modelValue', value: string | number | null): void }>()

function onInput(e: Event) {
  const target = e.target as HTMLInputElement
  if (props.type === 'number') {
    emit('update:modelValue', target.value === '' ? null : Number(target.value))
  } else {
    emit('update:modelValue', target.value)
  }
}
</script>

<template>
  <input
    :type="type"
    :value="modelValue ?? ''"
    :placeholder="placeholder"
    :readonly="readonly"
    :inputmode="(inputmode as any)"
    :style="{ textAlign: align }"
    :class="['base-input', ase-input--]"
    @input="onInput"
  />
</template>

<style scoped>
.base-input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--color-ink);
  font-family: inherit;
}
.base-input--sm { height: 36px; padding: 8px 12px; font-size: 17px; }
.base-input--md { height: 40px; padding: 10px 14px; font-size: 14px; }
.base-input::placeholder { color: var(--color-mute); }
</style>
`

### Task 2.3: BaseTextarea 加 size

- [ ] **Step 2.3.1: 完整覆盖 BaseTextarea.vue**

把 src/components/base/BaseTextarea.vue 完整替换为：

`ue
<script setup lang="ts">
interface Props {
  modelValue: string
  placeholder?: string
  rows?: number
  size?: 'sm' | 'md'
}

withDefaults(defineProps<Props>(), {
  placeholder: '',
  rows: 3,
  size: 'sm'
})

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

function onInput(e: Event) {
  const target = e.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <textarea
    :value="modelValue"
    :placeholder="placeholder"
    :rows="rows"
    :class="['base-textarea', ase-textarea--]"
    @input="onInput"
  />
</template>

<style scoped>
.base-textarea {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--color-ink);
  font-family: inherit;
  resize: vertical;
}
.base-textarea--sm { padding: 8px 12px; font-size: 17px; min-height: 60px; }
.base-textarea--md { padding: 10px 14px; font-size: 14px; min-height: 72px; }
.base-textarea::placeholder { color: var(--color-mute); }
</style>
`

### Task 2.4: BaseSelect 加 size + 桌面端 hover

- [ ] **Step 2.4.1: 完整覆盖 BaseSelect.vue**

把 src/components/base/BaseSelect.vue 完整替换为：

`ue
<script setup lang="ts">
import { computed } from 'vue'
import type { OptionItem } from '@/types/expense'
import DingIcon from './DingIcon.vue'
import { useActionSheet } from '@/composables/useActionSheet'

interface Props {
  modelValue: string | null
  options: OptionItem[]
  placeholder?: string
  title?: string
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请选择',
  title: '',
  size: 'sm'
})

const emit = defineEmits<{ (e: 'update:modelValue', value: string | null): void }>()

const sheet = useActionSheet()

const display = computed(() => {
  return props.options.find((o) => o.value === props.modelValue)?.label ?? ''
})

function open() {
  sheet.open({
    title: props.title,
    options: props.options,
    current: props.modelValue,
    onSelect: (val) => {
      emit('update:modelValue', val)
    }
  })
}
</script>

<template>
  <button
    type="button"
    :class="['picker-trigger', picker-trigger--, { placeholder: !display }]"
    @click="open"
  >
    <span>{{ display || placeholder }}</span>
    <DingIcon name="chevron-right" :size="16" />
  </button>
</template>

<style scoped>
.picker-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  width: 100%;
  background: var(--color-canvas);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-xs);
  color: var(--color-ink);
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.15s;
}
.picker-trigger--sm { height: 36px; padding: 0 12px; font-size: 17px; }
.picker-trigger--md { height: 40px; padding: 0 14px; font-size: 14px; }
.picker-trigger.placeholder { color: var(--color-mute); }
@media (min-width: var(--bp-desktop)) {
  .picker-trigger:hover { border-color: var(--color-hairline-strong); }
}
</style>
`

### Task 2.5: BaseDatePicker 加 size + 桌面端 hover

- [ ] **Step 2.5.1: 完整覆盖 BaseDatePicker.vue**

把 src/components/base/BaseDatePicker.vue 完整替换为：

`ue
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import DingIcon from './DingIcon.vue'

interface Props {
  modelValue: string | null
  placeholder?: string
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请选择',
  size: 'sm'
})
const emit = defineEmits<{ (e: 'update:modelValue', value: string | null): void }>()

const open = ref(false)

const initial = props.modelValue ? new Date(props.modelValue) : new Date()
const viewYear = ref(initial.getFullYear())
const viewMonth = ref(initial.getMonth())

watch(open, (v) => {
  if (v) {
    const init = props.modelValue ? new Date(props.modelValue) : new Date()
    viewYear.value = init.getFullYear()
    viewMonth.value = init.getMonth()
  }
})

const todayDate = new Date()
const selectedDate = computed(() => (props.modelValue ? new Date(props.modelValue) : null))

const monthLabel = computed(() => ${viewYear.value} 年  月)

const cells = computed(() => {
  const firstDay = new Date(viewYear.value, viewMonth.value, 1).getDay()
  const daysInMonth = new Date(viewYear.value, viewMonth.value + 1, 0).getDate()
  const prevMonthDays = new Date(viewYear.value, viewMonth.value, 0).getDate()
  const list: Array<{ d: number; muted: boolean }> = []
  for (let i = firstDay - 1; i >= 0; i--) {
    list.push({ d: prevMonthDays - i, muted: true })
  }
  for (let i = 1; i <= daysInMonth; i++) {
    list.push({ d: i, muted: false })
  }
  while (list.length % 7 !== 0) {
    list.push({ d: list.length - daysInMonth - firstDay + 1, muted: true })
  }
  return list
})

function gotoPrev() {
  if (viewMonth.value === 0) {
    viewYear.value -= 1
    viewMonth.value = 11
  } else {
    viewMonth.value -= 1
  }
}

function gotoNext() {
  if (viewMonth.value === 11) {
    viewYear.value += 1
    viewMonth.value = 0
  } else {
    viewMonth.value += 1
  }
}

function pad2(n: number) { return n < 10 ?   : String(n) }

function cellDate(c: { d: number; muted: boolean }) {
  if (!c.muted) return new Date(viewYear.value, viewMonth.value, c.d)
  if (c.d > 15) return new Date(viewYear.value, viewMonth.value - 1, c.d)
  return new Date(viewYear.value, viewMonth.value + 1, c.d)
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function pick(c: { d: number; muted: boolean }) {
  const dt = cellDate(c)
  emit('update:modelValue', ${dt.getFullYear()}--)
  open.value = false
}

function close() {
  open.value = false
}
</script>

<template>
  <button
    type="button"
    :class="['picker-trigger', picker-trigger--, { placeholder: !modelValue }]"
    @click="open = true"
  >
    <span>{{ modelValue || placeholder }}</span>
    <DingIcon name="calendar-today" :size="16" />
  </button>

  <Teleport to="body">
    <div v-if="open" class="popover-mask" @click.self="close">
      <div class="popover date-picker-popover">
        <div class="dp-head">
          <button type="button" class="dp-nav" aria-label="上月" @click="gotoPrev">
            <DingIcon name="chevron-left" :size="18" />
          </button>
          <div class="month-label">{{ monthLabel }}</div>
          <button type="button" class="dp-nav" aria-label="下月" @click="gotoNext">
            <DingIcon name="chevron-right" :size="18" />
          </button>
        </div>
        <div class="week-row">
          <div v-for="w in ['日','一','二','三','四','五','六']" :key="w">{{ w }}</div>
        </div>
        <div class="day-row">
          <div
            v-for="(c, i) in cells"
            :key="i"
            class="day"
            :class="{
              muted: c.muted,
              today: isSameDay(cellDate(c), todayDate),
              selected: selectedDate && isSameDay(cellDate(c), selectedDate)
            }"
            @click="pick(c)"
          >{{ c.d }}</div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.picker-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  width: 100%;
  background: var(--color-canvas);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-xs);
  color: var(--color-ink);
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.15s;
}
.picker-trigger--sm { height: 36px; padding: 0 12px; font-size: 17px; }
.picker-trigger--md { height: 40px; padding: 0 14px; font-size: 14px; }
.picker-trigger.placeholder { color: var(--color-mute); }
@media (min-width: var(--bp-desktop)) {
  .picker-trigger:hover { border-color: var(--color-hairline-strong); }
}

.popover-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.40);
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: fade-in 0.15s ease-out;
}
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
.popover {
  width: 100%;
  max-width: 480px;
  background: var(--color-canvas);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  animation: slide-up 0.25s ease-out;
}
@keyframes slide-up {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.date-picker-popover { padding: 8px 16px 24px; }
.dp-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 4px 12px;
}
.dp-nav {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  color: var(--color-primary);
  border-radius: var(--radius-full);
  background: transparent;
  border: 0;
  cursor: pointer;
}
.dp-nav:hover { background: rgba(0, 127, 255, 0.08); }
.month-label { font-size: 16px; font-weight: 600; color: var(--color-ink); }
.week-row,
.day-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}
.week-row > div {
  text-align: center;
  font-size: 12px;
  color: var(--color-mute);
  padding: 6px 0;
  letter-spacing: 0.04em;
}
.day {
  aspect-ratio: 1 / 1;
  display: grid;
  place-items: center;
  font-size: 14px;
  color: var(--color-ink);
  border-radius: var(--radius-full);
  cursor: pointer;
  font-variant-numeric: tabular-nums;
  background: transparent;
  border: 0;
}
.day:hover { background: rgba(0, 127, 255, 0.08); }
.day.muted { color: var(--color-mute); }
.day.today { color: var(--color-primary); font-weight: 600; }
.day.selected {
  background: var(--color-primary);
  color: var(--color-on-primary);
  font-weight: 500;
}
.day.selected.today { color: var(--color-on-primary); }
</style>
`

### Task 2.6: 验证 Base 组件改造

- [ ] **Step 2.6.1: 跑 typecheck**

Run: pnpm typecheck
Expected: PASS

- [ ] **Step 2.6.2: 跑单测**

Run: pnpm test --run
Expected: 4 个测试文件全绿。

- [ ] **Step 2.6.3: 提交 Base 组件 size 变体**

`ash
git add src/components/base/BaseButton.vue src/components/base/BaseInput.vue src/components/base/BaseTextarea.vue src/components/base/BaseSelect.vue src/components/base/BaseDatePicker.vue
git commit -m "feat(base): add size prop sm/md + desktop hover to 5 atomic components"
`

---

## Task 3: NavBar 桌面端改造

**Files:**
- Modify: `src/components/expense/NavBar.vue`

**Interfaces:**
- Consumes: Task 1 产出的 `--bp-desktop` 变量与 `.desktop-container` 工具类
- Produces: NavBar 容器加 `.desktop-container` 类，桌面端右侧新增 2 个 ghost 按钮（搜索 / 帮助），点击均触发 `useToast().show('该功能需要钉钉 App 端支持')`

- [ ] **Step 3.1: 完整覆盖 NavBar.vue**

把 `src/components/expense/NavBar.vue` 完整替换为：

```vue
<script setup lang="ts">
import { useRouter } from 'vue-router'
import DingIcon from '../base/DingIcon.vue'
import BaseButton from '../base/BaseButton.vue'
import { useToast } from '@/composables/useToast'

const emit = defineEmits<{ (e: 'back'): void }>()
const toast = useToast()

function goBack() {
  const router = useRouter()
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
  emit('back')
}

function showUnsupported() {
  toast.show({ message: '该功能需要钉钉 App 端支持', type: 'info' })
}
</script>

<template>
  <header class="nav-bar">
    <div class="nav-bar__inner desktop-container">
      <button type="button" class="nav-bar__back" aria-label="返回" @click="goBack">
        <DingIcon name="arrow-back" :size="22" />
      </button>
      <h1 class="nav-bar__title">日常报销</h1>
      <div class="nav-bar__actions">
        <BaseButton variant="ghost" size="sm" class="nav-bar__action" @click="showUnsupported">
          <DingIcon name="search" :size="18" />
        </BaseButton>
        <BaseButton variant="ghost" size="sm" class="nav-bar__action" @click="showUnsupported">
          <DingIcon name="help" :size="18" />
        </BaseButton>
      </div>
    </div>
  </header>
</template>

<style scoped>
.nav-bar {
  background: var(--color-canvas);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-s);
}
.nav-bar__inner {
  height: 48px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.nav-bar__back {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  color: var(--color-ink);
  border-radius: var(--radius-sm);
  background: transparent;
  border: 0;
  cursor: pointer;
}
.nav-bar__back:hover { background: rgba(126, 134, 142, 0.08); }
.nav-bar__title {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-ink);
  margin: 0;
}
.nav-bar__actions {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  display: none;
  gap: 4px;
}

@media (min-width: var(--bp-desktop)) {
  .nav-bar__title { font-size: 18px; }
  .nav-bar__actions { display: flex; }
}
</style>
```

- [ ] **Step 3.2: 跑 typecheck**

Run: `pnpm typecheck`
Expected: PASS

- [ ] **Step 3.3: 跑单测**

Run: `pnpm test --run`
Expected: 4 个测试文件全绿。

- [ ] **Step 3.4: 启动 dev server 浏览器目视 NavBar 桌面端**

Run: `pnpm dev`
Open: `http://localhost:5173/reimburse`
- Chrome DevTools → 视口 1440×900
- 检查：标题「日常报销」水平居中；右侧出现两个图标按钮（搜索 + 帮助）
- 视口拖到 375×667：右侧两按钮**消失**，标题居中
- 鼠标悬停「帮助」按钮：背景出现淡蓝色（ghost hover 反馈）
Expected: 上述视觉行为成立

- [ ] **Step 3.5: 提交 NavBar 改造**

```bash
git add src/components/expense/NavBar.vue
git commit -m "feat(navbar): add desktop actions (search/help) + .desktop-container wrapper"
```

---

## Task 4: ItemCard 桌面端 2 列布局

**Files:**
- Modify: `src/components/expense/ItemCard.vue`

**Interfaces:**
- Consumes: Task 1 产出的 `.desktop-grid-2` / `.desktop-grid-2--span-2` 工具类；Task 2 产出的 BaseInput/BaseDatePicker/BaseSelect `size="md"`
- Produces: ItemCard 内部 4 字段改为桌面端 2 列网格（金额跨 2 列、日期+类型同行、说明跨 2 列），子块（发票 / 附件）跨 2 列

- [ ] **Step 4.1: 完整覆盖 ItemCard.vue**

把 `src/components/expense/ItemCard.vue` 完整替换为：

```vue
<script setup lang="ts">
import type { ExpenseItem } from '@/types/expense'
import { categories } from '@/mocks/categories'
import BaseField from '../base/BaseField.vue'
import BaseInput from '../base/BaseInput.vue'
import BaseSelect from '../base/BaseSelect.vue'
import BaseDatePicker from '../base/BaseDatePicker.vue'
import BaseTextarea from '../base/BaseTextarea.vue'
import DingIcon from '../base/DingIcon.vue'
import InvoiceSubBlock from './InvoiceSubBlock.vue'
import AttachmentBlock from './AttachmentBlock.vue'

interface Props {
  item: ExpenseItem
  index: number
  removable: boolean
  errors?: {
    amount?: string
    occurredAt?: string
    category?: string
  }
}

withDefaults(defineProps<Props>(), { errors: () => ({}) })
const emit = defineEmits<{
  (e: 'remove', id: string): void
  (e: 'clear-error', key: 'amount' | 'occurredAt' | 'category'): void
}>()
</script>

<template>
  <div class="card item-card">
    <div class="section-title">
      <span>报销明细 {{ index + 1 }}</span>
      <button
        v-if="removable"
        type="button"
        class="remove"
        @click="emit('remove', item.id)"
      >
        <DingIcon name="close" :size="14" />
        <span>删除</span>
      </button>
    </div>

    <div class="item-card__grid">
      <BaseField label="报销金额(元)" :required="true" :error="errors.amount" data-field="amount" class="item-card__span-2">
        <BaseInput
          v-model="item.amount"
          type="number"
          inputmode="decimal"
          placeholder="请输入金额"
          size="md"
          @update:model-value="emit('clear-error', 'amount')"
        />
      </BaseField>

      <BaseField label="费用发生日期" :required="true" :error="errors.occurredAt" data-field="date">
        <BaseDatePicker
          v-model="item.occurredAt"
          size="md"
          @update:model-value="emit('clear-error', 'occurredAt')"
        />
      </BaseField>

      <BaseField label="费用类型" :required="true" :error="errors.category" data-field="category">
        <BaseSelect
          v-model="item.category"
          :options="categories"
          :title="'选择费用类型'"
          size="md"
          @update:model-value="emit('clear-error', 'category')"
        />
      </BaseField>

      <BaseField label="费用说明" :block="true" class="item-card__span-2">
        <BaseTextarea
          v-model="item.description"
          placeholder="请输入费用说明"
          :rows="2"
          size="md"
        />
      </BaseField>

      <div class="item-card__span-2">
        <InvoiceSubBlock v-model="item.invoiceStatus" />
      </div>

      <div class="item-card__span-2">
        <AttachmentBlock />
      </div>
    </div>
  </div>
</template>

<style scoped>
.item-card__grid {
  display: flex;
  flex-direction: column;
}

@media (min-width: var(--bp-desktop)) {
  .item-card__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: var(--layout-grid-gap-col);
    row-gap: 0;
  }
  .item-card__span-2 {
    grid-column: span 2;
  }
}
</style>
```

- [ ] **Step 4.2: 跑 typecheck**

Run: `pnpm typecheck`
Expected: PASS

- [ ] **Step 4.3: 启动 dev server 浏览器目视 ItemCard 桌面端**

Run: `pnpm dev`
Open: `http://localhost:5173/reimburse` 视口 1440×900
- 检查：金额字段独占整行（宽度占满两列）
- 检查：费用发生日期 + 费用类型在同一行（左右各占 1 列）
- 检查：费用说明独占整行
- 检查：发票子块 + 附件行各占整行
- 视口拖到 375×667：恢复单列堆叠
Expected: 视觉成立

- [ ] **Step 4.4: 提交 ItemCard 改造**

```bash
git add src/components/expense/ItemCard.vue
git commit -m "feat(item-card): desktop 2-column layout (amount span-2, date+category row, textarea span-2)"
```

---

## Task 5: BusinessFieldsSection 桌面端 2 列布局

**Files:**
- Modify: `src/components/expense/BusinessFieldsSection.vue`

**Interfaces:**
- Consumes: Task 1 产出的 `.desktop-grid-2` / `.desktop-grid-2--span-2` 工具类；Task 2 产出的 BaseSelect / BaseDatePicker `size="md"`
- Produces: 5 个字段桌面端 2 列对齐（项目+客户同行、账户+主体同行、付款时间独占一行）

- [ ] **Step 5.1: 完整覆盖 BusinessFieldsSection.vue**

把 `src/components/expense/BusinessFieldsSection.vue` 完整替换为：

```vue
<script setup lang="ts">
import BaseField from '../base/BaseField.vue'
import BaseSelect from '../base/BaseSelect.vue'
import BaseDatePicker from '../base/BaseDatePicker.vue'
import { useExpenseStore } from '@/stores/expense'
import { projects } from '@/mocks/projects'
import { customers } from '@/mocks/customers'
import { accounts } from '@/mocks/accounts'
import { entities } from '@/mocks/entities'

const expense = useExpenseStore()
</script>

<template>
  <div class="card business-grid">
    <BaseField label="项目">
      <BaseSelect v-model="expense.project" :options="projects" title="选择项目" size="md" />
    </BaseField>
    <BaseField label="客户">
      <BaseSelect v-model="expense.customer" :options="customers" title="选择客户" size="md" />
    </BaseField>
    <BaseField label="收款账户">
      <BaseSelect v-model="expense.payeeAccount" :options="accounts" title="选择收款账户" size="md" />
    </BaseField>
    <BaseField label="企业主体">
      <BaseSelect v-model="expense.entity" :options="entities" title="选择企业主体" size="md" />
    </BaseField>
    <BaseField label="付款时间" class="business-grid__span-2">
      <BaseDatePicker v-model="expense.payAt" size="md" />
    </BaseField>
  </div>
</template>

<style scoped>
.business-grid {
  display: flex;
  flex-direction: column;
}

@media (min-width: var(--bp-desktop)) {
  .business-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: var(--layout-grid-gap-col);
    row-gap: 0;
  }
  .business-grid__span-2 {
    grid-column: span 2;
  }
}
</style>
```

- [ ] **Step 5.2: 跑 typecheck**

Run: `pnpm typecheck`
Expected: PASS

- [ ] **Step 5.3: 浏览器目视 BusinessFieldsSection 桌面端**

Run: `pnpm dev` 视口 1440×900
- 检查：项目 + 客户同行、收款账户 + 企业主体同行、付款时间独占一行
- 视口 375×667：单列堆叠
Expected: 视觉成立

- [ ] **Step 5.4: 提交**

```bash
git add src/components/expense/BusinessFieldsSection.vue
git commit -m "feat(business-fields): desktop 2-column grid (project+customer row, account+entity row, payAt span-2)"
```

---

## Task 6: OwnershipSection 桌面端 2 列布局

**Files:**
- Modify: `src/components/expense/OwnershipSection.vue`

**Interfaces:**
- Consumes: Task 1 产出的 `.desktop-grid-2` / `.desktop-grid-2--span-2` 工具类；Task 2 产出的 BaseTextarea `size="md"`
- Produces: 3 字段桌面端 2 列对齐（归属人+部门同行、备注跨 2 列）

- [ ] **Step 6.1: 完整覆盖 OwnershipSection.vue**

把 `src/components/expense/OwnershipSection.vue` 完整替换为：

```vue
<script setup lang="ts">
import BaseField from '../base/BaseField.vue'
import BaseTextarea from '../base/BaseTextarea.vue'
import { useExpenseStore } from '@/stores/expense'

const expense = useExpenseStore()
</script>

<template>
  <div class="card ownership-grid">
    <div class="field readonly-field">
      <label class="label">归属人</label>
      <div class="value">{{ expense.owner }}</div>
    </div>
    <div class="field readonly-field">
      <label class="label">归属部门</label>
      <div class="value">{{ expense.department }}</div>
    </div>
    <div class="ownership-grid__span-2">
      <BaseField label="备注" :block="true">
        <BaseTextarea v-model="expense.remark" placeholder="请输入" :rows="2" size="md" />
      </BaseField>
    </div>
  </div>
</template>

<style scoped>
.ownership-grid {
  display: flex;
  flex-direction: column;
}
.readonly-field .value { color: var(--color-ink); }

@media (min-width: var(--bp-desktop)) {
  .ownership-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: var(--layout-grid-gap-col);
    row-gap: 0;
  }
  .ownership-grid__span-2 {
    grid-column: span 2;
  }
}
</style>
```

- [ ] **Step 6.2: 跑 typecheck**

Run: `pnpm typecheck`
Expected: PASS

- [ ] **Step 6.3: 浏览器目视 OwnershipSection 桌面端**

Run: `pnpm dev` 视口 1440×900
- 检查：归属人 + 归属部门同行、备注跨 2 列
- 视口 375×667：单列堆叠
Expected: 视觉成立

- [ ] **Step 6.4: 提交**

```bash
git add src/components/expense/OwnershipSection.vue
git commit -m "feat(ownership): desktop 2-column grid (owner+department row, remark span-2)"
```

---

## Task 7: BottomBar 桌面端浮动面板

**Files:**
- Modify: `src/components/expense/BottomBar.vue`

**Interfaces:**
- Consumes: Task 2 产出的 BaseButton `size="md"`
- Produces: 移动端保留吸底形态不变；桌面端（≥ 960px）改为右下角浮动面板（FAB 风格），两按钮上下堆叠，列宽 144px，距视口右下 32px

- [ ] **Step 7.1: 完整覆盖 BottomBar.vue**

把 `src/components/expense/BottomBar.vue` 完整替换为：

```vue
<script setup lang="ts">
import BaseButton from '../base/BaseButton.vue'
import { useToast } from '@/composables/useToast'
import { useDraftStorage } from '@/utils/draftStorage'
import { useExpenseStore } from '@/stores/expense'

interface Props {
  isValid: boolean
}

withDefaults(defineProps<Props>(), { isValid: false })

const emit = defineEmits<{ (e: 'submit'): void }>()

const toast = useToast()
const expense = useExpenseStore()

function saveDraft() {
  const draft = expense.toDraft()
  useDraftStorage().save(draft)
  toast.show({ message: '已保存为草稿', type: 'success' })
}

function submit() {
  emit('submit')
}
</script>

<template>
  <footer class="bottom-bar">
    <div class="bottom-bar__inner">
      <BaseButton variant="secondary" size="md" block class="bottom-bar__btn" @click="saveDraft">保存草稿</BaseButton>
      <BaseButton
        variant="primary"
        size="md"
        block
        class="bottom-bar__btn"
        :disabled="!isValid"
        @click="submit"
      >提交</BaseButton>
    </div>
  </footer>
</template>

<style scoped>
/* 移动端：吸底，左右两按钮 */
.bottom-bar {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-canvas);
  padding: 10px 12px calc(10px + env(safe-area-inset-bottom));
  border-top: 1px solid var(--color-hairline);
  z-index: 100;
}
.bottom-bar__inner {
  display: flex;
  gap: 12px;
}
.bottom-bar__inner :deep(.base-btn--secondary) { flex: 0.8; }
.bottom-bar__inner :deep(.base-btn--primary) { flex: 1; }

/* 桌面端：右下角浮动面板，上下堆叠两按钮 */
@media (min-width: var(--bp-desktop)) {
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
</style>
```

- [ ] **Step 7.2: 跑 typecheck**

Run: `pnpm typecheck`
Expected: PASS

- [ ] **Step 7.3: 浏览器目视 BottomBar 桌面端 + 移动端**

Run: `pnpm dev`
- 视口 1440×900：右下角出现浮动面板，两按钮上下堆叠（次按钮「保存草稿」在上，主按钮「提交」在下），列宽 144px，距视口右下各 32px
- 滚动到任意位置：浮动面板**始终**在视口右下角
- 视口 375×667：吸底 + 左右两按钮（v1.0 行为不变）
Expected: 视觉成立

- [ ] **Step 7.4: 提交**

```bash
git add src/components/expense/BottomBar.vue
git commit -m "feat(bottom-bar): desktop floating action panel (FAB) at right-bottom 32px"
```

---

## Task 8: TotalCard 桌面端取消 margin + ExpenseReimburse 主布局

**Files:**
- Modify: `src/components/expense/TotalCard.vue`
- Modify: `src/views/ExpenseReimburse.vue`

**Interfaces:**
- Consumes: Task 1 产出的 `.desktop-container` 工具类与 `--layout-*` 变量
- Produces: 
  - TotalCard 桌面端取消 `margin: 12px 12px 0`（由父容器 gap 控制）
  - ExpenseReimburse `.page-main` 加 `.desktop-container` 类，桌面端增加 `gap: 16px; padding-top: 24px; padding-bottom: 96px;`

- [ ] **Step 8.1: 改 TotalCard.vue 桌面端取消 margin**

修改 `src/components/expense/TotalCard.vue` 的 `<style scoped>` 块：

把
```css
.total-card {
  margin: 12px 12px 0;
  background: linear-gradient(180deg, rgba(0, 127, 255, 0.06) 0%, rgba(0, 127, 255, 0.02) 100%);
  border-radius: var(--radius-md);
  padding: 18px 16px 14px;
  box-shadow: var(--shadow-s);
  position: relative;
  overflow: hidden;
}
```

替换为
```css
.total-card {
  margin: 12px 12px 0;
  background: linear-gradient(180deg, rgba(0, 127, 255, 0.06) 0%, rgba(0, 127, 255, 0.02) 100%);
  border-radius: var(--radius-md);
  padding: 18px 16px 14px;
  box-shadow: var(--shadow-s);
  position: relative;
  overflow: hidden;
}

@media (min-width: var(--bp-desktop)) {
  .total-card {
    margin: 0;
  }
}
```

> **不替换完整文件**，只追加 @media 块。文件中其余代码（模板、其它样式）保持不动。

- [ ] **Step 8.2: 改 ExpenseReimburse.vue 加 desktop-container**

修改 `src/views/ExpenseReimburse.vue`：

(a) 把第 128 行的 `<main class="page-main">` 改为 `<main class="page-main desktop-container">`

(b) 在 `<style scoped>` 块末尾（`.add-detail-card:hover { ... }` 之后）追加：

```css
@media (min-width: var(--bp-desktop)) {
  .page-main {
    gap: 16px;
    padding-top: 24px;
    padding-bottom: 96px;
  }
  .add-detail-card {
    margin: 0;
  }
}
```

完整文件最终应包含的关键差异：

- 模板里 `<main class="page-main desktop-container">`（第 128 行）
- `<style scoped>` 末尾的 `@media` 块

- [ ] **Step 8.3: 跑 typecheck**

Run: `pnpm typecheck`
Expected: PASS

- [ ] **Step 8.4: 跑单测**

Run: `pnpm test --run`
Expected: 4 个测试文件全绿。

- [ ] **Step 8.5: 浏览器目视主布局**

Run: `pnpm dev` 视口 1440×900
- 检查：主内容整体居中、左右各 32px 内边距、max-width 1200
- 检查：所有 section 上下间距 16px
- 检查：底部 DingtalkFooter 与浮动按钮面板**不重叠**（padding-bottom 96px 留出空间）
- 检查：滚动到底部，浮动按钮面板仍在右下角
- 视口 375×667：v1.0 行为不变（无 gap / 无 96px 底 padding）
Expected: 视觉成立

- [ ] **Step 8.6: 提交**

```bash
git add src/components/expense/TotalCard.vue src/views/ExpenseReimburse.vue
git commit -m "feat(layout): add .desktop-container to page-main, cancel TotalCard margin on desktop"
```

---

## Task 9: 综合验证与回归

**Files:** 无（验证任务）

**Interfaces:** 无（验证任务）

### Task 9.1: 全量自动化验证

- [ ] **Step 9.1.1: 类型检查**

Run: `pnpm typecheck`
Expected: PASS，0 错误。

- [ ] **Step 9.1.2: 单元测试**

Run: `pnpm test --run`
Expected: 4 个测试文件全绿（stores / utils × 2 / composables）。**测试用例数与 v1.0 验收时一致**（不允许减少）。

- [ ] **Step 9.1.3: 生产构建**

Run: `pnpm build`
Expected: 成功产出 `dist/` 目录，无 PostCSS 报错。

### Task 9.2: 桌面端（1440×900）目视验收

启动 dev server: `pnpm dev`
浏览器打开: `http://localhost:5173/reimburse`
Chrome DevTools 设置视口: 1440×900

逐项对照以下验收清单，**每一项必须通过**：

- [ ] **桌面-1**: 主内容 max-width 1200px 居中，左右各 120px 留白
- [ ] **桌面-2**: NavBar 高度 48px、宽度撑到 1200 居中，标题「日常报销」水平居中
- [ ] **桌面-3**: NavBar 右侧显示「搜索」「帮助」两个图标按钮
- [ ] **桌面-4**: RelatedApply 胶囊在容器宽度内自然显示
- [ ] **桌面-5**: TotalCard 宽度撑满容器内部，3 列 actions 网格均匀分布，红色金额显示正常
- [ ] **桌面-6**: ItemCard 内部：金额单独一行、日期+费用类型同行、说明跨 2 列、发票子块 + 附件行各占整行
- [ ] **桌面-7**: 「+ 添加报销明细」按钮居中显示在 ItemCard 下方
- [ ] **桌面-8**: InvoiceBlock 顶层独立卡片宽度撑满容器
- [ ] **桌面-9**: OwnershipSection 桌面端：归属人 + 归属部门同行、备注跨 2 列
- [ ] **桌面-10**: BusinessFieldsSection 桌面端：项目 + 客户同行、收款账户 + 企业主体同行、付款时间独占一行
- [ ] **桌面-11**: NotifySection 单列堆叠（未变形）
- [ ] **桌面-12**: FlowSection 单列堆叠（审批人 / 付款人 / 抄送人各占一行）
- [ ] **桌面-13**: DingtalkFooter 居中显示，与浮动按钮面板**不重叠**
- [ ] **桌面-14**: BottomBar 浮动面板：右下角 32px 偏移、列宽 144px、两按钮上下堆叠（次按钮在上、主按钮在下）
- [ ] **桌面-15**: 滚动到任意位置，浮动按钮面板**始终**在视口右下角
- [ ] **桌面-16**: 鼠标悬停 BaseButton primary：背景色变深（hover 反馈）
- [ ] **桌面-17**: 鼠标悬停 BaseButton secondary：背景色变浅灰
- [ ] **桌面-18**: 鼠标悬停 BaseButton ghost：背景出现淡蓝
- [ ] **桌面-19**: 鼠标悬停 BaseSelect / BaseDatePicker：边框从 hairline 变 hairline-strong
- [ ] **桌面-20**: 鼠标悬停 NavBar 返回按钮：背景出现淡灰
- [ ] **桌面-21**: 鼠标悬停「+ 添加报销明细」按钮：背景出现淡蓝
- [ ] **桌面-22**: hover 过渡动画 150ms 平滑，无卡顿

### Task 9.3: 移动端（375×667）回归验收

继续 dev server，Chrome DevTools 切换视口: 375×667

逐项对照以下清单：

- [ ] **移动-1**: 页面与 v1.0 验收时**视觉一致**（颜色 / 间距 / 字号 / 圆角无差异）
- [ ] **移动-2**: NavBar 右侧两按钮**消失**
- [ ] **移动-3**: 不出现任何桌面端样式（无 2 列布局、无 desktop-container 容器效果、无浮动按钮）
- [ ] **移动-4**: 不出现 hover 样式（移动端无鼠标交互）
- [ ] **移动-5**: BottomBar 吸底 + 左右两按钮（v1.0 行为）
- [ ] **移动-6**: 提交按钮在 `isValid === true` 时高亮
- [ ] **移动-7**: 校验失败：第一个错误字段滚动居中 + 红框抖动
- [ ] **移动-8**: 保存草稿 → 刷新 → Toast 询问 → 恢复字段完整
- [ ] **移动-9**: 提交成功后表单清空 + 草稿被清除
- [ ] **移动-10**: 添加发票 / 附件按钮点击均弹「需要钉钉 App 端支持」Toast

### Task 9.4: 响应式切换验收

- [ ] **切换-1**: 视口从 1440 拖到 800：浮动按钮面板**瞬间消失**，BottomBar 切回贴底吸底（无动画）
- [ ] **切换-2**: 视口从 800 拖到 1440：BottomBar 瞬间切到右下角浮动
- [ ] **切换-3**: 切换瞬间已填写的金额 / 备注 / 流程人员数据**不丢失**（Pinia store 持续持有）

### Task 9.5: 提交流程端到端测试

- [ ] **Step 9.5.1: 桌面端完整流程**

1. 视口 1440×900
2. 填写金额 200、日期 2026-07-03、费用类型选「交通」、费用说明填「出差打车」
3. 点击「搜索」按钮 → 应弹 Toast「该功能需要钉钉 App 端支持」
4. 点击「帮助」按钮 → 同上
5. 提交按钮在 isValid=true 时高亮可点
6. 点击「提交」→ 应弹 Toast「已提交报销单 · 总额 ¥200.00」
7. 表单清空、草稿被清除

- [ ] **Step 9.5.2: 移动端完整流程**

1. 视口 375×667
2. 同样填写一条明细
3. 点击「保存草稿」→ Toast「已保存为草稿」
4. 刷新浏览器 → 应弹 Toast 询问「检测到未提交的草稿，是否恢复？」
5. 点击「恢复」→ 字段全部回填
6. 切到桌面端（1440×900）→ 字段依然保留

- [ ] **Step 9.5.3: 最终提交**

```bash
# 关闭 dev server（Ctrl+C），跑全量验证
pnpm typecheck && pnpm test --run && pnpm build
```

Expected: 三条命令全部通过；build 产出 `dist/` 目录。

- [ ] **Step 9.5.4: 收尾 commit（如有遗留）**

如有未提交的改动：

```bash
git status
git add -A
git diff --staged --check
git commit -m "chore(desktop): final verification cleanup"
```

---

## 完成定义 (Definition of Done)

**v1.1 桌面端响应式适配完成**，当且仅当：

- [ ] Task 1-8 全部 commit 成功
- [ ] Task 9.1 全量自动化验证通过
- [ ] Task 9.2 桌面端 22 项目视验收全部通过
- [ ] Task 9.3 移动端 10 项回归验收全部通过
- [ ] Task 9.4 响应式切换 3 项验收全部通过
- [ ] Task 9.5 端到端流程 2 项验收全部通过
- [ ] v1.0 验收清单（`docs/superpowers/specs/2026-07-02-expense-reimburse-design.md` §12）**全部 13 项**继续通过

---

## 自审记录

**1. Spec 覆盖**：
- §3 构建配置 → Task 1
- §4 样式基础设施 → Task 1
- §5.1 Base 组件 size → Task 2
- §5.2 NavBar 改造 → Task 3
- §5.2 ItemCard 2 列 → Task 4
- §5.2 BusinessFieldsSection 2 列 → Task 5
- §5.2 OwnershipSection 2 列 → Task 6
- §5.2 TotalCard 调整 → Task 8.1
- §5.2 FlowSection / NotifySection 不变 → 不需要 task（按 spec 不变）
- §6 BottomBar 浮动面板 → Task 7
- §7 主布局 → Task 8.2
- §8 hover 反馈 → 已分散到 Task 2-8 各组件中
- §9 字体 → 不需独立 task（沿用 token）
- §10 验收 → Task 9
- §11 风险 → 已通过 §3.2 CSS 变量断点、Task 1.2 layout token 等缓解

**2. 占位符扫描**：未发现 TBD / TODO / "类似 Task N" / 模糊描述。所有代码块完整。

**3. 类型一致性**：
- `size: 'sm' | 'md'` prop 在 Task 2 五个 Base 组件统一定义，Task 4-7 业务组件传 `size="md"` 一致
- `--bp-desktop` 变量在 Task 1 定义、Task 2-8 引用
- `.desktop-container` / `.desktop-grid-2` / `.desktop-grid-2--span-2` 工具类在 Task 1 定义，Task 3 4 5 6 8 引用
- `useToast` API（`show({ message, type })`）在 Task 3 NavBar 使用，与 v1.0 store/composable 一致
