import type { ExpenseDraft } from '@/types/expense'

const STORAGE_KEY = 'dingeval:expense:draft'

function isValidDraft(value: unknown): value is ExpenseDraft {
  if (!value || typeof value !== 'object') return false
  const d = value as Partial<ExpenseDraft>
  return (
    d.version === 1 &&
    typeof d.savedAt === 'number' &&
    Array.isArray(d.items) &&
    Array.isArray(d.notifyChats) &&
    Array.isArray(d.cc)
  )
}

function draftStorage() {
  return {
    save(draft: ExpenseDraft): void {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
      } catch (err) {
        console.warn('[draftStorage] save failed', err)
      }
    },
    load(): ExpenseDraft | null {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return null
        const parsed: unknown = JSON.parse(raw)
        return isValidDraft(parsed) ? parsed : null
      } catch (err) {
        console.warn('[draftStorage] load failed', err)
        return null
      }
    },
    clear(): void {
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch (err) {
        console.warn('[draftStorage] clear failed', err)
      }
    }
  }
}

export function useDraftStorage() {
  return draftStorage()
}
