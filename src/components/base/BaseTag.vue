<script setup lang="ts">
import DingIcon from './DingIcon.vue'

interface Props {
  label: string
  active?: boolean
  helpIcon?: boolean
}

withDefaults(defineProps<Props>(), {
  active: false,
  helpIcon: false
})

const emit = defineEmits<{ (e: 'click', event: MouseEvent): void }>()

function onClick(e: MouseEvent | KeyboardEvent) {
  emit('click', e as MouseEvent)
}
</script>

<template>
  <span
    class="chip"
    :class="{ active }"
    role="button"
    tabindex="0"
    @click="onClick"
    @keydown.enter="onClick"
  >
    <span>{{ label }}</span>
    <DingIcon v-if="helpIcon" name="help-outline" :size="12" class="help" />
  </span>
</template>
