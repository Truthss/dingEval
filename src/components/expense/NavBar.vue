<script setup lang="ts">
import { useRouter } from 'vue-router'
import DingIcon from '../base/DingIcon.vue'
import BaseButton from '../base/BaseButton.vue'
import { useToast } from '@/composables/useToast'

const emit = defineEmits<{ (e: 'back'): void }>()

const toast = useToast()

function goBack() {
  const router = useRouter()
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
  emit('back')
}

function showUnsupported() {
  toast.show({ message: '该功能需要钉钉 App 端支持', type: 'info' })
}
</script>

<template>
  <header class="nav-bar">
    <div class="nav-bar__inner desktop-container">
      <button type="button" class="nav-bar__back" aria-label="返回" @click="goBack">
        <DingIcon name="arrow-back" :size="22" />
      </button>
      <h1 class="nav-bar__title">日常报销</h1>
      <div class="nav-bar__actions">
        <BaseButton variant="ghost" size="sm" class="nav-bar__action" @click="showUnsupported">
          <DingIcon name="search" :size="18" />
        </BaseButton>
        <BaseButton variant="ghost" size="sm" class="nav-bar__action" @click="showUnsupported">
          <DingIcon name="help" :size="18" />
        </BaseButton>
      </div>
    </div>
  </header>
</template>

<style scoped>
.nav-bar {
  background: var(--color-canvas);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-s);
}

.nav-bar__inner {
  height: 48px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.nav-bar__back {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  color: var(--color-ink);
  border-radius: var(--radius-sm);
  background: transparent;
  border: 0;
  cursor: pointer;
}

.nav-bar__back:hover { background: rgba(126, 134, 142, 0.08); }

.nav-bar__title {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-ink);
  margin: 0;
}

.nav-bar__actions {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  display: none;
  gap: 4px;
}

@media (min-width: var(--bp-desktop)) {
  .nav-bar__title { font-size: 18px; }
  .nav-bar__actions { display: flex; }
}
</style>
