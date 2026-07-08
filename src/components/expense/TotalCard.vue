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
    <div class="total-card__head">
      <div>
        <div class="total-card__label">报销总额</div>
        <div class="total-card__amount">
          <span class="total-card__symbol">¥</span>
          <span class="total-card__num">{{ formatMoney(total) }}</span>
        </div>
      </div>
    </div>

    <div class="total-card__divider" />

    <div class="total-card__actions">
      <button type="button" class="total-card__action" @click="showUnsupported">
        <DingIcon name="upload" :size="16" />
        <span>批量导入</span>
      </button>
      <button type="button" class="total-card__action" @click="showUnsupported">
        <DingIcon name="description" :size="16" />
        <span>导入随手记</span>
      </button>
      <button type="button" class="total-card__action" @click="showUnsupported">
        <DingIcon name="qr-code-scanner" :size="16" />
        <span>发票识别</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.total-card {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  margin: 12px 12px 0;
  padding: 18px 16px 14px;
  box-shadow: var(--shadow-s);
}

.total-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
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
}

.total-card__symbol {
  font-size: 18px;
  color: var(--color-error);
  font-weight: 500;
  line-height: 1;
}

.total-card__num {
  font-size: 32px;
  color: var(--color-error);
  font-weight: 600;
  letter-spacing: -0.5px;
  font-variant-numeric: tabular-nums;
  font-family: var(--font-family-mono);
  line-height: 1.1;
}

.total-card__divider {
  height: 1px;
  background: var(--color-hairline);
  margin: 14px 0 12px;
}

.total-card__actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.total-card__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 4px;
  color: var(--color-primary);
  font-size: 12px;
  font-weight: 500;
  border-radius: var(--radius-xs);
  background: transparent;
  border: 0;
  cursor: pointer;
  transition: background 0.15s;
  font-family: inherit;
}
.total-card__action:hover { background: rgba(0, 127, 255, 0.06); }
.total-card__action svg { flex-shrink: 0; }

@media (min-width: 960px) {
  .total-card {
    margin: 0;
    padding: 20px 24px 16px;
  }

  .total-card__label {
    font-size: 13px;
    color: var(--color-mute);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }

  .total-card__symbol {
    font-size: 20px;
  }

  .total-card__num {
    font-size: 32px;
  }

  .total-card__actions {
    grid-template-columns: repeat(3, max-content);
    gap: 16px;
    justify-content: start;
  }

  .total-card__action {
    padding: 6px 10px;
    font-size: 13px;
  }
}
</style>
