<script setup lang="ts">
withDefaults(defineProps<{
  items: { id: string; label: string; errorCount?: number }[]
  activeId: string
}>(), {
  activeId: ''
})

const emit = defineEmits<{
  (e: 'jump', id: string): void
}>()
</script>

<template>
  <nav class="anchor-tabs" aria-label="表单区段导航">
    <div class="anchor-tabs__inner">
      <button
        v-for="item in items"
        :key="item.id"
        type="button"
        class="anchor-tabs__tab"
        :class="{ 'is-active': item.id === activeId }"
        @click="emit('jump', item.id)"
      >
        <span>{{ item.label }}</span>
        <span v-if="item.errorCount && item.errorCount > 0" class="anchor-tabs__badge">
          {{ item.errorCount > 9 ? '9+' : item.errorCount }}
        </span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
.anchor-tabs {
  position: sticky;
  top: var(--layout-navbar-height);
  z-index: var(--z-sticky);
  height: var(--layout-tabs-height);
  background: var(--color-canvas);
  border-bottom: 1px solid var(--color-hairline);
}

.anchor-tabs__inner {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 var(--layout-page-padding);
  overflow-x: auto;
  scrollbar-width: none;
}

.anchor-tabs__inner::-webkit-scrollbar {
  display: none;
}

.anchor-tabs__tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 100%;
  padding: 0 12px;
  font-size: var(--font-size-body);
  color: var(--color-body);
  background: transparent;
  border: 0;
  cursor: pointer;
  font-family: var(--font-family-base);
  white-space: nowrap;
  transition: color 0.15s;
}

.anchor-tabs__tab:hover {
  color: var(--color-ink);
}

.anchor-tabs__tab.is-active {
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
}

.anchor-tabs__tab.is-active::after {
  content: '';
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 0;
  height: 2px;
  background: var(--color-primary);
  border-radius: 2px 2px 0 0;
}

.anchor-tabs__badge {
  display: inline-grid;
  place-items: center;
  min-width: 16px;
  height: 16px;
  padding: 0 5px;
  background: var(--color-error);
  color: var(--color-on-primary);
  border-radius: var(--radius-full);
  font-size: 10px;
  font-weight: var(--font-weight-semibold);
  line-height: 1;
}
</style>
