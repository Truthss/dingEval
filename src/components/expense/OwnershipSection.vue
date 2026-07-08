<script setup lang="ts">
import BaseField from '../base/BaseField.vue'
import BaseTextarea from '../base/BaseTextarea.vue'
import { useExpenseStore } from '@/stores/expense'

const expense = useExpenseStore()
</script>

<template>
  <div class="card ownership-grid">
    <div class="field readonly-field">
      <label class="label">归属人</label>
      <div class="value">{{ expense.owner }}</div>
    </div>
    <div class="field readonly-field">
      <label class="label">归属部门</label>
      <div class="value">{{ expense.department }}</div>
    </div>
    <BaseField label="备注" :block="true" class="ownership-grid__span-2">
      <BaseTextarea v-model="expense.remark" placeholder="请输入" :rows="2" size="md" />
    </BaseField>
  </div>
</template>

<style scoped>
.readonly-field .value { color: var(--color-ink); }

.ownership-grid {
  display: flex;
  flex-direction: column;
}

@media (min-width: 960px) {
  .ownership-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: var(--layout-grid-gap-col);
    row-gap: 0;
    margin: 0;
    box-shadow: none;
    background: transparent;
  }

  .ownership-grid__span-2 {
    grid-column: span 2;
  }
}
</style>
