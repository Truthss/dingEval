# 钉钉「日常报销」页面复刻 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完整复刻钉钉移动端"日常报销"页面，桌面端无关，仅 375px 视口，所有交互走 mock 数据。

**Architecture:** Vue 3 SPA + Pinia 状态机 + vue-router。三层组件架构：原子层 (`components/base/`) → 业务层 (`components/expense/`) → 视图组合层 (`views/ExpenseReimburse.vue`)。全局单例浮层 (`useToast()` / `useActionSheet()`) 通过 Teleport 挂到 body。Pinia store 作为单一数据源。375px 视口由 `postcss-px-to-viewport` 统一处理。

**Tech Stack:**
- Vue 3.5 + TypeScript 5.6 (strict) + Vite 6
- Pinia 2 + vue-router 4
- `@iconify/vue` + `@iconify-json/ic`（图标，离线打包）
- `vitest` + `@vue/test-utils` + `happy-dom`（单测）
- `nanoid`（ID 生成）
- `postcss-px-to-viewport`（375 视口适配）
- 视觉设计参考 `docs/example.html`（独立 HTML 模拟，与本计划项目同源视觉）

---

## Global Constraints

1. **Token 命名**：所有样式必须使用 `src/styles/tokens.css` 已有的变量（`--color-*` / `--font-*` / `--space-*` / `--shadow-*` / `--radius-*` / `--z-*` / `--line-height-*`），不新增。
2. **单一数据源**：所有可读写状态走 `useExpenseStore()`；业务组件**不维护** local state。
3. **全局浮层**：`useToast()` 与 `useActionSheet()` 是 module-level 单例，对应 `BaseToast` / `BaseActionSheet` 在 `App.vue` 单次挂载，内部用 `<Teleport to="body">`。
4. **职责分层**：原子层（`base/`）不感知业务，只暴露 props；业务层（`expense/`）不直接 DOM 操作（除 `FlowSection` 通过 ref 触发滚动）；视图层只组合。
5. **样式范围**：所有 Vue 组件使用 `<style scoped>`；全局类名（`.field` / `.sub-block` / `.chip` 等）放在 `src/styles/reset.css`。
6. **TS 严格度**：`tsconfig.json` 已开启 `strict` / `noUnusedLocals` / `noUnusedParameters`，所有变量必须被使用、所有函数参数必须有消费者。
7. **测试隔离**：Pinia 测试用 `setActivePinia(createPinia())`；happy-dom 不复用。
8. **视口转换**：`postcss-px-to-viewport` 已配置 375 基准，所有 px 自动转 vw；写 CSS 时直接写 px。
9. **不在范围**：真实后端 API、真实图片上传、深色模式 UI 切换、桌面端布局、i18n、E2E 测试。
10. **提交契约**：`pnpm typecheck` / `pnpm test` / `pnpm build` 三条命令必须全绿。

---

## File Structure

### 新增文件（44 个）

```
src/
├── types/expense.ts                          # 类型集中
├── utils/
│   ├── money.ts                              # 金额格式化
│   ├── id.ts                                 # nanoid 包装
│   └── draftStorage.ts                       # localStorage 草稿
├── mocks/                                    # 7 个 mock 文件
│   ├── categories.ts
│   ├── projects.ts
│   ├── customers.ts
│   ├── accounts.ts
│   ├── entities.ts
│   ├── persons.ts
│   └── chats.ts
├── composables/                              # 4 个 composable
│   ├── useToast.ts
│   ├── useActionSheet.ts
│   ├── useFormValidation.ts
│   └── useDraftRestore.ts
├── components/
│   ├── base/                                 # 12 个原子组件
│   │   ├── DingIcon.vue
│   │   ├── BaseButton.vue
│   │   ├── BaseCard.vue
│   │   ├── BaseField.vue
│   │   ├── BaseInput.vue
│   │   ├── BaseTextarea.vue
│   │   ├── BaseSelect.vue
│   │   ├── BaseDatePicker.vue
│   │   ├── BaseCapsule.vue
│   │   ├── BaseTag.vue
│   │   ├── BaseToast.vue
│   │   └── BaseActionSheet.vue
│   └── expense/                              # 13 个业务组件
│       ├── NavBar.vue
│       ├── RelatedApply.vue
│       ├── TotalCard.vue
│       ├── ItemCard.vue
│       ├── InvoiceSubBlock.vue
│       ├── InvoiceBlock.vue
│       ├── AttachmentBlock.vue
│       ├── OwnershipSection.vue
│       ├── BusinessFieldsSection.vue
│       ├── NotifySection.vue
│       ├── FlowSection.vue
│       ├── BottomBar.vue
│       └── DingtalkFooter.vue
├── styles/reset.css                          # 移动端 reset + 全局类
└── __tests__/                                # 4 个测试文件
    ├── utils/money.spec.ts
    ├── utils/draftStorage.spec.ts
    ├── composables/useFormValidation.spec.ts
    └── stores/expense.spec.ts
```

### 修改文件（4 个）

```
src/
├── App.vue                                   # 挂载 BaseToast + BaseActionSheet
├── main.ts                                   # 引入 reset.css
├── stores/expense.ts                         # 增强：toDraft / restoreFromDraft / clearDraft / hasAnyAmount / isValid
└── views/ExpenseReimburse.vue                # 重写为组合入口
```

### 配置文件（2 个）

```
package.json                                 # 新增依赖与 scripts
vite.config.ts                               # 新增 test 块（vitest 集成）
```

---

## Execution Strategy

本计划按 8 个 Phase 顺序执行，每个 Phase 内可派多个 subagent 并行。

| Phase | 任务 | 派发策略 |
|---|---|---|
| **1. 基础** | 安装依赖、类型、工具、reset.css | **串行**（必须先有依赖） |
| **2. Mock 数据** | 7 个 mock 文件 | **7 路并行** |
| **3. Composables** | useToast / useActionSheet / useFormValidation / useDraftRestore | **4 路并行** |
| **4. 原子层** | 12 个 base 组件 | **12 路并行**（各自独立） |
| **5. Store 增强** | 增强 expense.ts + 测试 | **1 派发**（TDD） |
| **6. 业务层** | 13 个 expense 组件 | **13 路并行**（依赖 Phase 4、5 的接口） |
| **7. 组合** | App.vue + 视图重写 | **1 派发**（集成） |
| **8. 验收** | 视觉 + typecheck + test + build | **1 派发**（手动） |

**Subagent dispatch 协议**：
- 每个 subagent 接收一个 Phase 中的 1 个 task
- Task 描述中包含「完整文件路径」「所有依赖类型签名」「前序 Phase 产出物的接口约定」
- Subagent 不跨 task 工作；遇到阻塞时上报而非假设

---

## Phase 1: Foundation

> 必须全部完成才能进入 Phase 2。可串行执行，也可并行（除 T1.1 必须最先）。

### Task 1.1: 安装依赖并配置 vitest

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`

- [ ] **Step 1: 安装 npm 依赖**

```bash
cd D:\git\dingEval
pnpm add @iconify/vue @iconify-json/ic nanoid
pnpm add -D vitest @vue/test-utils happy-dom @vitest/coverage-v8
```

- [ ] **Step 2: 修改 package.json 的 scripts 段**

完整 `D:\git\dingEval\package.json` 应为：

```json
{
  "name": "dingeval",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "description": "钉钉移动端「日常报销」页面复刻，基于 Vue 3 + Vite + TypeScript",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build",
    "preview": "vite preview",
    "typecheck": "vue-tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  },
  "dependencies": {
    "@iconify-json/ic": "^1.2.0",
    "@iconify/vue": "^4.3.0",
    "nanoid": "^5.0.0",
    "pinia": "^2.3.0",
    "vue": "^3.5.13",
    "vue-router": "^4.5.0"
  },
  "devDependencies": {
    "@types/node": "^22.10.0",
    "@vitejs/plugin-vue": "^5.2.1",
    "@vitest/coverage-v8": "^2.1.0",
    "@vue/test-utils": "^2.4.0",
    "@vue/tsconfig": "^0.7.0",
    "autoprefixer": "^10.4.20",
    "happy-dom": "^15.0.0",
    "postcss": "^8.4.49",
    "postcss-px-to-viewport": "^1.1.1",
    "typescript": "~5.6.3",
    "vite": "^6.0.3",
    "vitest": "^2.1.0",
    "vue-tsc": "^2.1.10"
  },
  "engines": {
    "node": ">=20.19.0"
  }
}
```

- [ ] **Step 3: 在 vite.config.ts 中添加 test 字段**

修改 `D:\git\dingEval\vite.config.ts` 的 `defineConfig` 内（在 `build` 块后）添加 `test` 字段：

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import autoprefixer from 'autoprefixer'
import pxToViewport from 'postcss-px-to-viewport'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
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
          mediaQuery: false,
          replace: true,
          exclude: [/node_modules\/(?!(vant|@vant)\/)/],
          landscape: false
        })
      ]
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    open: false
  },
  build: {
    target: 'es2019',
    outDir: 'dist',
    sourcemap: false,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue', 'vue-router', 'pinia']
        }
      }
    }
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['src/**/__tests__/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,vue}'],
      exclude: ['src/**/__tests__/**', 'src/mocks/**', 'src/types/**', 'src/main.ts', 'src/router/**']
    }
  }
})
```

- [ ] **Step 4: 验证测试环境就绪**

创建临时 smoke 测试文件 `D:\git\dingEval\src\__tests__\smoke.spec.ts`：

```ts
import { describe, it, expect } from 'vitest'

describe('smoke', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2)
  })
})
```

运行：

```bash
cd D:\git\dingEval
pnpm test
```

Expected: `1 test passed`。删除 smoke 文件后进入下一步。

```bash
Remove-Item D:\git\dingEval\src\__tests__\smoke.spec.ts
```

- [ ] **Step 5: 提交**

```bash
cd D:\git\dingEval
git add package.json pnpm-lock.yaml vite.config.ts
git commit -m "chore: install iconify + nanoid + vitest, configure happy-dom env"
```

---

### Task 1.2: 创建 types/expense.ts

**Files:**
- Create: `src/types/expense.ts`

- [ ] **Step 1: 创建文件**

`D:\git\dingEval\src\types\expense.ts`：

```ts
export type InvoiceStatus = 'none' | 'pending' | 'received'

export type CategoryValue =
  | 'travel'
  | 'meal'
  | 'office'
  | 'entertain'
  | 'communication'
  | 'other'

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
  invoiceStatus: InvoiceStatus
  owner: string
  department: string
}

export interface OptionItem {
  value: string
  label: string
  description?: string
  title?: string
  avatarColor?: string
}

export interface PersonOption extends OptionItem {
  title: string
}

export interface ChatOption extends OptionItem {
  avatarColor: string
}
```

- [ ] **Step 2: 验证 TS 编译**

```bash
cd D:\git\dingEval
pnpm typecheck
```

Expected: 0 errors。

- [ ] **Step 3: 提交**

```bash
cd D:\git\dingEval
git add src/types/expense.ts
git commit -m "feat(types): add expense type definitions"
```

---

### Task 1.3: 创建 utils/money.ts（TDD）

**Files:**
- Create: `src/__tests__/utils/money.spec.ts`
- Create: `src/utils/money.ts`

- [ ] **Step 1: 写测试**

`D:\git\dingEval\src\__tests__\utils\money.spec.ts`：

```ts
import { describe, it, expect } from 'vitest'
import { formatMoney, parseMoney, isPositiveAmount } from '@/utils/money'

describe('formatMoney', () => {
  it('formats integer with thousand separators and 2 decimals', () => {
    expect(formatMoney(1280)).toBe('1,280.00')
  })

  it('formats decimal with thousand separators and 2 decimals', () => {
    expect(formatMoney(1234567.891)).toBe('1,234,567.89')
  })

  it('formats zero', () => {
    expect(formatMoney(0)).toBe('0.00')
  })

  it('treats null / undefined / NaN as zero', () => {
    expect(formatMoney(null)).toBe('0.00')
    expect(formatMoney(undefined)).toBe('0.00')
    expect(formatMoney(NaN)).toBe('0.00')
  })

  it('handles negative numbers', () => {
    expect(formatMoney(-1234.5)).toBe('-1,234.50')
  })
})

describe('parseMoney', () => {
  it('parses string with commas', () => {
    expect(parseMoney('1,234.56')).toBe(1234.56)
  })

  it('parses plain number string', () => {
    expect(parseMoney('1280')).toBe(1280)
  })

  it('returns 0 for empty / null / undefined', () => {
    expect(parseMoney('')).toBe(0)
    expect(parseMoney(null)).toBe(0)
    expect(parseMoney(undefined)).toBe(0)
  })

  it('returns 0 for invalid string', () => {
    expect(parseMoney('abc')).toBe(0)
  })
})

describe('isPositiveAmount', () => {
  it('returns true for > 0', () => {
    expect(isPositiveAmount(0.01)).toBe(true)
    expect(isPositiveAmount(100)).toBe(true)
  })

  it('returns false for 0, null, undefined, negative', () => {
    expect(isPositiveAmount(0)).toBe(false)
    expect(isPositiveAmount(null)).toBe(false)
    expect(isPositiveAmount(undefined)).toBe(false)
    expect(isPositiveAmount(-1)).toBe(false)
  })
})
```

- [ ] **Step 2: 运行测试，验证失败**

```bash
cd D:\git\dingEval
pnpm test src/__tests__/utils/money.spec.ts
```

Expected: FAIL with "Cannot find module '@/utils/money'"。

- [ ] **Step 3: 实现**

`D:\git\dingEval\src\utils\money.ts`：

```ts
export function formatMoney(value: number | null | undefined): string {
  const v = Number(value) || 0
  const fixed = v.toFixed(2)
  const [intPart, decPart] = fixed.split('.')
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `${withCommas}.${decPart}`
}

export function parseMoney(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === '') return 0
  const cleaned = String(value).replace(/,/g, '').trim()
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : 0
}

export function isPositiveAmount(value: number | null | undefined): boolean {
  if (value === null || value === undefined) return false
  return Number(value) > 0
}
```

- [ ] **Step 4: 运行测试，验证通过**

```bash
cd D:\git\dingEval
pnpm test src/__tests__/utils/money.spec.ts
```

Expected: 11 tests passed。

- [ ] **Step 5: 提交**

```bash
cd D:\git\dingEval
git add src/utils/money.ts src/__tests__/utils/money.spec.ts
git commit -m "feat(utils): add money formatter, parser, validator (TDD)"
```

---

### Task 1.4: 创建 utils/id.ts

**Files:**
- Create: `src/utils/id.ts`

- [ ] **Step 1: 创建文件**

`D:\git\dingEval\src\utils\id.ts`：

```ts
import { nanoid } from 'nanoid'

export function uid(prefix?: string): string {
  return prefix ? `${prefix}_${nanoid(8)}` : nanoid(10)
}

export const today = (): string => {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}
```

- [ ] **Step 2: 验证 TS 编译**

```bash
cd D:\git\dingEval
pnpm typecheck
```

Expected: 0 errors。

- [ ] **Step 3: 提交**

```bash
cd D:\git\dingEval
git add src/utils/id.ts
git commit -m "feat(utils): add nanoid wrapper and today() helper"
```

---

### Task 1.5: 创建 utils/draftStorage.ts（TDD）

**Files:**
- Create: `src/__tests__/utils/draftStorage.spec.ts`
- Create: `src/utils/draftStorage.ts`

