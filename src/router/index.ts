import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/reimburse'
  },
  {
    path: '/reimburse',
    name: 'ExpenseReimburse',
    component: () => import('@/views/ExpenseReimburse.vue'),
    meta: { title: '日常报销' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

router.afterEach((to) => {
  if (to.meta?.title) {
    document.title = `${to.meta.title} · 日常报销`
  }
})

export default router
