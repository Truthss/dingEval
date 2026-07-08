<script setup lang="ts">
defineProps<{
  modelValue: string
  placeholder?: string
  disabled?: boolean
}>()

defineEmits<{
  (e: 'update:modelValue', v: string): void
}>()
</script>

<template>
  <input
    class="text-input"
    type="text"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>

<style scoped>
.text-input {
  width: 100%;
  height: var(--layout-input-height);
  padding: 0 12px;
  font-size: var(--font-size-body);
  line-height: var(--line-height-normal);
  color: var(--color-ink);
  background: var(--color-canvas);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-xs);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.text-input::placeholder {
  color: var(--color-mute);
}

.text-input:hover:not(:disabled) {
  border-color: var(--color-hairline-strong);
}

.text-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(0, 127, 255, 0.12);
}

.text-input:disabled {
  background: var(--color-canvas-soft);
  color: var(--color-mute);
  cursor: not-allowed;
}
</style>
