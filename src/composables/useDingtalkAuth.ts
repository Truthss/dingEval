import { ref } from 'vue'

const userid = ref<string | null>(null)
const isLoggedIn = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)

export function useDingtalkAuth() {
  async function login(code: string) {
    loading.value = true
    error.value = null

    try {
      const res = await fetch('/api/dd-sso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })
      const data = await res.json()

      if (data.errcode) {
        throw new Error(data.errmsg || '免登失败')
      }

      userid.value = data.userid
      isLoggedIn.value = true
      return data
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '免登失败'
      error.value = msg
      throw e
    } finally {
      loading.value = false
    }
  }

  return { userid, isLoggedIn, loading, error, login }
}
