import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'
import NProgress from 'nprogress'
import Layout from '~/layout/index.vue'
import { useLogin } from '~/stores'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: Layout,
    redirect: '/jobs',
    children: [
      {
        path: 'jobs',
        component: () => import('~/views/jobs/index.vue'),
        beforeEnter: async (to, from, next) => {
          to.params.from = from.path
          next()
        },
      },
      {
        path: 'config',
        component: () => import('~/views/config/index.vue'),
      },
      {
        path: 'about',
        component: () => import('~/views/about/index.vue'),
      },
    ],
  },
  {
    path: '/login',
    component: () => import('~/views/login/index.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  NProgress.start()
  if (to.path === '/login') {
    return next()
  }
  const { getUser } = useLogin()
  try {
    await getUser()
    next()
  } catch (err) {
    console.log(err)
    next('/login')
  }
})

router.afterEach(() => {
  NProgress.done()
})

export default router
