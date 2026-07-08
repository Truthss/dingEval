// src/composables/useToast.ts
import { inject } from 'vue'

export type ToastType = 'info' | 'success' | 'error'

export type ShowToast = (message: string, type?: ToastType) => void

const NOOP: ShowToast = (msg) => {
  // Fallback for contexts where the App-level provider is not available
  // (e.g. unit tests, or components rendered outside the app shell).
  // We deliberately swallow the message rather than using alert().
  void msg
}

export function useToast(): { showToast: ShowToast } {
  const showToast = inject<ShowToast>('showToast', NOOP)
  return { showToast }
}
