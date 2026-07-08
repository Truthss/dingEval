# 钉钉工作台 H5 + 免登 + 工作通知 —— 部署到 Vercel

> 项目：dingEval（Vue 3 + Vite + TS 复刻"日常报销"）
> 目标：把现有报销单流程接入钉钉工作台，实现免登进入、流程结束发工作通知卡片
> 部署：Vercel

---

## 一、需求拆解

| # | 任务 | 实现位置 |
|---|---|---|
| 1 | 报销单流程页面（已存在） | 纯前端 `src/` |
| 2 | 工作台免登进入应用 | `/api/dd-sso`（Vercel Function） |
| 3 | 流程结束发工作通知卡片 | `/api/dd-notify`（Vercel Function） |

> **为什么必须有后端**：免登需要 `SSOSecret`、发通知需要 `AppSecret`，密钥不能放浏览器。Vercel Serverless Functions 提供轻量后端，与前端同仓库、零运维。

---

## 二、最终目录结构

```
dingEval/
├─ api/                          # Vercel 自动识别为 Serverless Functions
│  ├─ _lib/
│  │  ├─ dd-config.js            # 共享凭证（读 Vercel Env）
│  │  └─ dd-token.js             # 企业 access_token 缓存
│  ├─ dd-sso.js                  # 免登：code → userid
│  ├─ dd-jsapi-sign.js           # dd.config 签名
│  └─ dd-notify.js               # 发工作通知 action_card
├─ src/                          # 现有 Vue 3 前端
├─ vercel.json                   # 路由/build 配置
├─ vite.config.ts
└─ package.json
```

---

## 三、四个 API 函数（要点）

### `api/dd-sso.js`（核心：免登）
```
POST /api/dd-sso   { code }
  └─ 1. GET oapi/sso/gettoken?corpid&corpsecret=SSOSecret  → ssotoken
  └─ 2. GET oapi/sso/getuserinfo?access_token=ssotoken&code → userid
  └─ 返回 { userid }，同时 Set-Cookie: dd_user=...
```

### `api/dd-notify.js`（发工作通知）
```
POST /api/dd-notify
  { useridList: [..], title, content, jumpUrl }
  └─ 用企业 access_token 调 topapi/message/corpconversation/asyncsend_v2
  └─ msgtype: action_card（带 single_title / single_link_url）
```

### `api/dd-jsapi-sign.js`（dd.config 签名）
```
POST /api/dd-jsapi-sign   { url }
  └─ 用 oapi/get_jsapi_ticket + sha256 算 signature
  └─ 返回 { agentId, corpId, timeStamp, nonceStr, signature }
```

### `api/_lib/dd-token.js`（access_token 缓存）
- 内存缓存 `{ token, expireAt }`
- 提前 60s 过期自动重拉
- Vercel 同一实例复用内存，冷启动重新拉

---

## 四、Vercel 环境变量

在 Vercel Project → Settings → Environment Variables 配置：

| Key | 来源 |
|---|---|
| `DD_CORP_ID` | 企业 CorpID |
| `DD_AGENT_ID` | 应用的 AgentID |
| `DD_APP_KEY` | 应用的 AppKey |
| `DD_APP_SECRET` | 应用的 AppSecret（普通应用凭证） |
| `DD_SSO_SECRET` | 应用的 **SSOSecret**（免登专用，与 AppSecret 不同） |
| `DD_ROBOT_CODE` | 可选，发通知用企业机器人时填 |

> 全部 secret 仅出现在 Vercel 后端运行时，前端 bundle 里搜不到。

---

## 五、钉钉开放平台配置清单（一次性）

1. 创建应用 → 类型选 **企业内部 H5 微应用**
2. **应用信息**
   - 应用首页地址：`https://dingeval-xxx.vercel.app/`
3. **安全设置**
   - OAuth 2.0 回调域名：`dingeval-xxx.vercel.app`
   - 业务/登录域名：同上
4. **权限管理** 勾选
   - `ssoLogin`（免登）
   - `Contact.User.Read`（读用户详情）
   - `企业消息`（发工作通知）
5. **凭证管理** 复制 `AppKey / AppSecret / SSOSecret` → 填到 Vercel Env
6. **版本管理与发布** → 创建版本 → 发布
7. 钉钉工作台下拉刷新，看到应用入口

---

## 六、vercel.json

```json
{
  "rewrites": [{ "source": "/api/(.*)", "destination": "/api/$1" }],
  "buildCommand": "vite build",
  "outputDirectory": "dist"
}
```

---

## 七、前端关键调用

### 报销单提交时，发工作通知
```ts
await fetch('/api/dd-notify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    useridList: ['审批人userid', '抄送人userid'],
    title: '报销单已提交',
    content: '**陆晓锋** 提交了日常报销单，金额 **¥1,280.00**',
    jumpUrl: `${location.origin}/detail/${formId}`,
  }),
})
```

### 工作台进入时，免登
```ts
const code = new URL(location.href).searchParams.get('code')
if (code) {
  const r = await fetch('/api/dd-sso', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  }).then(r => r.json())
  // r.userid → 业务登录
}
```

---

## 八、关键安全准则

| 准则 | 说明 |
|---|---|
| `SSOSecret` ≠ `AppSecret` | 两套密钥、两个用途，不能混用 |
| `ssotoken` ≠ `access_token` | ssotoken 只给 `sso/*` 用；通讯录/消息用企业 `access_token` |
| `code` 一次性、5 分钟有效 | 前端拿到立即转发给后端，**不要重试** |
| `access_token` 缓存 | 服务端缓存 7200s，到期前 60s 刷新 |
| 域名白名单 | Vercel 域名必须填到 OAuth 回调 + 业务域名 |

---

## 九、实施步骤

- [ ] 1. 钉钉开放平台创建企业内部 H5 微应用，配首页/域名/权限
- [ ] 2. Vercel 创建项目，绑定仓库
- [ ] 3. 配置 Vercel 环境变量（6 个）
- [ ] 4. 添加 `vercel.json`
- [ ] 5. 写 `api/_lib/dd-config.js`、`api/_lib/dd-token.js`
- [ ] 6. 写 `api/dd-sso.js`（先打通免登）
- [ ] 7. 前端改造：进入页面时 `POST /api/dd-sso` 换 userid
- [ ] 8. 写 `api/dd-notify.js`
- [ ] 9. 报销单提交时 `POST /api/dd-notify` 发卡片
- [ ] 10. 写 `api/dd-jsapi-sign.js`（可选，做 dd.config 沉浸式）
- [ ] 11. 端到端联调：工作台 → 免登 → 提单 → 收卡片通知
