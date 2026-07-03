import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type InvoiceStatus = 'none' | 'pending' | 'received'

export interface ExpenseItem {
  id: string
  amount: number | null
  occurredAt: string
  category: string | null
  description: string
  invoiceStatus: InvoiceStatus
  attachmentCount: number
}

const today = (): string => {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const uid = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

export const useExpenseStore = defineStore('expense', () => {
  const items = ref<ExpenseItem[]>([
    {
      id: uid(),
      amount: null,
      occurredAt: today(),
      category: null,
      description: '',
      invoiceStatus: 'none',
      attachmentCount: 0
    }
  ])

  const relatedApplyId = ref<string | null>(null)

  const totalAmount = computed(() =>
    items.value.reduce((sum, item) => sum + (item.amount ?? 0), 0)
  )

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

  function addItem() {
    items.value.push({
      id: uid(),
      amount: null,
      occurredAt: today(),
      category: null,
      description: '',
      invoiceStatus: 'none',
      attachmentCount: 0
    })
  }

  function removeItem(id: string) {
    if (items.value.length <= 1) return
    items.value = items.value.filter((it) => it.id !== id)
  }

  function reset() {
    items.value = [
      {
        id: uid(),
        amount: null,
        occurredAt: today(),
        category: null,
        description: '',
        invoiceStatus: 'none',
        attachmentCount: 0
      }
    ]
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
  }

  return {
    items,
    relatedApplyId,
    totalAmount,
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
    addItem,
    removeItem,
    reset
  }
})
