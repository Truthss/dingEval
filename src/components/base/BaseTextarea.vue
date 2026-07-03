<script setup lang="ts">
interface Props {
  modelValue: string
  placeholder?: string
  rows?: number
  size?: 'sm' | 'md'
}

withDefaults(defineProps<Props>(), {
  placeholder: '',
  rows: 3,
  size: 'sm'
})

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

function onInput(e: Event) {
  const target = e.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <textarea
    :value="modelValue"
    :placeholder="placeholder"
    :rows="rows"
    :class="['base-textarea', `base-textarea--${size}`]"
    @input="onInput"
  />
</template>

<style scoped>
.base-textarea {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--color-ink);
  font-family: inherit;
  resize: vertical;
}
.base-textarea--sm { padding: 8px 12px; font-size: 17px; min-height: 60px; }
.base-textarea--md { padding: 10px 14px; font-size: 14px; min-height: 72px; }
.base-textarea::placeholder { color: var(--color-mute); }
</style>
