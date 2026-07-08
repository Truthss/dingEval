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
