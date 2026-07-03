import { ref } from 'vue'
import type { Ref } from 'vue'

type ToastType = 'info' | 'success' | 'error'

interface ToastAction {
  label: string
  onClick: () => void
}

interface ToastDismiss {
  label: string
  onClick?: () => void
}

interface ToastState {
  visible: boolean
  type: ToastType
  message: string
  action: ToastAction | null
  dismiss: ToastDismiss | null
}

const state: Ref<ToastState> = ref({
  visible: false,
  type: 'info',
  message: '',
  action: null,
  dismiss: null
})

export function useToast() {
  function show(payload: {
    type?: ToastType
    message: string
    action?: ToastAction
    dismiss?: ToastDismiss
    duration?: number
  }) {
    state.value = {
      type: payload.type ?? 'info',
      message: payload.message,
      action: payload.action ?? null,
      dismiss: payload.dismiss ?? null,
      visible: true
    }

    const duration = payload.duration ?? 3000
    if (duration > 0) {
      setTimeout(() => {
        state.value.visible = false
      }, duration)
    }
  }

  function hide() {
    state.value.visible = false
  }

  return { state, show, hide }
}
