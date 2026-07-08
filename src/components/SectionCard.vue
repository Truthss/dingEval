<script setup lang="ts">
defineProps<{
  id: string
  title?: string
  subtitle?: string
}>()
</script>

<template>
  <section :id="id" class="section-card">
    <header v-if="title || $slots.actions" class="section-card__head">
      <div>
        <h3 v-if="title" class="section-card__title">{{ title }}</h3>
        <p v-if="subtitle" class="section-card__subtitle">{{ subtitle }}</p>
      </div>
      <div v-if="$slots.actions" class="section-card__actions">
        <slot name="actions" />
      </div>
    </header>
    <div class="section-card__body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.section-card {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-s);
  padding: var(--layout-card-padding);
  scroll-margin-top: calc(var(--layout-navbar-height) + var(--layout-tabs-height) + 16px);
}

.section-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.section-card__title {
  font-size: var(--font-size-h3);
  font-weight: var(--font-weight-semibold);
  color: var(--color-ink);
  line-height: var(--line-height-snug);
}

.section-card__subtitle {
  margin-top: 4px;
  font-size: var(--font-size-caption);
  color: var(--color-body);
}

.section-card__actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.section-card__body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
