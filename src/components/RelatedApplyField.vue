<script setup lang="ts">
defineProps<{
  modelValue: string | null
  applies: { id: string; label: string }[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: string | null): void
}>()
</script>

<template>
  <SelectPicker
    :model-value="modelValue"
    :options="applies"
    placeholder="+ 请选择关联申请单"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>
