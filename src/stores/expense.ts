import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ExpenseDraft, ExpenseItem, CategoryValue, InvoiceStatus } from '@/types/expense'
import { uid, today } from '@/utils/id'
import { useDraftStorage } from '@/utils/draftStorage'

const newItem = (): ExpenseItem => ({
  id: uid('item'),
  amount: null,
  occurredAt: today(),
  category: null,
  description: '',
  invoiceStatus: 'none',
  attachmentCount: 0
})

export const useExpenseStore = defineStore('expense', () => {
  const items = ref<ExpenseItem[]>([newItem()])
  const relatedApplyId = ref<string | null>(null)
  const owner = ref('陆晓锋')
  const department = ref('播阳测试部门')
  const remark = ref('')

  const project = ref<string | null>(null)
  const customer = ref<string | null>(null)
  const payeeAccount = ref<string | null>(null)
  const entity = ref<string | null>(null)
  const payAt = ref<string | null>(null)
  const notifyChats = ref<string[]>([])

  const approver = ref<string | null>(null)
  const payer = ref<string | null>(null)
  const cc = ref<string[]>([])

  const invoiceStatus = ref<InvoiceStatus>('none')

  const totalAmount = computed(() =>
    items.value.reduce((sum, item) => sum + (item.amount ?? 0), 0)
  )

  const hasAnyAmount = computed(() =>
    items.value.some((item) => (item.amount ?? 0) > 0)
  )

  const isValid = computed(() => hasAnyAmount.value && payer.value !== null)

  function addItem() {
    items.value.push(newItem())
  }

  function removeItem(id: string) {
    if (items.value.length <= 1) return
    items.value = items.value.filter((it) => it.id !== id)
  }

  function reset() {
    items.value = [newItem()]
    relatedApplyId.value = null
    remark.value = ''
    project.value = null
    customer.value = null
    payeeAccount.value = null
    entity.value = null
    payAt.value = null
    approver.value = null
    payer.value = null
    cc.value = []
    notifyChats.value = []
    invoiceStatus.value = 'none'
  }

  function toDraft(): ExpenseDraft {
    const draft: ExpenseDraft = {
      version: 1,
      savedAt: Date.now(),
      items: items.value.map((it) => ({
        id: it.id,
        amount: it.amount,
        occurredAt: it.occurredAt,
        category: it.category as CategoryValue | null,
        description: it.description,
        invoiceStatus: it.invoiceStatus,
        attachmentCount: it.attachmentCount
      })),
      relatedApplyId: relatedApplyId.value,
      remark: remark.value,
      project: project.value,
      customer: customer.value,
      payeeAccount: payeeAccount.value,
      entity: entity.value,
      payAt: payAt.value,
      notifyChats: [...notifyChats.value],
      approver: approver.value,
      payer: payer.value,
      cc: [...cc.value],
      invoiceStatus: invoiceStatus.value,
      owner: owner.value,
      department: department.value
    }
    reset()
    return draft
  }

  function restoreFromDraft(draft: ExpenseDraft) {
    items.value = draft.items.map((it) => ({ ...it }))
    relatedApplyId.value = draft.relatedApplyId
    remark.value = draft.remark
    project.value = draft.project
    customer.value = draft.customer
    payeeAccount.value = draft.payeeAccount
    entity.value = draft.entity
    payAt.value = draft.payAt
    notifyChats.value = [...draft.notifyChats]
    approver.value = draft.approver
    payer.value = draft.payer
    cc.value = [...draft.cc]
    invoiceStatus.value = draft.invoiceStatus
    if (draft.owner) owner.value = draft.owner
    if (draft.department) department.value = draft.department
  }

  function clearDraft() {
    reset()
    useDraftStorage().clear()
  }

  return {
    items,
    relatedApplyId,
    owner,
    department,
    remark,
    project,
    customer,
    payeeAccount,
    entity,
    payAt,
    notifyChats,
    approver,
    payer,
    cc,
    invoiceStatus,
    totalAmount,
    hasAnyAmount,
    isValid,
    addItem,
    removeItem,
    reset,
    toDraft,
    restoreFromDraft,
    clearDraft
  }
})
