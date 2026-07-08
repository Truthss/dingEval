<script setup lang="ts">
withDefaults(defineProps<{
  label?: string
  placeholder?: string
  disabled?: boolean
}>(), {
  label: '+ 请选择',
  placeholder: '',
  disabled: false,
})

defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <button
    type="button"
    class="capsule-btn"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <span class="capsule-btn__icon" aria-hidden="true">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <line x1="7" y1="3" x2="7" y2="11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="3" y1="7" x2="11" y2="7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </span>
    <span>{{ label }}</span>
  </button>
</template>

<style scoped>
.capsule-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 14px;
  font-size: var(--font-size-body);
  color: var(--color-primary);
  background: rgba(0, 127, 255, 0.06);
  border: 1px dashed rgba(0, 127, 255, 0.32);
  border-radius: var(--radius-full);
  cursor: pointer;
  font-family: var(--font-family-base);
  transition: background 0.15s, border-color 0.15s;
}

.capsule-btn:hover:not(:disabled) {
  background: rgba(0, 127, 255, 0.12);
  border-color: var(--color-primary);
}

.capsule-btn:active:not(:disabled) {
  background: rgba(0, 127, 255, 0.18);
}

.capsule-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.capsule-btn__icon {
  display: inline-flex;
  color: currentColor;
}
</style>
