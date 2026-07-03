<script setup lang="ts">
import type { InvoiceStatus } from '@/types/expense'
import DingIcon from '../base/DingIcon.vue'
import { useToast } from '@/composables/useToast'

interface Props {
  modelValue: InvoiceStatus
}

defineProps<Props>()
const emit = defineEmits<{ (e: 'update:modelValue', v: InvoiceStatus): void }>()

const toast = useToast()

function addInvoice() {
  toast.show('该功能需要钉钉 App 端支持')
}

function setStatus(v: InvoiceStatus) {
  emit('update:modelValue', v)
}
</script>

<template>
  <div class="sub-block">
    <div class="sub-head">
      <h5>发票</h5>
      <button type="button" class="add-btn" @click="addInvoice">
        <DingIcon name="add" :size="14" />
        <span>添加发票</span>
      </button>
    </div>
    <p class="hint">支持智能识别电子、纸质发票的金额等信息</p>
    <div class="chip-row">
      <button
        type="button"
        class="chip"
        :class="{ active: modelValue === 'none' }"
        @click="setStatus('none')"
      >无发票</button>
      <button
        type="button"
        class="chip"
        :class="{ active: modelValue === 'pending' }"
        @click="setStatus('pending')"
      >
        <span>待收发票</span>
        <DingIcon name="help-outline" :size="12" class="help" />
      </button>
    </div>
  </div>
</template>
