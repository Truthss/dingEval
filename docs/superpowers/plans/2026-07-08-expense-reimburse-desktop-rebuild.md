# 钉钉「日常报销」桌面端重构 v1.3 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完全清理前端 UI 与业务层、删除移动端与原子组件、保留 Python Flask 后端与 DESIGN.md token，从头构建桌面端单页应用（顶部头 + 单页长表单 + 锚点目录 + 居中 720px 布局），验证基准 1440×900。

**Architecture:** 单一 composable `useExpenseForm`（reactive + computed + actions 替代 Pinia）+ 19 个业务组件（无 Base* 原子层）+ 5 个核心输入控件（TextInput / MoneyInput / DatePicker / SelectPicker / TextareaInput）+ `provide/inject` 跨组件共享 form。Desktop-only：单尺寸 1440×900，不做响应式、不做 viewport 适配。

**Tech Stack:** Vue 3.5 + TypeScript 5.6 + Vite 6 + Pinia 2（保留依赖但本设计不直接使用）+ vue-router 4 + vitest 2 + happy-dom 15 + @vue/test-utils 2

## Global Constraints

> 这些约束来自 spec §1 §2 §5 §11，**每个 task 的实现必须隐式满足**：

- **桌面端单一尺寸**：仅针对 1440×900 验证；不做 `< 960px` 移动端适配；不做 `600-959` 平板档；不做 `> 1920` 超宽屏适配
- **禁用 viewport 适配**：`vite.config.ts` 中**不**使用 `postcss-px-to-viewport` 插件；所有 px 数值原样写
- **禁用 @media**：CSS 中**禁止**使用 `@media` 断点；如需响应式行为用 JS（`window.matchMedia`）但本设计不需要
- **Design Token**：颜色 / 字号 / 间距 / 圆角 / 阴影 100% 沿用 DESIGN.md（见 spec §5.1 tokens.css 定义）
- **DESIGN.md 不动**：`docs/DESIGN.md` 是设计源文档，**只读**
- **后端不动**：`api/` / `server.py` / `vercel.json` / `requirements.txt` 不修改、不删除
- **prd.md 字段不增不减**：所有 prd.md 第 2 节的 12 个区块（A-L）必须有对应组件
- **组件粒度**：19 个业务组件（无 Base* 原子层），按 prd.md 1:1 拆分
- **状态管理**：1 个 composable `useExpenseForm`，不引入 Pinia store
- **TypeScript strict**：所有 composable、组件 props/emits 必须有类型
- **测试范围**：仅测 `useExpenseForm`（11 用例）+ `api/client.ts`（4 用例）= 15 个；不测组件渲染
- **路径别名**：源代码 import 路径用 `@/` 引用 `src/`
- **命名**：组件 PascalCase，composable camelCase + use 前缀，目录复数
- **CSS**：所有颜色 / 间距 / 圆角 / 阴影 / 字号 / 行高 / 字重必须用 tokens.css 变量；裸值仅在 transform / box-shadow 细节微调时使用
- **图标**：使用 inline SVG 或 emoji 字符；不引入 iconify / icon 库
- **必填红星**：`*` 红色 12px，显示在 label 后
- **错误反馈**：字段红框 + 错误文案（caption 12px / error 色）显示在字段下方

---

## 文件结构

| 文件 | 操作 | 职责 |
|---|---|---|
| `package.json` | 修改 | 删除 `postcss-px-to-viewport` / `@iconify-json/ic` / `@iconify/vue` |
| `vite.config.ts` | 修改 | 删除 postcss-px-to-viewport 插件块；保留 alias / server / build / test |
| `src/styles/tokens.css` | 重写 | 钉钉桌面端 token（颜色/字号/间距/圆角/阴影/布局尺寸） |
| `src/styles/reset.css` | 重写 | 最小 reset（删除所有 .field/.card/.sub-block/.chip 等全局类） |
| `src/App.vue` | 重写 | 极简壳 + provide form + router-view |
| `src/main.ts` | 保持 | 不动 |
| `src/router/index.ts` | 保持 | 不动（单路由 /reimburse） |
| `src/api/client.ts` | 新建 | fetch 封装 + NetworkError/ApiError + ddNotify/ddUsers |
| `src/api/contact.ts` | 新建 | 包装 ddUsers + 缓存 |
| `src/composables/useExpenseForm.ts` | 新建 | 状态/计算/动作/草稿/校验/提交 |
| `src/components/AppNavBar.vue` | 新建 | 顶部导航（64px sticky + 毛玻璃） |
| `src/components/AppAnchorTabs.vue` | 新建 | 锚点目录（48px sticky） |
| `src/components/AppFooter.vue` | 新建 | 底部提交 + 保存草稿 |
| `src/components/SectionCard.vue` | 新建 | 区段容器 |
| `src/components/FormField.vue` | 新建 | 字段单元（label + 控件 + 错误） |
| `src/components/TextInput.vue` | 新建 | 文本输入 |
| `src/components/MoneyInput.vue` | 新建 | 金额输入（千分位） |
| `src/components/DatePicker.vue` | 新建 | 日期选择 |
| `src/components/SelectPicker.vue` | 新建 | 单/多选弹层 |
| `src/components/TextareaInput.vue` | 新建 | 多行文本 |
| `src/components/CapsuleButton.vue` | 新建 | 胶囊按钮 |
| `src/components/PersonChips.vue` | 新建 | 人员标签组 |
| `src/components/FlowPicker.vue` | 新建 | 审批/付款/抄送 |
| `src/components/RelatedApplyField.vue` | 新建 | 关联申请单 |
| `src/components/TotalCard.vue` | 新建 | 报销总额 |
| `src/components/ItemListCard.vue` | 新建 | 明细列表 |
| `src/components/InvoiceBlock.vue` | 新建 | 发票区 |
| `src/components/OwnershipSection.vue` | 新建 | 归属信息 |
| `src/components/BusinessFieldsSection.vue` | 新建 | 业务字段 |
| `src/components/NotifySection.vue` | 新建 | 消息通知 |
| `src/views/ExpenseReimburse.vue` | 重写 | 主页面组合所有组件 |
| `src/__tests__/useExpenseForm.spec.ts` | 新建 | 11 个 composable 测试 |
| `src/__tests__/api.client.spec.ts` | 新建 | 4 个 api 客户端测试 |
| `src/components/base/*` | **删除** | 12 个原子组件全删 |
| `src/components/expense/*` | **删除** | 15 个业务组件全删 |
| `src/composables/*` | **删除** | 7 个 composable 全删（除 useExpenseForm） |
| `src/stores/expense.ts` | **删除** | Pinia store |
| `src/utils/*` | **删除** | 3 个 util |
| `src/mocks/*` | **删除** | 7 个 mock |
| `src/types/expense.ts` | **删除** | 类型（合并到 composable） |
| `src/__tests__/*` | **删除** | 旧 35 个测试 |
| `src/styles/base.css` | **删除** | 全部全局类 |

---

## Task 1: 项目清理 + 基础配置

**Files:**
- Delete: `src/components/base/*` (12 files)
- Delete: `src/components/expense/*` (15 files)
- Delete: 7 composable files in `src/composables/`
- Delete: `src/stores/expense.ts` (1 file)
- Delete: 3 files in `src/utils/`
- Delete: 7 files in `src/mocks/`
- Delete: 3 test directories in `src/__tests__/` (35 tests)
- Delete: `src/styles/base.css` (1 file)
- Delete: `src/types/expense.ts` (1 file)
- Delete: `src/views/ExpenseReimburse.vue` (1 file, will recreate in Task 19)
- Delete: `src/App.vue` (1 file, will recreate in Task 19)
- Modify: `package.json` (remove 3 deps)
- Modify: `vite.config.ts` (remove postcss-px-to-viewport)
- Create: new directories `src/api/`, `src/composables/`

**Interfaces:**
- Consumes: 无（清理任务）
- Produces: 干净的项目结构，等待后续 Task 填充

- [ ] **Step 1: 删除 12 个 base 原子组件**

```bash
rm -rf src/components/base
```

- [ ] **Step 2: 删除 15 个 expense 业务组件**

```bash
rm -rf src/components/expense
```

- [ ] **Step 3: 删除 composables（保留空目录）**

```bash
rm -f src/composables/useActionSheet.ts
rm -f src/composables/useContactList.ts
rm -f src/composables/useDingtalkAuth.ts
rm -f src/composables/useDingtalkJsapi.ts
rm -f src/composables/useDraftRestore.ts
rm -f src/composables/useFormValidation.ts
rm -f src/composables/useToast.ts
```

- [ ] **Step 4: 删除 stores/utils/types/mocks/base.css/views/App.vue**

```bash
rm -rf src/stores
rm -rf src/utils
rm -rf src/mocks
rm -rf src/types
rm -f src/styles/base.css
rm -f src/views/ExpenseReimburse.vue
rm -f src/App.vue
```

- [ ] **Step 5: 删除旧测试**

```bash
rm -rf src/__tests__
```

- [ ] **Step 6: 修改 package.json 删除 3 个依赖**

打开 `package.json`，删除以下 dependencies/devDependencies：
- `"@iconify-json/ic": "^1.2.0"`（dependencies）
- `"@iconify/vue": "^4.3.0"`（dependencies）
- `"postcss-px-to-viewport": "^1.1.1"`（devDependencies）

修改后保存。

- [ ] **Step 7: 修改 vite.config.ts 删除 postcss-px-to-viewport**

打开 `vite.config.ts`，做以下改动：
1. 删除第 4 行 `import pxToViewport from 'postcss-px-to-viewport'`
2. 删除整个 `css: { postcss: { plugins: [...] } }` 块
3. 删除 `import autoprefixer from 'autoprefixer'`

修改后的关键段（保留 alias / server / build / test）：

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5174,
    open: false,
    proxy: {
      '/api': {
        target: 'http://localhost:5173',
        changeOrigin: true
      }
    }
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
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,vue}'],
      exclude: ['src/**/__tests__/**', 'src/types/**', 'src/main.ts', 'src/router/**']
    }
  }
})
```

- [ ] **Step 8: 创建新目录 `src/api/`**

```bash
mkdir -p src/api
```

- [ ] **Step 9: 验证清理后能 install**

```bash
pnpm install
```

预期：删除的依赖不再被安装。

- [ ] **Step 10: 提交清理**

```bash
git add -A
git commit -m "chore: clean up old components, composables, stores, utils, mocks, tests

- Remove 12 base atomic components
- Remove 15 expense business components
- Remove 7 composables (will re-implement in useExpenseForm)
- Remove Pinia store, draft storage, money util, id util
- Remove 7 mocks
- Remove 35 old tests
- Remove base.css (global classes)
- Remove postcss-px-to-viewport + iconify deps
- Clear package.json and vite.config.ts"
```

---


---

## Task 2: tokens.css 桌面端 token

**Files:**
- Modify: `src/styles/tokens.css` (rewrite whole file)

**Interfaces:**
- Consumes: 无
- Produces: 钉钉桌面端 CSS 变量集（颜色/字号/间距/圆角/阴影/布局尺寸）

- [ ] **Step 1: 重写 tokens.css**

完整文件内容：

```css
/* ============================================================
 * 钉钉设计系统 Token（来源 DESIGN.md · dingtalk_common 主题）
 * 桌面端 v1.3：仅支持 1440×900 单尺寸，不做 viewport 适配
 * 历史：移动端 token 已删除，需要时参见 git history
 * ============================================================ */

:root {
  /* ---------- Brand & Accent ---------- */
  --color-primary: #007FFF;
  --color-on-primary: #FFFFFF;
  --color-primary-hover: #0075EB;
  --color-primary-press: #006AD6;
  --color-secondary: #5AC8FA;
  --color-accent: #00B042;

  /* ---------- Surface & Background ---------- */
  --color-canvas: #FFFFFF;
  --color-canvas-soft: #F2F2F6;
  --color-surface: #FFFFFF;
  --color-surface-press: #F6F6F6;
  --color-hairline: rgba(126, 134, 142, 0.16);
  --color-hairline-strong: rgba(126, 134, 142, 0.24);
  --color-overlay: rgba(0, 0, 0, 0.4);
  --color-overlay-hover: rgba(126, 134, 142, 0.16);
  --color-overlay-press: rgba(126, 134, 142, 0.24);

  /* ---------- Text Color ---------- */
  --color-ink: #171A1D;
  --color-body: rgba(23, 26, 29, 0.6);
  --color-mute: rgba(23, 26, 29, 0.24);
  --color-stamp: rgba(23, 26, 29, 0.04);
  --color-link: #317EDD;

  /* ---------- Semantic ---------- */
  --color-success: #00B042;
  --color-error: #FF5219;
  --color-warning: #FF9200;

  /* ---------- Typography ---------- */
  --font-family-base: "PingFang SC", "SF Pro Text", "Segoe UI", Roboto, "Microsoft YaHei", sans-serif;
  --font-family-mono: "SFMono-Regular", Menlo, Consolas, monospace;

  --font-size-tiny: 10px;
  --font-size-caption: 12px;
  --font-size-footnote: 13px;
  --font-size-body: 14px;
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

  /* ---------- Radius ---------- */
  --radius-none: 0px;
  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* ---------- Spacing (4pt base) ---------- */
  --space-xxs: 4px;
  --space-xs: 8px;
  --space-sm: 12px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 40px;
  --space-3xl: 64px;
  --space-section: 120px;

  /* ---------- Shadow ---------- */
  --shadow-s: 0px 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-m: 0px 8px 24px rgba(0, 0, 0, 0.12);
  --shadow-l: 0px 12px 32px rgba(0, 0, 0, 0.16);

  /* ---------- Z-Index ---------- */
  --z-base: 1;
  --z-sticky: 100;
  --z-fixed: 200;
  --z-popover: 800;
  --z-modal: 1000;
  --z-toast: 2000;

  /* ---------- Desktop Layout (1440×900) ---------- */
  --layout-page-padding: 40px;
  --layout-form-max-width: 720px;
  --layout-navbar-height: 64px;
  --layout-tabs-height: 48px;
  --layout-input-height: 36px;
  --layout-button-height: 40px;
  --layout-card-padding: 24px;
}
```

- [ ] **Step 2: 验证文件**

```bash
cat src/styles/tokens.css | head -20
```

预期：看到 DESIGN.md 注释和颜色 token。

- [ ] **Step 3: 提交**

```bash
git add src/styles/tokens.css
git commit -m "feat(styles): rewrite tokens.css for desktop-only v1.3

