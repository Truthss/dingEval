<script setup lang="ts">
import DingIcon from '../base/DingIcon.vue'
import { useToast } from '@/composables/useToast'
import { useExpenseStore } from '@/stores/expense'
import type { InvoiceStatus } from '@/types/expense'

const toast = useToast()
const expense = useExpenseStore()

function addInvoice() {
  toast.show('该功能需要钉钉 App 端支持')
}

function setStatus(v: InvoiceStatus) {
  expense.invoiceStatus = v
}
</script>

<template>
  <div class="card">
    <div class="section-title">
      <span>发票</span>
      <button type="button" class="add-btn" @click="addInvoice">
        <DingIcon name="add" :size="14" />
        <span>添加发票</span>
      </button>
    </div>
    <div class="sub-block global-invoice-sub">
      <p class="hint">支持智能识别电子、纸质发票的金额等信息</p>
      <div class="chip-row">
        <button
          type="button"
          class="chip"
          :class="{ active: expense.invoiceStatus === 'none' }"
          @click="setStatus('none')"
        >无发票</button>
        <button
          type="button"
          class="chip"
          :class="{ active: expense.invoiceStatus === 'pending' }"
          @click="setStatus('pending')"
        >
          <span>待收发票</span>
          <DingIcon name="help-outline" :size="12" class="help" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.global-invoice-sub {
  background: var(--color-canvas);
}
</style>
