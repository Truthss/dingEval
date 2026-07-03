# 钉钉「日常报销」页面复刻

基于 **Vue 3 + Vite + TypeScript** 的移动端 H5 页面，遵循 [`DESIGN.md`](./DESIGN.md) 中钉钉 dingtalk_common 主题的设计系统。

## 技术栈

- **构建工具**：Vite 6
- **框架**：Vue 3.5 + TypeScript 5.6
- **路由**：vue-router 4
- **状态管理**：Pinia 2
- **样式**：原生 CSS + CSS 变量（设计 token）+ postcss-px-to-viewport（移动端适配）
- **包管理**：pnpm

## 目录结构

```
.
├── DESIGN.md                # 钉钉设计系统源文档
├── prd.md                   # 复刻任务 PRD
├── index.html               # 入口 HTML
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── src/
    ├── main.ts              # 应用入口
    ├── App.vue
    ├── env.d.ts
    ├── router/
    │   └── index.ts
    ├── stores/
    │   └── expense.ts       # 报销数据 store
    ├── styles/
    │   ├── tokens.css       # 钉钉设计系统 token（CSS 变量）
    │   └── base.css         # 全局基础样式
    └── views/
        └── ExpenseReimburse.vue
```

## 开发命令

```bash
# 安装依赖
pnpm install

# 启动开发服务器（默认 5173 端口）
pnpm dev

# 类型检查 + 生产构建
pnpm build

# 仅类型检查
pnpm typecheck

# 本地预览生产构建
pnpm preview
```

## 设计 Token 使用方式

所有 token 在 `src/styles/tokens.css` 中以 CSS 变量形式声明，组件中直接引用：

```vue
<style scoped>
.demo {
  color: var(--color-primary);
  padding: var(--space-sm);
  border-radius: var(--radius-md);
  font-size: var(--font-size-body);
}
</style>
```

切换深色模式：

```html
<html data-theme="dark">
```

## 移动端适配

通过 `postcss-px-to-viewport` 自动将 `px` 转换为 `vw`（视口基准 `375px`），可直接按设计稿 `px` 数值编写样式。需保留 `px` 时，给元素加上 `.no-vw` 类即可豁免。

## 路由

| 路径 | 页面 |
| --- | --- |
| `/` | 重定向到 `/reimburse` |
| `/reimburse` | 日常报销（首页） |
