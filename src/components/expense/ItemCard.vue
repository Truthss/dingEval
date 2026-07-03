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
  <div class="card">
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

    <BaseField label="报销金额(元)" :required="true" :error="errors.amount" data-field="amount">
      <BaseInput
        v-model="item.amount"
        type="number"
        inputmode="decimal"
        placeholder="请输入金额"
        @update:model-value="emit('clear-error', 'amount')"
      />
    </BaseField>

    <BaseField label="费用发生日期" :required="true" :error="errors.occurredAt" data-field="date">
      <BaseDatePicker
        v-model="item.occurredAt"
        @update:model-value="emit('clear-error', 'occurredAt')"
      />
    </BaseField>

    <BaseField label="费用类型" :required="true" :error="errors.category" data-field="category">
      <BaseSelect
        v-model="item.category"
        :options="categories"
        :title="'选择费用类型'"
        @update:model-value="emit('clear-error', 'category')"
      />
    </BaseField>

    <BaseField label="费用说明" :block="true">
      <BaseTextarea
        v-model="item.description"
        placeholder="请输入费用说明"
        :rows="2"
      />
    </BaseField>

    <InvoiceSubBlock v-model="item.invoiceStatus" />
    <AttachmentBlock />
  </div>
</template>
