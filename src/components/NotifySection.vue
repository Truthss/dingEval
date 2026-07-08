<script setup lang="ts">
import type { User } from '@/api/client'

defineProps<{
  modelValue: string[]
  users: User[]
  loadError?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: string[]): void
  (e: 'pick'): void
}>()
</script>

<template>
  <div class="notify">
    <div class="notify__head">
      <h4 class="notify__title">
        发送到聊天
        <span class="notify__help" aria-label="帮助" title="提交后这些用户会在钉钉工作通知中收到消息">?</span>
      </h4>
    </div>
    <div
      v-if="loadError && users.length === 0"
      class="notify__fallback"
      role="status"
    >
      暂无可选人员，请手动输入员工号
    </div>
    <PersonChips
      v-else
      :model-value="modelValue"
      :users="users"
      @update:model-value="(v: string[]) => emit('update:modelValue', v)"
      @pick="emit('pick')"
    />
  </div>
</template>

<style scoped>
.notify {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notify__head {
  display: flex;
  align-items: center;
  gap: 6px;
}

.notify__title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--color-ink);
}

.notify__help {
  display: inline-grid;
  place-items: center;
  width: 14px;
  height: 14px;
  border-radius: var(--radius-full);
  background: var(--color-mute);
  color: var(--color-on-primary);
  font-size: 10px;
  font-weight: var(--font-weight-semibold);
  cursor: help;
}

.notify__fallback {
  font-size: var(--font-size-footnote);
  color: var(--color-warning);
  background: rgba(255, 146, 0, 0.08);
  border-radius: var(--radius-xs);
  padding: 8px 12px;
}
</style>
