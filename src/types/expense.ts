export type InvoiceStatus = 'none' | 'pending' | 'received'

export type CategoryValue =
  | 'travel'
  | 'meal'
  | 'office'
  | 'entertain'
  | 'communication'
  | 'other'

export interface ExpenseItem {
  id: string
  amount: number | null
  occurredAt: string
  category: CategoryValue | null
  description: string
  invoiceStatus: InvoiceStatus
  attachmentCount: number
}

export interface ExpenseDraft {
  version: 1
  savedAt: number
  items: ExpenseItem[]
  relatedApplyId: string | null
  remark: string
  project: string | null
  customer: string | null
  payeeAccount: string | null
  entity: string | null
  payAt: string | null
  notifyChats: string[]
  approver: string | null
  payer: string | null
  cc: string[]
  invoiceStatus: InvoiceStatus
  owner: string
  department: string
}

export interface OptionItem {
  value: string
  label: string
  description?: string
  title?: string
  avatarColor?: string
}

export interface PersonOption extends OptionItem {
  title: string
}

export interface ChatOption extends OptionItem {
  avatarColor: string
}
