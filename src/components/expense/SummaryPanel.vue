<script setup lang="ts">
import BaseButton from '../base/BaseButton.vue'
import { useToast } from '@/composables/useToast'
import { useDraftStorage } from '@/utils/draftStorage'
import { useExpenseStore } from '@/stores/expense'
import { formatMoney } from '@/utils/money'

interface Props {
  total: number
  isValid: boolean
}

withDefaults(defineProps<Props>(), { total: 0, isValid: false })

const emit = defineEmits<{ (e: 'submit'): void }>()

const toast = useToast()
const expense = useExpenseStore()
const draftStorage = useDraftStorage()  // 顶层复用，saveDraft 内不再重复实例化

function saveDraft() {
  const draft = expense.toDraft()
  draftStorage.save(draft)
  toast.show({ message: '已保存为草稿', type: 'success' })
}

function submit() {
  emit('submit')
}
</script>

<template>
  <aside class="summary-panel" aria-label="报销汇总">
    <div class="summary-panel__label">报销总额</div>
    <div class="summary-panel__amount">
      <span class="summary-panel__symbol">¥</span>
      <span class="summary-panel__num">{{ formatMoney(total) }}</span>
    </div>

    <div class="summary-panel__divider" />

    <div class="summary-panel__actions">
      <BaseButton variant="secondary" size="md" block @click="saveDraft">保存草稿</BaseButton>
      <BaseButton
        variant="primary"
        size="md"
        block
        :disabled="!isValid"
        @click="submit"
      >提交</BaseButton>
    </div>

    <div class="summary-panel__hint">提交后将进入审批流程</div>
  </aside>
</template>

<style scoped>
.summary-panel {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-m);          /* card-elevated */
  padding: var(--space-lg);
  display: none;                        /* Mobile 默认隐藏（additive media query） */
  flex-direction: column;
  gap: var(--space-md);
  position: sticky;
  top: var(--layout-navbar-offset);
}

.summary-panel__label {
  font-size: var(--font-size-tiny);
  color: var(--color-body);
  letter-spacing: 0.5px;
}

.summary-panel__amount {
  display: flex;
  align-items: baseline;
  gap: 4px;
}
/* 金额用 ink 而非 error：error 色（红/橙）语义为"错误/危险"，
   报销总额是业务正向结果，用 error 会给用户"出错了"的负向暗示 */
.summary-panel__symbol {
  font-size: 18px;
  font-weight: 500;
  color: var(--color-ink);
}
.summary-panel__num {
  font-size: 32px;
  font-weight: 600;
  color: var(--color-ink);
  letter-spacing: -0.5px;
  font-variant-numeric: tabular-nums;
  font-family: var(--font-family-mono);
}

.summary-panel__divider {
  height: 1px;
  background: var(--color-hairline);
  margin: var(--space-xs) 0;
}

.summary-panel__actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.summary-panel__hint {
  font-size: var(--font-size-tiny);
  color: var(--color-mute);
  text-align: center;
  margin-top: var(--space-xs);
}

/* 桌面端才显示（与代码库其他组件一致的 additive 媒体查询） */
@media (min-width: 960px) {
  .summary-panel { display: flex; }
}
</style>
