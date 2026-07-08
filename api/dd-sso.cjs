// api/dd-sso.cjs
const https = require('node:https')
const ddConfig = require('./_lib/dd-config.cjs')

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
