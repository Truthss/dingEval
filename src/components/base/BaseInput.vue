<script setup lang="ts">
interface Props {
  modelValue: string | number | null
  type?: 'text' | 'number'
  placeholder?: string
  readonly?: boolean
  inputmode?: string
  align?: 'left' | 'right'
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  readonly: false,
  inputmode: '',
  align: 'right',
  size: 'sm'
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
    :class="['base-input', `base-input--${size}`]"
    @input="onInput"
  />
</template>

<style scoped>
.base-input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--color-ink);
  font-family: inherit;
}
.base-input--sm { height: 36px; padding: 8px 12px; font-size: 17px; }
.base-input--md { height: 40px; padding: 10px 14px; font-size: 14px; }
.base-input::placeholder { color: var(--color-mute); }
</style>
