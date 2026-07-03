<script setup lang="ts">
import { computed } from 'vue'
import DingIcon from './DingIcon.vue'
import { useToast } from '@/composables/useToast'

const toast = useToast()

const iconName = computed(() => {
  const t = toast.state.value.type
  if (t === 'success') return 'check-circle'
  if (t === 'error') return 'error'
  return 'info'
})
</script>

<template>
  <Teleport to="body">
    <Transition name="toast">
      <div
        v-if="toast.state.value.visible"
        class="toast"
        :class="`toast--${toast.state.value.type}`"
        role="status"
        aria-live="polite"
      >
        <DingIcon :name="iconName" :size="16" />
        <span class="toast__msg">{{ toast.state.value.message }}</span>
        <template v-if="toast.state.value.action">
          <button
            type="button"
            class="toast__action"
            @click="toast.state.value.action!.onClick()"
          >{{ toast.state.value.action.label }}</button>
        </template>
        <template v-if="toast.state.value.dismiss">
          <button
            type="button"
            class="toast__dismiss"
            @click="toast.state.value.dismiss.onClick ? toast.state.value.dismiss.onClick() : toast.hide()"
          >{{ toast.state.value.dismiss.label }}</button>
        </template>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.toast {
  position: fixed;
  top: 70px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(23, 26, 29, 0.92);
  color: var(--color-on-primary);
  padding: 10px 18px;
  border-radius: var(--radius-md);
  font-size: 14px;
  z-index: 2000;
  box-shadow: var(--shadow-m);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: 90vw;
}
.toast--success { background: rgba(0, 176, 66, 0.94); }
.toast--error { background: rgba(255, 82, 25, 0.94); }
.toast__msg { flex-shrink: 0; }
.toast__action,
.toast__dismiss {
  color: var(--color-on-primary);
  font-weight: 600;
  padding: 2px 6px;
  border-radius: var(--radius-xs);
  font-size: 13px;
  cursor: pointer;
}
.toast__action { background: rgba(255, 255, 255, 0.16); }
.toast__dismiss { color: rgba(255, 255, 255, 0.72); }
.toast__action:hover,
.toast__dismiss:hover { background: rgba(255, 255, 255, 0.24); }

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}
</style>
