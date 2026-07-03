import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useExpenseStore } from '@/stores/expense'
import { today, uid } from '@/utils/id'

describe('useExpenseStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  it('starts with exactly one default item', () => {
    const store = useExpenseStore()
    expect(store.items).toHaveLength(1)
    expect(store.items[0].amount).toBeNull()
    expect(store.items[0].occurredAt).toBe(today())
    expect(store.items[0].invoiceStatus).toBe('none')
  })

  it('addItem appends a new empty item', () => {
    const store = useExpenseStore()
    store.addItem()
    expect(store.items).toHaveLength(2)
    expect(store.items[1].id).toBeTruthy()
    expect(store.items[1].amount).toBeNull()
  })

  it('removeItem removes the item by id', () => {
    const store = useExpenseStore()
    store.addItem()
    const targetId = store.items[1].id
    store.removeItem(targetId)
    expect(store.items).toHaveLength(1)
    expect(store.items[0].id).not.toBe(targetId)
  })

  it('removeItem on the last item is a no-op', () => {
    const store = useExpenseStore()
    const onlyId = store.items[0].id
    store.removeItem(onlyId)
    expect(store.items).toHaveLength(1)
  })

  it('totalAmount sums valid amounts', () => {
    const store = useExpenseStore()
    store.items = [
      { id: uid(), amount: 100, occurredAt: today(), category: 'travel', description: '', invoiceStatus: 'none', attachmentCount: 0 },
      { id: uid(), amount: 50.5, occurredAt: today(), category: 'meal', description: '', invoiceStatus: 'none', attachmentCount: 0 },
      { id: uid(), amount: null, occurredAt: today(), category: null, description: '', invoiceStatus: 'none', attachmentCount: 0 }
    ]
    expect(store.totalAmount).toBe(150.5)
  })

  it('hasAnyAmount is false when all amounts are 0 / null', () => {
    const store = useExpenseStore()
    expect(store.hasAnyAmount).toBe(false)
    store.items[0].amount = 0
    expect(store.hasAnyAmount).toBe(false)
  })

  it('hasAnyAmount is true when at least one amount > 0', () => {
    const store = useExpenseStore()
    store.items[0].amount = 1
    expect(store.hasAnyAmount).toBe(true)
  })

  it('isValid requires both amount and payer', () => {
    const store = useExpenseStore()
    expect(store.isValid).toBe(false)
    store.items[0].amount = 100
    expect(store.isValid).toBe(false)
    store.payer = 'wangfang'
    expect(store.isValid).toBe(true)
  })

  it('toDraft round-trips via restoreFromDraft', () => {
    const store = useExpenseStore()
    store.items = [
      { id: 'a', amount: 10, occurredAt: '2026-07-01', category: 'travel', description: 'x', invoiceStatus: 'pending', attachmentCount: 0 }
    ]
    store.relatedApplyId = 'app-1'
    store.remark = 'r'
    store.project = 'walker-1'
    store.customer = 'walker'
    store.payeeAccount = 'icbc-001'
    store.entity = 'walker-cn'
    store.payAt = '2026-07-05'
    store.notifyChats = ['lina']
    store.approver = 'zhangming'
    store.payer = 'wangfang'
    store.cc = ['liuhua']
    store.invoiceStatus = 'pending'

    const draft = store.toDraft()
    expect(draft.version).toBe(1)
    expect(draft.items[0].id).toBe('a')
    expect(draft.payer).toBe('wangfang')

    const fresh = useExpenseStore()
    expect(fresh.items[0].description).not.toBe('x')
    fresh.restoreFromDraft(draft)
    expect(fresh.items[0].description).toBe('x')
    expect(fresh.payer).toBe('wangfang')
    expect(fresh.notifyChats).toEqual(['lina'])
  })

  it('clearDraft resets state and clears localStorage', () => {
    const store = useExpenseStore()
    store.items[0].amount = 100
    store.payer = 'wangfang'
    localStorage.setItem('dingeval:expense:draft', '{"version":1,"items":[],"savedAt":0}')

    store.clearDraft()

    expect(store.items[0].amount).toBeNull()
    expect(store.payer).toBeNull()
    expect(localStorage.getItem('dingeval:expense:draft')).toBeNull()
  })
})
