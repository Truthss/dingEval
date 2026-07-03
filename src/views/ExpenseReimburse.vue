<script setup lang="ts">
import { useExpenseStore } from '@/stores/expense'

const expense = useExpenseStore()
</script>

<template>
  <div class="reimburse-page">
    <header class="nav-bar">
      <h1 class="nav-bar__title">日常报销</h1>
    </header>

    <main class="page-main">
      <section class="related-apply">
        <button class="capsule" type="button">
          <span class="capsule__icon">+</span>
          <span>请选择</span>
        </button>
      </section>

      <section class="total-card">
        <div class="total-card__label">报销总额</div>
        <div class="total-card__value">{{ expense.totalAmount.toFixed(2) }}</div>
        <div class="total-card__actions">
          <button class="action-item" type="button">
            <span class="action-item__icon">⤴</span>
            <span>批量导入</span>
          </button>
          <button class="action-item" type="button">
            <span class="action-item__icon">📒</span>
            <span>导入随手记</span>
          </button>
          <button class="action-item" type="button">
            <span class="action-item__icon">🧾</span>
            <span>发票识别</span>
          </button>
        </div>
      </section>

      <section
        v-for="(item, index) in expense.items"
        :key="item.id"
        class="item-card"
      >
        <div class="item-card__header">
          <h2 class="item-card__title">报销明细 {{ index + 1 }}</h2>
          <button
            v-if="expense.items.length > 1"
            class="item-card__remove"
            type="button"
            @click="expense.removeItem(item.id)"
          >
            删除
          </button>
        </div>

        <div class="form-field form-field--required">
          <label class="form-field__label">报销金额（元）</label>
          <input
            v-model.number="item.amount"
            class="form-field__input"
            type="number"
            inputmode="decimal"
            placeholder="请输入金额"
          />
        </div>

        <div class="form-field form-field--required">
          <label class="form-field__label">费用发生日期</label>
          <input
            v-model="item.occurredAt"
            class="form-field__input"
            type="date"
          />
        </div>

        <div class="form-field form-field--required">
          <label class="form-field__label">费用类型</label>
          <select v-model="item.category" class="form-field__input">
            <option :value="null">请选择</option>
            <option value="travel">差旅费</option>
            <option value="meal">餐饮费</option>
            <option value="office">办公用品</option>
            <option value="entertain">业务招待</option>
          </select>
        </div>

        <div class="form-field">
          <label class="form-field__label">费用说明</label>
          <textarea
            v-model="item.description"
            class="form-field__input form-field__input--textarea"
            rows="3"
            placeholder="请输入费用说明"
          />
        </div>

        <div class="invoice-block">
          <div class="invoice-block__title">发票</div>
          <button class="dashed-button" type="button">+ 添加发票</button>
          <p class="invoice-block__hint">
            支持智能识别电子、纸质发票的金额等信息
          </p>
          <div class="invoice-block__tags">
            <span class="tag" :class="{ 'tag--active': item.invoiceStatus === 'none' }">
              [无发票]
            </span>
            <span class="tag" :class="{ 'tag--active': item.invoiceStatus === 'pending' }">
              [待收发票]
            </span>
          </div>
        </div>

        <div class="attachment-block">
          <button class="dashed-button" type="button">+ 添加附件</button>
        </div>
      </section>

      <button class="add-item-button" type="button" @click="expense.addItem">
        + 添加报销明细
      </button>

      <section class="card">
        <div class="form-field">
          <label class="form-field__label">归属人</label>
          <input
            v-model="expense.owner"
            class="form-field__input form-field__input--readonly"
            readonly
          />
        </div>
        <div class="form-field">
          <label class="form-field__label">归属部门</label>
          <input
            v-model="expense.department"
            class="form-field__input form-field__input--readonly"
            readonly
          />
        </div>
        <div class="form-field">
          <label class="form-field__label">备注</label>
          <textarea
            v-model="expense.remark"
            class="form-field__input form-field__input--textarea"
            rows="2"
            placeholder="请输入"
          />
        </div>
      </section>

      <section class="card">
        <div class="form-field">
          <label class="form-field__label">项目</label>
          <select v-model="expense.project" class="form-field__input">
            <option :value="null">请选择</option>
          </select>
        </div>
        <div class="form-field">
          <label class="form-field__label">客户</label>
          <select v-model="expense.customer" class="form-field__input">
            <option :value="null">请选择</option>
          </select>
        </div>
        <div class="form-field">
          <label class="form-field__label">收款账户</label>
          <select v-model="expense.payeeAccount" class="form-field__input">
            <option :value="null">请选择</option>
          </select>
        </div>
        <div class="form-field">
          <label class="form-field__label">企业主体</label>
          <select v-model="expense.entity" class="form-field__input">
            <option :value="null">请选择</option>
          </select>
        </div>
        <div class="form-field">
          <label class="form-field__label">付款时间</label>
          <input
            v-model="expense.payAt"
            class="form-field__input"
            type="date"
            placeholder="请选择"
          />
        </div>
      </section>

      <section class="card">
        <div class="notify-block__title">
          发送到聊天
          <span class="help-icon" aria-label="帮助">?</span>
        </div>
        <button class="dashed-button" type="button">+ 添加</button>
      </section>

      <section class="card">
        <h3 class="card__title">流程</h3>
        <ul class="flow-list">
          <li class="flow-list__item">
            <span class="flow-list__dot" />
            <span class="flow-list__text">审批人</span>
            <span class="flow-list__placeholder">请选择审批人</span>
            <button class="flow-list__add" type="button">+</button>
          </li>
          <li class="flow-list__item flow-list__item--required">
            <span class="flow-list__dot" />
            <span class="flow-list__text">付款人</span>
            <span class="flow-list__placeholder">请选择</span>
            <button class="flow-list__add" type="button">+</button>
          </li>
          <li class="flow-list__item">
            <span class="flow-list__dot" />
            <span class="flow-list__text">抄送人</span>
            <span class="flow-list__placeholder">请选择抄送人</span>
            <button class="flow-list__add" type="button">+</button>
          </li>
        </ul>
      </section>
    </main>

    <footer class="bottom-bar">
      <button class="bottom-bar__secondary" type="button">保存草稿</button>
      <button class="bottom-bar__primary" type="button">提交</button>
    </footer>

    <div class="dingtalk-footer">
      <span class="dingtalk-footer__logo">D</span>
      <span class="dingtalk-footer__text">AI时代的工作方式</span>
    </div>
  </div>
