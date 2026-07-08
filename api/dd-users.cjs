// api/dd-users.cjs
const https = require('node:https')
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
  if (req.method !== 'GET') {
    res.status(405).json({ errcode: -1, errmsg: 'Method Not Allowed' })
    return
  }
  try {
    const accessToken = await getAccessToken()
    const result = await httpsPost(
      `https://oapi.dingtalk.com/topapi/v2/user/list?access_token=${accessToken}`,
      { dept_id: 1, cursor: 0, size: 100, fetch_child: true }
    )
    if (result.errcode !== 0) {
      res.status(500).json({ errcode: result.errcode, errmsg: result.errmsg })
      return
    }
    const users = (result.result && Array.isArray(result.result.list))
      ? result.result.list.map((u) => ({
          userid: u.userid,
          name: u.name,
          title: u.title || ''
        }))
      : []
    res.status(200).json({ errcode: 0, users })
  } catch (err) {
    res.status(500).json({ errcode: -1, errmsg: err.message })
  }
}
