import { createRouter, createWebHashHistory } from 'vue-router'
import { useSystemStore } from '@/stores/index'

import staticRoutes from './routes'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import dict from '@/utils/dict'
import { useSystemSetting } from '@/stores/setting'
NProgress.configure({ showSpinner: false })

export const routes = staticRoutes
const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    ...routes,
    {
      path: '/login',
      name: 'login',
      meta: { noKeep: true },
      component: () => import('@/views/login.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'p404',
      meta: { noKeep: true },
      component: () => import('@/views/page-404.vue')
    }
  ]
})
export const routeMap = new Map() // key<Symbol>:permission<array>
generateRouteMap()

function generateRouteMap() {
  router.getRoutes().map((route) => {
    route.meta.key = Symbol()
    routeMap.set(route.meta.key, route)
  })
}
router.getFullPath = function (route) {
  let r = routeMap.get(route.meta.key)
  if (r) {
    return r.path
  }
}

router.beforeEach((to) => {
  const systemStore = useSystemStore()
  const systemSetting = useSystemSetting()
  NProgress.start()
  if (
    // 检查用户是否已登录
    !systemStore.isLogin &&
    // ❗️ 避免无限重定向
    to.name !== 'login' &&
    systemSetting.setting.openPermission
  ) {
    // 将用户重定向到登录页面
    return { name: 'login' }
  }
  // return to
})
router.afterEach(() => {
  NProgress.done()
})
export default router
