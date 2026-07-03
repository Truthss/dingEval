<script setup lang="ts">
import DingIcon from './DingIcon.vue'

interface Props {
  icon?: string
  placeholder?: string
  active?: boolean
}

withDefaults(defineProps<Props>(), {
  icon: 'link',
  placeholder: '请选择',
  active: false
})

const emit = defineEmits<{ (e: 'click', event: MouseEvent): void }>()

function onClick(e: MouseEvent) {
  emit('click', e)
}
</script>

<template>
  <button
    type="button"
    class="capsule"
    :class="{ 'capsule--active': active }"
    @click="onClick"
  >
    <DingIcon v-if="!$slots.default" :name="icon" :size="16" />
    <slot>
      <span class="capsule__placeholder">+ {{ placeholder }}</span>
    </slot>
    <DingIcon name="chevron-right" :size="14" color="var(--color-mute)" class="capsule__chevron" />
  </button>
</template>

<style scoped>
.capsule {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: var(--radius-full);
  font-size: 14px;
  font-weight: 500;
  background: var(--color-canvas);
  color: var(--color-primary);
  border: 1px solid var(--color-hairline-strong);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.capsule:hover { background: rgba(126, 134, 142, 0.06); }
.capsule--active {
  border-color: var(--color-primary);
  background: rgba(0, 127, 255, 0.04);
}
.capsule__placeholder { color: var(--color-primary); }
.capsule__chevron { margin-left: 2px; }
</style>
