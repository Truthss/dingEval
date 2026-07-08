<script setup lang="ts">
defineProps<{
  total: number
}>()

const emit = defineEmits<{
  (e: 'batchImport'): void
  (e: 'importNote'): void
  (e: 'invoiceRecognize'): void
}>()

function fmt(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
</script>

<template>
  <div class="total-card">
    <div class="total-card__head">
      <span class="total-card__label">报销总额</span>
      <span class="total-card__amount">¥ {{ fmt(total) }}</span>
    </div>
    <div class="total-card__actions">
      <button type="button" class="total-card__action" @click="emit('batchImport')">
        <span class="total-card__action-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/>
            <line x1="7" y1="7" x2="7" y2="13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="7" y1="10" x2="13" y2="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </span>
        <span>批量导入</span>
      </button>
      <button type="button" class="total-card__action" @click="emit('importNote')">
        <span class="total-card__action-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 4H11L15 8V16H5V4Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
            <line x1="7" y1="11" x2="13" y2="11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="7" y1="14" x2="11" y2="14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </span>
        <span>导入随手记</span>
      </button>
      <button type="button" class="total-card__action" @click="emit('invoiceRecognize')">
        <span class="total-card__action-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="3" y="5" width="14" height="10" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
            <line x1="3" y1="9" x2="17" y2="9" stroke="currentColor" stroke-width="1.5"/>
          </svg>
        </span>
        <span>发票识别</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.total-card {
  background: var(--color-canvas-soft);
  border-radius: var(--radius-md);
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.total-card__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
}

.total-card__label {
  font-size: var(--font-size-caption);
  color: var(--color-body);
}

.total-card__amount {
  font-size: var(--font-size-large-title);
  font-weight: var(--font-weight-semibold);
  color: var(--color-error);
  font-variant-numeric: tabular-nums;
  line-height: 1;
  letter-spacing: -0.5px;
}

.total-card__actions {
  display: flex;
  gap: 16px;
}

.total-card__action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  font-size: var(--font-size-body);
  color: var(--color-primary);
  background: transparent;
  border: 0;
  border-radius: var(--radius-xs);
  cursor: pointer;
  font-family: var(--font-family-base);
  transition: background 0.15s;
}

.total-card__action:hover {
  background: rgba(0, 127, 255, 0.08);
}

.total-card__action-icon {
  display: inline-flex;
  color: currentColor;
}
</style>
