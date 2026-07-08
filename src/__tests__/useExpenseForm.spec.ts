// src/__tests__/useExpenseForm.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useExpenseForm } from '@/composables/useExpenseForm'

describe('useExpenseForm - items', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('initializes with one empty item', () => {
    const form = useExpenseForm()
    expect(form.items.value.length).toBe(1)
    expect(form.items.value[0]).toMatchObject({
      amount: null,
      occurredAt: null,
      category: null,
      description: '',
      invoiceIds: [],
      attachmentIds: []
    })
  })

  it('addItem appends a new item with unique id', () => {
    const form = useExpenseForm()
    const before = form.items.value.length
    form.addItem()
    expect(form.items.value.length).toBe(before + 1)
    const ids = form.items.value.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('removeItem removes by id', () => {
    const form = useExpenseForm()
    form.addItem()
    const target = form.items.value[1]
    form.removeItem(target.id)
    expect(form.items.value.length).toBe(1)
    expect(form.items.value.find((i) => i.id === target.id)).toBeUndefined()
  })

  it('updateItem patches fields', () => {
    const form = useExpenseForm()
    const id = form.items.value[0].id
    form.updateItem(id, { amount: 200, category: 'transport' })
    expect(form.items.value[0].amount).toBe(200)
    expect(form.items.value[0].category).toBe('transport')
  })
})

describe('useExpenseForm - validation', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('validate fails when amount missing', () => {
    const form = useExpenseForm()
    const result = form.validate()
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors[0]?.amount).toBeTruthy()
      expect(result.payerMissing).toBe(true)
    }
  })

  it('validate fails when payer missing', () => {
    const form = useExpenseForm()
    form.updateItem(form.items.value[0].id, { amount: 100, occurredAt: '2026-07-08', category: 'transport' })
    const result = form.validate()
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.payerMissing).toBe(true)
  })

  it('validate succeeds when all required fields present', () => {
    const form = useExpenseForm()
    form.updateItem(form.items.value[0].id, { amount: 100, occurredAt: '2026-07-08', category: 'transport' })
    form.flow.payerId = 'u-payer'
    const result = form.validate()
    expect(result.ok).toBe(true)
  })

  it('totalAmount sums item amounts', () => {
    const form = useExpenseForm()
    form.updateItem(form.items.value[0].id, { amount: 100 })
    form.addItem()
    form.updateItem(form.items.value[1].id, { amount: 50.5 })
    expect(form.totalAmount.value).toBe(150.5)
  })
})
describe('useExpenseForm - draft', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('saveDraft + restoreDraft roundtrip preserves state', () => {
    const form = useExpenseForm()
    form.relatedApplyId.value = 'apply-1'
    form.updateItem(form.items.value[0].id, { amount: 200, category: 'transport' })
    form.flow.payerId = 'u-payer'
    form.saveDraft()
    expect(localStorage.getItem('dingeval-expense-draft')).not.toBeNull()
    const form2 = useExpenseForm()
    const restored = form2.restoreDraft()
    expect(restored).toBe(true)
    expect(form2.relatedApplyId.value).toBe('apply-1')
    expect(form2.items.value[0].amount).toBe(200)
    expect(form2.items.value[0].category).toBe('transport')
    expect(form2.flow.payerId).toBe('u-payer')
  })

  it('restoreDraft returns false when no draft exists', () => {
    const form = useExpenseForm()
    expect(form.restoreDraft()).toBe(false)
    expect(form.items.value[0].amount).toBeNull()
  })
})

import { ddNotify } from '@/api/client'

vi.mock('@/api/client', () => ({
  ddNotify: vi.fn()
}))

describe('useExpenseForm - submit', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.mocked(ddNotify).mockReset()
  })

  it('submit succeeds: calls ddNotify and clears draft', async () => {
    const form = useExpenseForm()
    form.updateItem(form.items.value[0].id, { amount: 200, occurredAt: '2026-07-08', category: 'transport' })
    form.flow.payerId = 'u-payer'

    vi.mocked(ddNotify).mockResolvedValueOnce()

    const result = await form.submit()
    expect(result).toEqual({ ok: true })
    expect(ddNotify).toHaveBeenCalledWith(expect.objectContaining({
      title: '报销单已提交',
      content: expect.stringContaining('¥200.00')
    }))
    expect(localStorage.getItem('dingeval-expense-draft')).toBeNull()
  })

  it('submit fails: keeps draft on network error', async () => {
    const form = useExpenseForm()
    form.updateItem(form.items.value[0].id, { amount: 200, occurredAt: '2026-07-08', category: 'transport' })
    form.flow.payerId = 'u-payer'
    form.saveDraft()

    vi.mocked(ddNotify).mockRejectedValueOnce(new Error('network'))

    const result = await form.submit()
    expect(result.ok).toBe(false)
    expect(localStorage.getItem('dingeval-expense-draft')).not.toBeNull()
  })
})
