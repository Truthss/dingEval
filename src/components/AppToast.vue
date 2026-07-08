<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'

const props = defineProps<{
  message: string
  type: 'info' | 'success' | 'error'
}>()

const emit = defineEmits<{
  (e: 'dismiss'): void
}>()

const visible = ref(true)
let timer: number | null = null

function start(): void {
  visible.value = true
  if (timer) window.clearTimeout(timer)
  timer = window.setTimeout(() => {
    visible.value = false
    emit('dismiss')
  }, 3000)
}

watch(
  () => [props.message, props.type] as const,
  () => {
    start()
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if (timer) window.clearTimeout(timer)
})
</script>

<template>
  <div
    v-if="visible"
    class="app-toast"
    :class="[`app-toast--${type}`]"
    role="status"
    aria-live="polite"
  >
    <span class="app-toast__icon" aria-hidden="true">
      <svg v-if="type === 'success'" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 8.5L6.5 12L13 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <svg v-else-if="type === 'error'" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.5"/>
        <path d="M8 5V8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <circle cx="8" cy="11" r="0.8" fill="currentColor"/>
      </svg>
    </span>
    <span class="app-toast__msg">{{ message }}</span>
  </div>
</template>

<style scoped>
.app-toast {
  position: fixed;
  top: 32px;
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-toast);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: 480px;
  padding: 10px 16px;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-m);
  font-size: var(--font-size-body);
  color: var(--color-ink);
  border: 1px solid var(--color-hairline);
}

.app-toast--success .app-toast__icon {
  color: var(--color-success);
}

.app-toast--error {
  border-color: var(--color-error);
}

.app-toast--error .app-toast__icon {
  color: var(--color-error);
}

.app-toast--info .app-toast__icon {
  color: var(--color-primary);
}

.app-toast__icon {
  display: inline-flex;
  flex-shrink: 0;
}

.app-toast__msg {
  flex: 1;
  min-width: 0;
  word-break: break-word;
}
</style>
