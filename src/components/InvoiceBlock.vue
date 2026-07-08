<script setup lang="ts">
withDefaults(defineProps<{
  status?: 'none' | 'pending'
}>(), {
  status: 'none'
})

const emit = defineEmits<{
  (e: 'add'): void
}>()
</script>

<template>
  <div class="invoice-block">
    <div class="invoice-block__head">
      <h4 class="invoice-block__title">发票</h4>
      <div class="invoice-block__tags">
        <span class="invoice-block__tag" :class="{ 'is-active': status === 'none' }">[无发票]</span>
        <span class="invoice-block__tag" :class="{ 'is-active': status === 'pending' }">
          [待收发票]
          <span class="invoice-block__help" aria-hidden="true">?</span>
        </span>
      </div>
    </div>
    <p class="invoice-block__hint">支持智能识别电子、纸质发票的金额等信息</p>
    <button type="button" class="invoice-block__add" @click="emit('add')">
      <span class="invoice-block__add-icon" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <line x1="7" y1="3" x2="7" y2="11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="3" y1="7" x2="11" y2="7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </span>
      <span>添加发票</span>
    </button>
  </div>
</template>

<style scoped>
.invoice-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.invoice-block__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.invoice-block__title {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--color-ink);
}

.invoice-block__tags {
  display: flex;
  gap: 8px;
}

.invoice-block__tag {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 4px 10px;
  font-size: var(--font-size-caption);
  color: var(--color-body);
  background: var(--color-canvas);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all 0.15s;
}

.invoice-block__tag:hover {
  border-color: var(--color-hairline-strong);
}

.invoice-block__tag.is-active {
  background: rgba(0, 127, 255, 0.08);
  color: var(--color-primary);
  border-color: rgba(0, 127, 255, 0.32);
}

.invoice-block__help {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: 12px;
  border-radius: var(--radius-full);
  background: var(--color-mute);
  color: var(--color-on-primary);
  font-size: 9px;
  font-weight: var(--font-weight-semibold);
}

.invoice-block__hint {
  font-size: var(--font-size-caption);
  color: var(--color-body);
}

.invoice-block__add {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  font-size: var(--font-size-footnote);
  color: var(--color-primary);
  background: transparent;
  border: 0;
  border-radius: var(--radius-xs);
  cursor: pointer;
  font-family: var(--font-family-base);
  transition: background 0.15s;
}

.invoice-block__add:hover {
  background: rgba(0, 127, 255, 0.06);
}

.invoice-block__add-icon {
  display: inline-flex;
  color: currentColor;
}
</style>
