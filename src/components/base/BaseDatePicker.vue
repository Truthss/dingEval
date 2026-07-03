<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import DingIcon from './DingIcon.vue'

interface Props {
  modelValue: string | null
  placeholder?: string
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请选择',
  size: 'sm'
})

const emit = defineEmits<{ (e: 'update:modelValue', value: string | null): void }>()

const open = ref(false)

const initial = props.modelValue ? new Date(props.modelValue) : new Date()
const viewYear = ref(initial.getFullYear())
const viewMonth = ref(initial.getMonth())

watch(open, (v) => {
  if (v) {
    const init = props.modelValue ? new Date(props.modelValue) : new Date()
    viewYear.value = init.getFullYear()
    viewMonth.value = init.getMonth()
  }
})

const todayDate = new Date()
const selectedDate = computed(() => (props.modelValue ? new Date(props.modelValue) : null))

const monthLabel = computed(() => `${viewYear.value} 年 ${String(viewMonth.value + 1).padStart(2, '0')} 月`)

const cells = computed(() => {
  const firstDay = new Date(viewYear.value, viewMonth.value, 1).getDay()
  const daysInMonth = new Date(viewYear.value, viewMonth.value + 1, 0).getDate()
  const prevMonthDays = new Date(viewYear.value, viewMonth.value, 0).getDate()
  const list: Array<{ d: number; muted: boolean }> = []
  for (let i = firstDay - 1; i >= 0; i--) {
    list.push({ d: prevMonthDays - i, muted: true })
  }
  for (let i = 1; i <= daysInMonth; i++) {
    list.push({ d: i, muted: false })
  }
  while (list.length % 7 !== 0) {
    list.push({ d: list.length - daysInMonth - firstDay + 1, muted: true })
  }
  return list
})

function gotoPrev() {
  if (viewMonth.value === 0) {
    viewYear.value -= 1
    viewMonth.value = 11
  } else {
    viewMonth.value -= 1
  }
}

function gotoNext() {
  if (viewMonth.value === 11) {
    viewYear.value += 1
    viewMonth.value = 0
  } else {
    viewMonth.value += 1
  }
}

function pad2(n: number) { return n < 10 ? `0${n}` : String(n) }

function cellDate(c: { d: number; muted: boolean }) {
  if (!c.muted) return new Date(viewYear.value, viewMonth.value, c.d)
  if (c.d > 15) return new Date(viewYear.value, viewMonth.value - 1, c.d)
  return new Date(viewYear.value, viewMonth.value + 1, c.d)
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function pick(c: { d: number; muted: boolean }) {
  const dt = cellDate(c)
  emit('update:modelValue', `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`)
  open.value = false
}

function close() {
  open.value = false
}
</script>

<template>
  <button
    type="button"
    :class="['picker-trigger', `picker-trigger--${size}`, { placeholder: !modelValue }]"
    @click="open = true"
  >
    <span>{{ modelValue || placeholder }}</span>
    <DingIcon name="calendar-today" :size="16" />
  </button>

  <Teleport to="body">
    <div v-if="open" class="popover-mask" @click.self="close">
      <div class="popover date-picker-popover">
        <div class="dp-head">
          <button type="button" class="dp-nav" aria-label="上月" @click="gotoPrev">
            <DingIcon name="chevron-left" :size="18" />
          </button>
          <div class="month-label">{{ monthLabel }}</div>
          <button type="button" class="dp-nav" aria-label="下月" @click="gotoNext">
            <DingIcon name="chevron-right" :size="18" />
          </button>
        </div>
        <div class="week-row">
          <div v-for="w in ['日','一','二','三','四','五','六']" :key="w">{{ w }}</div>
        </div>
        <div class="day-row">
          <div
            v-for="(c, i) in cells"
            :key="i"
            class="day"
            :class="{
              muted: c.muted,
              today: isSameDay(cellDate(c), todayDate),
              selected: selectedDate && isSameDay(cellDate(c), selectedDate)
            }"
            @click="pick(c)"
          >{{ c.d }}</div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.picker-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  width: 100%;
  background: var(--color-canvas);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-xs);
  color: var(--color-ink);
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.15s;
}
.picker-trigger--sm { height: 36px; padding: 0 12px; font-size: 17px; }
.picker-trigger--md { height: 40px; padding: 0 14px; font-size: 14px; }
.picker-trigger.placeholder { color: var(--color-mute); }

@media (min-width: 960px) {
  .picker-trigger:hover { border-color: var(--color-hairline-strong); }
}

.popover-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.40);
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: fade-in 0.15s ease-out;
}
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
.popover {
  width: 100%;
  max-width: 480px;
  background: var(--color-canvas);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  animation: slide-up 0.25s ease-out;
}
@keyframes slide-up {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.date-picker-popover { padding: 8px 16px 24px; }
.dp-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 4px 12px;
}
.dp-nav {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  color: var(--color-primary);
  border-radius: var(--radius-full);
  background: transparent;
  border: 0;
  cursor: pointer;
}
.dp-nav:hover { background: rgba(0, 127, 255, 0.08); }
.month-label { font-size: 16px; font-weight: 600; color: var(--color-ink); }
.week-row,
.day-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}
.week-row > div {
  text-align: center;
  font-size: 12px;
  color: var(--color-mute);
  padding: 6px 0;
  letter-spacing: 0.04em;
}
.day {
  aspect-ratio: 1 / 1;
  display: grid;
  place-items: center;
  font-size: 14px;
  color: var(--color-ink);
  border-radius: var(--radius-full);
  cursor: pointer;
  font-variant-numeric: tabular-nums;
  background: transparent;
  border: 0;
}
.day:hover { background: rgba(0, 127, 255, 0.08); }
.day.muted { color: var(--color-mute); }
.day.today { color: var(--color-primary); font-weight: 600; }
.day.selected {
  background: var(--color-primary);
  color: var(--color-on-primary);
  font-weight: 500;
}
.day.selected.today { color: var(--color-on-primary); }
</style>
