<script setup lang="ts">
import type { BusinessFields } from '@/composables/useExpenseForm'

defineProps<{
  fields: BusinessFields
  options: {
    projects: { value: string; label: string }[]
    customers: { value: string; label: string }[]
    accounts: { value: string; label: string }[]
    entities: { value: string; label: string }[]
  }
}>()

const emit = defineEmits<{
  (e: 'update:fields', v: BusinessFields): void
}>()
</script>

<template>
  <div class="business-fields">
    <div class="business-fields__grid">
      <FormField label="项目">
        <SelectPicker
          :model-value="fields.projectId"
          :options="options.projects"
          placeholder="请选择"
          @update:model-value="(v: string | string[] | null) => emit('update:fields', { ...fields, projectId: v as string })"
        />
      </FormField>
      <FormField label="客户">
        <SelectPicker
          :model-value="fields.customerId"
          :options="options.customers"
          placeholder="请选择"
          @update:model-value="(v: string | string[] | null) => emit('update:fields', { ...fields, customerId: v as string })"
        />
      </FormField>
      <FormField label="收款账户">
        <SelectPicker
          :model-value="fields.accountId"
          :options="options.accounts"
          placeholder="请选择"
          @update:model-value="(v: string | string[] | null) => emit('update:fields', { ...fields, accountId: v as string })"
        />
      </FormField>
      <FormField label="企业主体">
        <SelectPicker
          :model-value="fields.entityId"
          :options="options.entities"
          placeholder="请选择"
          @update:model-value="(v: string | string[] | null) => emit('update:fields', { ...fields, entityId: v as string })"
        />
      </FormField>
      <FormField label="付款时间" class="business-fields__date">
        <DatePicker
          :model-value="fields.payAt"
          placeholder="请选择"
          @update:model-value="(v: string | null) => emit('update:fields', { ...fields, payAt: v })"
        />
      </FormField>
    </div>
  </div>
</template>

<style scoped>
.business-fields__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.business-fields__date {
  grid-column: span 2;
}
</style>