</template>

<style scoped>
.reimburse-page {
  min-height: 100vh;
  padding-bottom: 120px;
  background: var(--color-canvas-soft);
}

.nav-bar {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-canvas);
  box-shadow: var(--shadow-s);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
}
.nav-bar__title {
  margin: 0;
  font-size: var(--font-size-h2);
  font-weight: var(--font-weight-semibold);
}

.page-main {
  padding: var(--space-sm) var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.related-apply {
  padding: var(--space-xs) 0;
}
.capsule {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xxs);
  padding: var(--space-xs) var(--space-sm);
  border: 1px solid var(--color-hairline-strong);
  border-radius: var(--radius-full);
  color: var(--color-body);
  font-size: var(--font-size-description);
  background: var(--color-surface);
}
.capsule__icon {
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
}

.total-card {
  background: linear-gradient(180deg, #E6F1FF 0%, #F4F8FF 100%);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}
.total-card__label {
  color: var(--color-body);
  font-size: var(--font-size-description);
}
.total-card__value {
  color: var(--color-error);
  font-size: 32px;
  font-weight: var(--font-weight-semibold);
  line-height: 1.2;
}
.total-card__actions {
  display: flex;
  gap: var(--space-md);
  margin-top: var(--space-xs);
}
.action-item {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xxs);
  color: var(--color-primary);
  font-size: var(--font-size-description);
}
.action-item__icon {
  font-size: 18px;
}

.item-card {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  box-shadow: var(--shadow-s);
}
.item-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-sm);
}
.item-card__title {
  margin: 0;
  font-size: var(--font-size-subhead);
  font-weight: var(--font-weight-semibold);
}
.item-card__remove {
  color: var(--color-body);
  font-size: var(--font-size-description);
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding: var(--space-sm) 0;
  border-bottom: 1px solid var(--color-hairline);
}
.form-field:last-child {
  border-bottom: none;
}
.form-field__label {
  font-size: var(--font-size-description);
  color: var(--color-body);
}
.form-field--required .form-field__label::before {
  content: '*';
  color: var(--color-error);
  margin-right: 2px;
}
.form-field__input {
  border: 1px solid var(--color-hairline-strong);
  border-radius: var(--radius-xs);
  padding: 8px 12px;
  font-size: var(--font-size-body);
  background: var(--color-canvas);
  outline: none;
  height: 36px;
}
.form-field__input:focus {
  border-color: var(--color-primary);
}
.form-field__input--textarea {
  height: auto;
  min-height: 80px;
  resize: vertical;
}
.form-field__input--readonly {
  background: var(--color-canvas-soft);
  color: var(--color-body);
}

