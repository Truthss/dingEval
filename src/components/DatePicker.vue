<script setup lang="ts">
defineProps<{
  modelValue: string | null
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: string | null): void
}>()

function onInput(ev: Event): void {
  const target = ev.target as HTMLInputElement
  emit('update:modelValue', target.value === '' ? null : target.value)
}
</script>

<template>
  <div class="date-picker">
    <input
      class="date-picker__field"
      type="date"
      :value="modelValue ?? ''"
      :placeholder="placeholder"
      @input="onInput"
    />
  </div>
</template>

<style scoped>
.date-picker {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: var(--layout-input-height);
  padding: 0 12px;
  background: var(--color-canvas);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-xs);
  transition: border-color 0.15s, box-shadow 0.15s;
}

.date-picker:hover {
  border-color: var(--color-hairline-strong);
}

.date-picker:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(0, 127, 255, 0.12);
}

.date-picker__field {
  flex: 1;
  min-width: 0;
  height: 100%;
  padding: 0;
  font-size: var(--font-size-body);
  color: var(--color-ink);
  background: transparent;
  border: 0;
  outline: none;
  font-family: var(--font-family-base);
}

.date-picker__field::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.5;
}

.date-picker__field::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
}
</style>