- [ ] **Step 1: 写测试**

`D:\git\dingEval\src\__tests__\utils\draftStorage.spec.ts`：

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useDraftStorage } from '@/utils/draftStorage'
import type { ExpenseDraft } from '@/types/expense'

const STORAGE_KEY = 'dingeval:expense:draft'

const sampleDraft: ExpenseDraft = {
  version: 1,
  savedAt: 1700000000000,
  items: [
    {
      id: 'item-1',
      amount: 100,
      occurredAt: '2026-07-02',
      category: 'travel',
      description: 'taxi',
      invoiceStatus: 'none',
      attachmentCount: 0
    }
  ],
  relatedApplyId: null,
  remark: 'hello',
  project: 'walker-1',
  customer: 'walker',
  payeeAccount: 'icbc-001',
  entity: 'walker-cn',
  payAt: '2026-07-05',
  notifyChats: ['lina'],
  approver: 'zhangming',
  payer: 'wangfang',
  cc: ['liuhua'],
  invoiceStatus: 'pending',
  owner: '陆晓锋',
  department: '播阳测试部门'
}

describe('draftStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  it('returns null when no draft exists', () => {
    expect(useDraftStorage().load()).toBeNull()
  })

  it('saves and loads a draft', () => {
    useDraftStorage().save(sampleDraft)
    const loaded = useDraftStorage().load()
    expect(loaded).toEqual(sampleDraft)
    expect(localStorage.getItem(STORAGE_KEY)).toBeTruthy()
  })

  it('clears a draft', () => {
    useDraftStorage().save(sampleDraft)
    useDraftStorage().clear()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    expect(useDraftStorage().load()).toBeNull()
  })

  it('safely returns null when JSON is corrupt', () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json')
    expect(useDraftStorage().load()).toBeNull()
  })

  it('safely returns null when version mismatches', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 999, items: [] }))
    expect(useDraftStorage().load()).toBeNull()
  })

  it('safely returns null when required field missing', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1 }))
    expect(useDraftStorage().load()).toBeNull()
  })
})
```

- [ ] **Step 2: 运行测试，验证失败**

```bash
cd D:\git\dingEval
pnpm test src/__tests__/utils/draftStorage.spec.ts
```

Expected: FAIL with "Cannot find module '@/utils/draftStorage'"。

- [ ] **Step 3: 实现**

`D:\git\dingEval\src\utils\draftStorage.ts`：

```ts
import type { ExpenseDraft } from '@/types/expense'

const STORAGE_KEY = 'dingeval:expense:draft'

function isValidDraft(value: unknown): value is ExpenseDraft {
  if (!value || typeof value !== 'object') return false
  const d = value as Partial<ExpenseDraft>
  return (
    d.version === 1 &&
    typeof d.savedAt === 'number' &&
    Array.isArray(d.items) &&
    Array.isArray(d.notifyChats) &&
    Array.isArray(d.cc)
  )
}

function draftStorage() {
  return {
    save(draft: ExpenseDraft): void {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
      } catch (err) {
        console.warn('[draftStorage] save failed', err)
      }
    },
    load(): ExpenseDraft | null {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return null
        const parsed: unknown = JSON.parse(raw)
        return isValidDraft(parsed) ? parsed : null
      } catch (err) {
        console.warn('[draftStorage] load failed', err)
        return null
      }
    },
    clear(): void {
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch (err) {
        console.warn('[draftStorage] clear failed', err)
      }
    }
  }
}

export function useDraftStorage() {
  return draftStorage()
}
```

- [ ] **Step 4: 运行测试，验证通过**

```bash
cd D:\git\dingEval
pnpm test src/__tests__/utils/draftStorage.spec.ts
```

Expected: 6 tests passed。

- [ ] **Step 5: 提交**

```bash
cd D:\git\dingEval
git add src/utils/draftStorage.ts src/__tests__/utils/draftStorage.spec.ts
git commit -m "feat(utils): add draft storage with corrupt-safe parsing (TDD)"
```

---

### Task 1.6: 创建 styles/reset.css

**Files:**
- Create: `src/styles/reset.css`
- Modify: `src/main.ts`

- [ ] **Step 1: 创建 reset.css**

`D:\git\dingEval\src\styles\reset.css`：

```css
/* ============================================================
 * 移动端基础 reset + 全局类（参考 docs/example.html）
 * 视觉规范详见 src/styles/tokens.css 与 docs/DESIGN.md
 * ============================================================ */

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body {
  font-family: var(--font-family-base);
  font-size: var(--font-size-body);
  line-height: var(--line-height-normal);
  color: var(--color-ink);
  background: var(--color-canvas-soft);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  letter-spacing: 0;
}

body {
  min-height: 100vh;
  -webkit-tap-highlight-color: transparent;
}

button {
  font: inherit;
  color: inherit;
  cursor: pointer;
  border: 0;
  background: transparent;
}

input,
textarea,
select {
  font: inherit;
  color: inherit;
}

textarea {
  resize: none;
}

a {
  color: var(--color-link);
  text-decoration: none;
}

/* ---------- 全局类：field 通用行 ---------- */
.field {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 48px;
  position: relative;
  flex-wrap: wrap;
}
.field + .field { border-top: 1px solid var(--color-hairline); }
.field.block { align-items: flex-start; }
.field .label {
  font-size: 14px;
  color: var(--color-ink);
  min-width: 96px;
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}
.field .label .req { color: var(--color-error); font-size: 13px; line-height: 1; }
.field .label .help { color: var(--color-mute); margin-left: 4px; display: inline-flex; }
.field .control {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-end;
}
.field .control.start { justify-content: flex-start; }
.field .control input,
.field .control textarea {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  font-size: 14px;
  color: var(--color-ink);
  text-align: right;
  padding: 6px 0;
}
.field .control input::placeholder,
.field .control textarea::placeholder { color: var(--color-mute); }
.field .control textarea {
  text-align: left;
  line-height: var(--line-height-normal);
  min-height: 60px;
  padding: 6px 0 0;
}
.field .control input:focus-visible,
.field .control textarea:focus-visible {
  outline: none;
  box-shadow: inset 0 -1px 0 var(--color-primary);
  color: var(--color-ink);
}
.field .value {
  flex: 1 1 0;
  min-width: 0;
  text-align: right;
  font-size: 14px;
  color: var(--color-ink);
  font-variant-numeric: tabular-nums;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.field .value.placeholder { color: var(--color-mute); }
.field .value.readonly { color: var(--color-ink); }
.field .value.muted { color: var(--color-body); }
.field .suffix { color: var(--color-mute); display: inline-flex; flex-shrink: 0; }
.field .picker-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1 1 0;
  min-width: 0;
  justify-content: flex-end;
  cursor: pointer;
  font-size: 14px;
  color: var(--color-ink);
  background: transparent;
  border: 0;
  padding: 0;
}
.field .picker-trigger.placeholder { color: var(--color-mute); }
.field .picker-trigger:hover .chevron { color: var(--color-primary); }
.field .picker-trigger:focus-visible {
  outline: none;
  box-shadow: inset 0 -1px 0 var(--color-primary);
}
.field.has-error { background: rgba(255, 82, 25, 0.04); }
.field.has-error .label { color: var(--color-error); }
.field.has-error input,
.field.has-error textarea { color: var(--color-error); }
.field .error-text {
  flex: 1 0 100%;
  font-size: 11px;
  color: var(--color-error);
  text-align: right;
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin: -2px 0 0;
  letter-spacing: 0.01em;
}
.field .error-text::before {
  content: '';
  width: 12px;
  height: 12px;
  background: var(--color-error);
  -webkit-mask: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='10'/><line x1='12' y1='8' x2='12' y2='12'/><line x1='12' y1='16' x2='12.01' y2='16'/></svg>") no-repeat center / contain;
          mask: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='10'/><line x1='12' y1='8' x2='12' y2='12'/><line x1='12' y1='16' x2='12.01' y2='16'/></svg>") no-repeat center / contain;
  flex-shrink: 0;
}

/* ---------- 全局类：card 卡片 ---------- */
.card {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  margin: 12px 12px 0;
  box-shadow: var(--shadow-s);
  overflow: hidden;
}
.card-pad { padding: 16px; }
.card-section + .card-section { border-top: 1px solid var(--color-hairline); }
.card-section { padding: 14px 16px; }
.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-ink);
  letter-spacing: -0.01em;
}
.section-title .remove {
  color: var(--color-error);
  font-size: 13px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 4px 6px;
  border-radius: var(--radius-xs);
}
.section-title .remove:hover { background: rgba(255, 82, 25, 0.08); }

/* ---------- 全局类：sub-block（发票子块） ---------- */
.sub-block {
  padding: 12px 16px 14px;
  background: var(--color-canvas-soft);
}
.sub-block + .sub-block { border-top: 1px solid var(--color-hairline); }
.sub-block .sub-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.sub-block .sub-head h5 {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-ink);
}
.sub-block .hint {
  font-size: 12px;
  color: var(--color-body);
  margin: 0 0 10px;
  line-height: var(--line-height-normal);
}

/* ---------- 全局类：chip / tag-pill ---------- */
.chip-row { display: flex; gap: 8px; flex-wrap: wrap; }
.chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  border-radius: var(--radius-full);
  font-size: 12px;
  background: var(--color-canvas);
  color: var(--color-body);
  border: 1px solid var(--color-hairline);
  cursor: pointer;
  transition: all 0.15s;
}
.chip:hover { border-color: var(--color-hairline-strong); }
.chip.active {
  background: rgba(0, 127, 255, 0.08);
  color: var(--color-primary);
  border-color: rgba(0, 127, 255, 0.20);
  font-weight: 500;
}
.chip .help { color: var(--color-mute); display: inline-flex; margin-left: 2px; }
.tag-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px 5px 8px;
  background: rgba(0, 127, 255, 0.08);
  color: var(--color-primary);
  border-radius: var(--radius-full);
  font-size: 13px;
}
.tag-pill .avatar {
  width: 18px;
  height: 18px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  color: var(--color-on-primary);
  display: grid;
  place-items: center;
  font-size: 10px;
  font-weight: 600;
}
.tag-pill .close {
  color: var(--color-mute);
  display: grid;
  place-items: center;
  width: 14px;
  height: 14px;
  cursor: pointer;
}
.tag-pill .close:hover { color: var(--color-error); }

/* ---------- 全局类：add-btn / attach-row ---------- */
.add-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--color-primary);
  font-size: 13px;
  font-weight: 500;
  padding: 4px 6px;
  border-radius: var(--radius-xs);
}
.add-btn:hover { background: rgba(0, 127, 255, 0.06); }
.add-btn svg { width: 14px; height: 14px; }
.attach-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  color: var(--color-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}
.attach-row:hover { background: rgba(126, 134, 142, 0.06); }
.attach-row svg { width: 16px; height: 16px; }

/* ---------- 全局类：flow-list ---------- */
.flow-list .flow-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  position: relative;
}
.flow-list .flow-item + .flow-item { border-top: 1px solid var(--color-hairline); }
.flow-list .dot {
  width: 10px;
  height: 10px;
  border-radius: var(--radius-full);
  background: var(--color-canvas-soft);
  border: 2px solid var(--color-primary);
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}
.flow-list .flow-item + .flow-item .dot::before {
  content: '';
  position: absolute;
  left: 50%;
  top: -14px;
  transform: translateX(-50%);
  width: 1px;
  height: 12px;
  background: var(--color-hairline);
}
.flow-list .flow-item .info { flex: 1; min-width: 0; }
.flow-list .flow-item .info .name {
  font-size: 14px;
  color: var(--color-ink);
  display: flex;
  align-items: center;
  gap: 4px;
}
.flow-list .flow-item .info .name .req { color: var(--color-error); font-size: 12px; }
.flow-list .flow-item .info .meta {
  font-size: 12px;
  color: var(--color-mute);
  margin-top: 2px;
}
.flow-list .flow-item .add-btn-icon {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-xs);
  background: var(--color-canvas-soft);
  color: var(--color-primary);
  border: 0;
  display: grid;
  place-items: center;
  transition: background 0.15s, transform 0.12s;
  cursor: pointer;
}
.flow-list .flow-item .add-btn-icon svg { width: 16px; height: 16px; }
.flow-list .flow-item .add-btn-icon:hover { background: rgba(0, 127, 255, 0.12); }
.flow-list .flow-item .add-btn-icon:active { transform: scale(0.94); }
.flow-list .flow-item .add-btn-icon:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
.flow-list .flow-item.has-error .info .meta { color: var(--color-error); }

