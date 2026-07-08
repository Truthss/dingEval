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
