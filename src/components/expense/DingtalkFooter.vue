<template>
  <div class="ding-footer">
    <div class="ding-footer__logo">
      <span class="ding-footer__mark">D</span>
      <span>钉钉</span>
    </div>
    <div class="ding-footer__tagline">AI 时代的工作方式</div>
  </div>
</template>

<style scoped>
.ding-footer {
  padding: 20px 16px 28px;
  text-align: center;
  font-size: 12px;
  color: var(--color-mute);
}
.ding-footer__logo {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--color-body);
  font-size: 12px;
}
.ding-footer__mark {
  width: 18px;
  height: 18px;
  background: var(--color-primary);
  color: var(--color-on-primary);
  border-radius: var(--radius-xs);
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: 700;
}
.ding-footer__tagline {
  margin-top: 4px;
  letter-spacing: 0.04em;
}
</style>
