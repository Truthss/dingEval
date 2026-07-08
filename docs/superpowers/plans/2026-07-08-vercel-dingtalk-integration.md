# 钉钉工作台 H5 集成 — 实施计划

> **For agentic workers:** 使用 superpowers:subagent-driven-development 或 superpowers:executing-plans 按任务逐项实现。步骤使用 `- [ ]` 语法追踪进度。

**目标：** 将现有 dingEval（Vue 3 + Vite + TS）报销单流程接入钉钉工作台，实现免登进入、JSAPI 签名、流程结束发工作通知卡片，并部署到 Vercel。

**架构：** 前端保持纯静态（部署到 Vercel），新增 4 个 Vercel Serverless Functions（`api/` 目录）处理钉钉免登、JSAPI 签名、发工作通知。敏感密钥（SSOSecret、AppSecret）仅存在于 Vercel 环境变量中，前端不触及。

**Tech Stack：** Vue 3.5 / Vite 6 / TypeScript 5.6 / Vercel Serverless Functions (Node.js) / 钉钉开放平台 API

## 全局约束

- Node.js >= 20.19.0
- 所有 `api/` 文件使用 CommonJS（`module.exports`），因为 Vercel 自动识别为 Serverless Functions
- 环境变量通过 `process.env.*` 读取，仅暴露在服务端
- 前端钉钉相关逻辑统一封装到 `src/composables/` 和 `src/utils/` 中
- 提交信息使用 `feat(scope): message` 格式

---

## Task 0：目录与基础设施

**Files:**
- Create: `api/_lib/dd-config.js`
- Create: `api/_lib/dd-token.js`
- Modify: `.gitignore`（确保 `api/` 中没有敏感文件被提交）

**Interfaces:**
- Consumes: 无（基础模块）
- Produces: `ddConfig` 对象（corpId, agentId, appKey, appSecret, ssoSecret），`getAccessToken()` 函数

### Step 1: 创建 `api/_lib/dd-config.js`

从 Vercel 环境变量读取钉钉配置，提供统一凭证入口。

```js
// api/_lib/dd-config.js
module.exports = {
  corpId: process.env.DD_CORP_ID || '',
  agentId: process.env.DD_AGENT_ID || '',
  appKey: process.env.DD_APP_KEY || '',
  appSecret: process.env.DD_APP_SECRET || '',
  ssoSecret: process.env.DD_SSO_SECRET || ''
}
```

### Step 2: 创建 `api/_lib/dd-token.js`

企业 access_token 内存缓存（单实例复用，冷启动重新拉）。

```js
// api/_lib/dd-token.js
const https = require('node:https')
const ddConfig = require('./dd-config')

let cache = { token: null, expireAt: 0 }

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = ''
      res.on('data', (chunk) => (data += chunk))
      res.on('end', () => {
        try { resolve(JSON.parse(data)) } catch (e) { reject(e) }
      })
    }).on('error', reject)
  })
}

async function refreshToken() {
  const url = `https://oapi.dingtalk.com/gettoken?appkey=${ddConfig.appKey}&appsecret=${ddConfig.appSecret}`
  const body = await httpsGet(url)
  if (body.errcode !== 0) throw new Error(`钉钉 token 刷新失败: ${body.errmsg}`)
  cache.token = body.access_token
  cache.expireAt = Date.now() + body.expires_in * 1000 - 60000 // 提前 60s 过期
}

async function getAccessToken() {
  if (Date.now() < cache.expireAt && cache.token) return cache.token
  await refreshToken()
  return cache.token
}

