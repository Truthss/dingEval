<script setup lang="ts">
interface Props {
  modelValue: string
  placeholder?: string
  rows?: number
}

withDefaults(defineProps<Props>(), {
  placeholder: '',
  rows: 3
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
    @input="onInput"
  />
</template>
