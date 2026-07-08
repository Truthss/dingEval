import { ref } from 'vue'
import type { PersonOption } from '@/types/expense'
import { persons as mockPersons } from '@/mocks/persons'

const users = ref<PersonOption[]>(mockPersons)
const loaded = ref(false)

export function useContactList() {
  async function load() {
    if (loaded.value) return
    try {
      const res = await fetch('/api/dd-users')
      const data = await res.json()
      if (!data.errcode && Array.isArray(data.users) && data.users.length > 0) {
        users.value = data.users.map((u: { userid: string; name: string; title?: string }) => ({
          value: u.userid,
          label: u.name,
          title: u.title || ''
        }))
      }
    } catch {
      // 静默回退到 mock 数据
    }
    loaded.value = true
  }

  function findPersonDisplay(value: string | null): string {
    if (!value) return ''
    const p = users.value.find((u) => u.value === value)
    return p ? `${p.label} · ${p.title}` : ''
  }

  return { users, loaded, load, findPersonDisplay }
}
