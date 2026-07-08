/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

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
