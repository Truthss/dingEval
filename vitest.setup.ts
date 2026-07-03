import { vi, beforeEach } from 'vitest'

const memory = new Map<string, string>()

const memoryStorage = {
  get length() {
    return memory.size
  },
  clear() {
    memory.clear()
  },
  getItem(key: string): string | null {
    return memory.has(key) ? (memory.get(key) as string) : null
  },
  key(index: number): string | null {
    return Array.from(memory.keys())[index] ?? null
  },
  removeItem(key: string) {
    memory.delete(key)
  },
  setItem(key: string, value: string) {
    memory.set(key, String(value))
  }
}

const w = globalThis as unknown as { localStorage?: Storage; window?: { localStorage?: Storage } }
if (!w.localStorage) {
  w.localStorage = memoryStorage as unknown as Storage
}
if (w.window && !w.window.localStorage) {
  w.window.localStorage = memoryStorage as unknown as Storage
}

beforeEach(() => {
  memory.clear()
})

vi.stubGlobal('localStorage', memoryStorage)
