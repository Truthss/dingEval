<script setup lang="ts">
import type { User } from '@/api/client'

const props = defineProps<{
  modelValue: string[]
  users: User[]
  max?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: string[]): void
  (e: 'pick'): void
}>()

function getUser(id: string): User | undefined {
  return props.users.find((u) => u.userid === id)
}

function remove(id: string): void {
  emit('update:modelValue', props.modelValue.filter((x) => x !== id))
}

function getInitial(name: string): string {
  return name ? name.charAt(0) : '?'
}
</script>

<template>
  <div class="person-chips">
    <div
      v-for="id in modelValue"
      :key="id"
      class="person-chips__chip"
    >
      <span class="person-chips__avatar">{{ getInitial(getUser(id)?.name ?? '') }}</span>
      <span class="person-chips__name">{{ getUser(id)?.name ?? id }}</span>
      <button
        type="button"
        class="person-chips__close"
        aria-label="移除"
        @click="remove(id)"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <line x1="2" y1="2" x2="8" y2="8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="8" y1="2" x2="2" y2="8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
    <button
      v-if="!max || modelValue.length < max"
      type="button"
      class="person-chips__add"
      @click="emit('pick')"
    >
      <span class="person-chips__add-icon" aria-hidden="true">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <line x1="6" y1="2.5" x2="6" y2="9.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          <line x1="2.5" y1="6" x2="9.5" y2="6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
        </svg>
      </span>
      <span>添加</span>
    </button>
  </div>
</template>

<style scoped>
.person-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.person-chips__chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 6px 0 4px;
  background: rgba(0, 127, 255, 0.08);
  color: var(--color-primary);
  border-radius: var(--radius-full);
  font-size: var(--font-size-footnote);
}

.person-chips__avatar {
  width: 20px;
  height: 20px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  color: var(--color-on-primary);
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: var(--font-weight-semibold);
}

.person-chips__name {
  line-height: 1;
}

.person-chips__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: var(--radius-full);
  color: var(--color-mute);
  background: transparent;
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
}

.person-chips__close:hover {
  color: var(--color-error);
  background: rgba(255, 82, 25, 0.08);
}

.person-chips__add {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 28px;
  padding: 0 12px;
  font-size: var(--font-size-footnote);
  color: var(--color-primary);
  background: transparent;
  border: 1px dashed rgba(0, 127, 255, 0.32);
  border-radius: var(--radius-full);
  cursor: pointer;
  font-family: var(--font-family-base);
  transition: background 0.15s, border-color 0.15s;
}

.person-chips__add:hover {
  background: rgba(0, 127, 255, 0.06);
  border-color: var(--color-primary);
}

.person-chips__add-icon {
  display: inline-flex;
  color: currentColor;
}
</style>
