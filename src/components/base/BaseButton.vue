<script setup lang="ts">
import DingIcon from './DingIcon.vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  block?: boolean
  loading?: boolean
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  block: false,
  loading: false,
  disabled: false
})

const emit = defineEmits<{ (e: 'click', event: MouseEvent): void }>()

function onClick(e: MouseEvent) {
  emit('click', e)
}
</script>

<template>
  <button
    type="button"
    :class="['base-btn', `base-btn--${variant}`, { 'base-btn--block': block, 'base-btn--loading': loading }]"
    :disabled="disabled || loading"
    @click="onClick"
  >
    <DingIcon v-if="loading" name="progress-activity" :size="16" class="base-btn__spinner" />
    <slot />
  </button>
</template>

<style scoped>
.base-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-height: 32px;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.15s;
  border: 0;
  cursor: pointer;
}
.base-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.base-btn--block { display: flex; width: 100%; height: 44px; }
.base-btn--primary {
  background: var(--color-primary);
  color: var(--color-on-primary);
}
.base-btn--primary:hover:not(:disabled) { background: var(--color-primary-hover); }
.base-btn--primary:active:not(:disabled) { background: var(--color-primary-press); }
.base-btn--secondary {
  background: var(--color-canvas);
  color: var(--color-ink);
  border: 1px solid var(--color-hairline-strong);
}
.base-btn--secondary:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.base-btn--ghost {
  background: transparent;
  color: var(--color-primary);
  border: 0;
  padding: 8px 12px;
}
.base-btn--ghost:hover:not(:disabled) { background: rgba(0, 127, 255, 0.06); }
.base-btn--danger {
  background: var(--color-error);
  color: var(--color-on-primary);
}
.base-btn--danger:hover:not(:disabled) { background: #EB4B17; }
.base-btn--loading { color: transparent; position: relative; }
.base-btn__spinner {
  position: absolute;
  animation: spin 0.8s linear infinite;
  color: currentColor;
}
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
