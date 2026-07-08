<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, inject } from 'vue'
import { useRouter } from 'vue-router'
import type { ExpenseForm } from '@/composables/useExpenseForm'
import { fetchContacts } from '@/api/contact'
import type { User } from '@/api/client'

import AppNavBar from '@/components/AppNavBar.vue'
import AppAnchorTabs from '@/components/AppAnchorTabs.vue'
import AppFooter from '@/components/AppFooter.vue'
import SectionCard from '@/components/SectionCard.vue'
import RelatedApplyField from '@/components/RelatedApplyField.vue'
import TotalCard from '@/components/TotalCard.vue'
import ItemListCard from '@/components/ItemListCard.vue'
import InvoiceBlock from '@/components/InvoiceBlock.vue'
import OwnershipSection from '@/components/OwnershipSection.vue'
import BusinessFieldsSection from '@/components/BusinessFieldsSection.vue'
import NotifySection from '@/components/NotifySection.vue'
import FlowPicker from '@/components/FlowPicker.vue'

const form = inject<ExpenseForm>('expenseForm')!
const router = useRouter()

const users = ref<User[]>([])
const draftPromptVisible = ref(false)
const activeId = ref('related')
const draftDebounce = ref<number | null>(null)

const anchors = computed(() => [
  { id: 'related', label: '关联申请', errorCount: 0 },
  { id: 'total', label: '总额', errorCount: 0 },
  {
    id: 'items',
    label: '明细',
    errorCount: Object.values(form.errors).filter((e) => e).length
  },
  { id: 'invoice', label: '发票', errorCount: 0 },
  { id: 'ownership', label: '归属', errorCount: 0 },
  { id: 'business', label: '业务', errorCount: 0 },
  { id: 'notify', label: '通知', errorCount: 0 },
  {
    id: 'flow',
    label: '流程',
    errorCount: form.flow.payerId ? 0 : 1
  }
])

// Option lists (stub data for v1.3; replace with API in future)
const applies = [
  { id: 'apply-1', label: '2026-Q2 出差申请' },
  { id: 'apply-2', label: '2026-07 客户拜访' }
]

const categories = [
  { value: 'transport', label: '交通费' },
  { value: 'meal', label: '餐费' },
  { value: 'hotel', label: '住宿费' },
  { value: 'office', label: '办公用品' },
  { value: 'other', label: '其他' }
]

const businessOptions = {
  projects: [
    { value: 'p1', label: '钉钉智能助手' },
    { value: 'p2', label: '客户系统升级' }
  ],
  customers: [
    { value: 'c1', label: '阿里巴巴' },
    { value: 'c2', label: '字节跳动' }
  ],
  accounts: [
    { value: 'a1', label: '招商银行 ****1234' },
    { value: 'a2', label: '工商银行 ****5678' }
  ],
  entities: [
    { value: 'e1', label: '钉钉（中国）信息技术有限公司' }
  ]
}

function onJump(id: string): void {
  activeId.value = id
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  router.replace({ hash: `#${id}` })
}

function onScroll(): void {
  const ids = anchors.value.map((a) => a.id)
  for (const id of ids) {
    const el = document.getElementById(id)
    if (!el) continue
    const rect = el.getBoundingClientRect()
    if (rect.top <= 120 && rect.bottom > 120) {
      activeId.value = id
      break
    }
  }
}

function scheduleDraftSave(): void {
  if (draftDebounce.value) window.clearTimeout(draftDebounce.value)
  draftDebounce.value = window.setTimeout(() => {
    form.saveDraft()
  }, 500)
}

function onSaveDraft(): void {
  form.saveDraft()
  alert('已保存为草稿')
}

async function onSubmit(): Promise<void> {
  const result = await form.submit()
  if (result.ok) {
    alert(`已提交报销单 · 总额 ¥${form.totalAmount.value.toFixed(2)}`)
  } else {
    alert(result.message)
  }
}

function onLogout(): void {
  if (window.confirm('确定退出？')) {
    location.reload()
  }
}

function notifyStub(msg: string): void {
  window.alert(msg)
}

// Debounced auto-save: watch form state changes (setup scope, immediate)
const stopWatch = watch(
  () => [
    form.items.value,
    form.flow,
    form.businessFields,
    form.notifyUserIds.value,
    form.ownership,
    form.relatedApplyId.value
  ],
  () => {
    if (draftPromptVisible.value) {
      // user is being prompted; don't auto-save over restored state
      return
    }
    scheduleDraftSave()
  },
  { deep: true }
)

onMounted(async () => {
  // Try to fetch contacts (best-effort)
  try {
    users.value = await fetchContacts()
  } catch {
    users.value = []
  }

  // Try to restore draft
  if (form.restoreDraft()) {
    draftPromptVisible.value = true
  }

  // Scroll spy
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  stopWatch()
  window.removeEventListener('scroll', onScroll)
  if (draftDebounce.value) window.clearTimeout(draftDebounce.value)
})

