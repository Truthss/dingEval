<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: number | null
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: number | null): void
}>()

const display = computed({
  get(): string {
    if (props.modelValue == null) return ''
    return props.modelValue.toLocaleString('en-US', { maximumFractionDigits: 2 })
  },
  set(raw: string): void {
    const cleaned = raw.replace(/[^\d.]/g, '')
    if (cleaned === '' || cleaned === '.') {
      emit('update:modelValue', null)
      return
    }
    const n = Number(cleaned)
    if (Number.isFinite(n)) emit('update:modelValue', n)
  }
})

function onBlur(): void {
  if (props.modelValue != null) {
    emit('update:modelValue', Number(props.modelValue.toFixed(2)))
  }
}
</script>

<template>
  <div class="money-input">
    <span class="money-input__prefix">¥</span>
    <input
      class="money-input__field"
      type="text"
      inputmode="decimal"
      :value="display"
      :placeholder="placeholder"
      @input="display = ($event.target as HTMLInputElement).value"
      @blur="onBlur"
    />
  </div>
</template>

<style scoped>
.money-input {
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

.money-input:hover {
  border-color: var(--color-hairline-strong);
}

.money-input:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(0, 127, 255, 0.12);
}

.money-input__prefix {
  font-size: var(--font-size-body);
  color: var(--color-mute);
  margin-right: 4px;
  font-variant-numeric: tabular-nums;
}

.money-input__field {
  flex: 1;
  min-width: 0;
  height: 100%;
  padding: 0;
  font-size: var(--font-size-body);
  color: var(--color-ink);
  background: transparent;
  border: 0;
  outline: none;
  font-variant-numeric: tabular-nums;
}

.money-input__field::placeholder {
  color: var(--color-mute);
}
</style>
