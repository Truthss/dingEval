<script setup lang="ts">
import DingIcon from './DingIcon.vue'

interface Props {
  label: string
  required?: boolean
  error?: string
  block?: boolean
}

withDefaults(defineProps<Props>(), {
  required: false,
  error: '',
  block: false
})
</script>

<template>
  <div :class="['field', { block, 'has-error': !!error }]">
    <label class="label">
      <span v-if="required" class="req">*</span>
      <span>{{ label }}</span>
    </label>
    <div :class="['control', { start: block }]">
      <slot />
    </div>
    <div v-if="error" class="error-text" role="alert">
      <DingIcon name="error" :size="12" color="currentColor" />
      <span>{{ error }}</span>
    </div>
  </div>
</template>
