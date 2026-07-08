<script setup lang="ts">
defineProps<{
  label: string
  required?: boolean
  error?: string
  helpText?: string
}>()
</script>

<template>
  <div class="form-field" :class="{ 'has-error': !!error }">
    <label class="form-field__label">
      <span>{{ label }}</span>
      <span v-if="required" class="form-field__req" aria-label="必填">*</span>
    </label>
    <div class="form-field__control">
      <slot />
    </div>
    <p v-if="error" class="form-field__error">
      <span class="form-field__error-icon" aria-hidden="true">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <circle cx="6" cy="6" r="5" stroke="currentColor" stroke-width="1.2"/>
          <line x1="6" y1="3.5" x2="6" y2="6.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
          <circle cx="6" cy="8.5" r="0.6" fill="currentColor"/>
        </svg>
      </span>
      {{ error }}
    </p>
    <p v-else-if="helpText" class="form-field__help">{{ helpText }}</p>
  </div>
</template>

<style scoped>
.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.form-field__label {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: var(--font-size-body);
  color: var(--color-ink);
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-snug);
}

.form-field__req {
  color: var(--color-error);
  font-size: var(--font-size-caption);
  line-height: 1;
}

.form-field.has-error .form-field__label {
  color: var(--color-error);
}

.form-field__control {
  display: flex;
  align-items: center;
  width: 100%;
}

.form-field__error {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-size-caption);
  color: var(--color-error);
  line-height: var(--line-height-normal);
}

.form-field__error-icon {
  display: inline-flex;
  flex-shrink: 0;
}

.form-field__help {
  font-size: var(--font-size-caption);
  color: var(--color-mute);
  line-height: var(--line-height-normal);
}
</style>
