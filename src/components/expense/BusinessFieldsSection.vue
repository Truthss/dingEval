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
  <div class="card">
    <BaseField label="项目">
      <BaseSelect v-model="expense.project" :options="projects" title="选择项目" />
    </BaseField>
    <BaseField label="客户">
      <BaseSelect v-model="expense.customer" :options="customers" title="选择客户" />
    </BaseField>
    <BaseField label="收款账户">
      <BaseSelect v-model="expense.payeeAccount" :options="accounts" title="选择收款账户" />
    </BaseField>
    <BaseField label="企业主体">
      <BaseSelect v-model="expense.entity" :options="entities" title="选择企业主体" />
    </BaseField>
    <BaseField label="付款时间">
      <BaseDatePicker v-model="expense.payAt" />
    </BaseField>
  </div>
</template>
