<script setup lang="ts">
import DingIcon from '../base/DingIcon.vue'
</script>

<template>
  <nav class="side-nav" aria-label="主导航">
    <div class="side-nav__brand">
      <div class="side-nav__logo" aria-hidden="true">
        <DingIcon name="apps" :size="20" />
      </div>
      <div class="side-nav__brand-name">钉钉</div>
    </div>

    <div class="side-nav__divider" />

    <div class="side-nav__caption">导航</div>

    <ul class="side-nav__items">
      <li>
        <button
          type="button"
          class="side-nav__item side-nav__item--active"
          aria-current="page"
        >
          <span class="side-nav__item-icon" aria-hidden="true">
            <DingIcon name="check" :size="16" />
          </span>
          <span class="side-nav__item-label">日常报销</span>
        </button>
      </li>
    </ul>

    <div class="side-nav__footer">v0.1.0</div>
  </nav>
</template>

<style scoped>
.side-nav {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-s);
  padding: var(--space-lg);
  display: none;
  flex-direction: column;
  min-height: 360px;
  position: sticky;
  top: var(--layout-navbar-offset);
  align-self: start;
}

.side-nav__brand {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}
.side-nav__logo {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  color: var(--color-on-primary);
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.side-nav__brand-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-ink);
  letter-spacing: 0.01em;
}

.side-nav__divider {
  height: 1px;
  background: var(--color-hairline);
  margin: var(--space-xs) 0 var(--space-md) 0;
}

.side-nav__caption {
  font-size: var(--font-size-tiny);
  color: var(--color-mute);
  margin-bottom: var(--space-sm);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.side-nav__items {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.side-nav__item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 8px 12px;
  border: 0;
  background: transparent;
  border-radius: var(--radius-sm);
  text-decoration: none;
  color: var(--color-body);
  font-size: var(--font-size-body);
  font-family: inherit;
  text-align: left;
  width: 100%;
  transition: background 0.15s;
  cursor: default;
}
.side-nav__item:hover { background: var(--color-overlay-hover); }
.side-nav__item--active {
  background: rgba(0, 127, 255, 0.12);
  color: var(--color-primary);
  font-weight: 500;
}
.side-nav__item-icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.side-nav__footer {
  margin-top: auto;
  font-size: var(--font-size-tiny);
  color: var(--color-mute);
  padding-top: var(--space-md);
  letter-spacing: 0.04em;
}

@media (min-width: 960px) {
  .side-nav {
    display: flex;
    width: var(--layout-3col-nav-width);
  }
}
</style>