/* ---------- 卡片入场动画 ---------- */
.card,
.related-pill,
.total-card,
.add-detail-card,
.ding-footer {
  animation: card-in 0.3s ease-out backwards;
}
@keyframes card-in {
  from { transform: translateY(6px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.card:nth-child(1) { animation-delay: 0.04s; }
.card:nth-child(2) { animation-delay: 0.08s; }
.card:nth-child(3) { animation-delay: 0.12s; }
.card:nth-child(4) { animation-delay: 0.16s; }
.card:nth-child(5) { animation-delay: 0.20s; }
.card:nth-child(6) { animation-delay: 0.24s; }
.card:nth-child(7) { animation-delay: 0.28s; }
.card:nth-child(8) { animation-delay: 0.32s; }
.card:nth-child(9) { animation-delay: 0.36s; }
.card:nth-child(10) { animation-delay: 0.40s; }
.card:nth-child(n+11) { animation-delay: 0.44s; }
```

- [ ] **Step 2: 在 main.ts 中引入**

修改 `D:\git\dingEval\src\main.ts`：

```ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

import './styles/base.css'
import './styles/reset.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
```

- [ ] **Step 3: 验证**

```bash
cd D:\git\dingEval
pnpm typecheck
```

Expected: 0 errors。

- [ ] **Step 4: 提交**

```bash
cd D:\git\dingEval
git add src/styles/reset.css src/main.ts
git commit -m "feat(styles): add mobile reset + global utility classes (field, card, chip, flow)"
```

---

## Phase 2: Mocks (7 路并行)

> Phase 1 完成后，7 个 mock 文件可同时派发。每个文件独立、无依赖。

### Task 2.1: 创建 categories.ts

**Files:**
- Create: `src/mocks/categories.ts`

- [ ] **Step 1: 创建文件**

`D:\git\dingEval\src\mocks\categories.ts`：

```ts
import type { OptionItem } from '@/types/expense'

export const categories: OptionItem[] = [
  { value: 'travel', label: '差旅费' },
  { value: 'meal', label: '业务招待费' },
  { value: 'office', label: '办公用品' },
  { value: 'entertain', label: '业务招待' },
  { value: 'communication', label: '通讯费' },
  { value: 'other', label: '其他费用' }
]

export function findCategoryLabel(value: string | null): string {
  if (!value) return ''
  return categories.find((c) => c.value === value)?.label ?? ''
}
```

---

### Task 2.2: 创建 projects.ts

**Files:**
- Create: `src/mocks/projects.ts`

- [ ] **Step 1: 创建文件**

`D:\git\dingEval\src\mocks\projects.ts`：

```ts
import type { OptionItem } from '@/types/expense'

export const projects: OptionItem[] = [
  { value: 'walker-1', label: '沃克·供应链项目（一期）' },
  { value: 'walker-2', label: '沃克·数字化平台（二期）' },
  { value: 'walker-3', label: '沃克·海外仓 (Q3)' },
  { value: 'walker-4', label: '沃克·客户成功体系搭建' },
  { value: 'walker-5', label: '沃克·数据中台 PoC' }
]

export function findProjectLabel(value: string | null): string {
  if (!value) return ''
  return projects.find((p) => p.value === value)?.label ?? ''
}
```

---

### Task 2.3: 创建 customers.ts

**Files:**
- Create: `src/mocks/customers.ts`

- [ ] **Step 1: 创建文件**

`D:\git\dingEval\src\mocks\customers.ts`：

```ts
import type { OptionItem } from '@/types/expense'

export const customers: OptionItem[] = [
  { value: 'walker', label: '上海沃克供应链管理有限公司' },
  { value: 'bosch', label: '博世（中国）投资有限公司' },
  { value: 'huawei', label: '华为技术有限公司' },
  { value: 'sany', label: '三一重工股份有限公司' },
  { value: 'haier', label: '海尔智家股份有限公司' },
  { value: 'midea', label: '美的集团股份有限公司' }
]

export function findCustomerLabel(value: string | null): string {
  if (!value) return ''
  return customers.find((c) => c.value === value)?.label ?? ''
}
```

---

### Task 2.4: 创建 accounts.ts

**Files:**
- Create: `src/mocks/accounts.ts`

- [ ] **Step 1: 创建文件**

`D:\git\dingEval\src\mocks\accounts.ts`：

```ts
import type { OptionItem } from '@/types/expense'

export const accounts: OptionItem[] = [
  { value: 'icbc-001', label: '中国工商银行 (6212****1234)' },
  { value: 'cmb-002', label: '招商银行 (6225****5678)' },
  { value: 'ccb-003', label: '中国建设银行 (6217****9012)' },
  { value: 'boc-004', label: '中国银行 (6216****3456)' },
  { value: 'abc-005', label: '中国农业银行 (6228****7890)' }
]

export function findAccountLabel(value: string | null): string {
  if (!value) return ''
  return accounts.find((a) => a.value === value)?.label ?? ''
}
```

---

### Task 2.5: 创建 entities.ts

**Files:**
- Create: `src/mocks/entities.ts`

- [ ] **Step 1: 创建文件**

`D:\git\dingEval\src\mocks\entities.ts`：

```ts
import type { OptionItem } from '@/types/expense'

export const entities: OptionItem[] = [
  { value: 'walker-cn', label: '沃克（中国）供应链管理有限公司' },
  { value: 'walker-sh', label: '上海沃克物流有限公司' },
  { value: 'walker-bj', label: '北京沃克信息技术有限公司' },
  { value: 'walker-sz', label: '深圳沃克智能科技股份有限公司' }
]

export function findEntityLabel(value: string | null): string {
  if (!value) return ''
  return entities.find((e) => e.value === value)?.label ?? ''
}
```

---

### Task 2.6: 创建 persons.ts

**Files:**
- Create: `src/mocks/persons.ts`

- [ ] **Step 1: 创建文件**

`D:\git\dingEval\src\mocks\persons.ts`：

```ts
import type { PersonOption } from '@/types/expense'

export const persons: PersonOption[] = [
  { value: 'zhangming', label: '张明', title: '财务经理' },
  { value: 'wangfang', label: '王芳', title: '财务总监' },
  { value: 'liuhua', label: '刘华', title: 'CFO' },
  { value: 'lina', label: '李娜', title: 'HR 经理' },
  { value: 'chenyu', label: '陈宇', title: '项目总监' },
  { value: 'sunlei', label: '孙磊', title: '研发负责人' },
  { value: 'zhaoyan', label: '赵燕', title: '运营经理' },
  { value: 'zhengtao', label: '郑涛', title: '法务总监' }
]

export function findPerson(value: string | null): PersonOption | undefined {
  if (!value) return undefined
  return persons.find((p) => p.value === value)
}

export function findPersonDisplay(value: string | null): string {
  const p = findPerson(value)
  return p ? `${p.label} · ${p.title}` : ''
}
```

---

### Task 2.7: 创建 chats.ts

**Files:**
- Create: `src/mocks/chats.ts`

- [ ] **Step 1: 创建文件**

`D:\git\dingEval\src\mocks\chats.ts`：

```ts
import type { ChatOption } from '@/types/expense'

const PALETTE = ['#5AC8FA', '#007FFF', '#00B042', '#FF9200', '#FF5219']

export const chats: ChatOption[] = [
  { value: 'lina', label: '李娜', title: 'HR 经理', avatarColor: PALETTE[0] },
  { value: 'chenyu', label: '陈宇', title: '项目总监', avatarColor: PALETTE[1] },
  { value: 'sunlei', label: '孙磊', title: '研发负责人', avatarColor: PALETTE[2] },
  { value: 'zhaoyan', label: '赵燕', title: '运营经理', avatarColor: PALETTE[3] },
  { value: 'zhengtao', label: '郑涛', title: '法务总监', avatarColor: PALETTE[4] }
]

export function findChat(value: string | null): ChatOption | undefined {
  if (!value) return undefined
  return chats.find((c) => c.value === value)
}
```

- [ ] **Step 2: 全部 7 个 mock 完成后验证 + 提交**

```bash
cd D:\git\dingEval
pnpm typecheck
```

Expected: 0 errors。

```bash
cd D:\git\dingEval
git add src/mocks/
git commit -m "feat(mocks): add 7 mock data files (categories, projects, customers, accounts, entities, persons, chats)"
```

---

## Phase 3: Composables (4 路并行)

> 依赖 Phase 1 完成的 types。3 个非测试 composable + 1 个 TDD composable 并行。

### Task 3.1: 创建 useToast.ts

**Files:**
- Create: `src/composables/useToast.ts`

**接口约定：**
- `useToast()` 返回单例 `ToastController`。
- `show({ message, type?, duration?, action?, dismiss? })` 触发浮层。
- `hide()` 主动关闭。
- 内部 `ref<ToastState>` 在 module scope。
- `type` 限定 `'info' | 'success' | 'error'`，默认 `'info'`。
- `duration` 单位 ms，默认 2000；`0` 表示不自动消失。
- `action.onClick` 触发后**不**自动关闭；调用方负责 `useToast().hide()`。

- [ ] **Step 1: 创建文件**

`D:\git\dingEval\src\composables\useToast.ts`：

```ts
import { ref, readonly } from 'vue'

export type ToastType = 'info' | 'success' | 'error'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastDismiss {
  label: string
  onClick?: () => void
}

export interface ToastInput {
  message: string
  type?: ToastType
  duration?: number
  action?: ToastAction
  dismiss?: ToastDismiss
}

interface ToastState {
  visible: boolean
  message: string
  type: ToastType
  duration: number
  action: ToastAction | null
  dismiss: ToastDismiss | null
}

const initial: ToastState = {
  visible: false,
  message: '',
  type: 'info',
  duration: 2000,
  action: null,
  dismiss: null
}

const state = ref<ToastState>({ ...initial })
let timer: number | null = null

function clearTimer() {
  if (timer !== null) {
    window.clearTimeout(timer)
    timer = null
  }
}

function hide() {
  clearTimer()
  state.value = { ...initial }
}

function show(input: ToastInput) {
  clearTimer()
  state.value = {
    visible: true,
    message: input.message,
    type: input.type ?? 'info',
    duration: input.duration ?? 2000,
    action: input.action ?? null,
    dismiss: input.dismiss ?? null
  }
  if (state.value.duration > 0) {
    timer = window.setTimeout(hide, state.value.duration)
  }
}

export function useToast() {
  return {
    state: readonly(state),
    show,
    hide
  }
}
```

---

### Task 3.2: 创建 useActionSheet.ts

**Files:**
- Create: `src/composables/useActionSheet.ts`

**接口约定：**
- `useActionSheet()` 返回单例 `ActionSheetController`。
- `open({ title?, options, current?, onSelect })` 触发浮层。
- `select(value)` 调用 onSelect + 关闭；`close()` 仅关闭。
- 内部 `ref<ActionSheetState>` 在 module scope。
- options 元素为 `OptionItem`，value 为 string；`onSelect(value: string | null)` 中 `null` 表示无选择（关闭）。
- 同一时刻只允许一个 ActionSheet 打开（再次 `open` 会覆盖）。

- [ ] **Step 1: 创建文件**

`D:\git\dingEval\src\composables\useActionSheet.ts`：

```ts
import { ref, readonly } from 'vue'
import type { OptionItem } from '@/types/expense'

interface ActionSheetState {
  visible: boolean
  title: string
  options: OptionItem[]
  current: string | null
}

interface OpenInput {
  title?: string
  options: OptionItem[]
  current?: string | null
  onSelect: (value: string | null) => void
}

const initial: ActionSheetState = {
  visible: false,
  title: '',
  options: [],
  current: null
}

const state = ref<ActionSheetState>({ ...initial })
let pendingOnSelect: ((value: string | null) => void) | null = null

function close() {
  state.value = { ...initial }
  pendingOnSelect = null
}

function select(value: string) {
  const cb = pendingOnSelect
  close()
  if (cb) cb(value)
}

function open(input: OpenInput) {
  pendingOnSelect = input.onSelect
  state.value = {
    visible: true,
    title: input.title ?? '',
    options: input.options,
    current: input.current ?? null
  }
}

export function useActionSheet() {
  return {
    state: readonly(state),
    open,
    close,
    select
  }
}
```

---

### Task 3.3: 创建 useFormValidation.ts（TDD）

**Files:**
- Create: `src/__tests__/composables/useFormValidation.spec.ts`
- Create: `src/composables/useFormValidation.ts`

**接口约定：**
- `useFormValidation({ refs, store })` 返回 `{ validate, errors, clearError }`。
- `validate()` 返回 `{ ok: boolean; firstErrorRef?: Ref<HTMLElement | null> }`。
- 7 条规则（按出现顺序）：items[i].amount > 0 / items[i].occurredAt / items[i].category / payer。
- 业务字段（项目/客户/账户/主体/付款时间）和全局 invoiceStatus **不**参与必填校验。
- 字段错误清除：`clearError(path)` 手动清除某条。
- `refs` 是 `ValidationRefs` 接口。

- [ ] **Step 1: 写测试**

`D:\git\dingEval\src\__tests__\composables\useFormValidation.spec.ts`：

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { ref, nextTick } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { useExpenseStore } from '@/stores/expense'
import { useFormValidation } from '@/composables/useFormValidation'
import { today, uid } from '@/utils/id'

describe('useFormValidation', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('returns ok=true when all required fields filled', () => {
    const store = useExpenseStore()
    store.items = [
      { id: uid(), amount: 100, occurredAt: today(), category: 'travel', description: '', invoiceStatus: 'none', attachmentCount: 0 }
    ]
    store.payer = 'wangfang'

    const refs = makeRefs()

    const { validate, errors } = useFormValidation({ refs, store })
    const result = validate()
    expect(result.ok).toBe(true)
    expect(errors.value).toEqual({})
  })

  it('flags missing amount', () => {
    const store = useExpenseStore()
    store.items = [
      { id: uid(), amount: null, occurredAt: today(), category: 'travel', description: '', invoiceStatus: 'none', attachmentCount: 0 }
    ]
    store.payer = 'wangfang'

    const refs = makeRefs()
    const { validate, errors } = useFormValidation({ refs, store })
    const result = validate()
    expect(result.ok).toBe(false)
    expect(errors.value['items.0.amount']).toContain('金额')
  })

  it('flags zero amount as invalid', () => {
    const store = useExpenseStore()
    store.items = [
      { id: uid(), amount: 0, occurredAt: today(), category: 'travel', description: '', invoiceStatus: 'none', attachmentCount: 0 }
    ]
    store.payer = 'wangfang'
    const refs = makeRefs()
    const { validate, errors } = useFormValidation({ refs, store })
    expect(validate().ok).toBe(false)
    expect(errors.value['items.0.amount']).toBeTruthy()
  })

  it('flags missing occurredAt', () => {
    const store = useExpenseStore()
    store.items = [
      { id: uid(), amount: 100, occurredAt: '', category: 'travel', description: '', invoiceStatus: 'none', attachmentCount: 0 }
    ]
    store.payer = 'wangfang'
    const refs = makeRefs()
    const { validate, errors } = useFormValidation({ refs, store })
    expect(validate().ok).toBe(false)
    expect(errors.value['items.0.occurredAt']).toContain('日期')
  })

  it('flags missing category', () => {
    const store = useExpenseStore()
    store.items = [
      { id: uid(), amount: 100, occurredAt: today(), category: null, description: '', invoiceStatus: 'none', attachmentCount: 0 }
    ]
    store.payer = 'wangfang'
    const refs = makeRefs()
    const { validate, errors } = useFormValidation({ refs, store })
    expect(validate().ok).toBe(false)
    expect(errors.value['items.0.category']).toContain('类型')
  })

  it('flags missing payer', () => {
    const store = useExpenseStore()
    store.items = [
      { id: uid(), amount: 100, occurredAt: today(), category: 'travel', description: '', invoiceStatus: 'none', attachmentCount: 0 }
    ]
    store.payer = null
    const refs = makeRefs()
    const { validate, errors } = useFormValidation({ refs, store })
    expect(validate().ok).toBe(false)
    expect(errors.value.payer).toContain('付款人')
  })

  it('returns firstErrorRef pointing to the failing field', () => {
    const store = useExpenseStore()
    store.items = [
      { id: uid(), amount: null, occurredAt: '', category: null, description: '', invoiceStatus: 'none', attachmentCount: 0 }
    ]
    store.payer = null

    const amountEl = document.createElement('div')
    const refs = {
      amountRefs: ref<HTMLElement | null>(amountEl),
      dateRefs: ref<HTMLElement | null>(document.createElement('div')),
      categoryRefs: ref<HTMLElement | null>(document.createElement('div')),
      payerRef: ref<HTMLElement | null>(document.createElement('div'))
    }

    const { validate } = useFormValidation({ refs, store })
    const result = validate()
    expect(result.ok).toBe(false)
    expect(result.firstErrorRef?.value).toBe(amountEl)
  })

  it('clearError removes one entry', async () => {
    const store = useExpenseStore()
    store.items = [
      { id: uid(), amount: null, occurredAt: today(), category: 'travel', description: '', invoiceStatus: 'none', attachmentCount: 0 }
    ]
    store.payer = 'wangfang'
    const refs = makeRefs()
    const { validate, errors, clearError } = useFormValidation({ refs, store })
    validate()
    expect(errors.value['items.0.amount']).toBeTruthy()
    clearError('items.0.amount')
    await nextTick()
    expect(errors.value['items.0.amount']).toBeUndefined()
  })
})

function makeRefs() {
  return {
    amountRefs: ref<HTMLElement | null>(document.createElement('div')),
    dateRefs: ref<HTMLElement | null>(document.createElement('div')),
    categoryRefs: ref<HTMLElement | null>(document.createElement('div')),
    payerRef: ref<HTMLElement | null>(document.createElement('div'))
  }
}
```

- [ ] **Step 2: 运行测试，验证失败**

```bash
cd D:\git\dingEval
pnpm test src/__tests__/composables/useFormValidation.spec.ts
```

Expected: FAIL with "Cannot find module '@/composables/useFormValidation'"。

- [ ] **Step 3: 实现**

`D:\git\dingEval\src\composables\useFormValidation.ts`：

```ts
import { ref, type Ref } from 'vue'
import { useExpenseStore } from '@/stores/expense'
import { isPositiveAmount } from '@/utils/money'

export type Store = ReturnType<typeof useExpenseStore>

export interface ValidationRefs {
  amountRefs: Ref<HTMLElement | null>[]
  dateRefs: Ref<HTMLElement | null>[]
  categoryRefs: Ref<HTMLElement | null>[]
  payerRef: Ref<HTMLElement | null>
}

export type ErrorPath =
  | `items.${number}.amount`
  | `items.${number}.occurredAt`
  | `items.${number}.category`
  | 'payer'

export interface ValidationResult {
  ok: boolean
  firstErrorRef?: Ref<HTMLElement | null>
}

export function useFormValidation(params: { refs: ValidationRefs; store: Store }) {
  const { refs, store } = params
  const errors = ref<Record<string, string>>({})
  const firstErrorRef = ref<Ref<HTMLElement | null> | undefined>(undefined)
  const firstErrorFound = ref(false)

  function setError(path: ErrorPath, message: string, ref?: Ref<HTMLElement | null>) {
    errors.value[path] = message
    if (!firstErrorFound.value && ref?.value) {
      firstErrorRef.value = ref
      firstErrorFound.value = true
    }
  }

  function validate(): ValidationResult {
    errors.value = {}
    firstErrorRef.value = undefined
    firstErrorFound.value = false

    store.items.forEach((item, i) => {
      if (!isPositiveAmount(item.amount)) {
        setError(`items.${i}.amount`, `请输入第 ${i + 1} 条的报销金额`, refs.amountRefs[i])
      }
      if (!item.occurredAt) {
        setError(`items.${i}.occurredAt`, `请选择第 ${i + 1} 条的费用日期`, refs.dateRefs[i])
      }
      if (!item.category) {
        setError(`items.${i}.category`, `请选择第 ${i + 1} 条的费用类型`, refs.categoryRefs[i])
      }
    })

    if (!store.payer) {
      setError('payer', '请选择付款人', refs.payerRef)
    }

    if (firstErrorRef.value) {
      firstErrorRef.value.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    return {
      ok: Object.keys(errors.value).length === 0,
      firstErrorRef: firstErrorRef.value
    }
  }

  function clearError(path: ErrorPath) {
    if (errors.value[path]) {
      const next = { ...errors.value }
      delete next[path]
      errors.value = next
    }
  }

  return { validate, errors, clearError }
}
```

- [ ] **Step 4: 运行测试，验证通过**

```bash
cd D:\git\dingEval
pnpm test src/__tests__/composables/useFormValidation.spec.ts
```

Expected: 8 tests passed。

- [ ] **Step 5: 提交**

```bash
cd D:\git\dingEval
git add src/composables/useFormValidation.ts src/__tests__/composables/useFormValidation.spec.ts
git commit -m "feat(composables): add useFormValidation with 7 rules + scroll-to-error (TDD)"
```

---

### Task 3.4: 创建 useDraftRestore.ts

**Files:**
- Create: `src/composables/useDraftRestore.ts`

**接口约定：**
- `useDraftRestore()` 在视图 onMounted 调用，检测 localStorage 中的草稿。
- 存在则用 `useToast().show({ message, action, dismiss })` 询问。
- `action.onClick` 触发 `expense.restoreFromDraft(draft)` + `useToast().hide()`。
- `dismiss.onClick` 触发 `useDraftStorage().clear()` + `useToast().hide()`。
- 单例 toast，重复调用以最新一次为准。

- [ ] **Step 1: 创建文件**

`D:\git\dingEval\src\composables\useDraftRestore.ts`：

```ts
import { useToast } from '@/composables/useToast'
import { useDraftStorage } from '@/utils/draftStorage'
import { useExpenseStore } from '@/stores/expense'

export function useDraftRestore() {
  const draft = useDraftStorage().load()
  if (!draft) return

  const toast = useToast()
  const expense = useExpenseStore()

  toast.show({
    message: '检测到未提交的草稿，是否恢复？',
    type: 'info',
    duration: 0,
    action: {
      label: '恢复',
      onClick: () => {
        expense.restoreFromDraft(draft)
        toast.hide()
      }
    },
    dismiss: {
      label: '丢弃',
      onClick: () => {
        useDraftStorage().clear()
        toast.hide()
      }
    }
  })
}
```

- [ ] **Step 2: 提交**

```bash
cd D:\git\dingEval
git add src/composables/useDraftRestore.ts
git commit -m "feat(composables): add useDraftRestore with toast confirm action"
```

---

## Phase 4: Base Components (12 路并行)

> 依赖 Phase 1 完成的 types/utils/tokens。12 个组件各自独立，可同时派发。
> **统一约定**：所有原子组件 `<style scoped>`，全局类名（`.field` / `.card` / `.chip` / `.flow-list`）在 `reset.css` 已定义，组件直接复用。

---

### Task 4.1: DingIcon

**Files:**
- Create: `src/components/base/DingIcon.vue`

**接口：** props: `name: string`, `size?: number = 20`, `color?: string = 'currentColor'`

- [ ] **Step 1: 创建文件**

`D:\git\dingEval\src\components\base\DingIcon.vue`：

```vue
<script setup lang="ts">
import { Icon } from '@iconify/vue'

interface Props {
  name: string
  size?: number
  color?: string
}

withDefaults(defineProps<Props>(), {
  size: 20,
  color: 'currentColor'
})
</script>

<template>
  <Icon v-if="name" :icon="`ic:baseline-${name}`" :width="size" :height="size" :color="color" />
  <span v-else class="ding-icon-placeholder" />
</template>

<style scoped>
.ding-icon-placeholder {
  display: inline-block;
  width: 20px;
  height: 20px;
}
</style>
```

- [ ] **Step 2: 验证**

```bash
cd D:\git\dingEval
pnpm typecheck
```

---

### Task 4.2: BaseButton

**Files:**
- Create: `src/components/base/BaseButton.vue`

**接口：** props: `variant?: 'primary' | 'secondary' | 'ghost' | 'danger' = 'primary'`, `block?: boolean = false`, `loading?: boolean = false`, `disabled?: boolean = false`; emit: `click`; default slot for label.

- [ ] **Step 1: 创建文件**

`D:\git\dingEval\src\components\base\BaseButton.vue`：

```vue
<script setup lang="ts">
import DingIcon from './DingIcon.vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  block?: boolean
  loading?: boolean
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
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
    :class="['base-btn', `base-btn--${variant}`, { 'base-btn--block': block, 'base-btn--loading': loading }]"
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
  min-height: 32px;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.15s;
  border: 0;
  cursor: pointer;
}
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
</style>
```

- [ ] **Step 2: 验证**

```bash
cd D:\git\dingEval
pnpm typecheck
```

---

### Task 4.3: BaseCard

**Files:**
- Create: `src/components/base/BaseCard.vue`

**接口：** props: `padding?: 'sm' | 'md' | 'lg' = 'md'`, `elevated?: boolean = false`; default slot.

- [ ] **Step 1: 创建文件**

`D:\git\dingEval\src\components\base\BaseCard.vue`：

```vue
<script setup lang="ts">
interface Props {
  padding?: 'sm' | 'md' | 'lg'
  elevated?: boolean
}

withDefaults(defineProps<Props>(), {
  padding: 'md',
  elevated: false
})
</script>

<template>
  <div :class="['base-card', `base-card--p-${padding}`, { 'base-card--elevated': elevated }]">
    <slot />
  </div>
</template>

<style scoped>
.base-card {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-s);
  overflow: hidden;
}
.base-card--p-sm { padding: 12px; }
.base-card--p-md { padding: 16px; }
.base-card--p-lg { padding: 20px; }
.base-card--elevated { box-shadow: var(--shadow-m); }
</style>
```

- [ ] **Step 2: 验证**

```bash
cd D:\git\dingEval
pnpm typecheck
```

---

### Task 4.4: BaseField

**Files:**
- Create: `src/components/base/BaseField.vue`

**接口：** props: `label: string`, `required?: boolean = false`, `error?: string = ''`, `block?: boolean = false`; default slot for control.

- [ ] **Step 1: 创建文件**

`D:\git\dingEval\src\components\base\BaseField.vue`：

```vue
<script setup lang="ts">
import DingIcon from './DingIcon.vue'

interface Props {
  label: string
  required?: boolean
  error?: string
  block?: boolean
}

withDefaults(defineProps<Props>(), {
  required: false,
  error: '',
  block: false
})
</script>

<template>
  <div :class="['field', { block, 'has-error': !!error }]">
    <label class="label">
      <span v-if="required" class="req">*</span>
      <span>{{ label }}</span>
    </label>
    <div :class="['control', { start: block }]">
      <slot />
    </div>
    <div v-if="error" class="error-text" role="alert">
      <DingIcon name="error" :size="12" color="currentColor" />
      <span>{{ error }}</span>
    </div>
  </div>
</template>
```

- [ ] **Step 2: 验证**

```bash
cd D:\git\dingEval
pnpm typecheck
```

---

### Task 4.5: BaseInput

**Files:**
- Create: `src/components/base/BaseInput.vue`

**接口：** props: `modelValue: string | number | null`, `type?: 'text' | 'number' = 'text'`, `placeholder?: string = ''`, `readonly?: boolean = false`, `inputmode?: string = ''`, `align?: 'left' | 'right' = 'right'`; emit: `update:modelValue`.

- [ ] **Step 1: 创建文件**

`D:\git\dingEval\src\components\base\BaseInput.vue`：

```vue
<script setup lang="ts">
interface Props {
  modelValue: string | number | null
  type?: 'text' | 'number'
  placeholder?: string
  readonly?: boolean
  inputmode?: string
  align?: 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  readonly: false,
  inputmode: '',
  align: 'right'
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
    :inputmode="inputmode"
    :style="{ textAlign: align }"
    @input="onInput"
  />
</template>
```

- [ ] **Step 2: 验证**

```bash
cd D:\git\dingEval
pnpm typecheck
```

---

### Task 4.6: BaseTextarea

**Files:**
- Create: `src/components/base/BaseTextarea.vue`

**接口：** props: `modelValue: string`, `placeholder?: string = ''`, `rows?: number = 3`; emit: `update:modelValue`.

- [ ] **Step 1: 创建文件**

`D:\git\dingEval\src\components\base\BaseTextarea.vue`：

```vue
<script setup lang="ts">
interface Props {
  modelValue: string
  placeholder?: string
  rows?: number
}

withDefaults(defineProps<Props>(), {
  placeholder: '',
  rows: 3
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
    @input="onInput"
  />
</template>
```

- [ ] **Step 2: 验证**

```bash
cd D:\git\dingEval
pnpm typecheck
```

---

### Task 4.7: BaseSelect

**Files:**
- Create: `src/components/base/BaseSelect.vue`

**接口：** props: `modelValue: string | null`, `options: OptionItem[]`, `placeholder?: string = '请选择'`, `title?: string`; emit: `update:modelValue`. 点击触发 `useActionSheet().open({ title, options, current, onSelect })`.

- [ ] **Step 1: 创建文件**

`D:\git\dingEval\src\components\base\BaseSelect.vue`：

```vue
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
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请选择',
  title: ''
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
    class="picker-trigger"
    :class="{ placeholder: !display }"
    @click="open"
  >
    <span>{{ display || placeholder }}</span>
    <DingIcon name="chevron-right" :size="16" />
  </button>
</template>
```

- [ ] **Step 2: 验证**

```bash
cd D:\git\dingEval
pnpm typecheck
```

---

### Task 4.8: BaseDatePicker

**Files:**
- Create: `src/components/base/BaseDatePicker.vue`

**接口：** props: `modelValue: string | null` (YYYY-MM-DD), `placeholder?: string = '请选择'`; emit: `update:modelValue`. 点击触发自定义日历浮层（不依赖 `useActionSheet`，自维护 `open` 状态），面板内有上月/下月/选中态/今天态交互。

- [ ] **Step 1: 创建文件**

`D:\git\dingEval\src\components\base\BaseDatePicker.vue`：

```vue
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import DingIcon from './DingIcon.vue'

interface Props {
  modelValue: string | null
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), { placeholder: '请选择' })
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

const monthLabel = computed(() => `${viewYear.value} 年 ${String(viewMonth.value + 1).padStart(2, '0')} 月`)

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

function pad2(n: number) { return n < 10 ? `0${n}` : String(n) }

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
  emit('update:modelValue', `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`)
  open.value = false
}

function close() {
  open.value = false
}
</script>

<template>
  <button
    type="button"
    class="picker-trigger"
    :class="{ placeholder: !modelValue }"
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
```

- [ ] **Step 2: 验证**

```bash
cd D:\git\dingEval
pnpm typecheck
```

---

### Task 4.9: BaseCapsule

**Files:**
- Create: `src/components/base/BaseCapsule.vue`

**接口：** props: `icon?: string = 'link'`, `placeholder?: string = '请选择'`, `active?: boolean = false`; emit: `click`; default slot for full custom content (overrides placeholder).

- [ ] **Step 1: 创建文件**

`D:\git\dingEval\src\components\base\BaseCapsule.vue`：

```vue
<script setup lang="ts">
import DingIcon from './DingIcon.vue'

interface Props {
  icon?: string
  placeholder?: string
  active?: boolean
}

withDefaults(defineProps<Props>(), {
  icon: 'link',
  placeholder: '请选择',
  active: false
})

const emit = defineEmits<{ (e: 'click', event: MouseEvent): void }>()

function onClick(e: MouseEvent) {
  emit('click', e)
}
</script>

<template>
  <button
    type="button"
    class="capsule"
    :class="{ 'capsule--active': active }"
    @click="onClick"
  >
    <DingIcon v-if="!$slots.default" :name="icon" :size="16" />
    <slot>
      <span class="capsule__placeholder">+ {{ placeholder }}</span>
    </slot>
    <DingIcon name="chevron-right" :size="14" color="var(--color-mute)" class="capsule__chevron" />
  </button>
</template>

<style scoped>
.capsule {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: var(--radius-full);
  font-size: 14px;
  font-weight: 500;
  background: var(--color-canvas);
  color: var(--color-primary);
  border: 1px solid var(--color-hairline-strong);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.capsule:hover { background: rgba(126, 134, 142, 0.06); }
.capsule--active {
  border-color: var(--color-primary);
  background: rgba(0, 127, 255, 0.04);
}
.capsule__placeholder { color: var(--color-primary); }
.capsule__chevron { margin-left: 2px; }
</style>
```

- [ ] **Step 2: 验证**

```bash
cd D:\git\dingEval
pnpm typecheck
```

---

### Task 4.10: BaseTag

**Files:**
- Create: `src/components/base/BaseTag.vue`

**接口：** props: `label: string`, `active?: boolean = false`, `helpIcon?: boolean = false`; emit: `click`.

- [ ] **Step 1: 创建文件**

`D:\git\dingEval\src\components\base\BaseTag.vue`：

```vue
<script setup lang="ts">
import DingIcon from './DingIcon.vue'

interface Props {
  label: string
  active?: boolean
  helpIcon?: boolean
}

withDefaults(defineProps<Props>(), {
  active: false,
  helpIcon: false
})

const emit = defineEmits<{ (e: 'click', event: MouseEvent): void }>()

function onClick(e: MouseEvent) {
  emit('click', e)
}
</script>

<template>
  <span
    class="chip"
    :class="{ active }"
    role="button"
    tabindex="0"
    @click="onClick"
    @keydown.enter="onClick"
  >
    <span>{{ label }}</span>
    <DingIcon v-if="helpIcon" name="help-outline" :size="12" class="help" />
  </span>
</template>
```

- [ ] **Step 2: 验证**

```bash
cd D:\git\dingEval
pnpm typecheck
```

---

### Task 4.11: BaseToast

**Files:**
- Create: `src/components/base/BaseToast.vue`

**接口：** 无 props；通过 `useToast().state` 渲染；emit 通过调用 `useToast().show/hide`。
- 内部 `<Teleport to="body">`
- 支持 `action` / `dismiss` 槽位
- `duration > 0` 自动消失；`duration === 0` 不消失
- type: `'info' | 'success' | 'error'` 决定颜色（默认 info = 黑色）

- [ ] **Step 1: 创建文件**

`D:\git\dingEval\src\components\base\BaseToast.vue`：

```vue
<script setup lang="ts">
import { computed } from 'vue'
import DingIcon from './DingIcon.vue'
import { useToast } from '@/composables/useToast'

const toast = useToast()

const iconName = computed(() => {
  const t = toast.state.value.type
  if (t === 'success') return 'check-circle'
  if (t === 'error') return 'error'
  return 'info'
})
</script>

<template>
  <Teleport to="body">
    <Transition name="toast">
      <div
        v-if="toast.state.value.visible"
        class="toast"
        :class="`toast--${toast.state.value.type}`"
        role="status"
        aria-live="polite"
      >
        <DingIcon :name="iconName" :size="16" />
        <span class="toast__msg">{{ toast.state.value.message }}</span>
        <template v-if="toast.state.value.action">
          <button
            type="button"
            class="toast__action"
            @click="toast.state.value.action!.onClick()"
          >{{ toast.state.value.action.label }}</button>
        </template>
        <template v-if="toast.state.value.dismiss">
          <button
            type="button"
            class="toast__dismiss"
            @click="toast.state.value.dismiss.onClick ? toast.state.value.dismiss.onClick() : toast.hide()"
          >{{ toast.state.value.dismiss.label }}</button>
        </template>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.toast {
  position: fixed;
  top: 70px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(23, 26, 29, 0.92);
  color: var(--color-on-primary);
  padding: 10px 18px;
  border-radius: var(--radius-md);
  font-size: 14px;
  z-index: 2000;
  box-shadow: var(--shadow-m);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: 90vw;
}
.toast--success { background: rgba(0, 176, 66, 0.94); }
.toast--error { background: rgba(255, 82, 25, 0.94); }
.toast__msg { flex-shrink: 0; }
.toast__action,
.toast__dismiss {
  color: var(--color-on-primary);
  font-weight: 600;
  padding: 2px 6px;
  border-radius: var(--radius-xs);
  font-size: 13px;
  cursor: pointer;
}
.toast__action { background: rgba(255, 255, 255, 0.16); }
.toast__dismiss { color: rgba(255, 255, 255, 0.72); }
.toast__action:hover,
.toast__dismiss:hover { background: rgba(255, 255, 255, 0.24); }

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}
</style>
```

- [ ] **Step 2: 验证**

```bash
cd D:\git\dingEval
pnpm typecheck
```

---

### Task 4.12: BaseActionSheet

**Files:**
- Create: `src/components/base/BaseActionSheet.vue`

**接口：** 无 props；通过 `useActionSheet().state` 渲染。
- 内部 `<Teleport to="body">`
- 底部抽屉，200ms 滑入
- 点击选项后自动关闭
- ESC 关闭
- 点击遮罩关闭

- [ ] **Step 1: 创建文件**

`D:\git\dingEval\src\components\base\BaseActionSheet.vue`：

```vue
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import DingIcon from './DingIcon.vue'
import { useActionSheet } from '@/composables/useActionSheet'

const sheet = useActionSheet()

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && sheet.state.value.visible) {
    sheet.close()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div
        v-if="sheet.state.value.visible"
        class="sheet-mask"
        @click.self="sheet.close()"
      >
        <div class="sheet" role="dialog" aria-modal="true">
          <div v-if="sheet.state.value.title" class="sheet-head">
            <h4>{{ sheet.state.value.title }}</h4>
            <button type="button" class="sheet-close" aria-label="关闭" @click="sheet.close()">
              <DingIcon name="close" :size="16" />
            </button>
          </div>
          <div class="sheet-body">
            <div
              v-for="opt in sheet.state.value.options"
              :key="opt.value"
              class="sheet-opt"
              :class="{ selected: sheet.state.value.current === opt.value }"
              @click="sheet.select(opt.value)"
            >
              <span class="sheet-opt__label">
                {{ opt.label }}
                <span v-if="opt.title" class="sheet-opt__title">{{ opt.title }}</span>
              </span>
              <DingIcon
                v-if="sheet.state.value.current === opt.value"
                name="check"
                :size="16"
                class="sheet-opt__check"
              />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.sheet-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.40);
  z-index: 1500;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: fade-in 0.15s ease-out;
}
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
.sheet {
  width: 100%;
  max-width: 480px;
  background: var(--color-canvas);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  animation: slide-up 0.2s ease-out;
}
@keyframes slide-up {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.sheet-head {
  padding: 16px 20px 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.sheet-head h4 { font-size: 16px; font-weight: 600; color: var(--color-ink); }
.sheet-close {
  color: var(--color-mute);
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  background: transparent;
  border: 0;
  cursor: pointer;
}
.sheet-body { padding: 8px 0 20px; overflow-y: auto; }
.sheet-opt {
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: background 0.12s;
}
.sheet-opt:hover { background: var(--color-canvas-soft); }
.sheet-opt.selected { color: var(--color-primary); font-weight: 500; }
.sheet-opt__label { font-size: 15px; display: flex; align-items: center; gap: 8px; }
.sheet-opt__title { color: var(--color-mute); font-size: 13px; font-weight: 400; }
.sheet-opt__check { color: var(--color-primary); }

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.2s;
}
.sheet-enter-from,
.sheet-leave-to { opacity: 0; }
.sheet-enter-active .sheet,
.sheet-leave-active .sheet {
  transition: transform 0.2s ease-out;
}
.sheet-enter-from .sheet,
.sheet-leave-to .sheet {
  transform: translateY(20px);
}
</style>
```

- [ ] **Step 2: 验证**

```bash
cd D:\git\dingEval
pnpm typecheck
```

- [ ] **Step 3: 全部 12 个 base 组件完成后，提交**

```bash
cd D:\git\dingEval
git add src/components/base/
git commit -m "feat(base): add 12 atomic components (icon, button, card, field, input, textarea, select, date, capsule, tag, toast, sheet)"
```

---

## Phase 5: Store Enhancement (1 派发, TDD)

> 依赖 Phase 1 完成的 `types/expense.ts`、`utils/id.ts`、`utils/draftStorage.ts`。
> 修改 `src/stores/expense.ts`，新增 `toDraft` / `restoreFromDraft` / `clearDraft` / `hasAnyAmount` / `isValid` 派生。

### Task 5.1: 增强 expense store + 测试

**Files:**
- Modify: `src/stores/expense.ts`
- Create: `src/__tests__/stores/expense.spec.ts`

**接口约定：**
- `toDraft(): ExpenseDraft` 序列化所有字段（含 `savedAt: Date.now()`）
- `restoreFromDraft(draft: ExpenseDraft): void` 整体替换 state
- `clearDraft(): void` 等价于 `reset()` + 调 `useDraftStorage().clear()`
- `hasAnyAmount: ComputedRef<boolean>` = items 中存在 amount > 0
- `isValid: ComputedRef<boolean>` = hasAnyAmount && payer !== null
- 保留现有 `addItem` / `removeItem` / `reset` 行为不变

- [ ] **Step 1: 写测试**

`D:\git\dingEval\src\__tests__\stores\expense.spec.ts`：

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useExpenseStore } from '@/stores/expense'
import { today, uid } from '@/utils/id'

describe('useExpenseStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  it('starts with exactly one default item', () => {
    const store = useExpenseStore()
    expect(store.items).toHaveLength(1)
    expect(store.items[0].amount).toBeNull()
    expect(store.items[0].occurredAt).toBe(today())
    expect(store.items[0].invoiceStatus).toBe('none')
  })

  it('addItem appends a new empty item', () => {
    const store = useExpenseStore()
    store.addItem()
    expect(store.items).toHaveLength(2)
    expect(store.items[1].id).toBeTruthy()
    expect(store.items[1].amount).toBeNull()
  })

  it('removeItem removes the item by id', () => {
    const store = useExpenseStore()
    store.addItem()
    const targetId = store.items[1].id
    store.removeItem(targetId)
    expect(store.items).toHaveLength(1)
    expect(store.items[0].id).not.toBe(targetId)
  })

  it('removeItem on the last item is a no-op', () => {
    const store = useExpenseStore()
    const onlyId = store.items[0].id
    store.removeItem(onlyId)
    expect(store.items).toHaveLength(1)
  })

  it('totalAmount sums valid amounts', () => {
    const store = useExpenseStore()
    store.items = [
      { id: uid(), amount: 100, occurredAt: today(), category: 'travel', description: '', invoiceStatus: 'none', attachmentCount: 0 },
      { id: uid(), amount: 50.5, occurredAt: today(), category: 'meal', description: '', invoiceStatus: 'none', attachmentCount: 0 },
      { id: uid(), amount: null, occurredAt: today(), category: null, description: '', invoiceStatus: 'none', attachmentCount: 0 }
    ]
    expect(store.totalAmount).toBe(150.5)
  })

  it('hasAnyAmount is false when all amounts are 0 / null', () => {
    const store = useExpenseStore()
    expect(store.hasAnyAmount).toBe(false)
    store.items[0].amount = 0
    expect(store.hasAnyAmount).toBe(false)
  })

  it('hasAnyAmount is true when at least one amount > 0', () => {
    const store = useExpenseStore()
    store.items[0].amount = 1
    expect(store.hasAnyAmount).toBe(true)
  })

  it('isValid requires both amount and payer', () => {
    const store = useExpenseStore()
    expect(store.isValid).toBe(false)
    store.items[0].amount = 100
    expect(store.isValid).toBe(false)
    store.payer = 'wangfang'
    expect(store.isValid).toBe(true)
  })

  it('toDraft round-trips via restoreFromDraft', () => {
    const store = useExpenseStore()
    store.items = [
      { id: 'a', amount: 10, occurredAt: '2026-07-01', category: 'travel', description: 'x', invoiceStatus: 'pending', attachmentCount: 0 }
    ]
    store.relatedApplyId = 'app-1'
    store.remark = 'r'
    store.project = 'walker-1'
    store.customer = 'walker'
    store.payeeAccount = 'icbc-001'
    store.entity = 'walker-cn'
    store.payAt = '2026-07-05'
    store.notifyChats = ['lina']
    store.approver = 'zhangming'
    store.payer = 'wangfang'
    store.cc = ['liuhua']
    store.invoiceStatus = 'pending'

    const draft = store.toDraft()
    expect(draft.version).toBe(1)
    expect(draft.items[0].id).toBe('a')
    expect(draft.payer).toBe('wangfang')

    const fresh = useExpenseStore()
    expect(fresh.items[0].description).not.toBe('x')
    fresh.restoreFromDraft(draft)
    expect(fresh.items[0].description).toBe('x')
    expect(fresh.payer).toBe('wangfang')
    expect(fresh.notifyChats).toEqual(['lina'])
  })

  it('clearDraft resets state and clears localStorage', () => {
    const store = useExpenseStore()
    store.items[0].amount = 100
    store.payer = 'wangfang'
    localStorage.setItem('dingeval:expense:draft', '{"version":1,"items":[],"savedAt":0}')

    store.clearDraft()

    expect(store.items[0].amount).toBeNull()
    expect(store.payer).toBeNull()
    expect(localStorage.getItem('dingeval:expense:draft')).toBeNull()
  })
})
```

- [ ] **Step 2: 运行测试，验证失败**

```bash
cd D:\git\dingEval
pnpm test src/__tests__/stores/expense.spec.ts
```

Expected: FAIL - 5+ 个测试失败（toDraft / restoreFromDraft / clearDraft / hasAnyAmount / isValid / clearDraft 不存在）。

- [ ] **Step 3: 改写 stores/expense.ts**

完整替换 `D:\git\dingEval\src\stores\expense.ts`：

```ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ExpenseDraft, ExpenseItem, CategoryValue, InvoiceStatus } from '@/types/expense'
import { uid, today } from '@/utils/id'
import { useDraftStorage } from '@/utils/draftStorage'

