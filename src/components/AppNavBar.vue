<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

withDefaults(defineProps<{
  title: string
  userInitial?: string
  isValid?: boolean
}>(), {
  userInitial: '陆',
  isValid: false
})

const emit = defineEmits<{
  (e: 'submit'): void
  (e: 'saveDraft'): void
  (e: 'logout'): void
}>()

const menuOpen = ref(false)
const avatarRef = ref<HTMLElement | null>(null)

function toggleMenu(): void {
  menuOpen.value = !menuOpen.value
}

function onClickOutside(ev: MouseEvent): void {
  if (!menuOpen.value) return
  const target = ev.target as Node
  if (avatarRef.value?.contains(target)) return
  menuOpen.value = false
}

onMounted(() => document.addEventListener('mousedown', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('mousedown', onClickOutside))
</script>

<template>
  <header class="app-navbar">
    <div class="app-navbar__inner">
      <div class="app-navbar__brand">
        <div class="app-navbar__logo" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="2" y="2" width="24" height="24" rx="6" fill="#007FFF"/>
            <path d="M8 10.5C8 9.4 8.9 8.5 10 8.5H18C19.1 8.5 20 9.4 20 10.5V14.5C20 15.6 19.1 16.5 18 16.5H13L10 19.5V16.5H10C8.9 16.5 8 15.6 8 14.5V10.5Z" fill="white"/>
            <circle cx="18" cy="20" r="2.5" fill="white" fill-opacity="0.6"/>
          </svg>
        </div>
        <h1 class="app-navbar__title">{{ title }}</h1>
      </div>
      <div class="app-navbar__actions">
        <button
          type="button"
          class="app-navbar__btn app-navbar__btn--ghost"
          @click="emit('saveDraft')"
        >
          草稿
        </button>
        <button
          type="button"
          class="app-navbar__btn app-navbar__btn--primary"
          :disabled="!isValid"
          @click="emit('submit')"
        >
          提交
        </button>
        <div ref="avatarRef" class="app-navbar__avatar-wrap">
          <button
            type="button"
            class="app-navbar__avatar"
            aria-label="用户菜单"
            @click="toggleMenu"
          >
            {{ userInitial }}
          </button>
          <div v-if="menuOpen" class="app-navbar__menu" role="menu">
            <button type="button" class="app-navbar__menu-item" @click="emit('logout')">退出</button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-navbar {
  position: sticky;
  top: 0;
  z-index: var(--z-fixed);
  height: var(--layout-navbar-height);
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--color-hairline);
}

.app-navbar__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 var(--layout-page-padding);
}

.app-navbar__brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-navbar__logo {
  display: inline-flex;
}

.app-navbar__title {
  font-size: var(--font-size-h2);
  font-weight: var(--font-weight-medium);
  color: var(--color-ink);
  line-height: var(--line-height-snug);
}

.app-navbar__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-navbar__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: var(--layout-button-height);
  padding: 0 20px;
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-family: var(--font-family-base);
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.app-navbar__btn--ghost {
  color: var(--color-ink);
  background: transparent;
  border: 1px solid var(--color-hairline-strong);
}

.app-navbar__btn--ghost:hover {
  background: var(--color-overlay-hover);
}

.app-navbar__btn--primary {
  color: var(--color-on-primary);
  background: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.app-navbar__btn--primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
}

.app-navbar__btn--primary:active:not(:disabled) {
  background: var(--color-primary-press);
  border-color: var(--color-primary-press);
}

.app-navbar__btn--primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.app-navbar__avatar-wrap {
  position: relative;
}

.app-navbar__avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  color: var(--color-on-primary);
  display: grid;
  place-items: center;
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  border: 0;
  font-family: var(--font-family-base);
  transition: opacity 0.15s;
}

.app-navbar__avatar:hover {
  opacity: 0.85;
}

.app-navbar__menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  min-width: 120px;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-m);
  padding: 4px;
  z-index: var(--z-popover);
}

.app-navbar__menu-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 8px 12px;
  font-size: var(--font-size-body);
  color: var(--color-ink);
  background: transparent;
  border: 0;
  border-radius: var(--radius-xs);
  cursor: pointer;
  font-family: var(--font-family-base);
}

.app-navbar__menu-item:hover {
  background: var(--color-overlay-hover);
}
</style>
