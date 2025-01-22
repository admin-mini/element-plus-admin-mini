import { createRouter, createWebHashHistory } from 'vue-router'
import { useSystemStore } from '@/stores/index'

import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useSystemSetting } from '@/stores/setting'
import usePermissionStore from '@/stores/permission'
NProgress.configure({ showSpinner: false })
//eslint-disable-next-line
// import { RouterView } from 'vue-router'
// import RouterView from '@/layout/admin-router-view.vue'
import parentView from '@/layout/parent-view.vue'
import Layout from '@/layout/base-layout.vue'

/**
 * meta.hide = true 不会显示在侧边栏
 * meta.affix = true 会在侧边栏固定
 * meta.weight 排序权重
 * meta.name 侧边栏显示名称
 * meta.icon 侧边栏图标 系统优先使用element-plus图标库，如果匹配不到，则使用svg-icon图标，具体可参考/components/svg-icon.vue
 */
// 公共路由
export const constantRoutes = [
  // {
  //   path: '/redirect',
  //   component: Layout,
  //   hidden: true,
  //   children: [
  //     {
  //       path: '/redirect/:path(.*)',
  //       component: () => import('@/views/redirect/index.vue')
  //     }
  //   ]
  // },
  {
    path: '/login',
    component: () => import('@/views/login.vue'),
    hidden: true
  },
  // {
  //   path: '/register',
  //   component: () => import('@/views/register.vue'),
  //   hidden: true
  // },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/page-404.vue'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/page-401.vue'),
    hidden: true
  },
  {
    path: '',
    component: Layout,
    redirect: '/index',
    children: [
      {
        path: '/index',
        component: () => import('@/views/home.vue'),
        name: 'Index',
        meta: { title: '首页', icon: 'HomeFilled', affix: true }
      }
    ]
  }
  // {
  //   path: '/user',
  //   component: Layout,
  //   hidden: true,
  //   redirect: 'noredirect',
  //   children: [
  //     {
  //       path: 'profile',
  //       component: () => import('@/views/system/user/profile/index.vue'),
  //       name: 'Profile',
  //       meta: { title: '个人中心', icon: 'user' }
  //     }
  //   ]
  // }
]

// 动态路由，基于用户权限动态去加载
export const dynamicRoutes = [
  // {
  //   path: '/system/user-auth',
  //   component: Layout,
  //   hidden: true,
  //   permissions: ['system:user:edit'],
  //   children: [
  //     {
  //       path: 'role/:userId(\\d+)',
  //       component: () => import('@/views/system/user/authRole'),
  //       name: 'AuthRole',
  //       meta: { title: '分配角色', activeMenu: '/system/user' }
  //     }
  //   ]
  // }
  {
    path: '/system/role-auth',
    component: Layout,
    hidden: true,
    permissions: ['system:role:edit'],
    children: [
      {
        path: 'user/:roleId(\\d+)',
        component: () => import('@/views/system/role-auth-user/index.vue'),
        name: 'AuthUser',
        meta: { title: '分配用户', activeMenu: '/system/role' }
      }
    ]
  }
  // {
  //   path: '/system/dict-data',
  //   component: Layout,
  //   hidden: true,
  //   permissions: ['system:dict:list'],
  //   children: [
  //     {
  //       path: 'index/:dictId(\\d+)',
  //       component: () => import('@/views/system/dict/data'),
  //       name: 'Data',
  //       meta: { title: '字典数据', activeMenu: '/system/dict' }
  //     }
  //   ]
  // },
  // {
  //   path: '/monitor/job-log',
  //   component: Layout,
  //   hidden: true,
  //   permissions: ['monitor:job:list'],
  //   children: [
  //     {
  //       path: 'index/:jobId(\\d+)',
  //       component: () => import('@/views/monitor/job/log'),
  //       name: 'JobLog',
  //       meta: { title: '调度日志', activeMenu: '/monitor/job' }
  //     }
  //   ]
  // },
  // {
  //   path: '/tool/gen-edit',
  //   component: Layout,
  //   hidden: true,
  //   permissions: ['tool:gen:edit'],
  //   children: [
  //     {
  //       path: 'index/:tableId(\\d+)',
  //       component: () => import('@/views/tool/gen/editTable'),
  //       name: 'GenEdit',
  //       meta: { title: '修改生成配置', activeMenu: '/tool/gen' }
  //     }
  //   ]
  // }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    ...constantRoutes,
    ...dynamicRoutes,
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

router.beforeEach(async (to, from, next) => {
  const systemStore = useSystemStore()
  const systemSetting = useSystemSetting()
  const permissionStore = usePermissionStore()
  NProgress.start()
  if (
    // 检查用户是否已登录
    !systemStore.isLogin &&
    // ❗️ 避免无限重定向
    to.name !== 'login' &&
    systemSetting.setting.openPermission
  ) {
    // 将用户重定向到登录页面
    next({ name: 'login' })
    return false
  } else if (to.name == 'login') {
    next()
    return false
  }
  if (permissionStore.addRoutes.length == 0) {
    await permissionStore.generateRoutes()
  }
  next()
})
router.afterEach(() => {
  NProgress.done()
})
export default router
