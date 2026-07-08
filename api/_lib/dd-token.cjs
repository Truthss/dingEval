// api/_lib/dd-token.cjs
const https = require('node:https')
const ddConfig = require('./dd-config.cjs')

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
