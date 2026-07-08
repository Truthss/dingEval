<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import DingIcon from '../base/DingIcon.vue'
import { useToast } from '@/composables/useToast'

const emit = defineEmits<{ (e: 'back'): void }>()

const toast = useToast()
const activeTab = ref<'submit' | 'history'>('submit')

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

      <!-- Mobile title -->
      <h1 class="nav-bar__title">日常报销</h1>

      <!-- Desktop: tabs + toolbar -->
      <div class="nav-bar__desktop">
        <div class="nav-bar__tabs">
          <button
            type="button"
            class="nav-bar__tab"
            :class="{ 'nav-bar__tab--active': activeTab === 'submit' }"
            @click="activeTab = 'submit'"
          >发起审批</button>
          <button
            type="button"
            class="nav-bar__tab"
            :class="{ 'nav-bar__tab--active': activeTab === 'history' }"
            @click="activeTab = 'history'"
          >历史记录</button>
        </div>
        <div class="nav-bar__toolbar">
          <button type="button" class="nav-bar__toolbar-btn" @click="showUnsupported">
            <DingIcon name="assessment" :size="16" />
            <span>报表</span>
          </button>
          <button type="button" class="nav-bar__toolbar-btn" @click="showUnsupported">
            <DingIcon name="drafts" :size="16" />
            <span>草稿箱(0)</span>
          </button>
          <button type="button" class="nav-bar__toolbar-btn" @click="showUnsupported">
            <DingIcon name="edit" :size="16" />
            <span>编辑</span>
          </button>
          <button type="button" class="nav-bar__toolbar-btn" @click="showUnsupported">
            <DingIcon name="person-add" :size="16" />
            <span>添加到群</span>
          </button>
          <button type="button" class="nav-bar__toolbar-btn" @click="showUnsupported">
            <DingIcon name="share" :size="16" />
            <span>分享</span>
          </button>
        </div>
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

/* Desktop-only elements - hidden on mobile */
.nav-bar__desktop {
  display: none;
}

@media (min-width: 960px) {
  .nav-bar {
    background: rgba(255, 255, 255, 0.88);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--color-hairline);
    box-shadow: none;
  }

  .nav-bar__inner {
    max-width: var(--layout-3col-max-width);
    margin: 0 auto;
    padding: 0 24px;
    height: 56px;
    justify-content: flex-start;
    position: static;
  }

  .nav-bar__back {
    position: static;
    transform: none;
    margin-right: 4px;
  }

  .nav-bar__title {
    display: none;
  }

  .nav-bar__desktop {
    display: flex;
    align-items: center;
    flex: 1;
    margin-left: 4px;
  }

  .nav-bar__tabs {
    display: flex;
    align-items: center;
    gap: 0;
  }

  .nav-bar__tab {
    position: relative;
    height: 56px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    font-size: 14px;
    color: var(--color-body);
    background: transparent;
    border: 0;
    cursor: pointer;
    font-family: inherit;
    font-weight: 500;
    transition: color 0.15s;
  }
  .nav-bar__tab:hover { color: var(--color-ink); }
  .nav-bar__tab--active {
    color: var(--color-primary);
  }
  .nav-bar__tab--active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 16px;
    right: 16px;
    height: 2px;
    background: var(--color-primary);
    border-radius: 2px 2px 0 0;
  }

  .nav-bar__toolbar {
    display: flex;
    align-items: center;
    gap: 2px;
    margin-left: auto;
  }

  .nav-bar__toolbar-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 10px;
    color: var(--color-body);
    font-size: 13px;
    background: transparent;
    border: 0;
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-family: inherit;
    font-weight: 500;
    transition: background 0.15s, color 0.15s;
    white-space: nowrap;
  }
  .nav-bar__toolbar-btn:hover {
    background: rgba(126, 134, 142, 0.08);
    color: var(--color-ink);
  }
}
</style>