const newItem = (): ExpenseItem => ({
  id: uid('item'),
  amount: null,
  occurredAt: today(),
  category: null,
  description: '',
  invoiceStatus: 'none',
  attachmentCount: 0
})

export const useExpenseStore = defineStore('expense', () => {
  const items = ref<ExpenseItem[]>([newItem()])
  const relatedApplyId = ref<string | null>(null)
  const owner = ref('陆晓锋')
  const department = ref('播阳测试部门')
  const remark = ref('')

  const project = ref<string | null>(null)
  const customer = ref<string | null>(null)
  const payeeAccount = ref<string | null>(null)
  const entity = ref<string | null>(null)
  const payAt = ref<string | null>(null)
  const notifyChats = ref<string[]>([])

  const approver = ref<string | null>(null)
  const payer = ref<string | null>(null)
  const cc = ref<string[]>([])

  const invoiceStatus = ref<InvoiceStatus>('none')

  const totalAmount = computed(() =>
    items.value.reduce((sum, item) => sum + (item.amount ?? 0), 0)
  )

  const hasAnyAmount = computed(() =>
    items.value.some((item) => (item.amount ?? 0) > 0)
  )

  const isValid = computed(() => hasAnyAmount.value && payer.value !== null)

  function addItem() {
    items.value.push(newItem())
  }

  function removeItem(id: string) {
    if (items.value.length <= 1) return
    items.value = items.value.filter((it) => it.id !== id)
  }

  function reset() {
    items.value = [newItem()]
    relatedApplyId.value = null
    remark.value = ''
    project.value = null
    customer.value = null
    payeeAccount.value = null
    entity.value = null
    payAt.value = null
    approver.value = null
    payer.value = null
    cc.value = []
    notifyChats.value = []
    invoiceStatus.value = 'none'
  }

  function toDraft(): ExpenseDraft {
    return {
      version: 1,
      savedAt: Date.now(),
      items: items.value.map((it) => ({
        id: it.id,
        amount: it.amount,
        occurredAt: it.occurredAt,
        category: it.category as CategoryValue | null,
        description: it.description,
        invoiceStatus: it.invoiceStatus,
        attachmentCount: it.attachmentCount
      })),
      relatedApplyId: relatedApplyId.value,
      remark: remark.value,
      project: project.value,
      customer: customer.value,
      payeeAccount: payeeAccount.value,
      entity: entity.value,
      payAt: payAt.value,
      notifyChats: [...notifyChats.value],
      approver: approver.value,
      payer: payer.value,
      cc: [...cc.value],
      invoiceStatus: invoiceStatus.value,
      owner: owner.value,
      department: department.value
    }
  }

  function restoreFromDraft(draft: ExpenseDraft) {
    items.value = draft.items.map((it) => ({ ...it }))
    relatedApplyId.value = draft.relatedApplyId
    remark.value = draft.remark
    project.value = draft.project
    customer.value = draft.customer
    payeeAccount.value = draft.payeeAccount
    entity.value = draft.entity
    payAt.value = draft.payAt
    notifyChats.value = [...draft.notifyChats]
    approver.value = draft.approver
    payer.value = draft.payer
    cc.value = [...draft.cc]
    invoiceStatus.value = draft.invoiceStatus
    if (draft.owner) owner.value = draft.owner
    if (draft.department) department.value = draft.department
  }

  function clearDraft() {
    reset()
    useDraftStorage().clear()
  }

  return {
    items,
    relatedApplyId,
    owner,
    department,
    remark,
    project,
    customer,
    payeeAccount,
    entity,
    payAt,
    notifyChats,
    approver,
    payer,
    cc,
    invoiceStatus,
    totalAmount,
    hasAnyAmount,
    isValid,
    addItem,
    removeItem,
    reset,
    toDraft,
    restoreFromDraft,
    clearDraft
  }
})
```

- [ ] **Step 4: 运行测试，验证通过**

```bash
cd D:\git\dingEval
pnpm test src/__tests__/stores/expense.spec.ts
```

Expected: 10+ tests passed。

- [ ] **Step 5: 提交**

```bash
cd D:\git\dingEval
git add src/stores/expense.ts src/__tests__/stores/expense.spec.ts
git commit -m "feat(store): add toDraft/restoreFromDraft/clearDraft + hasAnyAmount/isValid (TDD)"
```

---

## Phase 6: Business Components (13 路并行)

> 依赖 Phase 3 composables、Phase 4 base 组件、Phase 5 store 增强。
> 所有业务组件**不维护** local state，通过 props/emit 接收数据并写回 store。
> 组件命名与目录严格按 spec 表格执行。

### Task 6.1: NavBar

**Files:**
- Create: `src/components/expense/NavBar.vue`

**接口：** 无 props；emit: `back`. 标题固定"日常报销"，返回按钮触发 `history.back()` / `router.back()`。

- [ ] **Step 1: 创建文件**

`D:\git\dingEval\src\components\expense\NavBar.vue`：

```vue
<script setup lang="ts">
import { useRouter } from 'vue-router'
import DingIcon from '../base/DingIcon.vue'

