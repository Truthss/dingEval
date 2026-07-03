<script setup lang="ts">
import DingIcon from '../base/DingIcon.vue'
import { useToast } from '@/composables/useToast'
import { formatMoney } from '@/utils/money'

interface Props {
  total: number
}

defineProps<Props>()

const toast = useToast()

function showUnsupported() {
  toast.show('该功能需要钉钉 App 端支持')
}
</script>

<template>
  <div class="total-card">
    <div class="total-card__label">报销总额</div>
    <div class="total-card__amount">
      <span class="total-card__symbol">¥</span>
      <span class="total-card__num">{{ formatMoney(total) }}</span>
    </div>
    <div class="total-card__actions">
      <button type="button" class="total-card__action" @click="showUnsupported">
        <DingIcon name="upload" :size="20" />
        <span>批量导入</span>
      </button>
      <button type="button" class="total-card__action" @click="showUnsupported">
        <DingIcon name="description" :size="20" />
        <span>导入随手记</span>
      </button>
      <button type="button" class="total-card__action" @click="showUnsupported">
        <DingIcon name="qr-code-scanner" :size="20" />
        <span>发票识别</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.total-card {
  margin: 12px 12px 0;
  background: linear-gradient(180deg, rgba(0, 127, 255, 0.06) 0%, rgba(0, 127, 255, 0.02) 100%);
  border-radius: var(--radius-md);
  padding: 18px 16px 14px;
  box-shadow: var(--shadow-s);
  position: relative;
  overflow: hidden;
}
.total-card__label {
  font-size: 13px;
  color: var(--color-body);
  margin-bottom: 6px;
}
.total-card__amount {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 14px;
}
.total-card__symbol { font-size: 18px; color: var(--color-error); font-weight: 500; }
.total-card__num {
  font-size: 32px;
  color: var(--color-error);
  font-weight: 600;
  letter-spacing: -0.5px;
  font-variant-numeric: tabular-nums;
  font-family: var(--font-family-mono);
}
.total-card__actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding-top: 12px;
  border-top: 1px dashed var(--color-hairline-strong);
}
.total-card__action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 4px 0;
  color: var(--color-primary);
  font-size: 12px;
  border-radius: var(--radius-xs);
  background: transparent;
  border: 0;
  cursor: pointer;
  transition: background 0.15s;
}
.total-card__action:hover { background: rgba(0, 127, 255, 0.06); }

@media (min-width: 960px) {
  .total-card { margin: 0; }
}
</style>