.invoice-block {
  margin-top: var(--space-sm);
  padding: var(--space-sm);
  background: var(--color-canvas-soft);
  border-radius: var(--radius-sm);
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}
.invoice-block__title {
  font-size: var(--font-size-subhead);
  font-weight: var(--font-weight-medium);
}
.invoice-block__hint {
  margin: 0;
  font-size: var(--font-size-footnote);
  color: var(--color-mute);
}
.invoice-block__tags {
  display: flex;
  gap: var(--space-xs);
  margin-top: var(--space-xs);
}
.tag {
  font-size: var(--font-size-footnote);
  color: var(--color-body);
  padding: 2px 6px;
  border-radius: var(--radius-xs);
}
.tag--active {
  color: var(--color-primary);
  background: #E6F1FF;
}

.dashed-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-xs) var(--space-sm);
  border: 1px dashed var(--color-hairline-strong);
  border-radius: var(--radius-sm);
  color: var(--color-primary);
  font-size: var(--font-size-description);
  background: var(--color-canvas);
}

.attachment-block {
  margin-top: var(--space-sm);
}

.add-item-button {
  width: 100%;
  padding: var(--space-sm);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  color: var(--color-primary);
  font-size: var(--font-size-body);
  box-shadow: var(--shadow-s);
}

.card {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: 0 var(--space-md);
  box-shadow: var(--shadow-s);
}
.card__title {
  margin: 0;
  padding: var(--space-sm) 0;
  font-size: var(--font-size-subhead);
  font-weight: var(--font-weight-semibold);
  border-bottom: 1px solid var(--color-hairline);
}

.notify-block__title {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) 0;
  font-size: var(--font-size-subhead);
}
.help-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-hairline-strong);
  font-size: 10px;
  color: var(--color-mute);
}

.flow-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.flow-list__item {
  display: grid;
  grid-template-columns: 12px auto 1fr auto;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) 0;
  border-bottom: 1px solid var(--color-hairline);
}
.flow-list__item:last-child {
  border-bottom: none;
}
.flow-list__item--required .flow-list__text::before {
  content: '*';
  color: var(--color-error);
  margin-right: 2px;
}
.flow-list__dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
}
.flow-list__text {
  font-size: var(--font-size-body);
}
.flow-list__placeholder {
  color: var(--color-mute);
  font-size: var(--font-size-description);
}
.flow-list__add {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-hairline-strong);
  color: var(--color-primary);
  font-size: var(--font-size-subhead);
  line-height: 1;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md) calc(env(safe-area-inset-bottom, 0) + var(--space-sm));
  background: var(--color-canvas);
  box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.04);
  z-index: var(--z-fixed);
}
.bottom-bar__primary,
.bottom-bar__secondary {
  flex: 1;
  height: 44px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
}
.bottom-bar__primary {
  background: var(--color-primary);
  color: var(--color-on-primary);
}
.bottom-bar__primary:active {
  background: var(--color-primary-press);
}
.bottom-bar__secondary {
  background: var(--color-canvas);
  color: var(--color-body);
  border: 1px solid var(--color-hairline-strong);
}

.dingtalk-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  padding: var(--space-sm) 0 var(--space-md);
  color: var(--color-mute);
  font-size: var(--font-size-footnote);
}
.dingtalk-footer__logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: var(--radius-xs);
  background: var(--color-primary);
  color: var(--color-on-primary);
  font-size: 10px;
  font-weight: var(--font-weight-bold);
}
</style>
