<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'

type Option = { value: string; label: string }

const props = defineProps<{
  modelValue: string | string[] | null
  options: Option[]
  multiple?: boolean
  placeholder?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: string | string[] | null): void
}>()

const open = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const popoverRef = ref<HTMLElement | null>(null)
const popoverStyle = ref<Record<string, string>>({})

const display = computed(() => {
  if (props.multiple) {
    if (!Array.isArray(props.modelValue) || props.modelValue.length === 0) {
      return props.placeholder ?? '请选择'
    }
    return props.modelValue
      .map((v) => props.options.find((o) => o.value === v)?.label ?? v)
      .join('、')
  }
  if (props.modelValue == null) return props.placeholder ?? '请选择'
  return props.options.find((o) => o.value === props.modelValue)?.label ?? (props.modelValue as string)
})

const isPlaceholder = computed(() => {
  if (props.multiple) {
    return !Array.isArray(props.modelValue) || props.modelValue.length === 0
  }
  return props.modelValue == null
})

function isSelected(v: string): boolean {
  if (props.multiple) {
    return Array.isArray(props.modelValue) && props.modelValue.includes(v)
  }
  return props.modelValue === v
}

function toggle(v: string): void {
  if (props.multiple) {
    const arr = Array.isArray(props.modelValue) ? [...props.modelValue] : []
    const idx = arr.indexOf(v)
    if (idx >= 0) arr.splice(idx, 1)
    else arr.push(v)
    emit('update:modelValue', arr)
  } else {
    emit('update:modelValue', v)
    open.value = false
  }
}

async function positionPopover(): Promise<void> {
  if (!triggerRef.value || !popoverRef.value) return
  await nextTick()
  const triggerRect = triggerRef.value.getBoundingClientRect()
  const popRect = popoverRef.value.getBoundingClientRect()
  const viewportW = window.innerWidth
  const viewportH = window.innerHeight

  let top = triggerRect.bottom + 4
  let left = triggerRect.left

  // flip if would overflow bottom
  if (top + popRect.height > viewportH - 8) {
    top = triggerRect.top - popRect.height - 4
  }
  // shift left if would overflow right
  if (left + popRect.width > viewportW - 8) {
    left = viewportW - popRect.width - 8
  }
  if (left < 8) left = 8

  popoverStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
    minWidth: `${Math.max(triggerRect.width, 200)}px`
  }
}

async function toggleOpen(): Promise<void> {
  if (props.disabled) return
  open.value = !open.value
  if (open.value) await positionPopover()
}

function onClickOutside(ev: MouseEvent): void {
  if (!open.value) return
  const target = ev.target as Node
  if (triggerRef.value?.contains(target)) return
  if (popoverRef.value?.contains(target)) return
  open.value = false
}

function onEsc(ev: KeyboardEvent): void {
  if (ev.key === 'Escape' && open.value) open.value = false
}

onMounted(() => {
  document.addEventListener('mousedown', onClickOutside)
  document.addEventListener('keydown', onEsc)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onClickOutside)
  document.removeEventListener('keydown', onEsc)
})

watch(open, (v) => {
  if (v) {
    setTimeout(() => positionPopover(), 0)
  }
})
</script>

<template>
  <div class="select-picker">
    <button
      ref="triggerRef"
      type="button"
      class="select-picker__trigger"
      :class="{ 'is-placeholder': isPlaceholder, 'is-open': open }"
      :disabled="disabled"
      @click="toggleOpen"
    >
      <span class="select-picker__text">{{ display }}</span>
      <span class="select-picker__chevron" aria-hidden="true">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
    </button>
    <Teleport to="body">
      <div
        v-if="open"
        ref="popoverRef"
        class="select-picker__popover"
        :style="popoverStyle"
        role="listbox"
        :aria-multiselectable="multiple"
      >
        <div
          v-for="opt in options"
          :key="opt.value"
          class="select-picker__option"
          :class="{ 'is-selected': isSelected(opt.value) }"
          role="option"
          :aria-selected="isSelected(opt.value)"
          @click="toggle(opt.value)"
        >
          <span class="select-picker__check" aria-hidden="true">
            <svg v-if="isSelected(opt.value)" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <span>{{ opt.label }}</span>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.select-picker {
  position: relative;
  display: inline-block;
  width: 100%;
}

.select-picker__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: var(--layout-input-height);
  padding: 0 12px;
  font-size: var(--font-size-body);
  color: var(--color-ink);
  background: var(--color-canvas);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-xs);
  cursor: pointer;
  outline: none;
  font-family: var(--font-family-base);
  transition: border-color 0.15s, box-shadow 0.15s;
}

.select-picker__trigger:hover:not(:disabled) {
  border-color: var(--color-hairline-strong);
}

.select-picker__trigger:focus-visible,
.select-picker__trigger.is-open {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(0, 127, 255, 0.12);
}

.select-picker__trigger:disabled {
  background: var(--color-canvas-soft);
  color: var(--color-mute);
  cursor: not-allowed;
}

.select-picker__trigger.is-placeholder .select-picker__text {
  color: var(--color-mute);
}

.select-picker__text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
}

.select-picker__chevron {
  display: inline-flex;
  color: var(--color-mute);
  margin-left: 8px;
  flex-shrink: 0;
}

.select-picker__trigger:hover .select-picker__chevron {
  color: var(--color-primary);
}

.select-picker__trigger.is-open .select-picker__chevron {
  transform: rotate(180deg);
  color: var(--color-primary);
}

.select-picker__popover {
  position: fixed;
  z-index: var(--z-popover);
  max-height: 280px;
  overflow-y: auto;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-m);
  padding: 4px;
}

.select-picker__option {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 12px;
  font-size: var(--font-size-body);
  color: var(--color-ink);
  border-radius: var(--radius-xs);
  cursor: pointer;
  user-select: none;
  transition: background 0.1s;
}

.select-picker__option:hover {
  background: var(--color-overlay-hover);
}

.select-picker__option.is-selected {
  color: var(--color-primary);
  background: rgba(0, 127, 255, 0.06);
}

.select-picker__check {
  display: inline-flex;
  width: 14px;
  height: 14px;
  color: var(--color-primary);
  flex-shrink: 0;
}
</style>
