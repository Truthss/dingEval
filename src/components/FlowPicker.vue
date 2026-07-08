<script setup lang="ts">
import type { User } from '@/api/client'
import type { Flow } from '@/composables/useExpenseForm'

const props = defineProps<{
  flow: Flow
  users: User[]
  payerMissing?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:flow', v: Flow): void
  (e: 'pick', role: 'approver' | 'payer' | 'cc'): void
}>()

function removePayer(): void {
  emit('update:flow', { ...props.flow, payerId: null })
}

function removeApprover(): void {
  emit('update:flow', { ...props.flow, approverId: null })
}

function removeCc(id: string): void {
  emit('update:flow', { ...props.flow, ccUserIds: props.flow.ccUserIds.filter((x) => x !== id) })
}
</script>

<template>
  <div class="flow-picker">
    <div class="flow-picker__row" :class="{ 'has-error': payerMissing }">
      <span class="flow-picker__dot" aria-hidden="true"></span>
      <div class="flow-picker__info">
        <div class="flow-picker__name">
          <span>付款人</span>
          <span class="flow-picker__req" aria-label="必填">*</span>
        </div>
        <div v-if="flow.payerId" class="flow-picker__person">
          {{ users.find((u) => u.userid === flow.payerId)?.name ?? flow.payerId }}
          <button
            type="button"
            class="flow-picker__remove"
            aria-label="移除付款人"
            @click="removePayer"
          >×</button>
        </div>
        <div v-else class="flow-picker__placeholder">请选择</div>
      </div>
      <button
        type="button"
        class="flow-picker__add"
        aria-label="选择付款人"
        @click="emit('pick', 'payer')"
      >+</button>
    </div>

    <div class="flow-picker__row">
      <span class="flow-picker__dot" aria-hidden="true"></span>
      <div class="flow-picker__info">
        <div class="flow-picker__name">审批人</div>
        <div v-if="flow.approverId" class="flow-picker__person">
          {{ users.find((u) => u.userid === flow.approverId)?.name ?? flow.approverId }}
          <button
            type="button"
            class="flow-picker__remove"
            aria-label="移除审批人"
            @click="removeApprover"
          >×</button>
        </div>
        <div v-else class="flow-picker__placeholder">请选择审批人</div>
      </div>
      <button
        type="button"
        class="flow-picker__add"
        aria-label="选择审批人"
        @click="emit('pick', 'approver')"
      >+</button>
    </div>

    <div class="flow-picker__row">
      <span class="flow-picker__dot flow-picker__dot--last" aria-hidden="true"></span>
      <div class="flow-picker__info">
        <div class="flow-picker__name">抄送人</div>
        <div v-if="flow.ccUserIds.length > 0" class="flow-picker__cc-list">
          <span
            v-for="id in flow.ccUserIds"
            :key="id"
            class="flow-picker__cc-chip"
          >
            {{ users.find((u) => u.userid === id)?.name ?? id }}
            <button
              type="button"
              class="flow-picker__cc-remove"
              aria-label="移除抄送人"
              @click="removeCc(id)"
            >×</button>
          </span>
        </div>
        <div v-else class="flow-picker__placeholder">请选择抄送人</div>
      </div>
      <button
        type="button"
        class="flow-picker__add"
        aria-label="选择抄送人"
        @click="emit('pick', 'cc')"
      >+</button>
    </div>
  </div>
</template>

<style scoped>
.flow-picker {
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
}

.flow-picker__row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 14px 0;
  position: relative;
}

.flow-picker__row + .flow-picker__row::before {
  content: '';
  position: absolute;
  left: 5px;
  top: -10px;
  width: 1px;
  height: 24px;
  background: var(--color-hairline);
}

.flow-picker__dot {
  width: 12px;
  height: 12px;
  border-radius: var(--radius-full);
  background: var(--color-canvas);
  border: 2px solid var(--color-primary);
  margin-top: 4px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.flow-picker__dot--last {
  border-color: var(--color-hairline-strong);
}

.flow-picker__row.has-error .flow-picker__name {
  color: var(--color-error);
}

.flow-picker__row.has-error .flow-picker__placeholder {
  color: var(--color-error);
}

.flow-picker__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.flow-picker__name {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  color: var(--color-ink);
}

.flow-picker__req {
  color: var(--color-error);
  font-size: var(--font-size-caption);
  line-height: 1;
}

.flow-picker__placeholder {
  font-size: var(--font-size-footnote);
  color: var(--color-mute);
}

.flow-picker__person {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--font-size-footnote);
  color: var(--color-ink);
}

.flow-picker__remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: var(--radius-full);
  color: var(--color-mute);
  background: transparent;
  border: 0;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
}

.flow-picker__remove:hover {
  color: var(--color-error);
  background: rgba(255, 82, 25, 0.08);
}

.flow-picker__cc-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.flow-picker__cc-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  background: rgba(0, 127, 255, 0.08);
  color: var(--color-primary);
  border-radius: var(--radius-full);
  font-size: var(--font-size-footnote);
}

.flow-picker__cc-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: var(--radius-full);
  color: var(--color-mute);
  background: transparent;
  border: 0;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
}

.flow-picker__cc-remove:hover {
  color: var(--color-error);
}

.flow-picker__add {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-xs);
  background: var(--color-canvas-soft);
  color: var(--color-primary);
  border: 0;
  display: grid;
  place-items: center;
  font-size: 18px;
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  flex-shrink: 0;
  margin-top: 2px;
  transition: background 0.15s;
}

.flow-picker__add:hover {
  background: rgba(0, 127, 255, 0.12);
}
</style>