module.exports = { getAccessToken }
```

### Step 3: 修改 `.gitignore`

确保 `.env` 等敏感文件不被提交：

```
# 追加到现有 .gitignore 末尾
# Vercel env
.env
.env.production
```

### Step 4: 验证

运行：`node -e "require('./api/_lib/dd-config'); console.log('dd-config loaded')"`（预期不报错）

运行：`node -e "require('./api/_lib/dd-token'); console.log('dd-token loaded')"`（预期不报错）

---

## Task 1：免登接口 `/api/dd-sso`

**Files:**
- Create: `api/dd-sso.js`

**Interfaces:**
- Consumes: `ddConfig` (from `_lib/dd-config.js`)
- Produces: `POST /api/dd-sso` → 接收 `{ code }`，返回 `{ userid, name }`

### Step 1: 创建 `api/dd-sso.js`

```js
// api/dd-sso.js
const https = require('node:https')
const ddConfig = require('./_lib/dd-config')

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = ''
      res.on('data', (chunk) => (data += chunk))
      res.on('end', () => {
        try { resolve(JSON.parse(data)) } catch (e) { reject(e) }
      })
    }).on('error', reject)
  })
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ errcode: -1, errmsg: 'Method Not Allowed' })
    return
  }

  try {
    const { code } = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {})

    if (!code) {
      res.status(400).json({ errcode: -1, errmsg: 'Missing code' })
      return
    }

    // 1. 用 SSOSecret 换 ssotoken
    const tokenUrl = `https://oapi.dingtalk.com/sso/gettoken?corpid=${ddConfig.corpId}&corpsecret=${ddConfig.ssoSecret}`
    const tokenBody = await httpsGet(tokenUrl)

    if (tokenBody.errcode !== 0) {
      res.status(500).json({ errcode: tokenBody.errcode, errmsg: tokenBody.errmsg })
      return
    }

    const ssotoken = tokenBody.access_token

    // 2. 用 ssotoken + code 换 userid
    const userUrl = `https://oapi.dingtalk.com/sso/getuserinfo?access_token=${ssotoken}&code=${code}`
    const userBody = await httpsGet(userUrl)

    if (userBody.errcode !== 0) {
      res.status(500).json({ errcode: userBody.errcode, errmsg: userBody.errmsg })
      return
    }

    // 3. 设置 Cookie（可选，简化实现直接返回 userid）
    res.setHeader('Set-Cookie', `dd_user=${userBody.userid}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`)

    res.status(200).json({
      userid: userBody.userid,
      name: userBody.name || '',
      corpId: ddConfig.corpId
    })
  } catch (err) {
    res.status(500).json({ errcode: -1, errmsg: err.message })
  }
}
```

### Step 2: 本地验证语法

运行：`node -c api/dd-sso.js`（预期无错误输出）

---

## Task 2：JSAPI 签名接口 `/api/dd-jsapi-sign`

**Files:**
- Create: `api/dd-jsapi-sign.js`

**Interfaces:**
- Consumes: `ddConfig` (from `_lib/dd-config.js`)，`getAccessToken()` (from `_lib/dd-token.js`)
- Produces: `POST /api/dd-jsapi-sign` → 接收 `{ url }`，返回 `{ agentId, corpId, timeStamp, nonceStr, signature }`

### Step 1: 创建 `api/dd-jsapi-sign.js`

```js
// api/dd-jsapi-sign.js
const crypto = require('node:crypto')
const https = require('node:https')
const ddConfig = require('./_lib/dd-config')
const { getAccessToken } = require('./_lib/dd-token')

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = ''
      res.on('data', (chunk) => (data += chunk))
      res.on('end', () => {
        try { resolve(JSON.parse(data)) } catch (e) { reject(e) }
      })
    }).on('error', reject)
  })
}

function sha256(content) {
  return crypto.createHash('sha256').update(content).digest('hex')
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ errcode: -1, errmsg: 'Method Not Allowed' })
    return
  }

  try {
    const { url } = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {})

    if (!url) {
      res.status(400).json({ errcode: -1, errmsg: 'Missing url' })
      return
    }

    const accessToken = await getAccessToken()
    const ticketBody = await httpsGet(`https://oapi.dingtalk.com/get_jsapi_ticket?access_token=${accessToken}&type=jsapi`)

    if (ticketBody.errcode !== 0) {
      res.status(500).json({ errcode: ticketBody.errcode, errmsg: ticketBody.errmsg })
      return
    }

    const ticket = ticketBody.ticket
    const timeStamp = Date.now()
    const nonceStr = crypto.randomBytes(8).toString('hex')
    const plain = `jsapi_ticket=${ticket}&noncestr=${nonceStr}&timestamp=${timeStamp}&url=${url}`
    const signature = sha256(plain)

    res.status(200).json({
      agentId: ddConfig.agentId,
      corpId: ddConfig.corpId,
      timeStamp: String(timeStamp),
      nonceStr,
      signature
    })
  } catch (err) {
    res.status(500).json({ errcode: -1, errmsg: err.message })
  }
}
```

### Step 2: 验证语法

运行：`node -c api/dd-jsapi-sign.js`（预期无错误输出）

---

## Task 3：工作通知接口 `/api/dd-notify`

**Files:**
- Create: `api/dd-notify.js`

**Interfaces:**
- Consumes: `getAccessToken()` (from `_lib/dd-token.js`)
- Produces: `POST /api/dd-notify` → 接收 `{ useridList, title, content, jumpUrl }`，返回 `{ taskId }`

### Step 1: 创建 `api/dd-notify.js`

```js
// api/dd-notify.js
const https = require('node:https')
const { getAccessToken } = require('./_lib/dd-token')

