// src/composables/useExpenseForm.ts
import { ref, reactive, computed, type Ref, type ComputedRef } from 'vue'
import { ddNotify } from '@/api/client'

const DRAFT_KEY = 'dingeval-expense-draft'

export type Item = {
  id: string
  amount: number | null
  occurredAt: string | null
  category: string | null
  description: string
  invoiceIds: string[]
  attachmentIds: string[]
}

export type Flow = {
  approverId: string | null
  payerId: string | null
  ccUserIds: string[]
}

export type BusinessFields = {
  projectId: string | null
  customerId: string | null
  accountId: string | null
  entityId: string | null
  payAt: string | null
}

export type InvoiceStatus = 'none' | 'pending'

export type ItemErrors = Record<number, { amount?: string; occurredAt?: string; category?: string }>

let _idCounter = 0
function makeId(): string {
  _idCounter += 1
  return `item-${Date.now().toString(36)}-${_idCounter}`
}

function createEmptyItem(): Item {
  return {
    id: makeId(),
    amount: null,
    occurredAt: null,
    category: null,
    description: '',
    invoiceIds: [],
    attachmentIds: []
  }
}

export interface ExpenseForm {
  // state
  relatedApplyId: Ref<string | null>
  items: Ref<Item[]>
  totalInvoiceStatus: Ref<InvoiceStatus>
  ownership: { owner: string; department: string; remark: string }
  businessFields: BusinessFields
  notifyUserIds: Ref<string[]>
  flow: Flow
  submitting: Ref<boolean>
  errors: ItemErrors

  // computed
  totalAmount: ComputedRef<number>
  isValid: ComputedRef<boolean>

  // item actions
  addItem(): void
  removeItem(id: string): void
  updateItem(id: string, patch: Partial<Item>): void
  clearError(index: number, key: 'amount' | 'occurredAt' | 'category'): void

  // draft
  toDraft(): unknown
  saveDraft(): void
  restoreDraft(): boolean
  clearDraft(): void

  // validation
  validate(): ValidationResult
  submit(): Promise<SubmitResult>
}

export type ValidationResult =
  | { ok: true }
  | { ok: false; errors: ItemErrors; payerMissing: boolean }

export type SubmitResult = { ok: true } | { ok: false; message: string }

export function useExpenseForm(): ExpenseForm {
  const relatedApplyId = ref<string | null>(null)
  const items = ref<Item[]>([createEmptyItem()])
  const totalInvoiceStatus = ref<InvoiceStatus>('none')
  const ownership = reactive({ owner: '陆晓锋', department: '播阳测试部门', remark: '' })
  const businessFields = reactive<BusinessFields>({
    projectId: null,
    customerId: null,
    accountId: null,
    entityId: null,
    payAt: null
  })
  const notifyUserIds = ref<string[]>([])
  const flow = reactive<Flow>({ approverId: null, payerId: null, ccUserIds: [] })
  const submitting = ref(false)
  const errors = reactive<ItemErrors>({})

  const totalAmount = computed(() =>
    items.value.reduce((sum, it) => sum + (it.amount ?? 0), 0)
  )

  const isValid = computed(() => {
    if (!flow.payerId) return false
    for (const it of items.value) {
      if (!it.amount || it.amount <= 0) return false
      if (!it.occurredAt) return false
      if (!it.category) return false
    }
    return true
  })

  function addItem(): void {
    items.value.push(createEmptyItem())
  }

  function removeItem(id: string): void {
    const idx = items.value.findIndex((i) => i.id === id)
    if (idx >= 0) items.value.splice(idx, 1)
  }

  function updateItem(id: string, patch: Partial<Item>): void {
    const it = items.value.find((i) => i.id === id)
    if (!it) return
    Object.assign(it, patch)
  }

  function clearError(index: number, key: 'amount' | 'occurredAt' | 'category'): void {
    if (errors[index]) errors[index][key] = undefined
  }

  function toDraft() {
    return {
      relatedApplyId: relatedApplyId.value,
      items: items.value.map((it) => ({ ...it })),
      businessFields: { ...businessFields },
      notifyUserIds: [...notifyUserIds.value],
      flow: { ...flow, ccUserIds: [...flow.ccUserIds] },
      ownership: { ...ownership }
    }
  }

  function saveDraft(): void {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(toDraft()))
    } catch {
      // quota / privacy mode - silently ignore
    }
  }

  function restoreDraft(): boolean {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (!raw) return false
      const d = JSON.parse(raw) as ReturnType<typeof toDraft>
      relatedApplyId.value = d.relatedApplyId ?? null
      if (Array.isArray(d.items) && d.items.length > 0) {
        items.value = d.items.map((it) => ({ ...it }))
      }
      Object.assign(businessFields, d.businessFields)
      notifyUserIds.value = d.notifyUserIds ?? []
      flow.approverId = d.flow?.approverId ?? null
      flow.payerId = d.flow?.payerId ?? null
      flow.ccUserIds = d.flow?.ccUserIds ?? []
      Object.assign(ownership, d.ownership)
      return true
    } catch {
      clearDraft()
      return false
    }
  }

  function clearDraft(): void {
    try {
      localStorage.removeItem(DRAFT_KEY)
    } catch {
      // ignore
    }
  }

  function validate(): ValidationResult {
    const errs: ItemErrors = {}
    let payerMissing = false

    items.value.forEach((it, i) => {
      const e: { amount?: string; occurredAt?: string; category?: string } = {}
      if (!it.amount || it.amount <= 0) e.amount = `请输入第 ${i + 1} 条的报销金额`
      if (!it.occurredAt) e.occurredAt = `请选择第 ${i + 1} 条的费用日期`
      if (!it.category) e.category = `请选择第 ${i + 1} 条的费用类型`
      if (e.amount || e.occurredAt || e.category) errs[i] = e
    })

    if (!flow.payerId) payerMissing = true

    if (Object.keys(errs).length === 0 && !payerMissing) {
      return { ok: true }
    }
    return { ok: false, errors: errs, payerMissing }
  }

  async function submit(): Promise<SubmitResult> {
    const result = validate()
    if (!result.ok) {
      // copy errors into reactive map so UI can show them
      for (const k of Object.keys(errors)) delete errors[Number(k)]
      Object.assign(errors, result.errors)
      return { ok: false, message: '请补全必填项后再提交' }
    }
    submitting.value = true
    try {
      const useridList: string[] = []
      if (flow.approverId) useridList.push(flow.approverId)
      if (flow.payerId) useridList.push(flow.payerId)
      flow.ccUserIds.forEach((u) => u && useridList.push(u))
      await ddNotify({
        useridList,
        title: '报销单已提交',
        content: `**${ownership.owner}** 提交了日常报销单，金额 **¥${totalAmount.value.toFixed(2)}**`,
        jumpUrl: location.origin + location.pathname
      })
      clearDraft()
      return { ok: true }
    } catch (e) {
      return { ok: false, message: e instanceof Error ? e.message : '提交失败' }
    } finally {
      submitting.value = false
    }
  }

  return {
    relatedApplyId,
    items,
    totalInvoiceStatus,
    ownership,
    businessFields,
    notifyUserIds,
    flow,
    submitting,
    errors,
    totalAmount,
    isValid,
    addItem,
    removeItem,
    updateItem,
    clearError,
    toDraft,
    saveDraft,
    restoreDraft,
    clearDraft,
    validate,
    submit
  }
}
