<script setup lang="ts">
import { provide } from 'vue'
import { useExpenseForm } from '@/composables/useExpenseForm'

const form = useExpenseForm()
provide('expenseForm', form)
</script>

<template>
  <router-view />
</template>
