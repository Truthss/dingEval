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

type ToastPayload = {
  type?: ToastType
  message: string
  action?: ToastAction
  dismiss?: ToastDismiss
  duration?: number
}

export function useToast() {
  function show(message: string): void
  function show(payload: ToastPayload): void
  function show(payload: string | ToastPayload) {
    const p: ToastPayload = typeof payload === 'string'
      ? { message: payload, type: 'info' }
      : payload
    state.value = {
      type: p.type ?? 'info',
      message: p.message,
      action: p.action ?? null,
      dismiss: p.dismiss ?? null,
      visible: true
    }
    const duration = p.duration ?? 3000
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
