<script setup lang="ts">
import { computed } from 'vue'
import DingIcon from '../base/DingIcon.vue'
import { useActionSheet } from '@/composables/useActionSheet'
import { useExpenseStore } from '@/stores/expense'
import { chats } from '@/mocks/chats'

const expense = useExpenseStore()
const sheet = useActionSheet()

const available = computed(() => {
  const chosen = new Set(expense.notifyChats)
  return chats.filter((c) => !chosen.has(c.value))
})

function addChat() {
  if (available.value.length === 0) {
    return
  }
  sheet.open({
    title: '选择发送对象',
    options: available.value,
    onSelect: (val) => {
      if (val) {
        expense.notifyChats = [...expense.notifyChats, val]
      }
    }
  })
}

function removeChat(value: string) {
  expense.notifyChats = expense.notifyChats.filter((v) => v !== value)
}

function chatLabel(value: string): string {
  return chats.find((c) => c.value === value)?.label ?? value
}
</script>

<template>
  <div class="card">
    <div class="notify-section">
      <div class="notify-section__row">
        <div class="notify-section__left">
          <span>发送到聊天</span>
          <DingIcon name="help-outline" :size="14" />
        </div>
        <button
          type="button"
          class="add-btn"
          :disabled="available.length === 0"
          @click="addChat"
        >
          <DingIcon name="add" :size="14" />
          <span>添加</span>
        </button>
      </div>
      <div v-if="expense.notifyChats.length > 0" class="notify-tags">
        <span
          v-for="value in expense.notifyChats"
          :key="value"
          class="tag-pill"
        >
          <span class="tag-pill__avatar">{{ chatLabel(value)[0] }}</span>
          <span>{{ chatLabel(value) }}</span>
          <span class="tag-pill__close" @click="removeChat(value)">
            <DingIcon name="close" :size="12" />
          </span>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notify-section { padding: 14px 16px; }
.notify-section__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.notify-section__left {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--color-ink);
}
.notify-section__left svg { color: var(--color-mute); width: 14px; height: 14px; }
.notify-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}
.tag-pill__avatar {
  width: 18px;
  height: 18px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  color: var(--color-on-primary);
  display: grid;
  place-items: center;
  font-size: 10px;
  font-weight: 600;
}
.tag-pill__close {
  color: var(--color-mute);
  display: grid;
  place-items: center;
  width: 14px;
  height: 14px;
  cursor: pointer;
}
.tag-pill__close:hover { color: var(--color-error); }
.add-btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
