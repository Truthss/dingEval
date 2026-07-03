import { ref, type Ref } from 'vue'
import { useExpenseStore } from '@/stores/expense'
import { isPositiveAmount } from '@/utils/money'

export type Store = ReturnType<typeof useExpenseStore>

export interface ValidationRefs {
  amountRefs: Ref<HTMLElement | null>[]
  dateRefs: Ref<HTMLElement | null>[]
  categoryRefs: Ref<HTMLElement | null>[]
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
  const firstErrorRef = ref<Ref<HTMLElement | null> | undefined>(undefined)
  const firstErrorFound = ref(false)

  function setError(path: ErrorPath, message: string, ref?: Ref<HTMLElement | null>) {
    errors.value[path] = message
    if (!firstErrorFound.value && ref?.value) {
      firstErrorRef.value = ref
      firstErrorFound.value = true
    }
  }

  function validate(): ValidationResult {
    errors.value = {}
    firstErrorRef.value = undefined
    firstErrorFound.value = false

    store.items.forEach((item, i) => {
      if (!isPositiveAmount(item.amount)) {
        setError(`items.${i}.amount`, `请输入第 ${i + 1} 条的报销金额`, refs.amountRefs[i])
      }
      if (!item.occurredAt) {
        setError(`items.${i}.occurredAt`, `请选择第 ${i + 1} 条的费用日期`, refs.dateRefs[i])
      }
      if (!item.category) {
        setError(`items.${i}.category`, `请选择第 ${i + 1} 条的费用类型`, refs.categoryRefs[i])
      }
    })

    if (!store.payer) {
      setError('payer', '请选择付款人', refs.payerRef)
    }

    if (firstErrorRef.value) {
      firstErrorRef.value.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    return {
      ok: Object.keys(errors.value).length === 0,
      firstErrorRef: firstErrorRef.value
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
