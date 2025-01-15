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

autoImportRotes = autoImportRotes.concat([
  {
    path: '',
    weight: 100,
    meta: { name: '首页', icon: 'House' },
    component: () => import('@/views/home.vue')
  },
  {
    path: '/system/',
    meta: { name: '系统设置', icon: 'House' },
    component: RouterView,
    children: [
      {
        path: 'role',
        meta: { name: '角色管理', icon: 'House' },
        component: () => import('@/views/system/role/index.vue')
      },
      {
        path: 'user',
        meta: { name: '用户管理', icon: 'House' },
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