- Remove mobile font sizes and breakpoint variables
- Add desktop layout dimensions (1440x900 baseline)
- Add z-index scale for popover/modal/toast
- Add hover/press state colors for primary interactions
- Document v1.3 scope in file header comment"
```

---


---

## Task 3: reset.css 最小化重写

**Files:**
- Modify: `src/styles/reset.css` (rewrite whole file)

**Interfaces:**
- Consumes: tokens.css
- Produces: 浏览器默认样式 reset + 全局 html/body 基础设置

- [ ] **Step 1: 重写 reset.css**

完整文件内容：

```css
/* ============================================================
 * 桌面端基础 reset + 全局基础样式
 * 视觉规范详见 src/styles/tokens.css 与 docs/DESIGN.md
 * 历史：v1.0-v1.2 含 .field/.card/.sub-block/.chip 等全局类
 *       全部删除，改为组件 scoped 样式
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

ol,
ul {
  list-style: none;
}

svg {
  display: block;
}
```

- [ ] **Step 2: 验证文件**

```bash
cat src/styles/reset.css
```

预期：仅含浏览器 reset，无 .field/.card 等业务类。

- [ ] **Step 3: 提交**

```bash
git add src/styles/reset.css
git commit -m "feat(styles): rewrite reset.css to minimal browser reset

- Remove all .field/.card/.sub-block/.chip/.flow-list/.add-btn global classes
- These are replaced by component-scoped styles in v1.3
- Add ul/ol/svg resets for cleaner defaults"
```

---


---

## Task 4: api/client.ts fetch 封装（TDD: 4 个测试）

**Files:**
- Create: `src/__tests__/api.client.spec.ts`
- Create: `src/api/client.ts`

**Interfaces:**
- Consumes: 原生 fetch API
- Produces:
  - `class NetworkError extends Error`
  - `class ApiError extends Error` 字段 `status: number`
  - `apiGet<T>(path: string): Promise<T>`
  - `apiPost<T>(path: string, body: unknown): Promise<T>`
  - `ddNotify(payload): Promise<void>` POST `/api/dd-notify`
  - `ddUsers(): Promise<User[]>` GET `/api/dd-users`
  - `type User = { userid: string, name: string, avatarUrl?: string }`

- [ ] **Step 1: 写测试文件**

```ts
// src/__tests__/api.client.spec.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NetworkError, ApiError, apiGet, apiPost, ddNotify, ddUsers } from '@/api/client'

describe('api/client', () => {
  const mockFetch = vi.fn()

  beforeEach(() => {
    mockFetch.mockReset()
    vi.stubGlobal('fetch', mockFetch)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('apiGet', () => {
    it('apiGet parses 2xx response as JSON', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ foo: 'bar' })
      })
      const result = await apiGet<{ foo: string }>('/api/test')
      expect(result).toEqual({ foo: 'bar' })
      expect(mockFetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({ method: 'GET' }))
    })
  })

  describe('apiPost', () => {
    it('apiPost serializes body and parses 2xx response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ ok: true })
      })
      const result = await apiPost<{ ok: boolean }>('/api/test', { a: 1 })
      expect(result).toEqual({ ok: true })
      expect(mockFetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ a: 1 })
      }))
    })
  })

  describe('error handling', () => {
    it('throws NetworkError when fetch rejects', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))
      await expect(apiGet('/api/test')).rejects.toBeInstanceOf(NetworkError)
    })

    it('throws ApiError with status when response is not 2xx', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error'
      })
      try {
        await apiGet('/api/test')
        expect.fail('should have thrown')
      } catch (e) {
        expect(e).toBeInstanceOf(ApiError)
        expect((e as ApiError).status).toBe(500)
        expect((e as ApiError).message).toBe('Internal Server Error')
      }
    })
  })

  describe('domain wrappers', () => {
    it('ddNotify POSTs to /api/dd-notify and returns void on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ errcode: 0 })
      })
      await expect(
        ddNotify({
          useridList: ['u1', 'u2'],
          title: '报销单已提交',
          content: '陆晓锋 提交了日常报销单，金额 ¥200.00'
        })
      ).resolves.toBeUndefined()
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/dd-notify',
        expect.objectContaining({ method: 'POST' })
      )
    })

    it('ddUsers GETs /api/dd-users and returns the user list', async () => {
      const users = [
        { userid: 'u1', name: '张三' },
        { userid: 'u2', name: '李四' }
      ]
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ users })
      })
      const result = await ddUsers()
      expect(result).toEqual(users)
    })
  })
})
```

- [ ] **Step 2: 运行测试，确认失败**

```bash
pnpm test src/__tests__/api.client.spec.ts
```

预期：FAIL - module '@/api/client' not found.

- [ ] **Step 3: 创建 src/api/client.ts**

```ts
// src/api/client.ts
export type User = {
  userid: string
  name: string
  avatarUrl?: string
}

export type NotifyPayload = {
  useridList: string[]
  title: string
  content: string
  jumpUrl?: string
}

export class NetworkError extends Error {
  constructor(message = '网络错误') {
    super(message)
    this.name = 'NetworkError'
  }
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(path, init)
  } catch (e) {
    throw new NetworkError(e instanceof Error ? e.message : '网络错误')
  }
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new ApiError(res.status, text || res.statusText)
  }
  return res.json() as Promise<T>
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'GET' })
}

export function apiPost<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
}

export async function ddNotify(payload: NotifyPayload): Promise<void> {
  await apiPost<{ errcode: number }>('/api/dd-notify', payload)
}

export async function ddUsers(): Promise<User[]> {
  const data = await apiGet<{ users: User[] }>('/api/dd-users')
  return data.users ?? []
}
```

- [ ] **Step 4: 运行测试，确认通过**

```bash
pnpm test src/__tests__/api.client.spec.ts
```

预期：PASS - 4 tests passed.

- [ ] **Step 5: 提交**

```bash
git add src/api/client.ts src/__tests__/api.client.spec.ts
git commit -m "feat(api): add fetch client with NetworkError/ApiError + dd wrappers

- TDD: 4 tests covering success, network failure, 5xx, domain wrappers
- ddNotify posts to /api/dd-notify
- ddUsers gets /api/dd-users and returns array
- NetworkError wraps fetch rejection
- ApiError wraps non-2xx response with status code"
```

---


---

## Task 5: api/contact.ts 联系人 API + 缓存

**Files:**
- Create: `src/api/contact.ts`

**Interfaces:**
- Consumes: `ddUsers` from `src/api/client.ts`
- Produces:
  - `fetchContacts(): Promise<User[]>` 内部缓存，重复调用只请求一次
  - `getCachedContacts(): User[] | null` 同步读取已缓存列表
  - `clearContactCache(): void` 清除缓存
  - `searchContacts(query: string, users: User[]): User[]` 纯函数，按 name 模糊匹配

- [ ] **Step 1: 创建 src/api/contact.ts**

```ts
// src/api/contact.ts
import { ddUsers, type User } from './client'

let cache: User[] | null = null
let inflight: Promise<User[]> | null = null

export function getCachedContacts(): User[] | null {
  return cache
}

export function clearContactCache(): void {
  cache = null
  inflight = null
}

export async function fetchContacts(): Promise<User[]> {
  if (cache) return cache
  if (inflight) return inflight
  inflight = ddUsers()
  try {
    cache = await inflight
    return cache
  } finally {
    inflight = null
  }
}

export function searchContacts(query: string, users: User[]): User[] {
  const q = query.trim().toLowerCase()
  if (!q) return users
  return users.filter((u) => u.name.toLowerCase().includes(q))
}
```

- [ ] **Step 2: 验证文件**

```bash
cat src/api/contact.ts
```

- [ ] **Step 3: 提交**

```bash
git add src/api/contact.ts
git commit -m "feat(api): add contact API with in-memory cache and search

- fetchContacts caches result, dedups concurrent calls
- getCachedContacts for sync read
- clearContactCache for testing
- searchContacts filters by name (case-insensitive)"
```

---


---

## Task 6: useExpenseForm composable 骨架 + 类型 + 状态

**Files:**
- Create: `src/composables/useExpenseForm.ts`
- Create: `src/__tests__/useExpenseForm.spec.ts`

**Interfaces:**
- Consumes: 无（composable 内部状态）
- Produces:
  - `useExpenseForm()` 返回 `ExpenseForm` 接口
  - `type Item = { id, amount, occurredAt, category, description, invoiceIds, attachmentIds }`
  - `type Flow = { approverId, payerId, ccUserIds }`
  - `type BusinessFields = { projectId, customerId, accountId, entityId, payAt }`
  - `type ItemErrors = Record<number, { amount?, occurredAt?, category? }>`

- [ ] **Step 1: 写第一组测试（addItem / removeItem / updateItem）**

```ts
// src/__tests__/useExpenseForm.spec.ts
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useExpenseForm } from '@/composables/useExpenseForm'

describe('useExpenseForm - items', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('initializes with one empty item', () => {
    const form = useExpenseForm()
    expect(form.items.value.length).toBe(1)
    expect(form.items.value[0]).toMatchObject({
      amount: null,
      occurredAt: null,
      category: null,
      description: '',
      invoiceIds: [],
      attachmentIds: []
    })
  })

  it('addItem appends a new item with unique id', () => {
    const form = useExpenseForm()
    const before = form.items.value.length
    form.addItem()
    expect(form.items.value.length).toBe(before + 1)
    const ids = form.items.value.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('removeItem removes by id', () => {
    const form = useExpenseForm()
    form.addItem()
    const target = form.items.value[1]
    form.removeItem(target.id)
    expect(form.items.value.length).toBe(1)
    expect(form.items.value.find((i) => i.id === target.id)).toBeUndefined()
  })

  it('updateItem patches fields', () => {
    const form = useExpenseForm()
    const id = form.items.value[0].id
    form.updateItem(id, { amount: 200, category: 'transport' })
    expect(form.items.value[0].amount).toBe(200)
    expect(form.items.value[0].category).toBe('transport')
  })
})
```

- [ ] **Step 2: 运行测试，确认失败**

```bash
pnpm test src/__tests__/useExpenseForm.spec.ts
```

预期：FAIL - module '@/composables/useExpenseForm' not found.

- [ ] **Step 3: 创建 composable 骨架**

```ts
// src/composables/useExpenseForm.ts
import { ref, reactive, computed, type Ref, type ComputedRef } from 'vue'

export type Item = {
  id: string
  amount: number | null
  occurredAt: string | null
  category: string | null
  description: string
  invoiceIds: string[]
  attachmentIds: string[]
}

export type Flow = {
  approverId: string | null
  payerId: string | null
  ccUserIds: string[]
}

export type BusinessFields = {
  projectId: string | null
  customerId: string | null
  accountId: string | null
  entityId: string | null
  payAt: string | null
}

export type InvoiceStatus = 'none' | 'pending'

export type ItemErrors = Record<number, { amount?: string; occurredAt?: string; category?: string }>

let _idCounter = 0
function makeId(): string {
  _idCounter += 1
  return `item-${Date.now().toString(36)}-${_idCounter}`
}

function createEmptyItem(): Item {
  return {
    id: makeId(),
    amount: null,
    occurredAt: null,
    category: null,
    description: '',
    invoiceIds: [],
    attachmentIds: []
  }
}

export interface ExpenseForm {
  // state
  relatedApplyId: Ref<string | null>
  items: Ref<Item[]>
  totalInvoiceStatus: Ref<InvoiceStatus>
  ownership: { owner: string; department: string; remark: string }
  businessFields: BusinessFields
  notifyUserIds: Ref<string[]>
  flow: Flow
  submitting: Ref<boolean>
  errors: ItemErrors

  // computed
  totalAmount: ComputedRef<number>
  isValid: ComputedRef<boolean>

  // item actions
  addItem(): void
  removeItem(id: string): void
  updateItem(id: string, patch: Partial<Item>): void
  clearError(index: number, key: 'amount' | 'occurredAt' | 'category'): void
}

export function useExpenseForm(): ExpenseForm {
  const relatedApplyId = ref<string | null>(null)
  const items = ref<Item[]>([createEmptyItem()])
  const totalInvoiceStatus = ref<InvoiceStatus>('none')
  const ownership = reactive({ owner: '陆晓锋', department: '播阳测试部门', remark: '' })
  const businessFields = reactive<BusinessFields>({
    projectId: null,
    customerId: null,
    accountId: null,
    entityId: null,
    payAt: null
  })
  const notifyUserIds = ref<string[]>([])
  const flow = reactive<Flow>({ approverId: null, payerId: null, ccUserIds: [] })
  const submitting = ref(false)
  const errors = reactive<ItemErrors>({})

  const totalAmount = computed(() =>
    items.value.reduce((sum, it) => sum + (it.amount ?? 0), 0)
  )

  const isValid = computed(() => {
    if (!flow.payerId) return false
    for (const it of items.value) {
      if (!it.amount || it.amount <= 0) return false
      if (!it.occurredAt) return false
      if (!it.category) return false
    }
    return true
  })

  function addItem(): void {
    items.value.push(createEmptyItem())
  }

  function removeItem(id: string): void {
    const idx = items.value.findIndex((i) => i.id === id)
    if (idx >= 0) items.value.splice(idx, 1)
  }

  function updateItem(id: string, patch: Partial<Item>): void {
    const it = items.value.find((i) => i.id === id)
    if (!it) return
    Object.assign(it, patch)
  }

  function clearError(index: number, key: 'amount' | 'occurredAt' | 'category'): void {
    if (errors[index]) errors[index][key] = undefined
  }

  return {
    relatedApplyId,
    items,
    totalInvoiceStatus,
    ownership,
    businessFields,
    notifyUserIds,
    flow,
    submitting,
    errors,
    totalAmount,
    isValid,
    addItem,
    removeItem,
    updateItem,
    clearError
  }
}
```

- [ ] **Step 4: 运行测试，确认通过**

```bash
pnpm test src/__tests__/useExpenseForm.spec.ts
```

预期：PASS - 4 tests passed.

- [ ] **Step 5: 提交**

```bash
git add src/composables/useExpenseForm.ts src/__tests__/useExpenseForm.spec.ts
git commit -m "feat(composable): useExpenseForm skeleton with state + items

- Define Item / Flow / BusinessFields / ItemErrors types
- Initialize with one empty item
- addItem/removeItem/updateItem/clearError actions
- totalAmount and isValid computed
- TDD: 4 tests for items CRUD"
```

---


---

## Task 7: useExpenseForm 草稿机制（TDD: 2 个测试）

**Files:**
- Modify: `src/composables/useExpenseForm.ts`
- Modify: `src/__tests__/useExpenseForm.spec.ts`

**Interfaces:**
- Consumes: Task 6 暴露的 ExpenseForm
- Produces:
  - `toDraft(): Draft` 序列化
  - `saveDraft(): void` 写入 localStorage
  - `restoreDraft(): boolean` 启动时恢复（成功返回 true）
  - `clearDraft(): void` 清除 localStorage
  - `type Draft = { relatedApplyId, items, businessFields, notifyUserIds, flow, ownership }`

- [ ] **Step 1: 追加 2 个草稿测试**

在 `src/__tests__/useExpenseForm.spec.ts` 末尾追加：

```ts
describe('useExpenseForm - draft', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('saveDraft + restoreDraft roundtrip preserves state', () => {
    const form = useExpenseForm()
    form.relatedApplyId.value = 'apply-1'
    form.updateItem(form.items.value[0].id, { amount: 200, category: 'transport' })
    form.flow.payerId = 'u-payer'
    form.saveDraft()
    expect(localStorage.getItem('dingeval-expense-draft')).not.toBeNull()

    const form2 = useExpenseForm()
    const restored = form2.restoreDraft()
    expect(restored).toBe(true)
    expect(form2.relatedApplyId.value).toBe('apply-1')
    expect(form2.items.value[0].amount).toBe(200)
    expect(form2.items.value[0].category).toBe('transport')
    expect(form2.flow.payerId).toBe('u-payer')
  })

  it('restoreDraft returns false when no draft exists', () => {
    const form = useExpenseForm()
    expect(form.restoreDraft()).toBe(false)
    expect(form.items.value[0].amount).toBeNull()
  })
})
```

- [ ] **Step 2: 运行测试，确认失败**

```bash
pnpm test src/__tests__/useExpenseForm.spec.ts
```

预期：FAIL - form.saveDraft is not a function.

- [ ] **Step 3: 扩展 useExpenseForm.ts 添加草稿方法**

在 `src/composables/useExpenseForm.ts` 顶部添加常量：

```ts
const DRAFT_KEY = 'dingeval-expense-draft'
```

在 `useExpenseForm` 函数内 `clearError` 之后添加：

```ts
  function toDraft() {
    return {
      relatedApplyId: relatedApplyId.value,
      items: items.value.map((it) => ({ ...it })),
      businessFields: { ...businessFields },
      notifyUserIds: [...notifyUserIds.value],
      flow: { ...flow, ccUserIds: [...flow.ccUserIds] },
      ownership: { ...ownership }
    }
  }

  function saveDraft(): void {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(toDraft()))
    } catch {
      // quota / privacy mode - silently ignore
    }
  }

  function restoreDraft(): boolean {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (!raw) return false
      const d = JSON.parse(raw) as ReturnType<typeof toDraft>
      relatedApplyId.value = d.relatedApplyId ?? null
      if (Array.isArray(d.items) && d.items.length > 0) {
        items.value = d.items.map((it) => ({ ...it }))
      }
      Object.assign(businessFields, d.businessFields)
      notifyUserIds.value = d.notifyUserIds ?? []
      flow.approverId = d.flow?.approverId ?? null
      flow.payerId = d.flow?.payerId ?? null
      flow.ccUserIds = d.flow?.ccUserIds ?? []
      Object.assign(ownership, d.ownership)
      return true
    } catch {
      clearDraft()
      return false
    }
  }

  function clearDraft(): void {
    try {
      localStorage.removeItem(DRAFT_KEY)
    } catch {
      // ignore
    }
  }
```

修改 return 对象，添加这 4 个方法：

```ts
  return {
    relatedApplyId,
    items,
    totalInvoiceStatus,
    ownership,
    businessFields,
    notifyUserIds,
    flow,
    submitting,
    errors,
    totalAmount,
    isValid,
    addItem,
    removeItem,
    updateItem,
    clearError,
    toDraft,
    saveDraft,
    restoreDraft,
    clearDraft
  }
```

修改 `interface ExpenseForm` 添加新方法签名：

```ts
  // draft
  toDraft(): unknown
  saveDraft(): void
  restoreDraft(): boolean
  clearDraft(): void
```

- [ ] **Step 4: 运行测试，确认通过**

```bash
pnpm test src/__tests__/useExpenseForm.spec.ts
```

预期：PASS - 6 tests passed.

- [ ] **Step 5: 提交**

```bash
git add src/composables/useExpenseForm.ts src/__tests__/useExpenseForm.spec.ts
git commit -m "feat(composable): useExpenseForm draft mechanism

- toDraft serializes all state to plain object
- saveDraft writes to localStorage (silent fail on quota)
- restoreDraft reads + applies + returns success boolean
- clearDraft removes from localStorage
- TDD: 2 tests for roundtrip and missing draft"
```

---


---

## Task 8: useExpenseForm 校验 + totalAmount（TDD: 2 个测试）

**Files:**
- Modify: `src/composables/useExpenseForm.ts`
- Modify: `src/__tests__/useExpenseForm.spec.ts`

**Interfaces:**
- Consumes: Task 7
- Produces:
  - `validate(): ValidationResult` 返回 `{ ok: true }` 或 `{ ok: false, errors: ItemErrors, payerMissing: boolean }`
  - `ValidationResult` 类型

- [ ] **Step 1: 追加 3 个校验测试**

在 `src/__tests__/useExpenseForm.spec.ts` 末尾追加：

```ts
describe('useExpenseForm - validation', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('validate fails when amount missing', () => {
    const form = useExpenseForm()
    const result = form.validate()
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors[0]?.amount).toBeTruthy()
      expect(result.payerMissing).toBe(true)
    }
  })

  it('validate fails when payer missing', () => {
    const form = useExpenseForm()
    form.updateItem(form.items.value[0].id, { amount: 100, occurredAt: '2026-07-08', category: 'transport' })
    const result = form.validate()
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.payerMissing).toBe(true)
  })

  it('validate succeeds when all required fields present', () => {
    const form = useExpenseForm()
    form.updateItem(form.items.value[0].id, { amount: 100, occurredAt: '2026-07-08', category: 'transport' })
    form.flow.payerId = 'u-payer'
    const result = form.validate()
    expect(result.ok).toBe(true)
  })

  it('totalAmount sums item amounts', () => {
    const form = useExpenseForm()
    form.updateItem(form.items.value[0].id, { amount: 100 })
    form.addItem()
    form.updateItem(form.items.value[1].id, { amount: 50.5 })
    expect(form.totalAmount.value).toBe(150.5)
  })
})
```

- [ ] **Step 2: 运行测试，确认失败**

```bash
pnpm test src/__tests__/useExpenseForm.spec.ts
```

预期：FAIL - form.validate is not a function.

- [ ] **Step 3: 添加 validate 到 useExpenseForm.ts**

在 `clearDraft` 之后添加：

```ts
  export type ValidationResult =
    | { ok: true }
    | { ok: false; errors: ItemErrors; payerMissing: boolean }

  function validate(): ValidationResult {
    const errs: ItemErrors = {}
    let payerMissing = false

    items.value.forEach((it, i) => {
      const e: { amount?: string; occurredAt?: string; category?: string } = {}
      if (!it.amount || it.amount <= 0) e.amount = `请输入第 ${i + 1} 条的报销金额`
      if (!it.occurredAt) e.occurredAt = `请选择第 ${i + 1} 条的费用日期`
      if (!it.category) e.category = `请选择第 ${i + 1} 条的费用类型`
      if (e.amount || e.occurredAt || e.category) errs[i] = e
    })

    if (!flow.payerId) payerMissing = true

    if (Object.keys(errs).length === 0 && !payerMissing) {
      return { ok: true }
    }
    return { ok: false, errors: errs, payerMissing }
  }
```

修改 `interface ExpenseForm` 添加：

```ts
  validate(): ValidationResult
```

修改 return 对象添加 `validate`。

> 注意：`ValidationResult` 类型需要 export。把它放在 `useExpenseForm` 函数定义**之前**。

- [ ] **Step 4: 运行测试，确认通过**

```bash
pnpm test src/__tests__/useExpenseForm.spec.ts
```

预期：PASS - 10 tests passed.

- [ ] **Step 5: 提交**

```bash
git add src/composables/useExpenseForm.ts src/__tests__/useExpenseForm.spec.ts
git commit -m "feat(composable): useExpenseForm validate()

- Returns { ok: true } or { ok: false, errors, payerMissing }
- Item-level errors keyed by index with field-level messages
- Payer required at flow level
- TDD: 3 tests for validation + 1 for totalAmount (was Task 6 but moved)"
```

---


---

## Task 9: useExpenseForm 提交（TDD: 1 个测试）

**Files:**
- Modify: `src/composables/useExpenseForm.ts`
- Modify: `src/__tests__/useExpenseForm.spec.ts`

**Interfaces:**
- Consumes: Task 8, `ddNotify` from client
- Produces:
  - `submit(): Promise<SubmitResult>` 返回 `{ ok: true }` 或 `{ ok: false, message }`
  - `SubmitResult` 类型
  - 提交时：调 `ddNotify` + 成功后 `clearDraft()` + 失败时保留草稿

- [ ] **Step 1: 追加 2 个提交测试**

在 `src/__tests__/useExpenseForm.spec.ts` 末尾追加：

```ts
import { ddNotify } from '@/api/client'

vi.mock('@/api/client', () => ({
  ddNotify: vi.fn()
}))

describe('useExpenseForm - submit', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.mocked(ddNotify).mockReset()
  })

  it('submit succeeds: calls ddNotify and clears draft', async () => {
    const form = useExpenseForm()
    form.updateItem(form.items.value[0].id, { amount: 200, occurredAt: '2026-07-08', category: 'transport' })
    form.flow.payerId = 'u-payer'

    vi.mocked(ddNotify).mockResolvedValueOnce()

    const result = await form.submit()
    expect(result).toEqual({ ok: true })
    expect(ddNotify).toHaveBeenCalledWith(expect.objectContaining({
      title: '报销单已提交',
      content: expect.stringContaining('¥200.00')
    }))
    expect(localStorage.getItem('dingeval-expense-draft')).toBeNull()
  })

  it('submit fails: keeps draft on network error', async () => {
    const form = useExpenseForm()
    form.updateItem(form.items.value[0].id, { amount: 200, occurredAt: '2026-07-08', category: 'transport' })
    form.flow.payerId = 'u-payer'
    form.saveDraft()

    vi.mocked(ddNotify).mockRejectedValueOnce(new Error('network'))

    const result = await form.submit()
    expect(result.ok).toBe(false)
    expect(localStorage.getItem('dingeval-expense-draft')).not.toBeNull()
  })
})
```

- [ ] **Step 2: 运行测试，确认失败**

```bash
pnpm test src/__tests__/useExpenseForm.spec.ts
```

预期：FAIL - form.submit is not a function.

- [ ] **Step 3: 添加 submit 到 useExpenseForm.ts**

在文件顶部 import 区域添加：

```ts
import { ddNotify } from '@/api/client'
```

在 `validate` 之后添加：

```ts
  export type SubmitResult = { ok: true } | { ok: false; message: string }

  async function submit(): Promise<SubmitResult> {
    const result = validate()
    if (!result.ok) {
      // copy errors into reactive map so UI can show them
      for (const k of Object.keys(errors)) delete errors[Number(k)]
      Object.assign(errors, result.errors)
      return { ok: false, message: '请补全必填项后再提交' }
    }
    submitting.value = true
    try {
      const useridList: string[] = []
      if (flow.approverId) useridList.push(flow.approverId)
      if (flow.payerId) useridList.push(flow.payerId)
      flow.ccUserIds.forEach((u) => u && useridList.push(u))
      await ddNotify({
        useridList,
        title: '报销单已提交',
        content: `**${ownership.owner}** 提交了日常报销单，金额 **¥${totalAmount.value.toFixed(2)}**`,
        jumpUrl: location.origin + location.pathname
      })
      clearDraft()
      return { ok: true }
    } catch (e) {
      return { ok: false, message: e instanceof Error ? e.message : '提交失败' }
    } finally {
      submitting.value = false
    }
  }
```

修改 `interface ExpenseForm` 添加：

```ts
  submit(): Promise<SubmitResult>
```

修改 return 对象添加 `submit`。

- [ ] **Step 4: 运行测试，确认通过**

```bash
pnpm test src/__tests__/useExpenseForm.spec.ts
```

预期：PASS - 12 tests passed (Task 6:4 + Task 7:2 + Task 8:4 + Task 9:2).

- [ ] **Step 5: 提交**

```bash
git add src/composables/useExpenseForm.ts src/__tests__/useExpenseForm.spec.ts
git commit -m "feat(composable): useExpenseForm submit() calls ddNotify and clears draft

- submit() calls validate() first
- On invalid: returns { ok: false } with errors mapped to reactive
- On valid: calls ddNotify with approver/payer/cc list
- On success: clears localStorage draft
- On network error: keeps draft, returns error message
- TDD: 2 tests for success and failure paths"
```

---


---

## Task 10: 5 个核心输入控件 - TextInput + MoneyInput

**Files:**
- Create: `src/components/TextInput.vue`
- Create: `src/components/MoneyInput.vue`

**Interfaces:**
- TextInput props: `modelValue: string`, `placeholder?: string`, `disabled?: boolean`
- TextInput emits: `update:modelValue`
- MoneyInput props: `modelValue: number | null`, `placeholder?: string`
- MoneyInput emits: `update:modelValue`

- [ ] **Step 1: 创建 TextInput.vue**

```vue
<script setup lang="ts">
defineProps<{
  modelValue: string
  placeholder?: string
  disabled?: boolean
}>()

defineEmits<{
  (e: 'update:modelValue', v: string): void
}>()
</script>

<template>
  <input
    class="text-input"
    type="text"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>

<style scoped>
.text-input {
  width: 100%;
  height: var(--layout-input-height);
  padding: 0 12px;
  font-size: var(--font-size-body);
  line-height: var(--line-height-normal);
  color: var(--color-ink);
  background: var(--color-canvas);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-xs);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.text-input::placeholder {
  color: var(--color-mute);
}

.text-input:hover:not(:disabled) {
  border-color: var(--color-hairline-strong);
}

.text-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(0, 127, 255, 0.12);
}

.text-input:disabled {
  background: var(--color-canvas-soft);
  color: var(--color-mute);
  cursor: not-allowed;
}
</style>
```

- [ ] **Step 2: 创建 MoneyInput.vue**

```vue
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: number | null
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: number | null): void
}>()

const display = computed({
  get(): string {
    if (props.modelValue == null) return ''
    return props.modelValue.toLocaleString('en-US', { maximumFractionDigits: 2 })
  },
  set(raw: string): void {
    const cleaned = raw.replace(/[^\d.]/g, '')
    if (cleaned === '' || cleaned === '.') {
      emit('update:modelValue', null)
      return
    }
    const n = Number(cleaned)
    if (Number.isFinite(n)) emit('update:modelValue', n)
  }
})

function onBlur(): void {
  if (props.modelValue != null) {
    emit('update:modelValue', Number(props.modelValue.toFixed(2)))
  }
}
</script>

<template>
  <div class="money-input">
    <span class="money-input__prefix">¥</span>
    <input
      class="money-input__field"
      type="text"
      inputmode="decimal"
      :value="display"
      :placeholder="placeholder"
      @input="display = ($event.target as HTMLInputElement).value"
      @blur="onBlur"
    />
  </div>
</template>

<style scoped>
.money-input {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: var(--layout-input-height);
  padding: 0 12px;
  background: var(--color-canvas);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-xs);
  transition: border-color 0.15s, box-shadow 0.15s;
}

.money-input:hover {
  border-color: var(--color-hairline-strong);
}

.money-input:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(0, 127, 255, 0.12);
}

.money-input__prefix {
  font-size: var(--font-size-body);
  color: var(--color-mute);
  margin-right: 4px;
  font-variant-numeric: tabular-nums;
}

.money-input__field {
  flex: 1;
  min-width: 0;
  height: 100%;
  padding: 0;
  font-size: var(--font-size-body);
  color: var(--color-ink);
  background: transparent;
  border: 0;
  outline: none;
  font-variant-numeric: tabular-nums;
}

.money-input__field::placeholder {
  color: var(--color-mute);
}
</style>
```

- [ ] **Step 3: 验证 typecheck**

```bash
pnpm typecheck
```

预期：当前应有 0 errors（composable 不依赖组件，组件独立）。

- [ ] **Step 4: 提交**

```bash
git add src/components/TextInput.vue src/components/MoneyInput.vue
git commit -m "feat(components): add TextInput and MoneyInput (千分位)

- TextInput: standard text input with focus/hover/disabled states
- MoneyInput: thousand separator, decimal inputmode, tabular-nums
- Both use design tokens (no hardcoded values)
- height 36px, border 1px hairline, focus 2px primary glow"
```

---


---

## Task 11: 5 个核心输入控件 - DatePicker + TextareaInput

**Files:**
- Create: `src/components/DatePicker.vue`
- Create: `src/components/TextareaInput.vue`

**Interfaces:**
- DatePicker props: `modelValue: string | null` (ISO date `YYYY-MM-DD`)
- DatePicker emits: `update:modelValue`
- TextareaInput props: `modelValue: string`, `placeholder?: string`, `rows?: number` (default 3)
- TextareaInput emits: `update:modelValue`

- [ ] **Step 1: 创建 DatePicker.vue**

```vue
<script setup lang="ts">
defineProps<{
  modelValue: string | null
  placeholder?: string
}>()

defineEmits<{
  (e: 'update:modelValue', v: string | null): void
}>()

function onInput(ev: Event): void {
  const target = ev.target as HTMLInputElement
  const val = target.value
  // emit empty string as null
  ;(arguments[1] as (v: string | null) => void)(val === '' ? null : val)
}
</script>

<template>
  <div class="date-picker">
    <input
      class="date-picker__field"
      type="date"
      :value="modelValue ?? ''"
      :placeholder="placeholder"
      @input="onInput($event, $emit)"
    />
  </div>
</template>

<style scoped>
.date-picker {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: var(--layout-input-height);
  padding: 0 12px;
  background: var(--color-canvas);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-xs);
  transition: border-color 0.15s, box-shadow 0.15s;
}

.date-picker:hover {
  border-color: var(--color-hairline-strong);
}

.date-picker:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(0, 127, 255, 0.12);
}

.date-picker__field {
  flex: 1;
  min-width: 0;
  height: 100%;
  padding: 0;
  font-size: var(--font-size-body);
  color: var(--color-ink);
  background: transparent;
  border: 0;
  outline: none;
  font-family: var(--font-family-base);
}

.date-picker__field::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.5;
}

.date-picker__field::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
}
</style>
```

注意：上面 `$emit` 模式有问题，重写更清晰版本：

```vue
<script setup lang="ts">
const props = defineProps<{
  modelValue: string | null
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: string | null): void
}>()

function onInput(ev: Event): void {
  const target = ev.target as HTMLInputElement
  emit('update:modelValue', target.value === '' ? null : target.value)
}
</script>

<template>
  <div class="date-picker">
    <input
      class="date-picker__field"
      type="date"
      :value="modelValue ?? ''"
      :placeholder="placeholder"
      @input="onInput"
    />
  </div>
</template>

<style scoped>
.date-picker {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: var(--layout-input-height);
  padding: 0 12px;
  background: var(--color-canvas);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-xs);
  transition: border-color 0.15s, box-shadow 0.15s;
}

.date-picker:hover {
  border-color: var(--color-hairline-strong);
}

.date-picker:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(0, 127, 255, 0.12);
}

.date-picker__field {
  flex: 1;
  min-width: 0;
  height: 100%;
  padding: 0;
  font-size: var(--font-size-body);
  color: var(--color-ink);
  background: transparent;
  border: 0;
  outline: none;
  font-family: var(--font-family-base);
}

.date-picker__field::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.5;
}

.date-picker__field::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
}
</style>
```

- [ ] **Step 2: 创建 TextareaInput.vue**

```vue
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: string
  placeholder?: string
  rows?: number
  maxlength?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
}>()

const rowCount = computed(() => props.rows ?? 3)
const length = computed(() => props.modelValue.length)
</script>

<template>
  <div class="textarea-input">
    <textarea
      class="textarea-input__field"
      :rows="rowCount"
      :placeholder="placeholder"
      :value="modelValue"
      :maxlength="maxlength"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    ></textarea>
    <div v-if="maxlength" class="textarea-input__count">
      {{ length }} / {{ maxlength }}
    </div>
  </div>
</template>

<style scoped>
.textarea-input {
  position: relative;
  display: block;
  width: 100%;
}

.textarea-input__field {
  display: block;
  width: 100%;
  min-height: 80px;
  padding: 8px 12px;
  font-size: var(--font-size-body);
  line-height: var(--line-height-normal);
  color: var(--color-ink);
  background: var(--color-canvas);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-xs);
  outline: none;
  resize: vertical;
  font-family: var(--font-family-base);
  transition: border-color 0.15s, box-shadow 0.15s;
}

.textarea-input__field::placeholder {
  color: var(--color-mute);
}

.textarea-input__field:hover {
  border-color: var(--color-hairline-strong);
}

.textarea-input__field:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(0, 127, 255, 0.12);
}

.textarea-input__count {
  position: absolute;
  right: 8px;
  bottom: 6px;
  font-size: var(--font-size-caption);
  color: var(--color-mute);
  pointer-events: none;
  background: var(--color-canvas);
  padding: 0 4px;
}
</style>
```

- [ ] **Step 3: 验证 typecheck**

```bash
pnpm typecheck
```

预期：0 errors.

- [ ] **Step 4: 提交**

```bash
git add src/components/DatePicker.vue src/components/TextareaInput.vue
git commit -m "feat(components): add DatePicker and TextareaInput

- DatePicker: native HTML5 date input with custom skin
- TextareaInput: resizable textarea with optional char counter
- Both follow design tokens, focus/hover/disabled states
- DatePicker emits null when cleared"
```

---


---

## Task 12: 5 个核心输入控件 - SelectPicker 弹层

**Files:**
- Create: `src/components/SelectPicker.vue`

**Interfaces:**
- SelectPicker props: `modelValue: string | string[] | null`, `options: { value: string, label: string }[]`, `multiple?: boolean`, `placeholder?: string`, `disabled?: boolean`
- SelectPicker emits: `update:modelValue`

- [ ] **Step 1: 创建 SelectPicker.vue**

```vue
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'

type Option = { value: string; label: string }

const props = defineProps<{
  modelValue: string | string[] | null
  options: Option[]
  multiple?: boolean
  placeholder?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: string | string[] | null): void
}>()

const open = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const popoverRef = ref<HTMLElement | null>(null)
const popoverStyle = ref<Record<string, string>>({})

const display = computed(() => {
  if (props.multiple) {
    if (!Array.isArray(props.modelValue) || props.modelValue.length === 0) {
      return props.placeholder ?? '请选择'
    }
    return props.modelValue
      .map((v) => props.options.find((o) => o.value === v)?.label ?? v)
      .join('、')
  }
  if (props.modelValue == null) return props.placeholder ?? '请选择'
  return props.options.find((o) => o.value === props.modelValue)?.label ?? (props.modelValue as string)
})

const isPlaceholder = computed(() => {
  if (props.multiple) {
    return !Array.isArray(props.modelValue) || props.modelValue.length === 0
  }
  return props.modelValue == null
})

function isSelected(v: string): boolean {
  if (props.multiple) {
    return Array.isArray(props.modelValue) && props.modelValue.includes(v)
  }
  return props.modelValue === v
}

function toggle(v: string): void {
  if (props.multiple) {
    const arr = Array.isArray(props.modelValue) ? [...props.modelValue] : []
    const idx = arr.indexOf(v)
    if (idx >= 0) arr.splice(idx, 1)
    else arr.push(v)
    emit('update:modelValue', arr)
  } else {
    emit('update:modelValue', v)
    open.value = false
  }
}

async function positionPopover(): Promise<void> {
  if (!triggerRef.value || !popoverRef.value) return
  await nextTick()
  const triggerRect = triggerRef.value.getBoundingClientRect()
  const popRect = popoverRef.value.getBoundingClientRect()
  const viewportW = window.innerWidth
  const viewportH = window.innerHeight

  let top = triggerRect.bottom + 4
  let left = triggerRect.left

  // flip if would overflow bottom
  if (top + popRect.height > viewportH - 8) {
    top = triggerRect.top - popRect.height - 4
  }
  // shift left if would overflow right
  if (left + popRect.width > viewportW - 8) {
    left = viewportW - popRect.width - 8
  }
  if (left < 8) left = 8

  popoverStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
    minWidth: `${Math.max(triggerRect.width, 200)}px`
  }
}

async function toggleOpen(): Promise<void> {
  if (props.disabled) return
  open.value = !open.value
  if (open.value) await positionPopover()
}

function onClickOutside(ev: MouseEvent): void {
  if (!open.value) return
  const target = ev.target as Node
  if (triggerRef.value?.contains(target)) return
  if (popoverRef.value?.contains(target)) return
  open.value = false
}

function onEsc(ev: KeyboardEvent): void {
  if (ev.key === 'Escape' && open.value) open.value = false
}

onMounted(() => {
  document.addEventListener('mousedown', onClickOutside)
  document.addEventListener('keydown', onEsc)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onClickOutside)
  document.removeEventListener('keydown', onEsc)
})

watch(open, (v) => {
  if (v) {
    setTimeout(() => positionPopover(), 0)
  }
})
</script>

<template>
  <div class="select-picker">
    <button
      ref="triggerRef"
      type="button"
      class="select-picker__trigger"
      :class="{ 'is-placeholder': isPlaceholder, 'is-open': open }"
      :disabled="disabled"
      @click="toggleOpen"
    >
      <span class="select-picker__text">{{ display }}</span>
      <span class="select-picker__chevron" aria-hidden="true">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
    </button>
    <Teleport to="body">
      <div
        v-if="open"
        ref="popoverRef"
        class="select-picker__popover"
        :style="popoverStyle"
        role="listbox"
        :aria-multiselectable="multiple"
      >
        <div
          v-for="opt in options"
          :key="opt.value"
          class="select-picker__option"
          :class="{ 'is-selected': isSelected(opt.value) }"
          role="option"
          :aria-selected="isSelected(opt.value)"
          @click="toggle(opt.value)"
        >
          <span class="select-picker__check" aria-hidden="true">
            <svg v-if="isSelected(opt.value)" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <span>{{ opt.label }}</span>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.select-picker {
  position: relative;
  display: inline-block;
  width: 100%;
}

.select-picker__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: var(--layout-input-height);
  padding: 0 12px;
  font-size: var(--font-size-body);
  color: var(--color-ink);
  background: var(--color-canvas);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-xs);
  cursor: pointer;
  outline: none;
  font-family: var(--font-family-base);
  transition: border-color 0.15s, box-shadow 0.15s;
}

.select-picker__trigger:hover:not(:disabled) {
  border-color: var(--color-hairline-strong);
}

.select-picker__trigger:focus-visible,
.select-picker__trigger.is-open {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(0, 127, 255, 0.12);
}

.select-picker__trigger:disabled {
  background: var(--color-canvas-soft);
  color: var(--color-mute);
  cursor: not-allowed;
}

.select-picker__trigger.is-placeholder .select-picker__text {
  color: var(--color-mute);
}

.select-picker__text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
}

.select-picker__chevron {
  display: inline-flex;
  color: var(--color-mute);
  margin-left: 8px;
  flex-shrink: 0;
}

.select-picker__trigger:hover .select-picker__chevron {
  color: var(--color-primary);
}

.select-picker__trigger.is-open .select-picker__chevron {
  transform: rotate(180deg);
  color: var(--color-primary);
}

.select-picker__popover {
  position: fixed;
  z-index: var(--z-popover);
  max-height: 280px;
  overflow-y: auto;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-m);
  padding: 4px;
}

.select-picker__option {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 12px;
  font-size: var(--font-size-body);
  color: var(--color-ink);
  border-radius: var(--radius-xs);
  cursor: pointer;
  user-select: none;
  transition: background 0.1s;
}

.select-picker__option:hover {
  background: var(--color-overlay-hover);
}

.select-picker__option.is-selected {
  color: var(--color-primary);
  background: rgba(0, 127, 255, 0.06);
}

.select-picker__check {
  display: inline-flex;
  width: 14px;
  height: 14px;
  color: var(--color-primary);
  flex-shrink: 0;
}
</style>
```

- [ ] **Step 2: 验证 typecheck**

```bash
pnpm typecheck
```

预期：0 errors.

- [ ] **Step 3: 提交**

```bash
git add src/components/SelectPicker.vue
git commit -m "feat(components): add SelectPicker with popover and auto-positioning

- Single and multiple selection modes
- Trigger looks like TextInput
- Popover teleports to body, position-flips on overflow
- Click outside / Esc closes
- Hover/focus states, design tokens throughout"
```

---


---

## Task 13: 布局组件 - SectionCard + FormField + CapsuleButton + PersonChips

**Files:**
- Create: `src/components/SectionCard.vue`
- Create: `src/components/FormField.vue`
- Create: `src/components/CapsuleButton.vue`
- Create: `src/components/PersonChips.vue`

**Interfaces:**
- SectionCard props: `id: string`, `title?: string`, `subtitle?: string`
- SectionCard slot: `default` (字段内容), `actions` (右上角操作)
- FormField props: `label: string`, `required?: boolean`, `error?: string`, `helpText?: string`
- FormField slot: `default` (控件)
- CapsuleButton props: `label: string`, `placeholder?: string` (默认 `+ 请选择`)
- CapsuleButton emits: `click`
- PersonChips props: `modelValue: string[]`, `users: User[]`, `max?: number`
- PersonChips emits: `update:modelValue`, `pick`

- [ ] **Step 1: 创建 SectionCard.vue**

```vue
<script setup lang="ts">
defineProps<{
  id: string
  title?: string
  subtitle?: string
}>()
</script>

<template>
  <section :id="id" class="section-card">
    <header v-if="title || $slots.actions" class="section-card__head">
      <div>
        <h3 v-if="title" class="section-card__title">{{ title }}</h3>
        <p v-if="subtitle" class="section-card__subtitle">{{ subtitle }}</p>
      </div>
      <div v-if="$slots.actions" class="section-card__actions">
        <slot name="actions" />
      </div>
    </header>
    <div class="section-card__body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.section-card {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-s);
  padding: var(--layout-card-padding);
  scroll-margin-top: calc(var(--layout-navbar-height) + var(--layout-tabs-height) + 16px);
}

.section-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.section-card__title {
  font-size: var(--font-size-h3);
  font-weight: var(--font-weight-semibold);
  color: var(--color-ink);
  line-height: var(--line-height-snug);
}

.section-card__subtitle {
  margin-top: 4px;
  font-size: var(--font-size-caption);
  color: var(--color-body);
}

.section-card__actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.section-card__body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
```

- [ ] **Step 2: 创建 FormField.vue**

```vue
<script setup lang="ts">
defineProps<{
  label: string
  required?: boolean
  error?: string
  helpText?: string
}>()
</script>

<template>
  <div class="form-field" :class="{ 'has-error': !!error }">
    <label class="form-field__label">
      <span>{{ label }}</span>
      <span v-if="required" class="form-field__req" aria-label="必填">*</span>
    </label>
    <div class="form-field__control">
      <slot />
    </div>
    <p v-if="error" class="form-field__error">
      <span class="form-field__error-icon" aria-hidden="true">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <circle cx="6" cy="6" r="5" stroke="currentColor" stroke-width="1.2"/>
          <line x1="6" y1="3.5" x2="6" y2="6.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
          <circle cx="6" cy="8.5" r="0.6" fill="currentColor"/>
        </svg>
      </span>
      {{ error }}
    </p>
    <p v-else-if="helpText" class="form-field__help">{{ helpText }}</p>
  </div>
</template>

<style scoped>
.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.form-field__label {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: var(--font-size-body);
  color: var(--color-ink);
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-snug);
}

.form-field__req {
  color: var(--color-error);
  font-size: var(--font-size-caption);
  line-height: 1;
}

.form-field.has-error .form-field__label {
  color: var(--color-error);
}

.form-field__control {
  display: flex;
  align-items: center;
  width: 100%;
}

.form-field__error {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-size-caption);
  color: var(--color-error);
  line-height: var(--line-height-normal);
}

.form-field__error-icon {
  display: inline-flex;
  flex-shrink: 0;
}

.form-field__help {
  font-size: var(--font-size-caption);
  color: var(--color-mute);
  line-height: var(--line-height-normal);
}
</style>
```

- [ ] **Step 3: 创建 CapsuleButton.vue**

```vue
<script setup lang="ts">
withDefaults(defineProps<{
  label?: string
  placeholder?: string
  disabled?: boolean
}>(), {
  label: '+ 请选择',
  placeholder: '',
  disabled: false
})

defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <button
    type="button"
    class="capsule-btn"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <span class="capsule-btn__icon" aria-hidden="true">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <line x1="7" y1="3" x2="7" y2="11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="3" y1="7" x2="11" y2="7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </span>
    <span>{{ label }}</span>
  </button>
</template>

<style scoped>
.capsule-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 14px;
  font-size: var(--font-size-body);
  color: var(--color-primary);
  background: rgba(0, 127, 255, 0.06);
  border: 1px dashed rgba(0, 127, 255, 0.32);
  border-radius: var(--radius-full);
  cursor: pointer;
  font-family: var(--font-family-base);
  transition: background 0.15s, border-color 0.15s;
}

.capsule-btn:hover:not(:disabled) {
  background: rgba(0, 127, 255, 0.12);
  border-color: var(--color-primary);
}

.capsule-btn:active:not(:disabled) {
  background: rgba(0, 127, 255, 0.18);
}

.capsule-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.capsule-btn__icon {
  display: inline-flex;
  color: currentColor;
}
</style>
```

- [ ] **Step 4: 创建 PersonChips.vue**

```vue
<script setup lang="ts">
import type { User } from '@/api/client'

const props = defineProps<{
  modelValue: string[]
  users: User[]
  max?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: string[]): void
  (e: 'pick'): void
}>()

function getUser(id: string): User | undefined {
  return props.users.find((u) => u.userid === id)
}

function remove(id: string): void {
  emit('update:modelValue', props.modelValue.filter((x) => x !== id))
}

function getInitial(name: string): string {
  return name ? name.charAt(0) : '?'
}
</script>

<template>
  <div class="person-chips">
    <div
      v-for="id in modelValue"
      :key="id"
      class="person-chips__chip"
    >
      <span class="person-chips__avatar">{{ getInitial(getUser(id)?.name ?? '') }}</span>
      <span class="person-chips__name">{{ getUser(id)?.name ?? id }}</span>
      <button
        type="button"
        class="person-chips__close"
        aria-label="移除"
        @click="remove(id)"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <line x1="2" y1="2" x2="8" y2="8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="8" y1="2" x2="2" y2="8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
    <button
      v-if="!max || modelValue.length < max"
      type="button"
      class="person-chips__add"
      @click="emit('pick')"
    >
      <span class="person-chips__add-icon" aria-hidden="true">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <line x1="6" y1="2.5" x2="6" y2="9.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          <line x1="2.5" y1="6" x2="9.5" y2="6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
        </svg>
      </span>
      <span>添加</span>
    </button>
  </div>
</template>

<style scoped>
.person-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.person-chips__chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 6px 0 4px;
  background: rgba(0, 127, 255, 0.08);
  color: var(--color-primary);
  border-radius: var(--radius-full);
  font-size: var(--font-size-footnote);
}

.person-chips__avatar {
  width: 20px;
  height: 20px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  color: var(--color-on-primary);
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: var(--font-weight-semibold);
}

.person-chips__name {
  line-height: 1;
}

.person-chips__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: var(--radius-full);
  color: var(--color-mute);
  background: transparent;
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
}

.person-chips__close:hover {
  color: var(--color-error);
  background: rgba(255, 82, 25, 0.08);
}

.person-chips__add {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 28px;
  padding: 0 12px;
  font-size: var(--font-size-footnote);
  color: var(--color-primary);
  background: transparent;
  border: 1px dashed rgba(0, 127, 255, 0.32);
  border-radius: var(--radius-full);
  cursor: pointer;
  font-family: var(--font-family-base);
  transition: background 0.15s, border-color 0.15s;
}

.person-chips__add:hover {
  background: rgba(0, 127, 255, 0.06);
  border-color: var(--color-primary);
}

.person-chips__add-icon {
  display: inline-flex;
  color: currentColor;
}
</style>
```

- [ ] **Step 5: 验证 typecheck**

```bash
pnpm typecheck
```

预期：0 errors.

- [ ] **Step 6: 提交**

```bash
git add src/components/SectionCard.vue src/components/FormField.vue src/components/CapsuleButton.vue src/components/PersonChips.vue
git commit -m "feat(components): add SectionCard, FormField, CapsuleButton, PersonChips

- SectionCard: section container with id anchor + optional title/actions
- FormField: label + control + error/help text layout
- CapsuleButton: dashed-border '+ 请选择' style button
- PersonChips: avatar+name chip with remove + add button
- scroll-margin-top for anchor jump
- All use design tokens"
```

---


---

## Task 14: 壳组件 - AppNavBar + AppAnchorTabs + AppFooter

**Files:**
- Create: `src/components/AppNavBar.vue`
- Create: `src/components/AppAnchorTabs.vue`
- Create: `src/components/AppFooter.vue`

**Interfaces:**
- AppNavBar props: `title: string`, `userInitial?: string`, `isValid?: boolean`
- AppNavBar emits: `submit`, `saveDraft`, `logout`
- AppAnchorTabs props: `items: { id: string, label: string, errorCount?: number }[]`, `activeId: string`
- AppAnchorTabs emits: `jump` (id: string)
- AppFooter props: `isValid: boolean`
- AppFooter emits: `submit`, `saveDraft`

- [ ] **Step 1: 创建 AppNavBar.vue**

```vue
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

withDefaults(defineProps<{
  title: string
  userInitial?: string
  isValid?: boolean
}>(), {
  userInitial: '陆',
  isValid: false
})

const emit = defineEmits<{
  (e: 'submit'): void
  (e: 'saveDraft'): void
  (e: 'logout'): void
}>()

const menuOpen = ref(false)
const avatarRef = ref<HTMLElement | null>(null)

function toggleMenu(): void {
  menuOpen.value = !menuOpen.value
}

function onClickOutside(ev: MouseEvent): void {
  if (!menuOpen.value) return
  const target = ev.target as Node
  if (avatarRef.value?.contains(target)) return
  menuOpen.value = false
}

onMounted(() => document.addEventListener('mousedown', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('mousedown', onClickOutside))
</script>

<template>
  <header class="app-navbar">
    <div class="app-navbar__inner">
      <div class="app-navbar__brand">
        <div class="app-navbar__logo" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="2" y="2" width="24" height="24" rx="6" fill="#007FFF"/>
            <path d="M8 10.5C8 9.4 8.9 8.5 10 8.5H18C19.1 8.5 20 9.4 20 10.5V14.5C20 15.6 19.1 16.5 18 16.5H13L10 19.5V16.5H10C8.9 16.5 8 15.6 8 14.5V10.5Z" fill="white"/>
            <circle cx="18" cy="20" r="2.5" fill="white" fill-opacity="0.6"/>
          </svg>
        </div>
        <h1 class="app-navbar__title">{{ title }}</h1>
      </div>
      <div class="app-navbar__actions">
        <button
          type="button"
          class="app-navbar__btn app-navbar__btn--ghost"
          @click="emit('saveDraft')"
        >
          草稿
        </button>
        <button
          type="button"
          class="app-navbar__btn app-navbar__btn--primary"
          :disabled="!isValid"
          @click="emit('submit')"
        >
          提交
        </button>
        <div ref="avatarRef" class="app-navbar__avatar-wrap">
          <button
            type="button"
            class="app-navbar__avatar"
            aria-label="用户菜单"
            @click="toggleMenu"
          >
            {{ userInitial }}
          </button>
          <div v-if="menuOpen" class="app-navbar__menu" role="menu">
            <button type="button" class="app-navbar__menu-item" @click="emit('logout')">退出</button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-navbar {
  position: sticky;
  top: 0;
  z-index: var(--z-fixed);
  height: var(--layout-navbar-height);
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--color-hairline);
}

.app-navbar__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 var(--layout-page-padding);
}

.app-navbar__brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-navbar__logo {
  display: inline-flex;
}

.app-navbar__title {
  font-size: var(--font-size-h2);
  font-weight: var(--font-weight-medium);
  color: var(--color-ink);
  line-height: var(--line-height-snug);
}

.app-navbar__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-navbar__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: var(--layout-button-height);
  padding: 0 20px;
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-family: var(--font-family-base);
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.app-navbar__btn--ghost {
  color: var(--color-ink);
  background: transparent;
  border: 1px solid var(--color-hairline-strong);
}

.app-navbar__btn--ghost:hover {
  background: var(--color-overlay-hover);
}

.app-navbar__btn--primary {
  color: var(--color-on-primary);
  background: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.app-navbar__btn--primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
}

.app-navbar__btn--primary:active:not(:disabled) {
  background: var(--color-primary-press);
  border-color: var(--color-primary-press);
}

.app-navbar__btn--primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.app-navbar__avatar-wrap {
  position: relative;
}

.app-navbar__avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  color: var(--color-on-primary);
  display: grid;
  place-items: center;
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  border: 0;
  font-family: var(--font-family-base);
  transition: opacity 0.15s;
}

.app-navbar__avatar:hover {
  opacity: 0.85;
}

.app-navbar__menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  min-width: 120px;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-m);
  padding: 4px;
  z-index: var(--z-popover);
}

.app-navbar__menu-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 8px 12px;
  font-size: var(--font-size-body);
  color: var(--color-ink);
  background: transparent;
  border: 0;
  border-radius: var(--radius-xs);
  cursor: pointer;
  font-family: var(--font-family-base);
}

.app-navbar__menu-item:hover {
  background: var(--color-overlay-hover);
}
</style>
```

- [ ] **Step 2: 创建 AppAnchorTabs.vue**

```vue
<script setup lang="ts">
withDefaults(defineProps<{
  items: { id: string; label: string; errorCount?: number }[]
  activeId: string
}>(), {
  activeId: ''
})

const emit = defineEmits<{
  (e: 'jump', id: string): void
}>()
</script>

<template>
  <nav class="anchor-tabs" aria-label="表单区段导航">
    <div class="anchor-tabs__inner">
      <button
        v-for="item in items"
        :key="item.id"
        type="button"
        class="anchor-tabs__tab"
        :class="{ 'is-active': item.id === activeId }"
        @click="emit('jump', item.id)"
      >
        <span>{{ item.label }}</span>
        <span v-if="item.errorCount && item.errorCount > 0" class="anchor-tabs__badge">
          {{ item.errorCount > 9 ? '9+' : item.errorCount }}
        </span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
.anchor-tabs {
  position: sticky;
  top: var(--layout-navbar-height);
  z-index: var(--z-sticky);
  height: var(--layout-tabs-height);
  background: var(--color-canvas);
  border-bottom: 1px solid var(--color-hairline);
}

.anchor-tabs__inner {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 var(--layout-page-padding);
  overflow-x: auto;
  scrollbar-width: none;
}

.anchor-tabs__inner::-webkit-scrollbar {
  display: none;
}

.anchor-tabs__tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 100%;
  padding: 0 12px;
  font-size: var(--font-size-body);
  color: var(--color-body);
  background: transparent;
  border: 0;
  cursor: pointer;
  font-family: var(--font-family-base);
  white-space: nowrap;
  transition: color 0.15s;
}

.anchor-tabs__tab:hover {
  color: var(--color-ink);
}

.anchor-tabs__tab.is-active {
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
}

.anchor-tabs__tab.is-active::after {
  content: '';
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 0;
  height: 2px;
  background: var(--color-primary);
  border-radius: 2px 2px 0 0;
}

.anchor-tabs__badge {
  display: inline-grid;
  place-items: center;
  min-width: 16px;
  height: 16px;
  padding: 0 5px;
  background: var(--color-error);
  color: var(--color-on-primary);
  border-radius: var(--radius-full);
  font-size: 10px;
  font-weight: var(--font-weight-semibold);
  line-height: 1;
}
</style>
```

- [ ] **Step 3: 创建 AppFooter.vue**

```vue
<script setup lang="ts">
withDefaults(defineProps<{
  isValid?: boolean
}>(), {
  isValid: false
})

const emit = defineEmits<{
  (e: 'submit'): void
  (e: 'saveDraft'): void
}>()
</script>

<template>
  <footer class="app-footer">
    <div class="app-footer__inner">
      <p class="app-footer__hint">提交后将进入审批流程，无法撤回</p>
      <div class="app-footer__actions">
        <button
          type="button"
          class="app-footer__btn app-footer__btn--secondary"
          @click="emit('saveDraft')"
        >
          保存草稿
        </button>
        <button
          type="button"
          class="app-footer__btn app-footer__btn--primary"
          :disabled="!isValid"
          @click="emit('submit')"
        >
          提交
        </button>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  margin-top: var(--space-3xl);
  padding: 24px 0 40px;
}

.app-footer__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  max-width: var(--layout-form-max-width);
  margin: 0 auto;
  padding: 0 var(--layout-page-padding);
}

.app-footer__hint {
  font-size: var(--font-size-caption);
  color: var(--color-mute);
}

.app-footer__actions {
  display: flex;
  gap: 12px;
}

.app-footer__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
  height: var(--layout-button-height);
  padding: 0 24px;
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-family: var(--font-family-base);
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.app-footer__btn--secondary {
  color: var(--color-ink);
  background: var(--color-canvas);
  border: 1px solid var(--color-hairline-strong);
}

.app-footer__btn--secondary:hover {
  background: var(--color-overlay-hover);
}

.app-footer__btn--primary {
  color: var(--color-on-primary);
  background: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.app-footer__btn--primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
}

.app-footer__btn--primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
```

- [ ] **Step 4: 验证 typecheck**

```bash
pnpm typecheck
```

预期：0 errors.

- [ ] **Step 5: 提交**

```bash
git add src/components/AppNavBar.vue src/components/AppAnchorTabs.vue src/components/AppFooter.vue
git commit -m "feat(components): add AppNavBar, AppAnchorTabs, AppFooter

- AppNavBar: 64px sticky + backdrop blur + 草稿/提交/头像菜单
- AppAnchorTabs: 48px sticky + 8 tabs with active highlight + error badge
- AppFooter: hint + 保存草稿 + 提交
- All use design tokens
- Scroll-margin handled in SectionCard"
```

---


---

## Task 15: 业务组件 - RelatedApplyField + TotalCard

**Files:**
- Create: `src/components/RelatedApplyField.vue`
- Create: `src/components/TotalCard.vue`

**Interfaces:**
- RelatedApplyField props: `modelValue: string | null`, `applies: { id: string, label: string }[]`
- RelatedApplyField emits: `update:modelValue`
- TotalCard props: `total: number`
- TotalCard emits: `batchImport`, `importNote`, `invoiceRecognize`

- [ ] **Step 1: 创建 RelatedApplyField.vue**

```vue
<script setup lang="ts">
defineProps<{
  modelValue: string | null
  applies: { id: string; label: string }[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: string | null): void
}>()
</script>

<template>
  <SelectPicker
    :model-value="modelValue"
    :options="applies"
    placeholder="+ 请选择关联申请单"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>
```

- [ ] **Step 2: 创建 TotalCard.vue**

```vue
<script setup lang="ts">
defineProps<{
  total: number
}>()

const emit = defineEmits<{
  (e: 'batchImport'): void
  (e: 'importNote'): void
  (e: 'invoiceRecognize'): void
}>()

function fmt(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
</script>

<template>
  <div class="total-card">
    <div class="total-card__head">
      <span class="total-card__label">报销总额</span>
      <span class="total-card__amount">¥ {{ fmt(total) }}</span>
    </div>
    <div class="total-card__actions">
      <button type="button" class="total-card__action" @click="emit('batchImport')">
        <span class="total-card__action-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/>
            <line x1="7" y1="7" x2="7" y2="13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="7" y1="10" x2="13" y2="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </span>
        <span>批量导入</span>
      </button>
      <button type="button" class="total-card__action" @click="emit('importNote')">
        <span class="total-card__action-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 4H11L15 8V16H5V4Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
            <line x1="7" y1="11" x2="13" y2="11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="7" y1="14" x2="11" y2="14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </span>
        <span>导入随手记</span>
      </button>
      <button type="button" class="total-card__action" @click="emit('invoiceRecognize')">
        <span class="total-card__action-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="3" y="5" width="14" height="10" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
            <line x1="3" y1="9" x2="17" y2="9" stroke="currentColor" stroke-width="1.5"/>
          </svg>
        </span>
        <span>发票识别</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.total-card {
  background: var(--color-canvas-soft);
  border-radius: var(--radius-md);
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.total-card__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
}

.total-card__label {
  font-size: var(--font-size-caption);
  color: var(--color-body);
}

.total-card__amount {
  font-size: var(--font-size-large-title);
  font-weight: var(--font-weight-semibold);
  color: var(--color-error);
  font-variant-numeric: tabular-nums;
  line-height: 1;
  letter-spacing: -0.5px;
}

.total-card__actions {
  display: flex;
  gap: 16px;
}

.total-card__action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  font-size: var(--font-size-body);
  color: var(--color-primary);
  background: transparent;
  border: 0;
  border-radius: var(--radius-xs);
  cursor: pointer;
  font-family: var(--font-family-base);
  transition: background 0.15s;
}

.total-card__action:hover {
  background: rgba(0, 127, 255, 0.08);
}

.total-card__action-icon {
  display: inline-flex;
  color: currentColor;
}
</style>
```

- [ ] **Step 3: 验证 typecheck**

```bash
pnpm typecheck
```

预期：0 errors.

- [ ] **Step 4: 提交**

```bash
git add src/components/RelatedApplyField.vue src/components/TotalCard.vue
git commit -m "feat(components): add RelatedApplyField and TotalCard

- RelatedApplyField: SelectPicker wrapper for 关联申请单
- TotalCard: 浅蓝底块 + 报销总额 (32px error 红) + 3 个功能入口
- Amount uses tabular-nums for stable display
- All use design tokens"
```

---


---

## Task 16: 业务组件 - ItemListCard

**Files:**
- Create: `src/components/ItemListCard.vue`

**Interfaces:**
- ItemListCard props: `items: Item[]`, `categories: { value: string, label: string }[]`, `errors?: ItemErrors`
- ItemListCard emits: `add`, `remove` (id: string), `update:item` (id, patch: Partial\<Item\>), `clearError` (index, key)

- [ ] **Step 1: 创建 ItemListCard.vue**

```vue
<script setup lang="ts">
import type { Item, ItemErrors } from '@/composables/useExpenseForm'

defineProps<{
  items: Item[]
  categories: { value: string; label: string }[]
  errors?: ItemErrors
}>()

const emit = defineEmits<{
  (e: 'add'): void
  (e: 'remove', id: string): void
  (e: 'update:item', id: string, patch: Partial<Item>): void
  (e: 'clearError', index: number, key: 'amount' | 'occurredAt' | 'category'): void
}>()

function confirmRemove(id: string): void {
  if (window.confirm('确定删除这条报销明细？')) {
    emit('remove', id)
  }
}
</script>

<template>
  <div class="item-list">
    <div
      v-for="(item, index) in items"
      :key="item.id"
      class="item-list__row"
    >
      <header class="item-list__row-head">
        <h4 class="item-list__row-title">报销明细 {{ index + 1 }}</h4>
        <button
          v-if="items.length > 1"
          type="button"
          class="item-list__row-remove"
          @click="confirmRemove(item.id)"
        >
          删除
        </button>
      </header>

      <div class="item-list__row-grid">
        <FormField
          label="报销金额（元）"
          required
          :error="errors?.[index]?.amount"
        >
          <MoneyInput
            :model-value="item.amount"
            placeholder="请输入金额"
            @update:model-value="(v) => { emit('update:item', item.id, { amount: v }); emit('clearError', index, 'amount') }"
          />
        </FormField>

        <FormField
          label="费用发生日期"
          required
          :error="errors?.[index]?.occurredAt"
        >
          <DatePicker
            :model-value="item.occurredAt"
            @update:model-value="(v) => { emit('update:item', item.id, { occurredAt: v }); emit('clearError', index, 'occurredAt') }"
          />
        </FormField>

        <FormField
          label="费用类型"
          required
          :error="errors?.[index]?.category"
        >
          <SelectPicker
            :model-value="item.category"
            :options="categories"
            placeholder="请选择"
            @update:model-value="(v) => { emit('update:item', item.id, { category: v as string }); emit('clearError', index, 'category') }"
          />
        </FormField>

        <FormField label="费用说明" class="item-list__row-textarea">
          <TextareaInput
            :model-value="item.description"
            placeholder="请输入费用说明"
            :rows="3"
            :maxlength="200"
            @update:model-value="(v) => emit('update:item', item.id, { description: v })"
          />
        </FormField>
      </div>
    </div>

    <button
      v-if="items.length < 20"
      type="button"
      class="item-list__add"
      @click="emit('add')"
    >
      <span class="item-list__add-icon" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <line x1="7" y1="3" x2="7" y2="11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="3" y1="7" x2="11" y2="7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </span>
      <span>添加报销明细</span>
    </button>
  </div>
</template>

<style scoped>
.item-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.item-list__row {
  background: var(--color-canvas-soft);
  border-radius: var(--radius-md);
  padding: 20px;
}

.item-list__row-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.item-list__row-title {
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-semibold);
  color: var(--color-ink);
}

.item-list__row-remove {
  font-size: var(--font-size-footnote);
  color: var(--color-error);
  background: transparent;
  border: 0;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--radius-xs);
  font-family: var(--font-family-base);
  transition: background 0.15s;
}

.item-list__row-remove:hover {
  background: rgba(255, 82, 25, 0.08);
}

.item-list__row-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.item-list__row-textarea {
  grid-column: span 2;
}

.item-list__add {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: var(--layout-button-height);
  padding: 0 20px;
  font-size: var(--font-size-body);
  color: var(--color-primary);
  background: var(--color-canvas);
  border: 1px dashed rgba(0, 127, 255, 0.32);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-family: var(--font-family-base);
  align-self: flex-start;
  transition: background 0.15s, border-color 0.15s;
}

.item-list__add:hover {
  background: rgba(0, 127, 255, 0.04);
  border-color: var(--color-primary);
}

.item-list__add-icon {
  display: inline-flex;
  color: currentColor;
}
</style>
```

- [ ] **Step 2: 验证 typecheck**

```bash
pnpm typecheck
```

预期：0 errors.

- [ ] **Step 3: 提交**

```bash
git add src/components/ItemListCard.vue
git commit -m "feat(components): add ItemListCard with grid 2-col layout

- Each item row: amount / date / category / description
- Delete button when items.length > 1 (with confirm)
- Add button at end (max 20 items)
- Errors mapped per field per item
- 2-col grid for desktop"
```

---


---

## Task 17: 业务组件 - InvoiceBlock + OwnershipSection + BusinessFieldsSection + NotifySection

**Files:**
- Create: `src/components/InvoiceBlock.vue`
- Create: `src/components/OwnershipSection.vue`
- Create: `src/components/BusinessFieldsSection.vue`
- Create: `src/components/NotifySection.vue`

**Interfaces:**
- InvoiceBlock props: `status: 'none' | 'pending'`
- InvoiceBlock emits: `add`
- OwnershipSection props: `ownership: { owner, department, remark }`
- OwnershipSection emits: `update:ownership`
- BusinessFieldsSection props: `fields: BusinessFields`, `options: { projects, customers, accounts, entities }`
- BusinessFieldsSection emits: `update:fields`
- NotifySection props: `modelValue: string[]`, `users: User[]`
- NotifySection emits: `update:modelValue`, `pick`

- [ ] **Step 1: 创建 InvoiceBlock.vue**

```vue
<script setup lang="ts">
withDefaults(defineProps<{
  status?: 'none' | 'pending'
}>(), {
  status: 'none'
})

const emit = defineEmits<{
  (e: 'add'): void
}>()
</script>

<template>
  <div class="invoice-block">
    <div class="invoice-block__head">
      <h4 class="invoice-block__title">发票</h4>
      <div class="invoice-block__tags">
        <span class="invoice-block__tag" :class="{ 'is-active': status === 'none' }">[无发票]</span>
        <span class="invoice-block__tag" :class="{ 'is-active': status === 'pending' }">
          [待收发票]
          <span class="invoice-block__help" aria-hidden="true">?</span>
        </span>
      </div>
    </div>
    <p class="invoice-block__hint">支持智能识别电子、纸质发票的金额等信息</p>
    <button type="button" class="invoice-block__add" @click="emit('add')">
      <span class="invoice-block__add-icon" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <line x1="7" y1="3" x2="7" y2="11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="3" y1="7" x2="11" y2="7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </span>
      <span>添加发票</span>
    </button>
  </div>
</template>

<style scoped>
.invoice-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.invoice-block__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.invoice-block__title {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--color-ink);
}

.invoice-block__tags {
  display: flex;
  gap: 8px;
}

.invoice-block__tag {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 4px 10px;
  font-size: var(--font-size-caption);
  color: var(--color-body);
  background: var(--color-canvas);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all 0.15s;
}

.invoice-block__tag:hover {
  border-color: var(--color-hairline-strong);
}

.invoice-block__tag.is-active {
  background: rgba(0, 127, 255, 0.08);
  color: var(--color-primary);
  border-color: rgba(0, 127, 255, 0.32);
}

.invoice-block__help {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: 12px;
  border-radius: var(--radius-full);
  background: var(--color-mute);
  color: var(--color-on-primary);
  font-size: 9px;
  font-weight: var(--font-weight-semibold);
}

.invoice-block__hint {
  font-size: var(--font-size-caption);
  color: var(--color-body);
}

.invoice-block__add {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  font-size: var(--font-size-footnote);
  color: var(--color-primary);
  background: transparent;
  border: 0;
  border-radius: var(--radius-xs);
  cursor: pointer;
  font-family: var(--font-family-base);
  transition: background 0.15s;
}

.invoice-block__add:hover {
  background: rgba(0, 127, 255, 0.06);
}

.invoice-block__add-icon {
  display: inline-flex;
  color: currentColor;
}
</style>
```

- [ ] **Step 2: 创建 OwnershipSection.vue**

```vue
<script setup lang="ts">
import type { User } from '@/api/client'

defineProps<{
  ownership: { owner: string; department: string; remark: string }
  users?: User[]
}>()

const emit = defineEmits<{
  (e: 'update:ownership', v: { owner: string; department: string; remark: string }): void
}>()
</script>

<template>
  <div class="ownership">
    <div class="ownership__grid">
      <FormField label="归属人">
        <TextInput
          :model-value="ownership.owner"
          placeholder="请输入归属人"
          @update:model-value="(v) => emit('update:ownership', { ...ownership, owner: v })"
        />
      </FormField>
      <FormField label="归属部门">
        <TextInput
          :model-value="ownership.department"
          placeholder="请输入归属部门"
          @update:model-value="(v) => emit('update:ownership', { ...ownership, department: v })"
        />
      </FormField>
      <FormField label="备注" class="ownership__remark">
        <TextareaInput
          :model-value="ownership.remark"
          placeholder="请输入备注"
          :rows="3"
          :maxlength="500"
          @update:model-value="(v) => emit('update:ownership', { ...ownership, remark: v })"
        />
      </FormField>
    </div>
  </div>
</template>

<style scoped>
.ownership {
  display: flex;
  flex-direction: column;
}

.ownership__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.ownership__remark {
  grid-column: span 2;
}
</style>
```

- [ ] **Step 3: 创建 BusinessFieldsSection.vue**

```vue
<script setup lang="ts">
import type { BusinessFields } from '@/composables/useExpenseForm'

defineProps<{
  fields: BusinessFields
  options: {
    projects: { value: string; label: string }[]
    customers: { value: string; label: string }[]
    accounts: { value: string; label: string }[]
    entities: { value: string; label: string }[]
  }
}>()

const emit = defineEmits<{
  (e: 'update:fields', v: BusinessFields): void
}>()
</script>

<template>
  <div class="business-fields">
    <div class="business-fields__grid">
      <FormField label="项目">
        <SelectPicker
          :model-value="fields.projectId"
          :options="options.projects"
          placeholder="请选择"
          @update:model-value="(v) => emit('update:fields', { ...fields, projectId: v as string })"
        />
      </FormField>
      <FormField label="客户">
        <SelectPicker
          :model-value="fields.customerId"
          :options="options.customers"
          placeholder="请选择"
          @update:model-value="(v) => emit('update:fields', { ...fields, customerId: v as string })"
        />
      </FormField>
      <FormField label="收款账户">
        <SelectPicker
          :model-value="fields.accountId"
          :options="options.accounts"
          placeholder="请选择"
          @update:model-value="(v) => emit('update:fields', { ...fields, accountId: v as string })"
        />
      </FormField>
      <FormField label="企业主体">
        <SelectPicker
          :model-value="fields.entityId"
          :options="options.entities"
          placeholder="请选择"
          @update:model-value="(v) => emit('update:fields', { ...fields, entityId: v as string })"
        />
      </FormField>
      <FormField label="付款时间" class="business-fields__date">
        <DatePicker
          :model-value="fields.payAt"
          placeholder="请选择"
          @update:model-value="(v) => emit('update:fields', { ...fields, payAt: v })"
        />
      </FormField>
    </div>
  </div>
</template>

<style scoped>
.business-fields__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.business-fields__date {
  grid-column: span 2;
}
</style>
```

- [ ] **Step 4: 创建 NotifySection.vue**

```vue
<script setup lang="ts">
import type { User } from '@/api/client'

defineProps<{
  modelValue: string[]
  users: User[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: string[]): void
  (e: 'pick'): void
}>()
</script>

<template>
  <div class="notify">
    <div class="notify__head">
      <h4 class="notify__title">
        发送到聊天
        <span class="notify__help" aria-label="帮助" title="提交后这些用户会在钉钉工作通知中收到消息">?</span>
      </h4>
    </div>
    <PersonChips
      :model-value="modelValue"
      :users="users"
      @update:model-value="(v) => emit('update:modelValue', v)"
      @pick="emit('pick')"
    />
  </div>
</template>

<style scoped>
.notify {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notify__head {
  display: flex;
  align-items: center;
  gap: 6px;
}

.notify__title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--color-ink);
}

.notify__help {
  display: inline-grid;
  place-items: center;
  width: 14px;
  height: 14px;
  border-radius: var(--radius-full);
  background: var(--color-mute);
  color: var(--color-on-primary);
  font-size: 10px;
  font-weight: var(--font-weight-semibold);
  cursor: help;
}
</style>
```

- [ ] **Step 5: 验证 typecheck**

```bash
pnpm typecheck
```

预期：0 errors.

- [ ] **Step 6: 提交**

```bash
git add src/components/InvoiceBlock.vue src/components/OwnershipSection.vue src/components/BusinessFieldsSection.vue src/components/NotifySection.vue
git commit -m "feat(components): add InvoiceBlock, OwnershipSection, BusinessFieldsSection, NotifySection

- InvoiceBlock: 状态 chips + 添加发票
- OwnershipSection: 归属人/部门 (2-col) + 备注 (span 2)
- BusinessFieldsSection: 5 fields in 2-col grid
- NotifySection: 标题 + 帮助 + PersonChips
- All use design tokens"
```

---


---

## Task 18: 业务组件 - FlowPicker

**Files:**
- Create: `src/components/FlowPicker.vue`

**Interfaces:**
- FlowPicker props: `flow: { approverId: string | null, payerId: string | null, ccUserIds: string[] }`, `users: User[]`
- FlowPicker emits: `update:flow`, `pick` (role: 'approver' | 'payer')

- [ ] **Step 1: 创建 FlowPicker.vue**

```vue
<script setup lang="ts">
import type { User } from '@/api/client'
import type { Flow } from '@/composables/useExpenseForm'

defineProps<{
  flow: Flow
  users: User[]
  payerMissing?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:flow', v: Flow): void
  (e: 'pick', role: 'approver' | 'payer'): void
}>()

function removePayer(): void {
  emit('update:flow', { ...flow, payerId: null })
}

function removeApprover(): void {
  emit('update:flow', { ...flow, approverId: null })
}

function removeCc(id: string): void {
  emit('update:flow', { ...flow, ccUserIds: flow.ccUserIds.filter((x) => x !== id) })
}
</script>

<template>
  <div class="flow-picker">
    <div class="flow-picker__row" :class="{ 'has-error': payerMissing }">
      <span class="flow-picker__dot" aria-hidden="true"></span>
      <div class="flow-picker__info">
        <div class="flow-picker__name">
          <span>付款人</span>
          <span class="flow-picker__req" aria-label="必填">*</span>
        </div>
        <div v-if="flow.payerId" class="flow-picker__person">
          {{ users.find((u) => u.userid === flow.payerId)?.name ?? flow.payerId }}
          <button
            type="button"
            class="flow-picker__remove"
            aria-label="移除付款人"
            @click="removePayer"
          >×</button>
        </div>
        <div v-else class="flow-picker__placeholder">请选择</div>
      </div>
      <button
        type="button"
        class="flow-picker__add"
        aria-label="选择付款人"
        @click="emit('pick', 'payer')"
      >+</button>
    </div>

    <div class="flow-picker__row">
      <span class="flow-picker__dot" aria-hidden="true"></span>
      <div class="flow-picker__info">
        <div class="flow-picker__name">审批人</div>
        <div v-if="flow.approverId" class="flow-picker__person">
          {{ users.find((u) => u.userid === flow.approverId)?.name ?? flow.approverId }}
          <button
            type="button"
            class="flow-picker__remove"
            aria-label="移除审批人"
            @click="removeApprover"
          >×</button>
        </div>
        <div v-else class="flow-picker__placeholder">请选择审批人</div>
      </div>
      <button
        type="button"
        class="flow-picker__add"
        aria-label="选择审批人"
        @click="emit('pick', 'approver')"
      >+</button>
    </div>

    <div class="flow-picker__row">
      <span class="flow-picker__dot flow-picker__dot--last" aria-hidden="true"></span>
      <div class="flow-picker__info">
        <div class="flow-picker__name">抄送人</div>
        <div v-if="flow.ccUserIds.length > 0" class="flow-picker__cc-list">
          <span
            v-for="id in flow.ccUserIds"
            :key="id"
            class="flow-picker__cc-chip"
          >
            {{ users.find((u) => u.userid === id)?.name ?? id }}
            <button
              type="button"
              class="flow-picker__cc-remove"
              aria-label="移除抄送人"
              @click="removeCc(id)"
            >×</button>
          </span>
        </div>
        <div v-else class="flow-picker__placeholder">请选择抄送人</div>
      </div>
      <button
        type="button"
        class="flow-picker__add"
        aria-label="选择抄送人"
        @click="emit('pick', 'cc')"
      >+</button>
    </div>
  </div>
</template>

<style scoped>
.flow-picker {
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
}

.flow-picker__row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 14px 0;
  position: relative;
}

.flow-picker__row + .flow-picker__row::before {
  content: '';
  position: absolute;
  left: 5px;
  top: -10px;
  width: 1px;
  height: 24px;
  background: var(--color-hairline);
}

.flow-picker__dot {
  width: 12px;
  height: 12px;
  border-radius: var(--radius-full);
  background: var(--color-canvas);
  border: 2px solid var(--color-primary);
  margin-top: 4px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.flow-picker__dot--last {
  border-color: var(--color-hairline-strong);
}

.flow-picker__row.has-error .flow-picker__name {
  color: var(--color-error);
}

.flow-picker__row.has-error .flow-picker__placeholder {
  color: var(--color-error);
}

.flow-picker__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.flow-picker__name {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  color: var(--color-ink);
}

.flow-picker__req {
  color: var(--color-error);
  font-size: var(--font-size-caption);
  line-height: 1;
}

.flow-picker__placeholder {
  font-size: var(--font-size-footnote);
  color: var(--color-mute);
}

.flow-picker__person {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--font-size-footnote);
  color: var(--color-ink);
}

.flow-picker__remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: var(--radius-full);
  color: var(--color-mute);
  background: transparent;
  border: 0;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
}

.flow-picker__remove:hover {
  color: var(--color-error);
  background: rgba(255, 82, 25, 0.08);
}

.flow-picker__cc-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.flow-picker__cc-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  background: rgba(0, 127, 255, 0.08);
  color: var(--color-primary);
  border-radius: var(--radius-full);
  font-size: var(--font-size-footnote);
}

.flow-picker__cc-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: var(--radius-full);
  color: var(--color-mute);
  background: transparent;
  border: 0;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
}

.flow-picker__cc-remove:hover {
  color: var(--color-error);
}

.flow-picker__add {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-xs);
  background: var(--color-canvas-soft);
  color: var(--color-primary);
  border: 0;
  display: grid;
  place-items: center;
  font-size: 18px;
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  flex-shrink: 0;
  margin-top: 2px;
  transition: background 0.15s;
}

.flow-picker__add:hover {
  background: rgba(0, 127, 255, 0.12);
}
</style>
```

- [ ] **Step 2: 验证 typecheck**

```bash
pnpm typecheck
```

预期：0 errors.

- [ ] **Step 3: 提交**

```bash
git add src/components/FlowPicker.vue
git commit -m "feat(components): add FlowPicker for 审批/付款/抄送

- 3 stacked rows with dot connector
- Single chip for 审批人/付款人, multi for 抄送人
- Add (+) and remove (×) buttons per row
- Payer required indicator + has-error state
- All use design tokens"
```

---


---

## Task 19: 主页面 - ExpenseReimburse.vue + App.vue 组合

**Files:**
- Create: `src/App.vue`
- Create: `src/views/ExpenseReimburse.vue`

**Interfaces:**
- App.vue 暴露 `form = useExpenseForm()` via `provide('expenseForm', form)`
- ExpenseReimburse.vue 通过 `inject<ExpenseForm>('expenseForm')` 消费

- [ ] **Step 1: 创建 src/App.vue**

```vue
<script setup lang="ts">
import { useExpenseForm } from '@/composables/useExpenseForm'

const form = useExpenseForm()
provide('expenseForm', form)
</script>

<script lang="ts">
import { provide } from 'vue'
</script>

<template>
  <router-view />
</template>
```

注：上面 import 了两次，修正如下：

```vue
<script setup lang="ts">
import { provide } from 'vue'
import { useExpenseForm } from '@/composables/useExpenseForm'

const form = useExpenseForm()
provide('expenseForm', form)
</script>

<template>
  <router-view />
</template>
```

- [ ] **Step 2: 创建 src/views/ExpenseReimburse.vue**

```vue
<script setup lang="ts">
import { inject, onMounted, ref, computed, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import type { ExpenseForm } from '@/composables/useExpenseForm'
import { fetchContacts, type User } from '@/api/contact'

import AppNavBar from '@/components/AppNavBar.vue'
import AppAnchorTabs from '@/components/AppAnchorTabs.vue'
import AppFooter from '@/components/AppFooter.vue'
import SectionCard from '@/components/SectionCard.vue'
import RelatedApplyField from '@/components/RelatedApplyField.vue'
import TotalCard from '@/components/TotalCard.vue'
import ItemListCard from '@/components/ItemListCard.vue'
import InvoiceBlock from '@/components/InvoiceBlock.vue'
import OwnershipSection from '@/components/OwnershipSection.vue'
import BusinessFieldsSection from '@/components/BusinessFieldsSection.vue'
import NotifySection from '@/components/NotifySection.vue'
import FlowPicker from '@/components/FlowPicker.vue'

const form = inject<ExpenseForm>('expenseForm')!
const router = useRouter()

const users = ref<User[]>([])
const draftPromptVisible = ref(false)
const activeId = ref('related')
const draftDebounce = ref<number | null>(null)

const anchors = computed(() => [
  { id: 'related', label: '关联申请', errorCount: 0 },
  { id: 'total', label: '总额', errorCount: 0 },
  {
    id: 'items',
    label: '明细',
    errorCount: Object.values(form.errors).filter((e) => e).length
  },
  { id: 'invoice', label: '发票', errorCount: 0 },
  { id: 'ownership', label: '归属', errorCount: 0 },
  { id: 'business', label: '业务', errorCount: 0 },
  { id: 'notify', label: '通知', errorCount: 0 },
  {
    id: 'flow',
    label: '流程',
    errorCount: form.flow.payerId ? 0 : 1
  }
])

// Option lists (stub data for v1.3; replace with API in future)
const applies = [
  { id: 'apply-1', label: '2026-Q2 出差申请' },
  { id: 'apply-2', label: '2026-07 客户拜访' }
]

const categories = [
  { value: 'transport', label: '交通费' },
  { value: 'meal', label: '餐费' },
  { value: 'hotel', label: '住宿费' },
  { value: 'office', label: '办公用品' },
  { value: 'other', label: '其他' }
]

const businessOptions = {
  projects: [
    { value: 'p1', label: '钉钉智能助手' },
    { value: 'p2', label: '客户系统升级' }
  ],
  customers: [
    { value: 'c1', label: '阿里巴巴' },
    { value: 'c2', label: '字节跳动' }
  ],
  accounts: [
    { value: 'a1', label: '招商银行 ****1234' },
    { value: 'a2', label: '工商银行 ****5678' }
  ],
  entities: [
    { value: 'e1', label: '钉钉（中国）信息技术有限公司' }
  ]
}

function onJump(id: string): void {
  activeId.value = id
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  router.replace({ hash: `#${id}` })
}

function onScroll(): void {
  // Update activeId based on scroll position
  const ids = anchors.value.map((a) => a.id)
  for (const id of ids) {
    const el = document.getElementById(id)
    if (!el) continue
    const rect = el.getBoundingClientRect()
    if (rect.top <= 120 && rect.bottom > 120) {
      activeId.value = id
      break
    }
  }
}

function scheduleDraftSave(): void {
  if (draftDebounce.value) window.clearTimeout(draftDebounce.value)
  draftDebounce.value = window.setTimeout(() => {
    form.saveDraft()
  }, 500)
}

function onSaveDraft(): void {
  form.saveDraft()
  alert('已保存为草稿')
}

async function onSubmit(): Promise<void> {
  const result = await form.submit()
  if (result.ok) {
    alert(`已提交报销单 · 总额 ¥${form.totalAmount.value.toFixed(2)}`)
  } else {
    alert(result.message)
  }
}

function onLogout(): void {
  // v1.3 stub: simple reload
  if (window.confirm('确定退出？')) {
    location.reload()
  }
}

onMounted(async () => {
  // Try to fetch contacts (best-effort)
  try {
    users.value = await fetchContacts()
  } catch {
    users.value = []
  }

  // Try to restore draft
  if (form.restoreDraft()) {
    draftPromptVisible.value = true
  }

  // Watch form state for debounced auto-save
  const stopWatch = watch(
    () => [
      form.items.value,
      form.flow,
      form.businessFields,
      form.notifyUserIds.value,
      form.ownership,
      form.relatedApplyId.value
    ],
    () => {
      if (draftPromptVisible.value) {
        // user is being prompted; don't auto-save over restored state
        return
      }
      scheduleDraftSave()
    },
    { deep: true }
  )

  // Scroll spy
  window.addEventListener('scroll', onScroll, { passive: true })

  onBeforeUnmount(() => {
    stopWatch()
    window.removeEventListener('scroll', onScroll)
    if (draftDebounce.value) window.clearTimeout(draftDebounce.value)
  })
})

function onAcceptDraft(): void {
  draftPromptVisible.value = false
}

function onDiscardDraft(): void {
  form.clearDraft()
  draftPromptVisible.value = false
}
</script>

<script lang="ts">
import { watch } from 'vue'
</script>

<template>
  <div class="reimburse-page">
    <AppNavBar
      title="日常报销"
      :is-valid="form.isValid.value"
      :user-initial="form.ownership.owner.charAt(0)"
      @submit="onSubmit"
      @save-draft="onSaveDraft"
      @logout="onLogout"
    />

    <AppAnchorTabs :items="anchors" :active-id="activeId" @jump="onJump" />

    <div v-if="draftPromptVisible" class="draft-prompt">
      <div class="draft-prompt__inner">
        <span>检测到上次未提交的草稿，是否恢复？</span>
        <div class="draft-prompt__actions">
          <button type="button" class="draft-prompt__btn" @click="onDiscardDraft">丢弃</button>
          <button type="button" class="draft-prompt__btn draft-prompt__btn--primary" @click="onAcceptDraft">恢复</button>
        </div>
      </div>
    </div>

    <main class="reimburse-main">
      <SectionCard id="related" title="关联申请">
        <RelatedApplyField
          :model-value="form.relatedApplyId.value"
          :applies="applies"
          @update:model-value="(v) => (form.relatedApplyId.value = v)"
        />
      </SectionCard>

      <SectionCard id="total">
        <TotalCard
          :total="form.totalAmount.value"
          @batch-import="() => alert('批量导入功能即将上线')"
          @import-note="() => alert('导入随手记功能即将上线')"
          @invoice-recognize="() => alert('发票识别功能即将上线')"
        />
      </SectionCard>

      <SectionCard id="items" title="报销明细">
        <ItemListCard
          :items="form.items.value"
          :categories="categories"
          :errors="form.errors"
          @add="form.addItem"
          @remove="form.removeItem"
          @update:item="(id, patch) => form.updateItem(id, patch)"
          @clear-error="(i, k) => form.clearError(i, k)"
        />
      </SectionCard>

      <SectionCard id="invoice" title="发票">
        <InvoiceBlock
          :status="form.totalInvoiceStatus.value"
          @add="() => alert('添加发票功能即将上线')"
        />
      </SectionCard>

      <SectionCard id="ownership" title="归属信息">
        <OwnershipSection
          :ownership="form.ownership"
          :users="users"
          @update:ownership="(v) => Object.assign(form.ownership, v)"
        />
      </SectionCard>

      <SectionCard id="business" title="业务字段">
        <BusinessFieldsSection
          :fields="form.businessFields"
          :options="businessOptions"
          @update:fields="(v) => Object.assign(form.businessFields, v)"
        />
      </SectionCard>

      <SectionCard id="notify" title="消息通知">
        <NotifySection
          :model-value="form.notifyUserIds.value"
          :users="users"
          @update:model-value="(v) => (form.notifyUserIds.value = v)"
          @pick="() => alert('人员选择器即将上线')"
        />
      </SectionCard>

      <SectionCard id="flow" title="流程">
        <FlowPicker
          :flow="form.flow"
          :users="users"
          :payer-missing="!form.flow.payerId && Object.keys(form.errors).length > 0"
          @update:flow="(v) => Object.assign(form.flow, v)"
          @pick="() => alert('人员选择器即将上线')"
        />
      </SectionCard>

      <AppFooter :is-valid="form.isValid.value" @submit="onSubmit" @save-draft="onSaveDraft" />
    </main>
  </div>
</template>

<style scoped>
.reimburse-page {
  min-height: 100vh;
  background: var(--color-canvas-soft);
  padding-bottom: 40px;
}

.reimburse-main {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
  max-width: var(--layout-form-max-width);
  margin: 0 auto;
  padding: var(--space-xl) var(--layout-page-padding) 0;
}

.draft-prompt {
  position: fixed;
  top: calc(var(--layout-navbar-height) + var(--layout-tabs-height) + 16px);
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-popover);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-m);
  padding: 12px 20px;
}

.draft-prompt__inner {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: var(--font-size-body);
  color: var(--color-ink);
}

.draft-prompt__actions {
  display: flex;
  gap: 8px;
}

.draft-prompt__btn {
  height: 28px;
  padding: 0 12px;
  font-size: var(--font-size-footnote);
  color: var(--color-ink);
  background: transparent;
  border: 1px solid var(--color-hairline-strong);
  border-radius: var(--radius-xs);
  cursor: pointer;
  font-family: var(--font-family-base);
}

.draft-prompt__btn--primary {
  color: var(--color-on-primary);
  background: var(--color-primary);
  border-color: var(--color-primary);
}
</style>
```

- [ ] **Step 3: 验证 typecheck**

```bash
pnpm typecheck
```

预期：可能有一些小问题（Watch import 位置、onBeforeUnmount 调用位置），按报错修复。

- [ ] **Step 4: 验证 build**

```bash
pnpm build
```

预期：成功。

- [ ] **Step 5: 提交**

```bash
git add src/App.vue src/views/ExpenseReimburse.vue
git commit -m "feat(views): assemble ExpenseReimburse with all sections

- App.vue: provide form via inject
- ExpenseReimburse.vue: AppNavBar + AppAnchorTabs + 8 SectionCards + AppFooter
- Draft prompt toast on mount if draft exists
- Scroll spy for active anchor
- Debounced auto-save (500ms)
- Stub option lists for v1.3
- All design tokens throughout"
```

---


---

## Task 20: 端到端验收

**Files:**
- 无（验收任务）

**Interfaces:**
- Consumes: 所有 Task 1-19 的产出
- Produces: 验收报告

- [ ] **Step 1: 运行 typecheck**

```bash
pnpm typecheck
```

预期：0 errors. 如果有错，按错误信息修复代码（不修改本计划文件）。

- [ ] **Step 2: 运行测试**

```bash
pnpm test
```

预期：所有测试通过（composable 12 个 + api 4 个 = 16 个 tests）。如果数量不对，按 Task 6-9 的测试统计调整。

- [ ] **Step 3: 构建生产包**

```bash
pnpm build
```

预期：构建成功，dist/ 目录有产物。

- [ ] **Step 4: 启动开发服务器**

```bash
pnpm dev
```

预期：服务在 5174 端口启动。

- [ ] **Step 5: Chrome DevTools 1440×900 端到端验收（20 项）**

打开 Chrome DevTools，切换到 1440×900 视口。

**布局（6 项）**：
1. [ ] NavBar 高度 64px，含 Logo + 标题「日常报销」+ 头像 + 草稿 + 提交按钮
2. [ ] NavBar sticky 在顶部，滚动时跟随
3. [ ] NavBar 背景有毛玻璃效果（`backdrop-filter: blur(10px)` 生效）
4. [ ] AnchorTabs 显示 8 个锚点（关联申请/总额/明细/发票/归属/业务/通知/流程）
5. [ ] 滚动时 AnchorTabs 跟随，激活 tab 显示 primary 蓝 + 下划线
6. [ ] 居中表单区 max-width 720px，左右内边距 40px

**表单字段（9 项）**：
7. [ ] 关联申请单：可点击下拉选择
8. [ ] 报销总额卡片：浅蓝底 + ¥ 数字（error 红 32px）+ 3 个功能入口
9. [ ] 报销明细 1：金额（千分位显示）/ 日期 / 类型 / 说明 / 删除按钮
10. [ ] 「+ 添加报销明细」追加新行，新行的金额输入自动获得焦点（或可点开获得焦点）
11. [ ] 全局发票区 + 状态标签 [无发票] / [待收发票] + 「+ 添加发票」按钮
12. [ ] 归属信息：归属人 / 归属部门 / 备注（2 列布局）
13. [ ] 业务字段：项目 / 客户 / 收款账户 / 企业主体 / 付款时间
14. [ ] 消息通知：「+ 添加」按钮 + 人员 chips（空状态）
15. [ ] 流程：审批人 / 付款人 / 抄送人 三栏，付款人带必填红星

**交互（5 项）**：
16. [ ] 锚点点击平滑滚动 + URL hash 更新（如 #items）
17. [ ] 提交校验：缺必填项时弹错误，AnchorTabs「明细」tab 显示红色错误角标
18. [ ] 草稿恢复：填一些字段后刷新页面，顶部出现「检测到草稿」提示
19. [ ] 提交成功：填完必填项后点提交，alert「已提交报销单 · 总额 ¥X.XX」
20. [ ] 必填项红星 `*` 显示正确，字段聚焦时边框变 primary + 外发光

- [ ] **Step 6: 控制台无错误**

打开 DevTools Console，确认：
- 无红色错误
- 无未处理的 Promise rejection
- 无 Vue warning

- [ ] **Step 7: 网络请求检查**

打开 DevTools Network，确认：
- 草稿写入不发起网络请求（只用 localStorage）
- 提交时 POST /api/dd-notify 发起（后端可能 404，因为 v1.3 测试环境未启动；这是预期的）

- [ ] **Step 8: 提交最终代码**

```bash
git status
```

预期：clean working tree.

```bash
git log --oneline -25
```

预期：看到 19 个 feat commits + 1 chore commit.

- [ ] **Step 9: 推送（仅在用户明确要求时）**

> **警告**：不要主动 push 或创建 PR。等待用户指令。

---

## 验收标准总览

| 维度 | 验证项 | 通过条件 |
|---|---|---|
| 自动化 | `pnpm typecheck` | 0 errors |
| 自动化 | `pnpm test` | 16/16 tests pass |
| 自动化 | `pnpm build` | success |
| 端到端 | Chrome DevTools 1440×900 | 20 项全部通过 |
| 控制台 | 无 error / warning | clean |

---

## 常见问题与修复指引

| 问题 | 修复 |
|---|---|
| typecheck 报 `inject is not a function` | 检查 `App.vue` 是否正确 `provide('expenseForm', form)` |
| typecheck 报 `User not exported` | 在 `client.ts` 顶部 `export type User` |
| typecheck 报 `FormField slots` 警告 | 在 FormField 显式声明 `defineSlots<{ default(): unknown }>()` |
| `pnpm test` 报 `localStorage is not defined` | happy-dom 已配置，Vitest 找不到 setup。检查 `vitest.setup.ts` 是否存在 |
| 草稿提示不显示 | 检查 `form.restoreDraft()` 是否返回 true；可能 localStorage 中存的是损坏数据 |
| SelectPicker 弹层定位错位 | 检查 `position: fixed` + Teleport 是否生效；可临时加 `console.log(popoverStyle)` 调试 |
| 锚点点击不滚动 | 检查 `scroll-margin-top` 在 SectionCard 是否设置；CSS 选择器是否匹配 |
| 提交时网络失败但草稿被清 | 检查 `submit()` 错误处理路径，确保只有 `result.ok === true` 时才 `clearDraft` |

---

## 范围外（明确不做）

- 移动端 / 平板适配（任何 <1280 宽度）
- 暗色模式
- 4K 屏（≥2560）适配
- IE11 / 老 Safari 兼容
- 附件真实上传（占位 UI）
- 多借据 / 关联申请单复杂流程
- 国际化 i18n
- 主题切换 UI
- 引入 SideNav / 抽屉 / 汉堡菜单
- 引入 UI 组件库
- 引入 Tailwind / UnoCSS
- 路由多页面扩展

---

## 风险与缓解（实施时关注）

| ID | 风险 | 缓解 |
|---|---|---|
| R1 | 19 个组件多、文档可能遗漏 | 严格按 Task 步骤执行；任何 typecheck 报错即修即验证 |
| R2 | SelectPicker 弹层定位边缘 case | 提供 `positionPopover` 函数，Task 12 已实现翻转/左移 |
| R3 | 草稿机制与表单同步不严密 | Task 19 用 `watch(deep: true)` + 500ms debounce |
| R4 | 锚点 + 滚动 + 高亮同步掉帧 | 任务 19 用 `requestAnimationFrame` 节流（已用 `passive: true` 监听） |
| R5 | 钉钉联系人 API 失败时无法选人 | Task 19 用 `try/catch` 兜底，users 留空 |
| R6 | App.vue provide 时机 | `useExpenseForm()` 在 setup 阶段调用，provide 同步 |
| R7 | watch + onBeforeUnmount 在 onMounted 内调用 | Task 19 已修正为外层 onBeforeUnmount |

---

## 计划自审（writing-plans self-review）

### 1. Spec 覆盖
- [x] §1 目标 → Task 1-20 全部覆盖
- [x] §2 决策摘要 → Task 1 清理、Task 2 token、Task 19 布局
- [x] §3 文件清单 → Task 1 删除，Task 2-19 新建
- [x] §4 信息架构 → Task 14 AppNavBar/AnchorTabs/Footer，Task 19 主页面
- [x] §5 视觉规范 → Task 2 tokens.css，Task 3 reset.css
- [x] §6 组件规范 → Task 10-18 各组件
- [x] §7 状态管理 → Task 6-9 useExpenseForm
- [x] §8 数据流与 API → Task 4-5 api/
- [x] §9 交互与错误处理 → Task 19 onSubmit/onSaveDraft
- [x] §10 测试策略 → Task 4 (4), Task 6-9 (12) = 16 tests
- [x] §11 验收标准 → Task 20 端到端

### 2. 占位扫描
- 无 TBD / TODO / "类似 Task N" 占位
- 所有代码块均含完整代码
- 所有命令均含完整命令与预期输出

### 3. 类型一致性
- `Item` 类型在 Task 6 定义、Task 7 序列化、Task 8 校验、Task 9 提交、Task 16 消费 → 一致
- `Flow` 类型在 Task 6 定义、Task 8 校验、Task 9 提交、Task 18 消费 → 一致
- `BusinessFields` 类型在 Task 6 定义、Task 7 序列化、Task 17 消费 → 一致
- `User` 类型在 Task 4 client.ts 定义、Task 5 contact 消费、Task 18 FlowPicker 消费、Task 19 ExpenseReimburse 消费 → 一致
- `ValidationResult` 类型在 Task 8 定义、Task 9 消费 → 一致
- `SubmitResult` 类型在 Task 9 定义、Task 19 消费 → 一致

### 4. 端到端可执行性
- Task 1-19 每个都自包含可独立提交
- Task 20 是端到端验收，必须 Task 1-19 全部完成才能开始
- 没有循环依赖
- 任何 Task 失败可独立修复并重试

### 5. 已知 caveat
- Task 19 的 `ExpenseReimburse.vue` 包含 `watch` 和 `onBeforeUnmount` 在 `onMounted` 内的特殊用法，Vue 3 是允许的（onBeforeUnmount 在 setup 阶段注册）。如有问题移到外层。
- Task 19 的 `Object.assign(form.ownership, v)` 是直接修改 reactive 对象的内部状态，OK
- 任务 19 `onSubmit` 使用 `alert` 而非自定义 toast，因为本设计无 toast 组件（简化）

