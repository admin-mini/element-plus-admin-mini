import BaseLayout from '@/layout/base-layout.vue'
//eslint-disable-next-line
// import { RouterView } from 'vue-router'
import RouterView from './admin-router-view.vue'

const autoImportPage = import.meta.glob(['@/views/**/index.vue'])
const autoImportPageInfo = import.meta.glob(['@/views/**/auto-route.js'], { eager: true })

let autoImportRotesCache = {}
let autoImportRotes = []
for (let path in autoImportPageInfo) {
  let pathList = path.split('/').slice(3, -1)
  let realPath = pathList.join('/')
  let route = {
    name: realPath,
    path: realPath,
    meta: {
      name: realPath
    },
    component: autoImportPage['/src/views/' + realPath + '/index.vue'] || RouterView
  }
  let info = autoImportPageInfo[path]
  if (info) {
    Object.assign(route, info.default)
  }
  autoImportRotesCache[pathList.join('/')] = route
  let parentRoute = autoImportRotesCache[pathList.slice(0, -1).join('/')]
  if (pathList.length > 1 && parentRoute) {
    parentRoute.children = parentRoute.children || []
    parentRoute.children.push(route)
    parentRoute.children.sort((a, b) => {
      return (b.weight || 0) - (a.weight || 0)
    })
  } else {
    autoImportRotes.push(route)
  }
}
/**
 * meta.hide = true 不会显示在侧边栏
 * meta.affix = true 会在侧边栏固定
 * meta.weight 排序权重
 * meta.name 侧边栏显示名称
 * meta.icon 侧边栏图标 系统优先使用element-plus图标库，如果匹配不到，则使用svg-icon图标，具体可参考/components/svg-icon.vue
 */
autoImportRotes = autoImportRotes.concat([
  {
    path: '',
    weight: 100,
    meta: { name: '首页', icon: 'HomeFilled', affix: true },
    component: () => import('@/views/home.vue')
  },
  {
    path: '/system/',
    meta: { name: '系统设置', icon: 'Tools' },
    component: RouterView,
    children: [
      {
        path: 'role',
        meta: { name: '角色管理', icon: 'Avatar' },
        component: () => import('@/views/system/role/index.vue')
      },
      {
        path: 'role/auth/:roleId(\\d+)',
        component: () => import('@/views/system/role-auth-user/index.vue'),
        meta: { name: '分配用户', hide: true, activeMenu: '/system/role' }
      },
      {
        path: 'user',
        meta: { name: '用户管理', icon: 'UserFilled' },
        component: () => import('@/views/system/user/index.vue')
      }
    ]
  }
])

autoImportRotes.sort((a, b) => {
  return (b.weight || 0) - (a.weight || 0)
})
export default [
  {
    path: '/',
    component: BaseLayout,
    children: [...autoImportRotes]
  }
]