const emit = defineEmits<{ (e: 'back'): void }>()

function goBack() {
  const router = useRouter()
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
  emit('back')
}
</script>

<template>
  <header class="nav-bar">
    <button type="button" class="nav-bar__back" aria-label="返回" @click="goBack">
      <DingIcon name="arrow-back" :size="22" />
    </button>
    <h1 class="nav-bar__title">日常报销</h1>
  </header>
</template>

<style scoped>
.nav-bar {
  height: 48px;
  padding: 0 12px;
  background: var(--color-canvas);
  display: flex;
  align-items: center;
  justify-content: center;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-s);
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
</style>
```

- [ ] **Step 2: 验证**

```bash
cd D:\git\dingEval
pnpm typecheck
```

---

### Task 6.2: RelatedApply

**Files:**
- Create: `src/components/expense/RelatedApply.vue`

**接口：** 无 props；emit: `select`. 点击 → `useToast().show('请在钉钉 App 端选择关联申请单')`。

- [ ] **Step 1: 创建文件**

`D:\git\dingEval\src\components\expense\RelatedApply.vue`：

```vue
<script setup lang="ts">
import BaseCapsule from '../base/BaseCapsule.vue'
import { useToast } from '@/composables/useToast'

const emit = defineEmits<{ (e: 'select'): void }>()
const toast = useToast()

