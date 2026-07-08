// api/dd-sso.cjs
const https = require('node:https')
const ddConfig = require('./_lib/dd-config.cjs')
const { getAccessToken } = require('./_lib/dd-token.cjs')

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
    const { code } = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {})
    if (!code) {
      res.status(400).json({ errcode: -1, errmsg: 'Missing code' })
      return
    }

    const accessToken = await getAccessToken()
    const userBody = await httpsPost(
      `https://oapi.dingtalk.com/topapi/v2/user/getuserinfo?access_token=${accessToken}`,
      { code }
    )

    if (userBody.errcode !== 0) {
      res.status(500).json({ errcode: userBody.errcode, errmsg: userBody.errmsg })
      return
    }

    const user = userBody.result || {}

    res.setHeader('Set-Cookie', `dd_user=${user.userid}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`)
    res.status(200).json({
      userid: user.userid,
      name: user.name || '',
      corpId: ddConfig.corpId
    })
  } catch (err) {
    res.status(500).json({ errcode: -1, errmsg: err.message })
  }
}
