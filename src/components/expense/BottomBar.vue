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
    <div class="bottom-bar__inner">
      <BaseButton variant="secondary" size="md" block class="bottom-bar__btn" @click="saveDraft">保存草稿</BaseButton>
      <BaseButton
        variant="primary"
        size="md"
        block
        class="bottom-bar__btn"
        :disabled="!isValid"
        @click="submit"
      >提交</BaseButton>
    </div>
  </footer>
</template>

<style scoped>
/* 移动端：吸底，左右两按钮 */
.bottom-bar {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-canvas);
  padding: 10px 12px calc(10px + env(safe-area-inset-bottom));
  border-top: 1px solid var(--color-hairline);
  z-index: 100;
}
.bottom-bar__inner {
  display: flex;
  gap: 12px;
}
.bottom-bar__inner :deep(.base-btn--secondary) { flex: 0.8; }
.bottom-bar__inner :deep(.base-btn--primary) { flex: 1; }

/* 桌面端：右下角浮动面板，上下堆叠两按钮 */
@media (min-width: var(--bp-desktop)) {
  .bottom-bar {
    position: fixed;
    right: 32px;
    bottom: 32px;
    left: auto;
    width: 144px;
    padding: 12px;
    background: var(--color-canvas);
    border: 1px solid var(--color-hairline);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-m);
  }
  .bottom-bar__inner {
    flex-direction: column;
    gap: 8px;
  }
  .bottom-bar__inner :deep(.base-btn--secondary),
  .bottom-bar__inner :deep(.base-btn--primary) {
    flex: none;
    width: 100%;
  }
}
</style>