function onClick() {
  toast.show('请在钉钉 App 端选择关联申请单')
  emit('select')
}
</script>

<template>
  <div class="related-apply-wrapper">
    <BaseCapsule icon="link" placeholder="请选择" @click="onClick" />
  </div>
</template>

<style scoped>
.related-apply-wrapper {
  margin: 12px 12px 0;
  display: flex;
}
</style>
```

- [ ] **Step 2: 验证**

```bash
cd D:\git\dingEval
pnpm typecheck
```

---

### Task 6.3: TotalCard

**Files:**
- Create: `src/components/expense/TotalCard.vue`

**接口：** props: `total: number`. 浅蓝渐变 + 红色大数字 + 3 个动作（批量导入 / 导入随手记 / 发票识别），全部仅 Toast。

- [ ] **Step 1: 创建文件**

`D:\git\dingEval\src\components\expense\TotalCard.vue`：

```vue
<script setup lang="ts">
import DingIcon from '../base/DingIcon.vue'
import { useToast } from '@/composables/useToast'
import { formatMoney } from '@/utils/money'

interface Props {
  total: number
}

defineProps<Props>()

const toast = useToast()

function showUnsupported() {
  toast.show('该功能需要钉钉 App 端支持')
}
</script>

<template>
  <div class="total-card">
    <div class="total-card__label">报销总额</div>
    <div class="total-card__amount">
      <span class="total-card__symbol">¥</span>
      <span class="total-card__num">{{ formatMoney(total) }}</span>
    </div>
    <div class="total-card__actions">
      <button type="button" class="total-card__action" @click="showUnsupported">
        <DingIcon name="upload" :size="20" />
        <span>批量导入</span>
      </button>
      <button type="button" class="total-card__action" @click="showUnsupported">
        <DingIcon name="description" :size="20" />
        <span>导入随手记</span>
      </button>
      <button type="button" class="total-card__action" @click="showUnsupported">
        <DingIcon name="qr-code-scanner" :size="20" />
        <span>发票识别</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.total-card {
  margin: 12px 12px 0;
  background: linear-gradient(180deg, rgba(0, 127, 255, 0.06) 0%, rgba(0, 127, 255, 0.02) 100%);
  border-radius: var(--radius-md);
  padding: 18px 16px 14px;
  box-shadow: var(--shadow-s);
  position: relative;
  overflow: hidden;
}
.total-card__label {
  font-size: 13px;
  color: var(--color-body);
  margin-bottom: 6px;
}
.total-card__amount {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 14px;
}
.total-card__symbol { font-size: 18px; color: var(--color-error); font-weight: 500; }
.total-card__num {
  font-size: 32px;
  color: var(--color-error);
  font-weight: 600;
  letter-spacing: -0.5px;
  font-variant-numeric: tabular-nums;
  font-family: var(--font-family-mono);
}
.total-card__actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding-top: 12px;
  border-top: 1px dashed var(--color-hairline-strong);
}
.total-card__action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 4px 0;
  color: var(--color-primary);
  font-size: 12px;
  border-radius: var(--radius-xs);
  background: transparent;
  border: 0;
  cursor: pointer;
  transition: background 0.15s;
}
.total-card__action:hover { background: rgba(0, 127, 255, 0.06); }
</style>
```

- [ ] **Step 2: 验证**

```bash
cd D:\\git\\dingEval
pnpm typecheck
```

---

### Task 6.4: ItemCard

**Files:**
- Create: `src/components/expense/ItemCard.vue`

**接口：** props: `item: ExpenseItem`, `index: number`, `removable: boolean`. 组合 BaseField + BaseInput/BaseSelect/BaseDatePicker/BaseTextarea + InvoiceSubBlock + AttachmentBlock；右上"删除"仅 removable 时显示。事件委托：所有字段变更直接 `v-model` 写 store。

- [ ] **Step 1: 创建文件**

`D:\git\dingEval\src\components\expense\ItemCard.vue`：

```vue
<script setup lang="ts">
import type { ExpenseItem } from '@/types/expense'
import { categories, findCategoryLabel } from '@/mocks/categories'
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

const props = withDefaults(defineProps<Props>(), { errors: () => ({}) })
const emit = defineEmits<{
  (e: 'remove', id: string): void
  (e: 'clear-error', key: 'amount' | 'occurredAt' | 'category'): void
}>()
</script>

<template>
  <div class="card">
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

    <BaseField label="报销金额(元)" :required="true" :error="errors.amount">
      <BaseInput
        v-model="item.amount"
        type="number"
        inputmode="decimal"
        placeholder="请输入金额"
        @update:model-value="emit('clear-error', 'amount')"
      />
    </BaseField>

    <BaseField label="费用发生日期" :required="true" :error="errors.occurredAt">
      <BaseDatePicker
        v-model="item.occurredAt"
        @update:model-value="emit('clear-error', 'occurredAt')"
      />
    </BaseField>

    <BaseField label="费用类型" :required="true" :error="errors.category">
      <BaseSelect
        v-model="item.category"
        :options="categories"
        :title="'选择费用类型'"
        @update:model-value="emit('clear-error', 'category')"
      />
    </BaseField>

    <BaseField label="费用说明" :block="true">
      <BaseTextarea
        v-model="item.description"
        placeholder="请输入费用说明"
        :rows="2"
      />
    </BaseField>

    <InvoiceSubBlock v-model="item.invoiceStatus" />
    <AttachmentBlock />
  </div>
</template>
```

- [ ] **Step 2: 验证**

```bash
cd D:\git\dingEval
pnpm typecheck
```

---

### Task 6.5: InvoiceSubBlock

**Files:**
- Create: `src/components/expense/InvoiceSubBlock.vue`

**接口：** props: `modelValue: InvoiceStatus`. emit: `update:modelValue`. 嵌入 ItemCard 内的发票子块；点击"添加发票" → Toast；tag 互斥切换 `item.invoiceStatus`。

- [ ] **Step 1: 创建文件**

`D:\git\dingEval\src\components\expense\InvoiceSubBlock.vue`：

```vue
<script setup lang="ts">
import type { InvoiceStatus } from '@/types/expense'
import DingIcon from '../base/DingIcon.vue'
import { useToast } from '@/composables/useToast'

interface Props {
  modelValue: InvoiceStatus
}

const props = defineProps<Props>()
const emit = defineEmits<{ (e: 'update:modelValue', v: InvoiceStatus): void }>()

const toast = useToast()

function addInvoice() {
  toast.show('该功能需要钉钉 App 端支持')
}

function setStatus(v: InvoiceStatus) {
  emit('update:modelValue', v)
}
</script>

<template>
  <div class="sub-block">
    <div class="sub-head">
      <h5>发票</h5>
      <button type="button" class="add-btn" @click="addInvoice">
        <DingIcon name="add" :size="14" />
        <span>添加发票</span>
      </button>
    </div>
    <p class="hint">支持智能识别电子、纸质发票的金额等信息</p>
    <div class="chip-row">
      <button
        type="button"
        class="chip"
        :class="{ active: modelValue === 'none' }"
        @click="setStatus('none')"
      >无发票</button>
      <button
        type="button"
        class="chip"
        :class="{ active: modelValue === 'pending' }"
        @click="setStatus('pending')"
      >
        <span>待收发票</span>
        <DingIcon name="help-outline" :size="12" class="help" />
      </button>
    </div>
  </div>
</template>
```

- [ ] **Step 2: 验证**

```bash
cd D:\git\dingEval
pnpm typecheck
```

---

### Task 6.6: InvoiceBlock

**Files:**
- Create: `src/components/expense/InvoiceBlock.vue`

**接口：** 无 props；直接读 `expense.invoiceStatus` 写回。顶层独立卡片，结构与 InvoiceSubBlock 类似但作用于全局 invoiceStatus。

- [ ] **Step 1: 创建文件**

`D:\git\dingEval\src\components\expense\InvoiceBlock.vue`：

```vue
<script setup lang="ts">
import DingIcon from '../base/DingIcon.vue'
import { useToast } from '@/composables/useToast'
import { useExpenseStore } from '@/stores/expense'
import type { InvoiceStatus } from '@/types/expense'

const toast = useToast()
const expense = useExpenseStore()

function addInvoice() {
  toast.show('该功能需要钉钉 App 端支持')
}

function setStatus(v: InvoiceStatus) {
  expense.invoiceStatus = v
}
</script>

<template>
  <div class="card">
    <div class="section-title">
      <span>发票</span>
      <button type="button" class="add-btn" @click="addInvoice">
        <DingIcon name="add" :size="14" />
        <span>添加发票</span>
      </button>
    </div>
    <div class="sub-block global-invoice-sub">
      <p class="hint">支持智能识别电子、纸质发票的金额等信息</p>
      <div class="chip-row">
        <button
          type="button"
          class="chip"
          :class="{ active: expense.invoiceStatus === 'none' }"
          @click="setStatus('none')"
        >无发票</button>
        <button
          type="button"
          class="chip"
          :class="{ active: expense.invoiceStatus === 'pending' }"
          @click="setStatus('pending')"
        >
          <span>待收发票</span>
          <DingIcon name="help-outline" :size="12" class="help" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.global-invoice-sub {
  background: var(--color-canvas);
}
</style>
```

- [ ] **Step 2: 验证**

```bash
cd D:\git\dingEval
pnpm typecheck
```

---

### Task 6.7: AttachmentBlock

**Files:**
- Create: `src/components/expense/AttachmentBlock.vue`

**接口：** 无 props；点击 → Toast。

- [ ] **Step 1: 创建文件**

`D:\git\dingEval\src\components\expense\AttachmentBlock.vue`：

```vue
<script setup lang="ts">
import DingIcon from '../base/DingIcon.vue'
import { useToast } from '@/composables/useToast'

const toast = useToast()

function add() {
  toast.show('该功能需要钉钉 App 端支持')
}
</script>

<template>
  <button type="button" class="attach-row" @click="add">
    <DingIcon name="attach-file" :size="18" />
    <span>添加附件</span>
  </button>
</template>
```

- [ ] **Step 2: 验证**

```bash
cd D:\git\dingEval
pnpm typecheck
```

---

### Task 6.8: OwnershipSection

**Files:**
- Create: `src/components/expense/OwnershipSection.vue`

**接口：** 无 props；直接读 `expense.owner / department / remark`，owner/department 只读。

- [ ] **Step 1: 创建文件**

`D:\git\dingEval\src\components\expense\OwnershipSection.vue`：

```vue
<script setup lang="ts">
import BaseField from '../base/BaseField.vue'
import BaseInput from '../base/BaseInput.vue'
import BaseTextarea from '../base/BaseTextarea.vue'
import { useExpenseStore } from '@/stores/expense'

const expense = useExpenseStore()
</script>

<template>
  <div class="card">
    <div class="field readonly-field">
      <label class="label">归属人</label>
      <div class="value">{{ expense.owner }}</div>
    </div>
    <div class="field readonly-field">
      <label class="label">归属部门</label>
      <div class="value">{{ expense.department }}</div>
    </div>
    <BaseField label="备注" :block="true">
      <BaseTextarea v-model="expense.remark" placeholder="请输入" :rows="2" />
    </BaseField>
  </div>
</template>

<style scoped>
.readonly-field .value { color: var(--color-ink); }
</style>
```

- [ ] **Step 2: 验证**

```bash
cd D:\git\dingEval
pnpm typecheck
```

---

### Task 6.9: BusinessFieldsSection

**Files:**
- Create: `src/components/expense/BusinessFieldsSection.vue`

**接口：** 无 props；5 个 BaseField（项目 / 客户 / 收款账户 / 企业主体 / 付款时间）；options 来自 mocks。

- [ ] **Step 1: 创建文件**

`D:\git\dingEval\src\components\expense\BusinessFieldsSection.vue`：

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
  <div class="card">
    <BaseField label="项目">
      <BaseSelect v-model="expense.project" :options="projects" title="选择项目" />
    </BaseField>
    <BaseField label="客户">
      <BaseSelect v-model="expense.customer" :options="customers" title="选择客户" />
    </BaseField>
    <BaseField label="收款账户">
      <BaseSelect v-model="expense.payeeAccount" :options="accounts" title="选择收款账户" />
    </BaseField>
    <BaseField label="企业主体">
      <BaseSelect v-model="expense.entity" :options="entities" title="选择企业主体" />
    </BaseField>
    <BaseField label="付款时间">
      <BaseDatePicker v-model="expense.payAt" />
    </BaseField>
  </div>
</template>
```

