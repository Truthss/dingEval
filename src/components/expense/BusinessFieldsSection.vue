<script setup lang="ts">
import BaseField from '../base/BaseField.vue'
import BaseSelect from '../base/BaseSelect.vue'
import BaseDatePicker from '../base/BaseDatePicker.vue'
import { useExpenseStore } from '@/stores/expense'
import { projects } from '@/mocks/projects'
import { customers } from '@/mocks/customers'
import { accounts } from '@/mocks/accounts'
import { entities } from '@/mocks/entities'

const expense = useExpenseStore()
</script>

<template>
  <div class="card business-grid">
    <BaseField label="项目">
      <BaseSelect v-model="expense.project" :options="projects" title="选择项目" size="md" />
    </BaseField>
    <BaseField label="客户">
      <BaseSelect v-model="expense.customer" :options="customers" title="选择客户" size="md" />
    </BaseField>
    <BaseField label="收款账户">
      <BaseSelect v-model="expense.payeeAccount" :options="accounts" title="选择收款账户" size="md" />
    </BaseField>
    <BaseField label="企业主体">
      <BaseSelect v-model="expense.entity" :options="entities" title="选择企业主体" size="md" />
    </BaseField>
    <BaseField label="付款时间" class="business-grid__span-2">
      <BaseDatePicker v-model="expense.payAt" size="md" />
    </BaseField>
  </div>
</template>

<style scoped>
.business-grid {
  display: flex;
  flex-direction: column;
}

@media (min-width: 960px) {
  .business-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: var(--layout-grid-gap-col);
    row-gap: 0;
    margin: 0;
    box-shadow: none;
    background: transparent;
  }

  .business-grid__span-2 {
    grid-column: span 2;
  }
}
</style>
