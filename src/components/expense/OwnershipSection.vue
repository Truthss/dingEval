<script setup lang="ts">
import BaseField from '../base/BaseField.vue'
import BaseTextarea from '../base/BaseTextarea.vue'
import { useExpenseStore } from '@/stores/expense'

const expense = useExpenseStore()
</script>

<template>
  <div class="card">
    <div class="field readonly-field">
      <label class="label">归属人</label>
      <div class="value">{{ expense.owner }}</div>
    </div>
    <div class="field readonly-field">
      <label class="label">归属部门</label>
      <div class="value">{{ expense.department }}</div>
    </div>
    <BaseField label="备注" :block="true">
      <BaseTextarea v-model="expense.remark" placeholder="请输入" :rows="2" />
    </BaseField>
  </div>
</template>

<style scoped>
.readonly-field .value { color: var(--color-ink); }
</style>
