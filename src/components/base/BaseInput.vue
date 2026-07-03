<script setup lang="ts">
interface Props {
  modelValue: string | number | null
  type?: 'text' | 'number'
  placeholder?: string
  readonly?: boolean
  inputmode?: string
  align?: 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  readonly: false,
  inputmode: '',
  align: 'right'
})

const emit = defineEmits<{ (e: 'update:modelValue', value: string | number | null): void }>()

function onInput(e: Event) {
  const target = e.target as HTMLInputElement
  if (props.type === 'number') {
    emit('update:modelValue', target.value === '' ? null : Number(target.value))
  } else {
    emit('update:modelValue', target.value)
  }
}
</script>

<template>
  <input
    :type="type"
    :value="modelValue ?? ''"
    :placeholder="placeholder"
    :readonly="readonly"
    :inputmode="(inputmode as any)"
    :style="{ textAlign: align }"
    @input="onInput"
  />
</template>
