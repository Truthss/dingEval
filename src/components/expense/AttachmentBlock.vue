<script setup lang="ts">
import DingIcon from '../base/DingIcon.vue'
import { useToast } from '@/composables/useToast'

const toast = useToast()

function add() {
  toast.show('该功能需要钉钉 App 端支持')
}
</script>

<template>
  <button type="button" class="attach-row" @click="add">
    <DingIcon name="attach-file" :size="18" />
    <span>添加附件</span>
  </button>
</template>
