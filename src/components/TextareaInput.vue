<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: string
  placeholder?: string
  rows?: number
  maxlength?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
}>()

const rowCount = computed(() => props.rows ?? 3)
const length = computed(() => props.modelValue.length)
</script>

<template>
  <div class="textarea-input">
    <textarea
      class="textarea-input__field"
      :rows="rowCount"
      :placeholder="placeholder"
      :value="modelValue"
      :maxlength="maxlength"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    ></textarea>
    <div v-if="maxlength" class="textarea-input__count">
      {{ length }} / {{ maxlength }}
    </div>
  </div>
</template>

<style scoped>
.textarea-input {
  position: relative;
  display: block;
  width: 100%;
}

.textarea-input__field {
  display: block;
  width: 100%;
  min-height: 80px;
  padding: 8px 12px;
  font-size: var(--font-size-body);
  line-height: var(--line-height-normal);
  color: var(--color-ink);
  background: var(--color-canvas);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-xs);
  outline: none;
  resize: vertical;
  font-family: var(--font-family-base);
  transition: border-color 0.15s, box-shadow 0.15s;
}

.textarea-input__field::placeholder {
  color: var(--color-mute);
}

.textarea-input__field:hover {
  border-color: var(--color-hairline-strong);
}

.textarea-input__field:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(0, 127, 255, 0.12);
}

.textarea-input__count {
  position: absolute;
  right: 8px;
  bottom: 6px;
  font-size: var(--font-size-caption);
  color: var(--color-mute);
  pointer-events: none;
  background: var(--color-canvas);
  padding: 0 4px;
}
</style>
