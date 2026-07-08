import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

import './styles/base.css'
import './styles/reset.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// 钉钉免登：检测 URL 中是否有 code 参数
const code = new URL(location.href).searchParams.get('code')
if (code) {
  // 异步执行免登，不阻塞渲染
  import('./composables/useDingtalkAuth').then(({ useDingtalkAuth }) => {
    useDingtalkAuth().login(code).catch(console.warn)
  })
}

app.mount('#app')
