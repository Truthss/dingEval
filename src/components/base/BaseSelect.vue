<script setup lang="ts">
import { computed } from 'vue'
import type { OptionItem } from '@/types/expense'
import DingIcon from './DingIcon.vue'
import { useActionSheet } from '@/composables/useActionSheet'

interface Props {
  modelValue: string | null
  options: OptionItem[]
  placeholder?: string
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请选择',
  title: ''
})

const emit = defineEmits<{ (e: 'update:modelValue', value: string | null): void }>()

const sheet = useActionSheet()

const display = computed(() => {
  return props.options.find((o) => o.value === props.modelValue)?.label ?? ''
})

function open() {
  sheet.open({
    title: props.title,
    options: props.options,
    current: props.modelValue,
    onSelect: (val) => {
      emit('update:modelValue', val)
    }
  })
}
</script>

<template>
  <button
    type="button"
    class="picker-trigger"
    :class="{ placeholder: !display }"
    @click="open"
  >
    <span>{{ display || placeholder }}</span>
    <DingIcon name="chevron-right" :size="16" />
  </button>
</template>
