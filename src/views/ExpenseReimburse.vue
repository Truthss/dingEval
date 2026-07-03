<script setup lang="ts">
import { onMounted, reactive, ref, watch, nextTick } from 'vue'
import { useExpenseStore } from '@/stores/expense'
import { useToast } from '@/composables/useToast'
import { useDraftRestore } from '@/composables/useDraftRestore'
import { useFormValidation } from '@/composables/useFormValidation'

import NavBar from '@/components/expense/NavBar.vue'
import RelatedApply from '@/components/expense/RelatedApply.vue'
import TotalCard from '@/components/expense/TotalCard.vue'
import ItemCard from '@/components/expense/ItemCard.vue'
import InvoiceBlock from '@/components/expense/InvoiceBlock.vue'
import OwnershipSection from '@/components/expense/OwnershipSection.vue'
import BusinessFieldsSection from '@/components/expense/BusinessFieldsSection.vue'
import NotifySection from '@/components/expense/NotifySection.vue'
import FlowSection from '@/components/expense/FlowSection.vue'
import BottomBar from '@/components/expense/BottomBar.vue'
import DingtalkFooter from '@/components/expense/DingtalkFooter.vue'

const expense = useExpenseStore()
const toast = useToast()

const errors = reactive<Record<number, { amount?: string; occurredAt?: string; category?: string }>>({})
const payerError = ref(false)
const submitting = ref(false)

const amountRefs = ref<(HTMLElement | null)[]>([])
const dateRefs = ref<(HTMLElement | null)[]>([])
const categoryRefs = ref<(HTMLElement | null)[]>([])
const payerRef = ref<HTMLElement | null>(null)
const flowSectionRef = ref<InstanceType<typeof FlowSection> | null>(null)

onMounted(async () => {
  await nextTick()
  useDraftRestore()
  const fs = flowSectionRef.value as { payerRowRef: { value: HTMLElement | null } } | null
  if (fs?.payerRowRef) {
    payerRef.value = fs.payerRowRef.value
  }
})

function clearItemError(index: number, key: 'amount' | 'occurredAt' | 'category') {
  if (errors[index]) {
    errors[index][key] = undefined
  }
}

watch(
  () => expense.items.length,
  () => {
    amountRefs.value.length = expense.items.length
    dateRefs.value.length = expense.items.length
    categoryRefs.value.length = expense.items.length
  },
  { immediate: true }
)

function handleSubmit() {
  submitting.value = true
  const fs = flowSectionRef.value as { payerRowRef: { value: HTMLElement | null } } | null
  if (fs?.payerRowRef) {
    payerRef.value = fs.payerRowRef.value
  }

  const { validate } = useFormValidation({
    refs: {
      amountRefs: amountRefs.value as never,
      dateRefs: dateRefs.value as never,
      categoryRefs: categoryRefs.value as never,
      payerRef
    },
    store: expense
  })

  const result = validate()

  for (const key of Object.keys(errors)) {
    delete errors[Number(key)]
  }
  payerError.value = false

  expense.items.forEach((it, i) => {
    if (!errors[i]) errors[i] = {}
    if ((it.amount ?? 0) <= 0) errors[i].amount = `请输入第 ${i + 1} 条的报销金额`
    else errors[i].amount = undefined
    if (!it.occurredAt) errors[i].occurredAt = `请选择第 ${i + 1} 条的费用日期`
    else errors[i].occurredAt = undefined
    if (!it.category) errors[i].category = `请选择第 ${i + 1} 条的费用类型`
    else errors[i].category = undefined
  })
  if (!expense.payer) payerError.value = true

  if (result.ok) {
    toast.show({
      message: `已提交报销单 · 总额 ¥${expense.totalAmount.toFixed(2)}`,
      type: 'success'
    })
    expense.clearDraft()
    for (const key of Object.keys(errors)) delete errors[Number(key)]
    payerError.value = false
  } else {
    toast.show({ message: '请补全必填项后再提交', type: 'error' })
  }
  submitting.value = false
}

function setItemRef(index: number, key: 'amount' | 'date' | 'category', el: Element | null) {
  const refList = key === 'amount' ? amountRefs.value : key === 'date' ? dateRefs.value : categoryRefs.value
  refList[index] = el as HTMLElement | null
}

function setItemCardRef(el: unknown, index: number) {
  if (!el) return
  const root = (el as { $el?: HTMLElement }).$el || (el as HTMLElement)
  const amountEl = root.querySelector('[data-field=amount]') as HTMLElement | null
  const dateEl = root.querySelector('[data-field=date]') as HTMLElement | null
  const categoryEl = root.querySelector('[data-field=category]') as HTMLElement | null
  setItemRef(index, 'amount', amountEl)
  setItemRef(index, 'date', dateEl)
  setItemRef(index, 'category', categoryEl)
}
</script>

<template>
  <div class="reimburse-page">
    <NavBar />

    <main class="page-main">
      <RelatedApply />

      <TotalCard :total="expense.totalAmount" />

      <ItemCard
        v-for="(item, index) in expense.items"
        :key="item.id"
        :item="item"
        :index="index"
        :removable="expense.items.length > 1"
        :errors="errors[index] || {}"
        :ref="(el) => setItemCardRef(el, index)"
        @remove="expense.removeItem"
        @clear-error="(k) => clearItemError(index, k)"
      />

      <button
        type="button"
        class="add-detail-card"
        @click="expense.addItem"
      >
        + 添加报销明细
      </button>

      <InvoiceBlock />

      <OwnershipSection />

      <BusinessFieldsSection />

      <NotifySection />

      <FlowSection ref="flowSectionRef" />

      <DingtalkFooter />
    </main>

    <BottomBar :is-valid="expense.isValid" @submit="handleSubmit" />
  </div>
</template>

<style scoped>
.reimburse-page {
  min-height: 100vh;
  padding-bottom: 24px;
  background: var(--color-canvas-soft);
}

.page-main {
  display: flex;
  flex-direction: column;
}

.add-detail-card {
  margin: 12px 12px 0;
  background: var(--color-canvas);
  border-radius: var(--radius-sm);
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: var(--color-primary);
  font-size: 14px;
  font-weight: 500;
  box-shadow: var(--shadow-s);
  cursor: pointer;
  transition: background 0.15s;
  border: 0;
}
.add-detail-card:hover { background: rgba(0, 127, 255, 0.04); }
</style>