function httpsPost(url, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data)
    const urlObj = new URL(url)
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }
    const req = https.request(options, (res) => {
      let resp = ''
      res.on('data', (chunk) => (resp += chunk))
      res.on('end', () => {
        try { resolve(JSON.parse(resp)) } catch (e) { reject(e) }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ errcode: -1, errmsg: 'Method Not Allowed' })
    return
  }

  try {
    const { useridList, title, content, jumpUrl } =
      typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {})

    if (!useridList || !useridList.length || !title || !content) {
      res.status(400).json({ errcode: -1, errmsg: 'Missing required fields: useridList, title, content' })
      return
    }

    const accessToken = await getAccessToken()

    const msgBody = {
      agent_id: process.env.DD_AGENT_ID,
      userid_list: useridList.join(','),
      msg: {
        msgtype: 'action_card',
        action_card: {
          title,
          markdown: content,
          btn_orientation: '1',
          btn_json_list: [{
            title: '查看详情',
            action_url: jumpUrl || ''
          }]
        }
      }
    }

    const result = await httpsPost(
      `https://oapi.dingtalk.com/topapi/message/corpconversation/asyncsend_v2?access_token=${accessToken}`,
      msgBody
    )

    if (result.errcode !== 0) {
      res.status(500).json({ errcode: result.errcode, errmsg: result.errmsg })
      return
    }

    res.status(200).json({ taskId: result.task_id })
  } catch (err) {
    res.status(500).json({ errcode: -1, errmsg: err.message })
  }
}
```

### Step 2: 验证语法

运行：`node -c api/dd-notify.js`（预期无错误输出）

---

## Task 4：Vercel 配置文件

**Files:**
- Create: `vercel.json`

### Step 1: 创建 `vercel.json`

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" }
  ],
  "buildCommand": "vite build",
  "outputDirectory": "dist",
  "installCommand": "pnpm install"
}
```

### Step 2: 验证

运行：`node -e "const v = require('./vercel.json'); console.log(JSON.stringify(v))"`（预期打印 JSON）

---

## Task 5：前端 — 钉钉 SSO 免登集成

**Files:**
- Create: `src/composables/useDingtalkAuth.ts`
- Modify: `src/router/index.ts`（新增路由守卫）
- Modify: `src/main.ts`（挂载时触发免登）

**Interfaces:**
- Consumes: 无
- Produces: `useDingtalkAuth` composable 暴露 `{ userid, isLoggedIn, login }`

### Step 1: 创建 `src/composables/useDingtalkAuth.ts`

```ts
import { ref } from 'vue'

const userid = ref<string | null>(null)
const isLoggedIn = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)

export function useDingtalkAuth() {
  async function login(code: string) {
    loading.value = true
    error.value = null
    try {
      const res = await fetch('/api/dd-sso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })
      const data = await res.json()
      if (data.errcode) {
        throw new Error(data.errmsg || '免登失败')
      }
      userid.value = data.userid
      isLoggedIn.value = true
      return data
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '免登失败'
      error.value = msg
      throw e
    } finally {
      loading.value = false
    }
  }

  return { userid, isLoggedIn, loading, error, login }
}
```

### Step 2: 修改 `src/main.ts` — 启动时检测免登 code

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

// 钉钉免登：检测 URL 中是否有 code 参数
const code = new URL(location.href).searchParams.get('code')
if (code) {
  // 异步执行免登，不阻塞渲染
  import('./composables/useDingtalkAuth').then(({ useDingtalkAuth }) => {
    useDingtalkAuth().login(code).catch(console.warn)
  })
}

app.mount('#app')
```

### Step 3: 验证

运行：`pnpm typecheck`（预期通过，无类型错误）

---

## Task 6：前端 — 提交后发工作通知

**Files:**
- Modify: `src/views/ExpenseReimburse.vue`

### Step 1: 修改 `handleSubmit`，在成功提交后发送工作通知

在 `handleSubmit` 内的 `if (result.ok)` 分支中，在 toast 之后添加发通知逻辑：

找到 `src/views/ExpenseReimburse.vue:96-100`：

```ts
  if (result.ok) {
    toast.show({
      message: `已提交报销单 · 总额 ¥${expense.totalAmount.toFixed(2)}`,
      type: 'success'
    })
    expense.clearDraft()
```

修改为：

```ts
  if (result.ok) {
    toast.show({
      message: `已提交报销单 · 总额 ¥${expense.totalAmount.toFixed(2)}`,
      type: 'success'
    })
    // 发钉钉工作通知
    if (expense.approver || expense.payer) {
      const notifyUserIds: string[] = []
      if (expense.approver) notifyUserIds.push(expense.approver)
      if (expense.payer) notifyUserIds.push(expense.payer)
      expense.cc.forEach((uid) => { if (uid) notifyUserIds.push(uid) })

      fetch('/api/dd-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          useridList: notifyUserIds,
          title: '报销单已提交',
          content: `**${expense.owner}** 提交了日常报销单，金额 **¥${expense.totalAmount.toFixed(2)}**`,
          jumpUrl: location.origin + location.pathname
        })
      }).catch(() => {
        // 通知发送失败不影响提单结果
      })
    }
    expense.clearDraft()
