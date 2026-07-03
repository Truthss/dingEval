<script setup lang="ts">
interface Props {
  padding?: 'sm' | 'md' | 'lg'
  elevated?: boolean
}

withDefaults(defineProps<Props>(), {
  padding: 'md',
  elevated: false
})
</script>

<template>
  <div :class="['base-card', `base-card--p-${padding}`, { 'base-card--elevated': elevated }]">
    <slot />
  </div>
</template>

<style scoped>
.base-card {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-s);
  overflow: hidden;
}
.base-card--p-sm { padding: 12px; }
.base-card--p-md { padding: 16px; }
.base-card--p-lg { padding: 20px; }
.base-card--elevated { box-shadow: var(--shadow-m); }
</style>