- [ ] **Step 2: 验证**

```bash
cd D:\git\dingEval
pnpm typecheck
```

---

### Task 6.10: NotifySection

**Files:**
- Create: `src/components/expense/NotifySection.vue`

**接口：** 无 props；读 `expense.notifyChats` 写回。点"+" 触发 ActionSheet 列出 chats，已选中的从弹层选项中过滤。chip 支持单条删除。

- [ ] **Step 1: 创建文件**

`D:\git\dingEval\src\components\expense\NotifySection.vue`：

```vue
<script setup lang="ts">
import { computed } from 'vue'
import DingIcon from '../base/DingIcon.vue'
import { useActionSheet } from '@/composables/useActionSheet'
import { useExpenseStore } from '@/stores/expense'
import { chats } from '@/mocks/chats'

const expense = useExpenseStore()
const sheet = useActionSheet()

const available = computed(() => {
  const chosen = new Set(expense.notifyChats)
  return chats.filter((c) => !chosen.has(c.value))
})

function addChat() {
  if (available.value.length === 0) {
    return
  }
  sheet.open({
    title: '选择发送对象',
    options: available.value,
    onSelect: (val) => {
      if (val) {
        expense.notifyChats = [...expense.notifyChats, val]
      }
    }
  })
}

function removeChat(value: string) {
  expense.notifyChats = expense.notifyChats.filter((v) => v !== value)
}

function chatLabel(value: string): string {
  return chats.find((c) => c.value === value)?.label ?? value
}
</script>

<template>
  <div class="card">
    <div class="notify-section">
      <div class="notify-section__row">
        <div class="notify-section__left">
          <span>发送到聊天</span>
          <DingIcon name="help-outline" :size="14" />
        </div>
        <button
          type="button"
          class="add-btn"
          :disabled="available.length === 0"
          @click="addChat"
        >
          <DingIcon name="add" :size="14" />
          <span>添加</span>
        </button>
      </div>
      <div v-if="expense.notifyChats.length > 0" class="notify-tags">
        <span
          v-for="value in expense.notifyChats"
          :key="value"
          class="tag-pill"
        >
          <span class="tag-pill__avatar">{{ chatLabel(value)[0] }}</span>
          <span>{{ chatLabel(value) }}</span>
          <span class="tag-pill__close" @click="removeChat(value)">
            <DingIcon name="close" :size="12" />
          </span>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notify-section { padding: 14px 16px; }
.notify-section__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.notify-section__left {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--color-ink);
}
.notify-section__left svg { color: var(--color-mute); width: 14px; height: 14px; }
.notify-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}
.tag-pill__avatar {
  width: 18px;
  height: 18px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  color: var(--color-on-primary);
  display: grid;
  place-items: center;
  font-size: 10px;
  font-weight: 600;
}
.tag-pill__close {
  color: var(--color-mute);
  display: grid;
  place-items: center;
  width: 14px;
  height: 14px;
  cursor: pointer;
}
.tag-pill__close:hover { color: var(--color-error); }
.add-btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
```

- [ ] **Step 2: 验证**

```bash
cd D:\git\dingEval
pnpm typecheck
```

---

### Task 6.11: FlowSection

**Files:**
- Create: `src/components/expense/FlowSection.vue`

**接口：** props: `payerRef?: Ref<HTMLElement | null>`（用于校验失败时滚动定位）.
- 3 行（审批人 / 付款人(*) / 抄送人）
- 审批人 / 付款人 = 单选 BaseActionSheet
- 抄送人 = 多选（chip 列表展示，支持移除）
- 行容器 ref 用于错误时滚动定位

- [ ] **Step 1: 创建文件**

`D:\git\dingEval\src\components\expense\FlowSection.vue`：

```vue
<script setup lang="ts">
import { ref, type Ref } from 'vue'
import DingIcon from '../base/DingIcon.vue'
import { useActionSheet } from '@/composables/useActionSheet'
import { useExpenseStore } from '@/stores/expense'
import { persons, findPersonDisplay } from '@/mocks/persons'

interface Props {
  payerRef?: Ref<HTMLElement | null>
}

withDefaults(defineProps<Props>(), { payerRef: undefined })

const expense = useExpenseStore()
const sheet = useActionSheet()

const approverRowRef = ref<HTMLElement | null>(null)
const payerRowRef = ref<HTMLElement | null>(null)
const ccRowRef = ref<HTMLElement | null>(null)

defineExpose({ approverRowRef, payerRowRef, ccRowRef })

function openApprover() {
  sheet.open({
    title: '选择审批人',
    options: persons,
    current: expense.approver,
    onSelect: (val) => {
      if (val) expense.approver = val
    }
  })
}

function openPayer() {
  sheet.open({
    title: '选择付款人',
    options: persons,
    current: expense.payer,
    onSelect: (val) => {
      if (val) expense.payer = val
    }
  })
}

function openCc() {
  const available = persons.filter((p) => !expense.cc.includes(p.value))
  if (available.length === 0) return
  sheet.open({
    title: '选择抄送人',
    options: available,
    onSelect: (val) => {
      if (val && !expense.cc.includes(val)) {
        expense.cc = [...expense.cc, val]
      }
    }
  })
}

function removeCc(value: string) {
  expense.cc = expense.cc.filter((v) => v !== value)
}

function ccLabel(value: string): string {
  return persons.find((p) => p.value === value)?.label ?? value
}
</script>

<template>
  <div class="card">
    <div class="section-title">
      <span>流程</span>
    </div>
    <div class="flow-list">
      <div ref="approverRowRef" class="flow-item">
        <span class="dot" />
        <div class="info">
          <div class="name">审批人</div>
          <div class="meta">{{ findPersonDisplay(expense.approver) || '请选择审批人' }}</div>
        </div>
        <button type="button" class="add-btn-icon" aria-label="选择审批人" @click="openApprover">
          <DingIcon name="add" :size="16" />
        </button>
      </div>

      <div ref="payerRowRef" class="flow-item" :class="{ 'has-error': !expense.payer }">
        <span class="dot" />
        <div class="info">
          <div class="name">
            <span>付款人</span>
            <span class="req">*</span>
          </div>
          <div class="meta">{{ findPersonDisplay(expense.payer) || '请选择' }}</div>
        </div>
        <button type="button" class="add-btn-icon" aria-label="选择付款人" @click="openPayer">
          <DingIcon name="add" :size="16" />
        </button>
      </div>

      <div ref="ccRowRef" class="flow-item">
        <span class="dot" />
        <div class="info">
          <div class="name">抄送人</div>
          <div v-if="expense.cc.length === 0" class="meta">请选择抄送人</div>
          <div v-else class="cc-chips">
            <span
              v-for="v in expense.cc"
              :key="v"
              class="cc-chip"
            >
              <span>{{ ccLabel(v) }}</span>
              <span class="cc-chip__close" @click="removeCc(v)">
                <DingIcon name="close" :size="12" />
              </span>
            </span>
          </div>
        </div>
        <button type="button" class="add-btn-icon" aria-label="选择抄送人" @click="openCc">
          <DingIcon name="add" :size="16" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cc-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}
.cc-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  background: rgba(0, 127, 255, 0.08);
  color: var(--color-primary);
  border-radius: var(--radius-full);
  font-size: 12px;
}
.cc-chip__close {
  color: var(--color-mute);
  display: grid;
  place-items: center;
  width: 12px;
  height: 12px;
  cursor: pointer;
}
.cc-chip__close:hover { color: var(--color-error); }
</style>
```

- [ ] **Step 2: 验证**

```bash
cd D:\git\dingEval
pnpm typecheck
```

---

### Task 6.12: BottomBar

**Files:**
- Create: `src/components/expense/BottomBar.vue`

**接口：** props: `isValid: boolean`. "保存草稿" → `useDraftStorage().save(expense.toDraft())` + Toast；"提交" → emit `submit`。

- [ ] **Step 1: 创建文件**

`D:\git\dingEval\src\components\expense\BottomBar.vue`：

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
    <BaseButton variant="secondary" @click="saveDraft">保存草稿</BaseButton>
    <BaseButton
      variant="primary"
      :disabled="!isValid"
      @click="submit"
    >提交</BaseButton>
  </footer>
</template>

<style scoped>
.bottom-bar {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-canvas);
  padding: 10px 12px calc(10px + env(safe-area-inset-bottom));
  display: flex;
  gap: 12px;
  border-top: 1px solid var(--color-hairline);
  z-index: 100;
}
.bottom-bar :deep(.base-btn--secondary) { flex: 0.8; }
.bottom-bar :deep(.base-btn--primary) { flex: 1; }
</style>
```

- [ ] **Step 2: 验证**

```bash
cd D:\git\dingEval
pnpm typecheck
```

---

### Task 6.13: DingtalkFooter

**Files:**
- Create: `src/components/expense/DingtalkFooter.vue`

**接口：** 无 props；居中蓝色方块 D + 钉钉主标 + 副标题。

- [ ] **Step 1: 创建文件**

`D:\git\dingEval\src\components\expense\DingtalkFooter.vue`：

```vue
<template>
  <div class="ding-footer">
    <div class="ding-footer__logo">
      <span class="ding-footer__mark">D</span>
      <span>钉钉</span>
    </div>
    <div class="ding-footer__tagline">AI 时代的工作方式</div>
  </div>
</template>

<style scoped>
.ding-footer {
  padding: 20px 16px 28px;
  text-align: center;
  font-size: 12px;
  color: var(--color-mute);
}
.ding-footer__logo {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--color-body);
  font-size: 12px;
}
.ding-footer__mark {
  width: 18px;
  height: 18px;
  background: var(--color-primary);
  color: var(--color-on-primary);
  border-radius: var(--radius-xs);
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: 700;
}
.ding-footer__tagline {
  margin-top: 4px;
  letter-spacing: 0.04em;
}
</style>
```

- [ ] **Step 2: 验证**

```bash
cd D:\git\dingEval
pnpm typecheck
```

- [ ] **Step 3: 全部 13 个业务组件完成后，提交**

```bash
cd D:\git\dingEval
git add src/components/expense/
git commit -m "feat(expense): add 13 business components (navbar, related, total, item, invoices, attachment, ownership, business, notify, flow, bottom, footer)"
```

---

## Phase 7: Composition

> 依赖 Phase 1-6 全部完成。1 个串行任务：先 App.vue 挂载浮层，再重写 ExpenseReimburse.vue 组合所有业务组件。

### Task 7.1: App.vue 挂载 BaseToast + BaseActionSheet

**Files:**
- Modify: `src/App.vue`

- [ ] **Step 1: 修改 App.vue**

完整替换 `D:\git\dingEval\src\App.vue`：

```vue
<script setup lang="ts">
import BaseToast from '@/components/base/BaseToast.vue'
import BaseActionSheet from '@/components/base/BaseActionSheet.vue'
</script>

<template>
  <router-view v-slot="{ Component, route }">
    <transition name="fade" mode="out-in">
      <component :is="Component" :key="route.fullPath" />
    </transition>
  </router-view>
  <BaseToast />
  <BaseActionSheet />
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

- [ ] **Step 2: 验证**

```bash
cd D:\git\dingEval
pnpm typecheck
```

- [ ] **Step 3: 提交**

```bash
cd D:\git\dingEval
git add src/App.vue
git commit -m "feat(app): mount BaseToast + BaseActionSheet singletons"
```

---

### Task 7.2: 重写 ExpenseReimburse.vue

**Files:**
- Modify: `src/views/ExpenseReimburse.vue`

**接口约定：**
- `onMounted` 调用 `useDraftRestore()`
- 维护 `errors: Record<number, { amount?, occurredAt?, category? }>` + `payerError: boolean` 局部 UI 状态
- ItemCard `ref` 收集 amount/date/category 行 DOM 节点，传给 `useFormValidation`
- 提交：调用 `useFormValidation().validate()`，失败则把 errors 写回局部状态、成功则 Toast + `expense.clearDraft()`
- 字段值变更时清错误（监听）

- [ ] **Step 1: 创建新文件**

完整替换 `D:\git\dingEval\src\views\ExpenseReimburse.vue`：

```vue
<script setup lang="ts">
import { onMounted, reactive, ref, watch, nextTick } from 'vue'
import { useExpenseStore } from '@/stores/expense'
import { useToast } from '@/composables/useToast'
import { useDraftRestore } from '@/composables/useDraftRestore'
import { useFormValidation, type ErrorPath } from '@/composables/useFormValidation'

import NavBar from '@/components/expense/NavBar.vue'
import RelatedApply from '@/components/expense/RelatedApply.vue'
import TotalCard from '@/components/expense/TotalCard.vue'
import ItemCard from '@/components/expense/ItemCard.vue'
import InvoiceBlock from '@/components/expense/InvoiceBlock.vue'
import OwnershipSection from '@/components/expense/OwnershipSection.vue'
import BusinessFieldsSection from '@/components/expense/BusinessFieldsSection.vue'
import NotifySection from '@/components/expense/NotifySection.vue'
import FlowSection from '@/components/expense/FlowSection.vue'
import BottomBar from '@/components/expense/BottomBar.vue'
import DingtalkFooter from '@/components/expense/DingtalkFooter.vue'

const expense = useExpenseStore()
const toast = useToast()

const errors = reactive<Record<number, { amount?: string; occurredAt?: string; category?: string }>>({})
const payerError = ref(false)
const submitting = ref(false)

const amountRefs = ref<HTMLElement | null[]>([])
const dateRefs = ref<HTMLElement | null[]>([])
const categoryRefs = ref<HTMLElement | null[]>([])
const payerRef = ref<HTMLElement | null>(null)
const flowSectionRef = ref<InstanceType<typeof FlowSection> | null>(null)

onMounted(async () => {
  await nextTick()
  useDraftRestore()
  // 等子组件挂载后捕获付款人 ref
  if (flowSectionRef.value?.payerRowRef) {
    payerRef.value = flowSectionRef.value.payerRowRef.value
  }
})

function clearItemError(index: number, key: 'amount' | 'occurredAt' | 'category') {
  if (errors[index]) {
    errors[index][key] = undefined
  }
}

// 监听明细变化，动态调整 refs 数组
watch(
  () => expense.items.length,
  () => {
    amountRefs.value.length = expense.items.length
    dateRefs.value.length = expense.items.length
    categoryRefs.value.length = expense.items.length
  },
  { immediate: true }
)

function handleSubmit() {
  submitting.value = true
  // 把 payerRef 的最新值同步
  if (flowSectionRef.value?.payerRowRef) {
    payerRef.value = flowSectionRef.value.payerRowRef.value
  }

  const { validate, clearError } = useFormValidation({
    refs: {
      amountRefs: amountRefs.value as never,
      dateRefs: dateRefs.value as never,
      categoryRefs: categoryRefs.value as never,
      payerRef
    },
    store: expense
  })

  const result = validate()

  // 把校验结果回写到局部 errors
  for (const key of Object.keys(errors)) {
    delete errors[Number(key)]
  }
  payerError.value = false

  Object.entries(result.ok ? {} : ({} as Record<string, string>)).forEach(() => {})

  // 重新解析 errors：useFormValidation 内部 errors 不暴露，但通过路径前缀
  // 这里采用简化策略：清空再按字段变化重新填
  // 由于 composable 内部 errors 是 private，调用方在 validate() 返回时再按 store 状态判断
  // ——为简化，下面使用直接读 store 的方式二次确认
  expense.items.forEach((it, i) => {
    if (!errors[i]) errors[i] = {}
    if ((it.amount ?? 0) <= 0) errors[i].amount = `请输入第 ${i + 1} 条的报销金额`
    else errors[i].amount = undefined
    if (!it.occurredAt) errors[i].occurredAt = `请选择第 ${i + 1} 条的费用日期`
    else errors[i].occurredAt = undefined
    if (!it.category) errors[i].category = `请选择第 ${i + 1} 条的费用类型`
    else errors[i].category = undefined
  })
  if (!expense.payer) payerError.value = true

  if (result.ok) {
    toast.show({
      message: `已提交报销单 · 总额 ¥${expense.totalAmount.toFixed(2)}`,
      type: 'success'
    })
    expense.clearDraft()
    for (const key of Object.keys(errors)) delete errors[Number(key)]
    payerError.value = false
  } else {
    toast.show({ message: '请补全必填项后再提交', type: 'error' })
  }
  submitting.value = false
}

function setItemRef(index: number, key: 'amount' | 'date' | 'category', el: Element | null) {
  const refList = key === 'amount' ? amountRefs.value : key === 'date' ? dateRefs.value : categoryRefs.value
  refList[index] = el as HTMLElement | null
}
</script>

<template>
  <div class="reimburse-page">
    <NavBar />

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
        :ref="(el) => {
          if (!el) return
          const root = (el as unknown as { $el?: HTMLElement }).$el || (el as unknown as HTMLElement)
          const amountEl = root.querySelector('[data-field=amount]') as HTMLElement | null
          const dateEl = root.querySelector('[data-field=date]') as HTMLElement | null
          const categoryEl = root.querySelector('[data-field=category]') as HTMLElement | null
          setItemRef(index, 'amount', amountEl)
          setItemRef(index, 'date', dateEl)
          setItemRef(index, 'category', categoryEl)
        }"
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

    <BottomBar :is-valid="expense.isValid" @submit="handleSubmit" />
  </div>
</template>

<style scoped>
.reimburse-page {
  min-height: 100vh;
  padding-bottom: 24px;
  background: var(--color-canvas-soft);
}

.page-main {
  display: flex;
  flex-direction: column;
}

.add-detail-card {
  margin: 12px 12px 0;
  background: var(--color-canvas);
  border-radius: var(--radius-sm);
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: var(--color-primary);
  font-size: 14px;
  font-weight: 500;
  box-shadow: var(--shadow-s);
  cursor: pointer;
  transition: background 0.15s;
  border: 0;
}
.add-detail-card:hover { background: rgba(0, 127, 255, 0.04); }
</style>
```

