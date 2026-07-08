<script setup lang="ts">
import type { Item, ItemErrors } from '@/composables/useExpenseForm'

defineProps<{
  items: Item[]
  categories: { value: string; label: string }[]
  errors?: ItemErrors
}>()

const emit = defineEmits<{
  (e: 'add'): void
  (e: 'remove', id: string): void
  (e: 'update:item', id: string, patch: Partial<Item>): void
  (e: 'clearError', index: number, key: 'amount' | 'occurredAt' | 'category'): void
}>()

function confirmRemove(id: string): void {
  if (window.confirm('确定删除这条报销明细？')) {
    emit('remove', id)
  }
}
</script>

<template>
  <div class="item-list">
    <div
      v-for="(item, index) in items"
      :key="item.id"
      class="item-list__row"
    >
      <header class="item-list__row-head">
        <h4 class="item-list__row-title">报销明细 {{ index + 1 }}</h4>
        <button
          v-if="items.length > 1"
          type="button"
          class="item-list__row-remove"
          @click="confirmRemove(item.id)"
        >
          删除
        </button>
      </header>

      <div class="item-list__row-grid">
        <FormField
          label="报销金额（元）"
          required
          :error="errors?.[index]?.amount"
        >
          <MoneyInput
            :model-value="item.amount"
            placeholder="请输入金额"
            @update:model-value="(v: number | null) => { emit('update:item', item.id, { amount: v }); emit('clearError', index, 'amount') }"
          />
        </FormField>

        <FormField
          label="费用发生日期"
          required
          :error="errors?.[index]?.occurredAt"
        >
          <DatePicker
            :model-value="item.occurredAt"
            @update:model-value="(v: string | null) => { emit('update:item', item.id, { occurredAt: v }); emit('clearError', index, 'occurredAt') }"
          />
        </FormField>

        <FormField
          label="费用类型"
          required
          :error="errors?.[index]?.category"
        >
          <SelectPicker
            :model-value="item.category"
            :options="categories"
            placeholder="请选择"
            @update:model-value="(v: string | string[] | null) => { emit('update:item', item.id, { category: v as string }); emit('clearError', index, 'category') }"
          />
        </FormField>

        <FormField label="费用说明" class="item-list__row-textarea">
          <TextareaInput
            :model-value="item.description"
            placeholder="请输入费用说明"
            :rows="3"
            :maxlength="200"
            @update:model-value="(v: string) => emit('update:item', item.id, { description: v })"
          />
        </FormField>
      </div>
    </div>

    <button
      v-if="items.length < 20"
      type="button"
      class="item-list__add"
      @click="emit('add')"
    >
      <span class="item-list__add-icon" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <line x1="7" y1="3" x2="7" y2="11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="3" y1="7" x2="11" y2="7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </span>
      <span>添加报销明细</span>
    </button>
  </div>
</template>

<style scoped>
.item-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.item-list__row {
  background: var(--color-canvas-soft);
  border-radius: var(--radius-md);
  padding: 20px;
}

.item-list__row-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.item-list__row-title {
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-semibold);
  color: var(--color-ink);
}

.item-list__row-remove {
  font-size: var(--font-size-footnote);
  color: var(--color-error);
  background: transparent;
  border: 0;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--radius-xs);
  font-family: var(--font-family-base);
  transition: background 0.15s;
}

.item-list__row-remove:hover {
  background: rgba(255, 82, 25, 0.08);
}

.item-list__row-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.item-list__row-textarea {
  grid-column: span 2;
}

.item-list__add {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: var(--layout-button-height);
  padding: 0 20px;
  font-size: var(--font-size-body);
  color: var(--color-primary);
  background: var(--color-canvas);
  border: 1px dashed rgba(0, 127, 255, 0.32);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-family: var(--font-family-base);
  align-self: flex-start;
  transition: background 0.15s, border-color 0.15s;
}

.item-list__add:hover {
  background: rgba(0, 127, 255, 0.04);
  border-color: var(--color-primary);
}

.item-list__add-icon {
  display: inline-flex;
  color: currentColor;
}
</style>
