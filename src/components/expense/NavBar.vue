<script setup lang="ts">
import { useRouter } from 'vue-router'
import DingIcon from '../base/DingIcon.vue'

const emit = defineEmits<{ (e: 'back'): void }>()

function goBack() {
  const router = useRouter()
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
  emit('back')
}
</script>

<template>
  <header class="nav-bar">
    <button type="button" class="nav-bar__back" aria-label="返回" @click="goBack">
      <DingIcon name="arrow-back" :size="22" />
    </button>
    <h1 class="nav-bar__title">日常报销</h1>
  </header>
</template>

<style scoped>
.nav-bar {
  height: 48px;
  padding: 0 12px;
  background: var(--color-canvas);
  display: flex;
  align-items: center;
  justify-content: center;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-s);
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
</style>
