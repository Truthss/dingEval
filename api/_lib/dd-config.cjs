// api/_lib/dd-config.cjs
module.exports = {
  corpId: process.env.DD_CORP_ID || '',
  agentId: process.env.DD_AGENT_ID || '',
  appKey: process.env.DD_APP_KEY || '',
  appSecret: process.env.DD_APP_SECRET || ''
}
