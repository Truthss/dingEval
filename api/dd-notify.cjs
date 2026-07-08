// api/dd-notify.cjs
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
    const { useridList, title, content, jumpUrl } =
      typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {})
    if (!useridList || !useridList.length || !title || !content) {
      res.status(400).json({ errcode: -1, errmsg: 'Missing required fields: useridList, title, content' })
      return
    }
    const accessToken = await getAccessToken()
    const msgBody = {
      agent_id: ddConfig.agentId,
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