```

### Step 2: 验证

运行：`pnpm typecheck`（预期通过）

---

## Task 7：前端 — JSAPI dd.config 初始化（可选增强）

**Files:**
- Create: `src/composables/useDingtalkJsapi.ts`
- Modify: `src/main.ts`（调用 dd.config）

### Step 1: 创建 `src/composables/useDingtalkJsapi.ts`

```ts
declare const dd: {
  config: (config: {
    agentId: string
    corpId: string
    timeStamp: string
    nonceStr: string
    signature: string
    jsApiList: string[]
  }) => void
  error: (fn: (err: { errorMessage: string }) => void) => void
} | undefined

export async function configDingtalkJsapi(): Promise<void> {
  if (typeof dd === 'undefined') return

  try {
    const res = await fetch('/api/dd-jsapi-sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: location.href.split('#')[0] })
    })
    const config = await res.json()
    if (config.errcode) {
      console.warn('dd.config 签名获取失败:', config.errmsg)
      return
    }

    dd.config({
      agentId: config.agentId,
      corpId: config.corpId,
      timeStamp: config.timeStamp,
      nonceStr: config.nonceStr,
      signature: config.signature,
      jsApiList: [
        'biz.navigation.open',
        'biz.util.openLink'
      ]
    })

    dd.error((err) => {
      console.warn('dd.config 失败:', err.errorMessage)
    })
  } catch (e) {
    console.warn('dd.config 初始化失败:', e)
  }
}
```

### Step 2: 修改 `src/main.ts`，在免登成功后调用

在免登代码之后追加：

```ts
// 钉钉免登
const code = new URL(location.href).searchParams.get('code')
if (code) {
  import('./composables/useDingtalkAuth').then(({ useDingtalkAuth }) => {
    useDingtalkAuth().login(code).catch(console.warn)
  })
}

// JSAPI 配置（无论是否免登都能做）
import('./composables/useDingtalkJsapi').then(({ configDingtalkJsapi }) => {
  configDingtalkJsapi()
})
```

### Step 3: 类型声明

修改 `src/env.d.ts` 追加 dd 全局类型：

```ts
declare const dd: {
  config: (config: {
    agentId: string
    corpId: string
    timeStamp: string
    nonceStr: string
    signature: string
    jsApiList: string[]
  }) => void
  error: (fn: (err: { errorMessage: string }) => void) => void
  ready: (fn: () => void) => void
} | undefined
```

### Step 4: 验证

运行：`pnpm typecheck`（预期通过）

---

## Task 8：端到端验证清单

此任务不涉及代码更改，仅提供验证步骤。

### 前置条件

在钉钉开放平台完成以下配置（一次性操作）：

1. 创建企业内部 H5 微应用
2. 设置应用首页地址：`https://<你的项目>.vercel.app/`
3. OAuth 2.0 回调域名：`<你的项目>.vercel.app`
4. 权限管理勾选：`ssoLogin`、`Contact.User.Read`、`企业消息`
5. 保存 AppKey / AppSecret / SSOSecret
6. 发布应用

### Vercel 环境变量设置

| Key | 值 |
|---|---|
| `DD_CORP_ID` | 企业 CorpID |
| `DD_AGENT_ID` | 应用的 AgentID |
| `DD_APP_KEY` | 应用的 AppKey |
| `DD_APP_SECRET` | 应用的 AppSecret |
| `DD_SSO_SECRET` | 应用的 SSOSecret |

### 本地验证

1. `pnpm build` 构建通过
2. `pnpm typecheck` 类型检查通过
3. 检查 `dist/` 目录生成正确

### 部署后验证

1. 打开钉钉工作台 → 找到应用 → 点击进入
2. 页面正常加载，URL 中自动带 `code` 参数
3. 浏览器 DevTools → Network → 看到 `/api/dd-sso` 请求成功
4. 填写报销单 → 提交 → 审批人/付款人收到工作通知卡片
