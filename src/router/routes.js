//eslint-disable-next-line
// import { RouterView } from 'vue-router'
// import RouterView from '@/layout/admin-router-view.vue'
import parentView from '@/layout/parent-view.vue'
import layout from '@/layout/base-layout.vue'
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
    component: autoImportPage['/src/views/' + realPath + '/index.vue']
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
    meta: { name: '首页', icon: 'HomeFilled' },
    component: layout,
    children: [
      {
        path: '/home',
        meta: { name: '首页', icon: 'HomeFilled', affix: true },
        component: () => import('@/views/home.vue')
      }
    ]
  },
  {
    path: '/system/',
    meta: { name: '系统设置', icon: 'Tools' },
    component: layout,
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
      },
      {
        path: 'dept',
        meta: { name: '部门管理', icon: 'Stamp' },
        component: () => import('@/views/system/dept/index.vue')
      },
      {
        path: 'post',
        meta: { name: '岗位管理', icon: 'Briefcase' },
        component: () => import('@/views/system/post/index.vue')
      },
      {
        path: 'dict',
        meta: { name: '字典管理', icon: 'Collection' },
        component: () => import('@/views/system/dict/index.vue')
      },
      {
        path: 'dict/data/:dictId(\\d+)',
        component: () => import('@/views/system/dict/data.vue'),
        meta: { name: '字典数据', hide: true, activeMenu: '/system/dict' }
      },
      {
        path: 'config',
        meta: { name: '参数设置', icon: 'Setting' },
        component: () => import('@/views/system/config/index.vue')
      },
      {
        path: 'notice',
        meta: { name: '通知公告', icon: 'Bell' },
        component: () => import('@/views/system/notice/index.vue')
      },
      {
        path: 'log',
        meta: { name: '日志管理', icon: 'Document' },
        component: parentView,
        children: [
          {
            path: 'oper',
            meta: { name: '操作日志', icon: 'Operation' },
            component: () => import('@/views/system/log/oper/index.vue')
          },
          {
            path: 'login',
            meta: { name: '登录日志', icon: 'UserFilled' },
            component: () => import('@/views/system/log/login/index.vue')
          }
        ]
      },
      {
        path: 'menu',
        meta: { name: '菜单管理', icon: 'Menu' },
        component: () => import('@/views/system/menu/index.vue')
      }
    ]
  }
])

autoImportRotes.sort((a, b) => {
  return (b.weight || 0) - (a.weight || 0)
})
export default autoImportRotes
