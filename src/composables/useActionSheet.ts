import { ref, readonly } from 'vue'
import type { OptionItem } from '@/types/expense'

interface ActionSheetState {
  visible: boolean
  title: string
  options: OptionItem[]
  current: string | null
}

interface OpenInput {
  title?: string
  options: OptionItem[]
  current?: string | null
  onSelect: (value: string | null) => void
}

const initial: ActionSheetState = {
  visible: false,
  title: '',
  options: [],
  current: null
}

const state = ref<ActionSheetState>({ ...initial })
let pendingOnSelect: ((value: string | null) => void) | null = null

function close() {
  state.value = { ...initial }
  pendingOnSelect = null
}

function select(value: string) {
  const cb = pendingOnSelect
  close()
  if (cb) cb(value)
}

function open(input: OpenInput) {
  pendingOnSelect = input.onSelect
  state.value = {
    visible: true,
    title: input.title ?? '',
    options: input.options,
    current: input.current ?? null
  }
}

export function useActionSheet() {
  return {
    state: readonly(state),
    open,
    close,
    select
  }
}
