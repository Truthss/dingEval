// api/dd-jsapi-sign.cjs
const crypto = require('node:crypto')
const https = require('node:https')
const ddConfig = require('./_lib/dd-config.cjs')
const { getAccessToken } = require('./_lib/dd-token.cjs')

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
