<script setup lang="ts">
withDefaults(defineProps<{
  isValid?: boolean
}>(), {
  isValid: false
})

const emit = defineEmits<{
  (e: 'submit'): void
  (e: 'saveDraft'): void
}>()
</script>

<template>
  <footer class="app-footer">
    <div class="app-footer__inner">
      <p class="app-footer__hint">提交后将进入审批流程，无法撤回</p>
      <div class="app-footer__actions">
        <button
          type="button"
          class="app-footer__btn app-footer__btn--secondary"
          @click="emit('saveDraft')"
        >
          保存草稿
        </button>
        <button
          type="button"
          class="app-footer__btn app-footer__btn--primary"
          :disabled="!isValid"
          @click="emit('submit')"
        >
          提交
        </button>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  margin-top: var(--space-3xl);
  padding: 24px 0 40px;
}

.app-footer__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  max-width: var(--layout-form-max-width);
  margin: 0 auto;
  padding: 0 var(--layout-page-padding);
}

.app-footer__hint {
  font-size: var(--font-size-caption);
  color: var(--color-mute);
}

.app-footer__actions {
  display: flex;
  gap: 12px;
}

.app-footer__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
  height: var(--layout-button-height);
  padding: 0 24px;
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-family: var(--font-family-base);
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.app-footer__btn--secondary {
  color: var(--color-ink);
  background: var(--color-canvas);
  border: 1px solid var(--color-hairline-strong);
}

.app-footer__btn--secondary:hover {
  background: var(--color-overlay-hover);
}

.app-footer__btn--primary {
  color: var(--color-on-primary);
  background: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.app-footer__btn--primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
}

.app-footer__btn--primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
