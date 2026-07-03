<script setup lang="ts">
import BaseCapsule from '../base/BaseCapsule.vue'
import { useToast } from '@/composables/useToast'

const emit = defineEmits<{ (e: 'select'): void }>()
const toast = useToast()

function onClick() {
  toast.show('请在钉钉 App 端选择关联申请单')
  emit('select')
}
</script>

<template>
  <div class="related-apply-wrapper">
    <BaseCapsule icon="link" placeholder="请选择" @click="onClick" />
  </div>
</template>

<style scoped>
.related-apply-wrapper {
  margin: 12px 12px 0;
  display: flex;
}
</style>
