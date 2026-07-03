<script setup lang="ts">
import { ref, type Ref } from 'vue'
import DingIcon from '../base/DingIcon.vue'
import { useActionSheet } from '@/composables/useActionSheet'
import { useExpenseStore } from '@/stores/expense'
import { persons, findPersonDisplay } from '@/mocks/persons'

interface Props {
  payerRef?: Ref<HTMLElement | null>
}

withDefaults(defineProps<Props>(), { payerRef: undefined })

const expense = useExpenseStore()
const sheet = useActionSheet()

const approverRowRef = ref<HTMLElement | null>(null)
const payerRowRef = ref<HTMLElement | null>(null)
const ccRowRef = ref<HTMLElement | null>(null)

defineExpose({ approverRowRef, payerRowRef, ccRowRef })

function openApprover() {
  sheet.open({
    title: '选择审批人',
    options: persons,
    current: expense.approver,
    onSelect: (val) => {
      if (val) expense.approver = val
    }
  })
}

function openPayer() {
  sheet.open({
    title: '选择付款人',
    options: persons,
    current: expense.payer,
    onSelect: (val) => {
      if (val) expense.payer = val
    }
  })
}

function openCc() {
  const available = persons.filter((p) => !expense.cc.includes(p.value))
  if (available.length === 0) return
  sheet.open({
    title: '选择抄送人',
    options: available,
    onSelect: (val) => {
      if (val && !expense.cc.includes(val)) {
        expense.cc = [...expense.cc, val]
      }
    }
  })
}

function removeCc(value: string) {
  expense.cc = expense.cc.filter((v) => v !== value)
}

function ccLabel(value: string): string {
  return persons.find((p) => p.value === value)?.label ?? value
}
</script>

<template>
  <div class="card">
    <div class="section-title">
      <span>流程</span>
    </div>
    <div class="flow-list">
      <div ref="approverRowRef" class="flow-item">
        <span class="dot" />
        <div class="info">
          <div class="name">审批人</div>
          <div class="meta">{{ findPersonDisplay(expense.approver) || '请选择审批人' }}</div>
        </div>
        <button type="button" class="add-btn-icon" aria-label="选择审批人" @click="openApprover">
          <DingIcon name="add" :size="16" />
        </button>
      </div>

      <div ref="payerRowRef" class="flow-item" :class="{ 'has-error': !expense.payer }">
        <span class="dot" />
        <div class="info">
          <div class="name">
            <span>付款人</span>
            <span class="req">*</span>
          </div>
          <div class="meta">{{ findPersonDisplay(expense.payer) || '请选择' }}</div>
        </div>
        <button type="button" class="add-btn-icon" aria-label="选择付款人" @click="openPayer">
          <DingIcon name="add" :size="16" />
        </button>
      </div>

      <div ref="ccRowRef" class="flow-item">
        <span class="dot" />
        <div class="info">
          <div class="name">抄送人</div>
          <div v-if="expense.cc.length === 0" class="meta">请选择抄送人</div>
          <div v-else class="cc-chips">
            <span
              v-for="v in expense.cc"
              :key="v"
              class="cc-chip"
            >
              <span>{{ ccLabel(v) }}</span>
              <span class="cc-chip__close" @click="removeCc(v)">
                <DingIcon name="close" :size="12" />
              </span>
            </span>
          </div>
        </div>
        <button type="button" class="add-btn-icon" aria-label="选择抄送人" @click="openCc">
          <DingIcon name="add" :size="16" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cc-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}
.cc-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  background: rgba(0, 127, 255, 0.08);
  color: var(--color-primary);
  border-radius: var(--radius-full);
  font-size: 12px;
}
.cc-chip__close {
  color: var(--color-mute);
  display: grid;
  place-items: center;
  width: 12px;
  height: 12px;
  cursor: pointer;
}
.cc-chip__close:hover { color: var(--color-error); }
</style>
