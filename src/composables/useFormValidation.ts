import { ref, type Ref } from 'vue'
import { useExpenseStore } from '@/stores/expense'
import { isPositiveAmount } from '@/utils/money'

export type Store = ReturnType<typeof useExpenseStore>

export interface ValidationRefs {
  amountRefs: Ref<HTMLElement | null>
  dateRefs: Ref<HTMLElement | null>
  categoryRefs: Ref<HTMLElement | null>
  payerRef: Ref<HTMLElement | null>
}

export type ErrorPath =
  | `items.${number}.amount`
  | `items.${number}.occurredAt`
  | `items.${number}.category`
  | 'payer'

export interface ValidationResult {
  ok: boolean
  firstErrorRef?: Ref<HTMLElement | null>
}

export function useFormValidation(params: { refs: ValidationRefs; store: Store }) {
  const { refs, store } = params
  const errors = ref<Record<string, string>>({})

  function validate(): ValidationResult {
    errors.value = {}
    let firstErrorRef: Ref<HTMLElement | null> | undefined

    store.items.forEach((item, i) => {
      if (!isPositiveAmount(item.amount)) {
        errors.value[`items.${i}.amount`] = `请输入第 ${i + 1} 条的报销金额`
        if (!firstErrorRef) firstErrorRef = refs.amountRefs
      }
      if (!item.occurredAt) {
        errors.value[`items.${i}.occurredAt`] = `请选择第 ${i + 1} 条的费用日期`
        if (!firstErrorRef) firstErrorRef = refs.dateRefs
      }
      if (!item.category) {
        errors.value[`items.${i}.category`] = `请选择第 ${i + 1} 条的费用类型`
        if (!firstErrorRef) firstErrorRef = refs.categoryRefs
      }
    })

    if (!store.payer) {
      errors.value.payer = '请选择付款人'
      if (!firstErrorRef) firstErrorRef = refs.payerRef
    }

    if (firstErrorRef?.value) {
      ;(firstErrorRef.value as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    return {
      ok: Object.keys(errors.value).length === 0,
      firstErrorRef
    }
  }

  function clearError(path: ErrorPath) {
    if (errors.value[path]) {
      const next = { ...errors.value }
      delete next[path]
      errors.value = next
    }
  }

  return { validate, errors, clearError }
}
