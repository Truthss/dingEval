<script setup lang="ts">
import type { ExpenseItem } from '@/types/expense'
import { categories } from '@/mocks/categories'
import BaseField from '../base/BaseField.vue'
import BaseInput from '../base/BaseInput.vue'
import BaseSelect from '../base/BaseSelect.vue'
import BaseDatePicker from '../base/BaseDatePicker.vue'
import BaseTextarea from '../base/BaseTextarea.vue'
import DingIcon from '../base/DingIcon.vue'
import InvoiceSubBlock from './InvoiceSubBlock.vue'
import AttachmentBlock from './AttachmentBlock.vue'

interface Props {
  item: ExpenseItem
  index: number
  removable: boolean
  errors?: {
    amount?: string
    occurredAt?: string
    category?: string
  }
}

withDefaults(defineProps<Props>(), { errors: () => ({}) })
const emit = defineEmits<{
  (e: 'remove', id: string): void
  (e: 'clear-error', key: 'amount' | 'occurredAt' | 'category'): void
}>()
</script>

<template>
  <div class="card item-card">
    <div class="section-title">
      <span>报销明细 {{ index + 1 }}</span>
      <button
        v-if="removable"
        type="button"
        class="remove"
        @click="emit('remove', item.id)"
      >
        <DingIcon name="close" :size="14" />
        <span>删除</span>
      </button>
    </div>
    <div class="item-card__grid">
      <BaseField label="报销金额(元)" :required="true" :error="errors.amount" data-field="amount" class="item-card__span-2">
        <BaseInput
          v-model="item.amount"
          type="number"
          inputmode="decimal"
          placeholder="请输入金额"
          size="md"
          @update:model-value="emit('clear-error', 'amount')"
        />
      </BaseField>

      <BaseField label="费用发生日期" :required="true" :error="errors.occurredAt" data-field="date">
        <BaseDatePicker
          v-model="item.occurredAt"
          size="md"
          @update:model-value="emit('clear-error', 'occurredAt')"
        />
      </BaseField>

      <BaseField label="费用类型" :required="true" :error="errors.category" data-field="category">
        <BaseSelect
          v-model="item.category"
          :options="categories"
          :title="'选择费用类型'"
          size="md"
          @update:model-value="emit('clear-error', 'category')"
        />
      </BaseField>

      <BaseField label="费用说明" :block="true" class="item-card__span-2">
        <BaseTextarea
          v-model="item.description"
          placeholder="请输入费用说明"
          :rows="2"
          size="md"
        />
      </BaseField>

      <div class="item-card__span-2">
        <InvoiceSubBlock v-model="item.invoiceStatus" />
      </div>

      <div class="item-card__span-2">
        <AttachmentBlock />
      </div>
    </div>
  </div>
</template>

<style scoped>
.item-card__grid {
  display: flex;
  flex-direction: column;
}

@media (min-width: var(--bp-desktop)) {
  .item-card__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: var(--layout-grid-gap-col);
    row-gap: 0;
  }

  .item-card__span-2 {
    grid-column: span 2;
  }
}
</style>
