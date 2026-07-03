import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useDraftStorage } from '@/utils/draftStorage'
import type { ExpenseDraft } from '@/types/expense'

const STORAGE_KEY = 'dingeval:expense:draft'

const sampleDraft: ExpenseDraft = {
  version: 1,
  savedAt: 1700000000000,
  items: [
    {
      id: 'item-1',
      amount: 100,
      occurredAt: '2026-07-02',
      category: 'travel',
      description: 'taxi',
      invoiceStatus: 'none',
      attachmentCount: 0
    }
  ],
  relatedApplyId: null,
  remark: 'hello',
  project: 'walker-1',
  customer: 'walker',
  payeeAccount: 'icbc-001',
  entity: 'walker-cn',
  payAt: '2026-07-05',
  notifyChats: ['lina'],
  approver: 'zhangming',
  payer: 'wangfang',
  cc: ['liuhua'],
  invoiceStatus: 'pending',
  owner: '陆晓锋',
  department: '播阳测试部门'
}

describe('draftStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  it('returns null when no draft exists', () => {
    expect(useDraftStorage().load()).toBeNull()
  })

  it('saves and loads a draft', () => {
    useDraftStorage().save(sampleDraft)
    const loaded = useDraftStorage().load()
    expect(loaded).toEqual(sampleDraft)
    expect(localStorage.getItem(STORAGE_KEY)).toBeTruthy()
  })

  it('clears a draft', () => {
    useDraftStorage().save(sampleDraft)
    useDraftStorage().clear()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    expect(useDraftStorage().load()).toBeNull()
  })

  it('safely returns null when JSON is corrupt', () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json')
    expect(useDraftStorage().load()).toBeNull()
  })

  it('safely returns null when version mismatches', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 999, items: [] }))
    expect(useDraftStorage().load()).toBeNull()
  })

  it('safely returns null when required field missing', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1 }))
    expect(useDraftStorage().load()).toBeNull()
  })
})
