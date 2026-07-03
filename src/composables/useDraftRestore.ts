import { useToast } from '@/composables/useToast'
import { useDraftStorage } from '@/utils/draftStorage'
import { useExpenseStore } from '@/stores/expense'

export function useDraftRestore() {
  const draft = useDraftStorage().load()
  if (!draft) return

  const toast = useToast()
  const expense = useExpenseStore()

  toast.show({
    message: '检测到未提交的草稿，是否恢复？',
    type: 'info',
    duration: 0,
    action: {
      label: '恢复',
      onClick: () => {
        expense.restoreFromDraft(draft)
        toast.hide()
      }
    },
    dismiss: {
      label: '丢弃',
      onClick: () => {
        useDraftStorage().clear()
        toast.hide()
      }
    }
  })
}
