<script setup lang="ts">
import { Icon } from '@iconify/vue'

interface Props {
  name: string
  size?: number
  color?: string
}

withDefaults(defineProps<Props>(), {
  size: 20,
  color: 'currentColor'
})
</script>

<template>
  <Icon v-if="name" :icon="`ic:baseline-${name}`" :width="size" :height="size" :color="color" />
  <span v-else class="ding-icon-placeholder" />
</template>

<style scoped>
.ding-icon-placeholder {
  display: inline-block;
  width: 20px;
  height: 20px;
}
</style>
