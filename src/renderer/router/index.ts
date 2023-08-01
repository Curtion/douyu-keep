import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', component: () => import('~/views/login/index.vue') },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  next()
})

export default router
