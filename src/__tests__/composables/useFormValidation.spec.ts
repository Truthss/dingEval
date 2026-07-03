import { describe, it, expect, beforeEach } from 'vitest'
import { ref, nextTick } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { useExpenseStore } from '@/stores/expense'
import { useFormValidation } from '@/composables/useFormValidation'
import { today, uid } from '@/utils/id'

describe('useFormValidation', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('returns ok=true when all required fields filled', () => {
    const store = useExpenseStore()
    store.items = [
      { id: uid(), amount: 100, occurredAt: today(), category: 'travel', description: '', invoiceStatus: 'none', attachmentCount: 0 }
    ]
    store.payer = 'wangfang'

    const refs = makeRefs()

    const { validate, errors } = useFormValidation({ refs, store })
    const result = validate()
    expect(result.ok).toBe(true)
    expect(errors.value).toEqual({})
  })

  it('flags missing amount', () => {
    const store = useExpenseStore()
    store.items = [
      { id: uid(), amount: null, occurredAt: today(), category: 'travel', description: '', invoiceStatus: 'none', attachmentCount: 0 }
    ]
    store.payer = 'wangfang'

    const refs = makeRefs()
    const { validate, errors } = useFormValidation({ refs, store })
    const result = validate()
    expect(result.ok).toBe(false)
    expect(errors.value['items.0.amount']).toContain('金额')
  })

  it('flags zero amount as invalid', () => {
    const store = useExpenseStore()
    store.items = [
      { id: uid(), amount: 0, occurredAt: today(), category: 'travel', description: '', invoiceStatus: 'none', attachmentCount: 0 }
    ]
    store.payer = 'wangfang'
    const refs = makeRefs()
    const { validate, errors } = useFormValidation({ refs, store })
    expect(validate().ok).toBe(false)
    expect(errors.value['items.0.amount']).toBeTruthy()
  })

  it('flags missing occurredAt', () => {
    const store = useExpenseStore()
    store.items = [
      { id: uid(), amount: 100, occurredAt: '', category: 'travel', description: '', invoiceStatus: 'none', attachmentCount: 0 }
    ]
    store.payer = 'wangfang'
    const refs = makeRefs()
    const { validate, errors } = useFormValidation({ refs, store })
    expect(validate().ok).toBe(false)
    expect(errors.value['items.0.occurredAt']).toContain('日期')
  })

  it('flags missing category', () => {
    const store = useExpenseStore()
    store.items = [
      { id: uid(), amount: 100, occurredAt: today(), category: null, description: '', invoiceStatus: 'none', attachmentCount: 0 }
    ]
    store.payer = 'wangfang'
    const refs = makeRefs()
    const { validate, errors } = useFormValidation({ refs, store })
    expect(validate().ok).toBe(false)
    expect(errors.value['items.0.category']).toContain('类型')
  })

  it('flags missing payer', () => {
    const store = useExpenseStore()
    store.items = [
      { id: uid(), amount: 100, occurredAt: today(), category: 'travel', description: '', invoiceStatus: 'none', attachmentCount: 0 }
    ]
    store.payer = null
    const refs = makeRefs()
    const { validate, errors } = useFormValidation({ refs, store })
    expect(validate().ok).toBe(false)
    expect(errors.value.payer).toContain('付款人')
  })

  it('returns firstErrorRef pointing to the failing field', () => {
    const store = useExpenseStore()
    store.items = [
      { id: uid(), amount: null, occurredAt: '', category: null, description: '', invoiceStatus: 'none', attachmentCount: 0 }
    ]
    store.payer = null

    const amountEl = document.createElement('div')
    const refs = {
      amountRefs: [ref<HTMLElement | null>(amountEl)],
      dateRefs: [ref<HTMLElement | null>(document.createElement('div'))],
      categoryRefs: [ref<HTMLElement | null>(document.createElement('div'))],
      payerRef: ref<HTMLElement | null>(document.createElement('div'))
    }

    const { validate } = useFormValidation({ refs, store })
    const result = validate()
    expect(result.ok).toBe(false)
    expect(result.firstErrorRef?.value).toBe(amountEl)
  })

  it('clearError removes one entry', async () => {
    const store = useExpenseStore()
    store.items = [
      { id: uid(), amount: null, occurredAt: today(), category: 'travel', description: '', invoiceStatus: 'none', attachmentCount: 0 }
    ]
    store.payer = 'wangfang'
    const refs = makeRefs()
    const { validate, errors, clearError } = useFormValidation({ refs, store })
    validate()
    expect(errors.value['items.0.amount']).toBeTruthy()
    clearError('items.0.amount')
    await nextTick()
    expect(errors.value['items.0.amount']).toBeUndefined()
  })
})

function makeRefs() {
  return {
    amountRefs: [ref<HTMLElement | null>(document.createElement('div'))],
    dateRefs: [ref<HTMLElement | null>(document.createElement('div'))],
    categoryRefs: [ref<HTMLElement | null>(document.createElement('div'))],
    payerRef: ref<HTMLElement | null>(document.createElement('div'))
  }
}