> **注意**：上面 ItemCard 的 `data-field=amount` / `date` / `category` 属性需要在 ItemCard 内的对应 BaseField 上添加。回到 Task 6.4，在 ItemCard 模板的 3 个 BaseField 上分别添加 `:data-field="'amount' | 'date' | 'category'"` 属性（参考 Phase 6.4 修订）。
> 同样地，payerError 需要传给 FlowSection 的 payer 行（FlowSection 内部读 `expense.payer` 判 has-error，本组件的 payerError 暂未使用，保留供后续扩展）。

- [ ] **Step 2: 修订 ItemCard 添加 data-field 属性**

修改 `D:\git\dingEval\src\components\expense\ItemCard.vue`，在 3 个 BaseField 上加 `:data-field`：

```vue
<BaseField label="报销金额(元)" :required="true" :error="errors.amount" data-field="amount">
  <BaseInput ... />
</BaseField>

<BaseField label="费用发生日期" :required="true" :error="errors.occurredAt" data-field="date">
  <BaseDatePicker ... />
</BaseField>

<BaseField label="费用类型" :required="true" :error="errors.category" data-field="category">
  <BaseSelect ... />
</BaseField>
```

- [ ] **Step 3: 验证**

```bash
cd D:\git\dingEval
pnpm typecheck
```

- [ ] **Step 4: 启动 dev server，目视检查**

```bash
cd D:\git\dingEval
pnpm dev
```

打开浏览器，DevTools 切到 Mobile 视图（iPhone SE 375x667），逐项对照 PRD 章节 1-12：
- 导航栏 + 返回按钮
- 关联申请胶囊
- 报销总额卡片（红色大数字 + 3 个动作）
- 报销明细卡片（金额 / 日期 / 类型 / 说明 / 发票子块 / 附件行）
- "+ 添加报销明细" 按钮
- 全局发票卡片
- 归属 / 备注卡片
- 项目 / 客户 / 收款账户 / 企业主体 / 付款时间 5 个 field
- 通知到聊天卡片
- 流程卡片（审批人 / 付款人* / 抄送人）
- 钉钉 footer
- 底部固定操作栏

- [ ] **Step 5: 交互验证清单**

- [ ] 点击 + 添加明细 → 列表增加新行
- [ ] 调整明细行数（删除/添加）→ 总价实时更新
- [ ] 提交按钮初始 disabled
- [ ] 填金额 + 选付款人 → 提交按钮亮起
- [ ] 清空后提交 → 第一个错误字段滚动居中 + 红框抖动（has-error class）
- [ ] 字段填正确后，对应 error 自动消失
- [ ] 点击保存草稿 → Toast 提示 + localStorage 有数据
- [ ] 刷新页面 → 弹出"是否恢复草稿"Toast，点恢复字段完整
- [ ] 点丢弃 → 草稿被清空
- [ ] 提交成功 → Toast + 表单清空 + 草稿清除
- [ ] ActionSheet 单选（审批人/付款人/项目等）→ 选完自动关闭
- [ ] ActionSheet 多选（抄送人/通知到聊天）→ 选完追加 chip
- [ ] chip 可点击删除
- [ ] 添加发票/附件/批量导入/导入随手记/发票识别 → 全部弹"需要钉钉 App 端支持"

- [ ] **Step 6: 提交**

```bash
cd D:\git\dingEval
git add src/views/ExpenseReimburse.vue src/components/expense/ItemCard.vue
git commit -m "feat(view): rewrite ExpenseReimburse as composition entry with validation + draft restore"
```

---

## Phase 8: Verification

> 手动验收。所有 Phase 7 任务通过后执行。

### Task 8.1: 跑全量校验

**Files:** 无（仅执行命令）

- [ ] **Step 1: 类型检查**

```bash
cd D:\git\dingEval
pnpm typecheck
```

Expected: 0 errors。

- [ ] **Step 2: 单元测试**

```bash
cd D:\git\dingEval
pnpm test
```

Expected: 所有 spec 全绿（money 11 + draftStorage 6 + useFormValidation 8 + expense 10+），业务逻辑覆盖率 ≥ 70%。

- [ ] **Step 3: 生产构建**

```bash
cd D:\git\dingEval
pnpm build
```

Expected: 产出 `dist/` 目录，无错误。

- [ ] **Step 4: 修复所有问题**

若任一命令失败，回到对应 Phase 修复后重新执行本任务全部 3 个 step。

- [ ] **Step 5: 提交（如有变动）**

```bash
cd D:\git\dingEval
git status
```

若仅是文档/小修：

```bash
git add -A
git commit -m "fix: pass typecheck/test/build verification"
```

---

### Task 8.2: 视觉验收（手动目视）

- [ ] **Step 1: 启动 dev server**

```bash
cd D:\git\dingEval
pnpm dev
```

打开浏览器 `http://localhost:5173/reimburse`。

- [ ] **Step 2: DevTools 切到 375 移动端视图**

- iPhone SE 预设 (375 x 667)
- 或自定义 375 x 812 (iPhone 13 mini)

- [ ] **Step 3: 逐项对照 PRD / DESIGN.md / example.html**

按以下清单勾选（任一项不符则回到对应 Task 修复）：

- [ ] 顶部导航：48px 高、白色背景、阴影 s、返回箭头 + 居中"日常报销"标题
- [ ] 关联申请胶囊：圆角 full、白色背景、虚线边、左侧 link 图标 + 蓝色"+ 请选择" + 右侧 chevron
- [ ] 报销总额卡片：浅蓝渐变背景、红色 ¥1,234.56（mono 字体 tabular-nums）、3 列等分动作按钮（虚线分割线）
- [ ] 报销明细卡片：白底 + 阴影 s、section-title 16px semibold、删除按钮仅多条时显示
- [ ] 每个明细字段：左侧 label（带 * 红色星号）、右侧 control（右对齐 placeholder 灰色）
- [ ] 发票子块：sub-block 浅灰底、sub-head "发票" + 蓝色"+ 添加发票" 按钮、灰色 hint 文案、两个 chip（无发票 / 待收发票）可互斥切换
- [ ] 附件行：左侧 paperclip 图标 + 蓝色"添加附件"、hover 浅灰
- [ ] "+ 添加报销明细" 卡片：白底圆角 + 阴影、居中蓝色"+" 文字
- [ ] 全局发票卡片：section-title "发票" + sub-block 在白底（与明细里的浅灰不同）
- [ ] 归属卡片：归属人 / 归属部门 只读深色文字、备注 textarea 左对齐
- [ ] 业务字段卡片：5 个 field（项目/客户/收款账户/企业主体/付款时间），全部右侧 chevron / calendar
- [ ] 通知卡片：左侧"发送到聊天" + 问号图标、右侧"+ 添加"按钮，chip 蓝色实色带首字头像
- [ ] 流程卡片：左圆点连接 + 虚线、3 行（审批人 / 付款人* / 抄送人）、右侧 28x28 圆角方块 + 号
- [ ] 钉钉 footer：18px 蓝色方块 D + 灰色"钉钉" + "AI 时代的工作方式"
- [ ] 底部固定栏：白底 + 顶 hairline、保存草稿（次按钮白底灰边）+ 提交（主按钮蓝色实心，disabled 时变 mute 灰）
- [ ] safe-area 适配：iOS 底部有 env(safe-area-inset-bottom) 留白

- [ ] **Step 4: 提交（如有视觉调整）**

```bash
cd D:\git\dingEval
git add -A
git commit -m "fix(ui): visual adjustments to match PRD"
```

---

## Self-Review（自检）

写完计划后，对照 spec 逐项检查覆盖度。

### Spec 覆盖矩阵

| Spec 章节 | 覆盖任务 |
|---|---|
| §1 目标与范围 | 全局约束 #9（不在范围）已明确 |
| §2 技术栈 | Phase 1.1（依赖）+ 全局约束（栈约束） |
| §3 目录结构 | Phase 1-7 文件创建/修改完全对应 |
| §4 架构分层 | 全局约束 #2/#3/#4 + App.vue 挂载（Phase 7.1） |
| §5.1 原子层契约 | Phase 4 全部 12 个 task 严格按表格 props/emit |
| §5.2 业务层契约 | Phase 6 全部 13 个 task 严格按表格 |
| §6.1 Store 增强 | Phase 5.1 toDraft/restoreFromDraft/clearDraft + hasAnyAmount/isValid |
| §6.2 类型定义 | Phase 1.2 types/expense.ts |
| §6.3 Mock 规范 | Phase 2 7 个 mock 文件 |
| §6.4 写入策略 | 全局约束 #2（单一数据源），业务组件 v-model 写 store |
| §7.1 校验规则 | Phase 3.3 useFormValidation 7 条规则 |
| §7.2 错误反馈 | useFormValidation 内部 scrollIntoView + BaseField has-error class |
| §7.3 字段错误态清除 | Phase 7.2 handleSubmit 内 errors 重建 + ItemCard @clear-error |
| §8.1 草稿存储 | Phase 1.5 useDraftStorage（key/version/JSON 校验） |
| §8.2 草稿恢复 | Phase 3.4 useDraftRestore + Phase 7.2 onMounted |
| §9.1 Toast/ActionSheet 单例 | Phase 3.1/3.2 module-level ref + Phase 4.11/4.12 Teleport + Phase 7.1 App.vue 挂载 |
| §9.2 总价卡 3 动作 | Phase 6.3 TotalCard showUnsupported |
| §9.3 添加发票/附件 | Phase 6.5/6.6/6.7 showUnsupported |
| §9.4 流程节点交互 | Phase 6.11 FlowSection 单/多选 + 过滤已选 |
| §9.5 通知到聊天 | Phase 6.10 NotifySection available 过滤 |
| §9.6 移除明细 | Phase 5.1 removeItem length<=1 no-op + Phase 6.1 ItemCard removable prop |
| §9.7 深色模式 | 全局约束 #9（不在范围） |
| §10.1 单测覆盖 | Phase 1.3 / 1.5 / 3.3 / 5.1 共 4 个 spec |
| §10.2 UI 视觉验收 | Phase 8.2 |
| §10.3 验收命令 | Phase 8.1 typecheck/test/build |
| §11 实施顺序 | Phase 1-8 严格按 §11 三轮顺序 |
| §12 验收标准 | Phase 8 全部 12 条对应 ✓ |
| §13 风险 | Teleport（全局约束 #3）/.no-vw（vite.config 保留）/happy-dom（Phase 1.1）/Pinia 隔离（Phase 3.3 setActivePinia）/Iconify 离线（Phase 1.1 @iconify-json/ic 装本地） |

### 类型一致性

- `types/expense.ts` 中 `ExpenseItem.id: string` ↔ `uid('item')` 生成 ↔ `restoreFromDraft` 读取一致
- `ExpenseDraft.version: 1` ↔ `draftStorage.isValidDraft` 校验一致
- `useFormValidation` 错误路径 `items.${i}.amount` ↔ `errors[i].amount` 字段名一致
- `useToast` 状态 `action.onClick` / `dismiss.onClick` ↔ `useDraftRestore` 使用一致
- `useActionSheet.onSelect(value: string | null)` ↔ `BaseSelect` emit `update:modelValue` 一致

### Placeholder 扫描

无 `TBD` / `TODO` / `fill in details` / `similar to Task N`。所有 mock 数据实际填入；所有组件代码完整可运行；测试用例全部断言具体值。

---

## Execution Handoff

**计划完成，保存到**：`docs/superpowers/plans/2026-07-02-expense-reimburse-design.md`

**两种执行方式**：

**1. Subagent-Driven（推荐，匹配多 subagent 并行）**
- 每个 task 派一个 fresh subagent，task 间做两阶段 review
- Phase 2-4-6 大量并发，最高效
- 使用 `superpowers:subagent-driven-development` 技能

**2. Inline Execution**
- 当前会话内批量执行，checkpoint review
- 适合希望立即看到进度的场景
- 使用 `superpowers:executing-plans` 技能

**派发顺序建议**：

```
T0  → 串行：Phase 1 全部 6 task
       ↓
T1  → 7 路并行：Phase 2 mocks（21-27）
       ↓
T2  → 4 路并行：Phase 3 composables（31-34）
       ↓
T3  → 12 路并行：Phase 4 base（41-52）
       ↓
T4  → 1 派发：Phase 5 store（51）
       ↓
T5  → 13 路并行：Phase 6 business（61-73）
       ↓
T6  → 串行：Phase 7 composition（71-72）
       ↓
T7  → 1 派发：Phase 8 verification（81-82）
```

**预计工时（单 subagent 串行）**：~6-8 小时
**预计工时（多 subagent 并行）**：~2-3 小时
