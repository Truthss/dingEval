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
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请选择',
  title: '',
  size: 'sm'
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
    :class="['picker-trigger', `picker-trigger--${size}`, { placeholder: !display }]"
    @click="open"
  >
    <span>{{ display || placeholder }}</span>
    <DingIcon name="chevron-right" :size="16" />
  </button>
</template>

<style scoped>
.picker-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  width: 100%;
  background: var(--color-canvas);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-xs);
  color: var(--color-ink);
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.15s;
}
.picker-trigger--sm { height: 36px; padding: 0 12px; font-size: 17px; }
.picker-trigger--md { height: 40px; padding: 0 14px; font-size: 14px; }
.picker-trigger.placeholder { color: var(--color-mute); }

@media (min-width: 960px) {
  .picker-trigger:hover { border-color: var(--color-hairline-strong); }
}
</style>
