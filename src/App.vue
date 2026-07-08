<script setup lang="ts">
import { ref, provide } from 'vue'
import { useExpenseForm } from '@/composables/useExpenseForm'
import type { ShowToast, ToastType } from '@/composables/useToast'
import AppToast from '@/components/AppToast.vue'

const form = useExpenseForm()
provide('expenseForm', form)

const currentToast = ref<{ message: string; type: ToastType; ts: number } | null>(null)

function showToast(message: string, type: ToastType = 'info'): void {
  currentToast.value = { message, type, ts: Date.now() }
}

provide<ShowToast>('showToast', showToast)
</script>

<template>
  <router-view />
  <AppToast
    v-if="currentToast"
    :key="currentToast.ts"
    :message="currentToast.message"
    :type="currentToast.type"
    @dismiss="currentToast = null"
  />
</template>
