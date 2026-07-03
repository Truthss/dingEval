<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import DingIcon from './DingIcon.vue'
import { useActionSheet } from '@/composables/useActionSheet'

const sheet = useActionSheet()

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && sheet.state.value.visible) {
    sheet.close()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div
        v-if="sheet.state.value.visible"
        class="sheet-mask"
        @click.self="sheet.close()"
      >
        <div class="sheet" role="dialog" aria-modal="true">
          <div v-if="sheet.state.value.title" class="sheet-head">
            <h4>{{ sheet.state.value.title }}</h4>
            <button type="button" class="sheet-close" aria-label="关闭" @click="sheet.close()">
              <DingIcon name="close" :size="16" />
            </button>
          </div>
          <div class="sheet-body">
            <div
              v-for="opt in sheet.state.value.options"
              :key="opt.value"
              class="sheet-opt"
              :class="{ selected: sheet.state.value.current === opt.value }"
              @click="sheet.select(opt.value)"
            >
              <span class="sheet-opt__label">
                {{ opt.label }}
                <span v-if="opt.title" class="sheet-opt__title">{{ opt.title }}</span>
              </span>
              <DingIcon
                v-if="sheet.state.value.current === opt.value"
                name="check"
                :size="16"
                class="sheet-opt__check"
              />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.sheet-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.40);
  z-index: 1500;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: fade-in 0.15s ease-out;
}
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
.sheet {
  width: 100%;
  max-width: 480px;
  background: var(--color-canvas);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  animation: slide-up 0.2s ease-out;
}
@keyframes slide-up {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.sheet-head {
  padding: 16px 20px 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.sheet-head h4 { font-size: 16px; font-weight: 600; color: var(--color-ink); }
.sheet-close {
  color: var(--color-mute);
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  background: transparent;
  border: 0;
  cursor: pointer;
}
.sheet-body { padding: 8px 0 20px; overflow-y: auto; }
.sheet-opt {
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: background 0.12s;
}
.sheet-opt:hover { background: var(--color-canvas-soft); }
.sheet-opt.selected { color: var(--color-primary); font-weight: 500; }
.sheet-opt__label { font-size: 15px; display: flex; align-items: center; gap: 8px; }
.sheet-opt__title { color: var(--color-mute); font-size: 13px; font-weight: 400; }
.sheet-opt__check { color: var(--color-primary); }

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.2s;
}
.sheet-enter-from,
.sheet-leave-to { opacity: 0; }
.sheet-enter-active .sheet,
.sheet-leave-active .sheet {
  transition: transform 0.2s ease-out;
}
.sheet-enter-from .sheet,
.sheet-leave-to .sheet {
  transform: translateY(20px);
}
</style>
