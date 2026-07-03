<script setup lang="ts">
import BaseButton from '../base/BaseButton.vue'
import { useToast } from '@/composables/useToast'
import { useDraftStorage } from '@/utils/draftStorage'
import { useExpenseStore } from '@/stores/expense'

interface Props {
  isValid: boolean
}

withDefaults(defineProps<Props>(), { isValid: false })

const emit = defineEmits<{ (e: 'submit'): void }>()

const toast = useToast()
const expense = useExpenseStore()

function saveDraft() {
  const draft = expense.toDraft()
  useDraftStorage().save(draft)
  toast.show({ message: '已保存为草稿', type: 'success' })
}

function submit() {
  emit('submit')
}
</script>

<template>
  <footer class="bottom-bar">
    <BaseButton variant="secondary" @click="saveDraft">保存草稿</BaseButton>
    <BaseButton
      variant="primary"
      :disabled="!isValid"
      @click="submit"
    >提交</BaseButton>
  </footer>
</template>

<style scoped>
.bottom-bar {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-canvas);
  padding: 10px 12px calc(10px + env(safe-area-inset-bottom));
  display: flex;
  gap: 12px;
  border-top: 1px solid var(--color-hairline);
  z-index: 100;
}
.bottom-bar :deep(.base-btn--secondary) { flex: 0.8; }
.bottom-bar :deep(.base-btn--primary) { flex: 1; }
</style>