function onAcceptDraft(): void {
  draftPromptVisible.value = false
}

function onDiscardDraft(): void {
  form.clearDraft()
  draftPromptVisible.value = false
}
</script>

<template>
  <div class="reimburse-page">
    <AppNavBar
      title="日常报销"
      :is-valid="form.isValid.value"
      :user-initial="form.ownership.owner.charAt(0)"
      @submit="onSubmit"
      @save-draft="onSaveDraft"
      @logout="onLogout"
    />

    <AppAnchorTabs :items="anchors" :active-id="activeId" @jump="onJump" />

    <div v-if="draftPromptVisible" class="draft-prompt">
      <div class="draft-prompt__inner">
        <span>检测到上次未提交的草稿，是否恢复？</span>
        <div class="draft-prompt__actions">
          <button type="button" class="draft-prompt__btn" @click="onDiscardDraft">丢弃</button>
          <button type="button" class="draft-prompt__btn draft-prompt__btn--primary" @click="onAcceptDraft">恢复</button>
        </div>
      </div>
    </div>

    <main class="reimburse-main">
      <SectionCard id="related" title="关联申请">
        <RelatedApplyField
          :model-value="form.relatedApplyId.value"
          :applies="applies"
          @update:model-value="(v) => (form.relatedApplyId.value = v)"
        />
      </SectionCard>

      <SectionCard id="total">
        <TotalCard
          :total="form.totalAmount.value"
          @batch-import="() => notifyStub('批量导入功能即将上线')"
          @import-note="() => notifyStub('导入随手记功能即将上线')"
          @invoice-recognize="() => notifyStub('发票识别功能即将上线')"
        />
      </SectionCard>

      <SectionCard id="items" title="报销明细">
        <ItemListCard
          :items="form.items.value"
          :categories="categories"
          :errors="form.errors"
          @add="form.addItem"
          @remove="form.removeItem"
          @update:item="(id, patch) => form.updateItem(id, patch)"
          @clear-error="(i, k) => form.clearError(i, k)"
        />
      </SectionCard>

      <SectionCard id="invoice" title="发票">
        <InvoiceBlock
          :status="form.totalInvoiceStatus.value"
          @add="() => notifyStub('添加发票功能即将上线')"
        />
      </SectionCard>

      <SectionCard id="ownership" title="归属信息">
        <OwnershipSection
          :ownership="form.ownership"
          :users="users"
          @update:ownership="(v) => Object.assign(form.ownership, v)"
        />
      </SectionCard>

      <SectionCard id="business" title="业务字段">
        <BusinessFieldsSection
          :fields="form.businessFields"
          :options="businessOptions"
          @update:fields="(v) => Object.assign(form.businessFields, v)"
        />
      </SectionCard>

      <SectionCard id="notify" title="消息通知">
        <NotifySection
          :model-value="form.notifyUserIds.value"
          :users="users"
          @update:model-value="(v) => (form.notifyUserIds.value = v)"
          @pick="() => notifyStub('人员选择器即将上线')"
        />
      </SectionCard>

      <SectionCard id="flow" title="流程">
        <FlowPicker
          :flow="form.flow"
          :users="users"
          :payer-missing="!form.flow.payerId && Object.keys(form.errors).length > 0"
          @update:flow="(v) => Object.assign(form.flow, v)"
          @pick="() => notifyStub('人员选择器即将上线')"
        />
      </SectionCard>

      <AppFooter :is-valid="form.isValid.value" @submit="onSubmit" @save-draft="onSaveDraft" />
    </main>
  </div>
</template>

<style scoped>
.reimburse-page {
  min-height: 100vh;
  background: var(--color-canvas-soft);
  padding-bottom: 40px;
}

.reimburse-main {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
  max-width: var(--layout-form-max-width);
  margin: 0 auto;
  padding: var(--space-xl) var(--layout-page-padding) 0;
}

.draft-prompt {
  position: fixed;
  top: calc(var(--layout-navbar-height) + var(--layout-tabs-height) + 16px);
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-popover);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-m);
  padding: 12px 20px;
}

.draft-prompt__inner {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: var(--font-size-body);
  color: var(--color-ink);
}

.draft-prompt__actions {
  display: flex;
  gap: 8px;
}

.draft-prompt__btn {
  height: 28px;
  padding: 0 12px;
  font-size: var(--font-size-footnote);
  color: var(--color-ink);
  background: transparent;
  border: 1px solid var(--color-hairline-strong);
  border-radius: var(--radius-xs);
  cursor: pointer;
  font-family: var(--font-family-base);
}

.draft-prompt__btn--primary {
  color: var(--color-on-primary);
  background: var(--color-primary);
  border-color: var(--color-primary);
}
</style>
