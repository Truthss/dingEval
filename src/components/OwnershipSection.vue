<script setup lang="ts">
import type { User } from '@/api/client'

defineProps<{
  ownership: { owner: string; department: string; remark: string }
  users?: User[]
}>()

const emit = defineEmits<{
  (e: 'update:ownership', v: { owner: string; department: string; remark: string }): void
}>()
</script>

<template>
  <div class="ownership">
    <div class="ownership__grid">
      <FormField label="归属人">
        <TextInput
          :model-value="ownership.owner"
          placeholder="请输入归属人"
          @update:model-value="(v: string) => emit('update:ownership', { ...ownership, owner: v })"
        />
      </FormField>
      <FormField label="归属部门">
        <TextInput
          :model-value="ownership.department"
          placeholder="请输入归属部门"
          @update:model-value="(v: string) => emit('update:ownership', { ...ownership, department: v })"
        />
      </FormField>
      <FormField label="备注" class="ownership__remark">
        <TextareaInput
          :model-value="ownership.remark"
          placeholder="请输入备注"
          :rows="3"
          :maxlength="500"
          @update:model-value="(v: string) => emit('update:ownership', { ...ownership, remark: v })"
        />
      </FormField>
    </div>
  </div>
</template>

<style scoped>
.ownership {
  display: flex;
  flex-direction: column;
}

.ownership__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.ownership__remark {
  grid-column: span 2;
}
</style>
