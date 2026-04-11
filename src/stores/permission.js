import router, { constantRoutes, dynamicRoutes } from '@/router'
import { getRouters } from '@/api/menu'
import Layout from '@/layout/base-layout.vue'
import ParentView from '@/layout/parent-view.vue'
//import InnerLink from '@/layout/inner-link.vue'
import auth from '@/utils/auth'
import { defineStore } from 'pinia'
import { isExternal } from '@/utils/validate'
import { useTagView } from './tag-view'

const modules = import.meta.glob('@/views/**/*.vue')

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    routes: [],
    addRoutes: [],
    defaultRoutes: [],
    topbarRouters: [],
    sidebarRouters: []
  }),
  actions: {
    setRoutes(routes) {
      this.addRoutes = routes
      this.routes = constantRoutes.concat(routes)
    },
    setDefaultRoutes(routes) {
      this.defaultRoutes = constantRoutes.concat(routes)
    },
    setTopbarRoutes(routes) {
      this.topbarRouters = routes
    },
    setSidebarRouters(routes) {
      this.sidebarRouters = routes
    },
    clearAddRoutes() {
      this.addRoutes = []
    },
    generateRoutes(roles) {
      return new Promise((resolve, reject) => {
        getRouters()
          .then((res) => {
            const { routes: rawRoutes, home: homeName } = res.data

            const sdata = JSON.parse(JSON.stringify(rawRoutes))
            const rdata = JSON.parse(JSON.stringify(rawRoutes))
            const defaultData = JSON.parse(JSON.stringify(rawRoutes))

            const sidebarRoutes = transformRoutes(sdata)
            const rewriteRoutes = transformRoutes(rdata)
            const defaultRoutes = transformRoutes(defaultData)

            // 根据home名称找到对应路径，设置默认重定向
            const homeRoute = findRouteByName(rewriteRoutes, homeName)
            console.log("home",homeRoute);
            if (homeRoute) {
              router.addRoute({
                path: '/',
                redirect: homeRoute.path
              })
            }

            // 前端硬编码的动态权限路由
            const asyncRoutes = filterDynamicRoutes(dynamicRoutes)
            asyncRoutes.forEach((route) => {
              router.addRoute(route)
            })

            rewriteRoutes.forEach((route) => {
              if (!isExternal(route.path)) {
                router.addRoute(route)
              }
            })

            this.setRoutes(rewriteRoutes)
            this.setSidebarRouters(constantRoutes.concat(sidebarRoutes))
            this.setDefaultRoutes(sidebarRoutes)
            this.setTopbarRoutes(defaultRoutes)

            const tagView = useTagView()
            filterAffixTags(this.routes).forEach((_route) => {
              tagView.addTag(_route)
            })

            resolve(rewriteRoutes)
          })
          .catch((err) => {
            reject(err)
          })
      })
    }
  }
})

/**
 * 递归查找指定name的路由
 */
function findRouteByName(routes, name) {
  for (const route of routes) {
    if (route.name === name) return route
    // layout.base$view.xxx 展开后 name 在子路由上
    if (route.children) {
      const found = findRouteByName(route.children, name)
      if (found) return found
    }
  }
  return null
}

/**
 * 转换路由数组
 */
function transformRoutes(routeList) {
  return routeList.map((route) => transformRoute(route)).filter(Boolean)
}

/**
 * 转换单条路由
 *
 * component 规则：
 *   layout.base$view.xxx  → Layout容器 + 默认子路由渲染view.xxx
 *   layout.base           → Layout容器，children来自后端返回
 *   view.xxx_yyy          → 具体页面组件（作为父级layout.base的子路由）
 *   ParentView            → 保留占位，待后续完善
 *   InnerLink             → 保留占位，待后续完善
 */
function transformRoute(route) {
  const { name, path, component: componentStr, meta, children } = route

  const hasChildren = children && children.length > 0

  // layout.base$view.xxx：展开为 Layout + 默认子路由
  if (componentStr && componentStr.includes('$')) {
    const [, viewPart] = componentStr.split('$')
    const pathSegments = path.split('/').filter(Boolean)
    const childPath = pathSegments[pathSegments.length - 1] // 'home'
    const parentPath = '/' + pathSegments.slice(0, -1).join('/') // '/'

    return {
        path: parentPath,   // /
        component: Layout,
        meta: { ...transformMeta(meta), affix: false }, //转后强制不进入affix状态
        redirect: path,     // /home
        children: [
        {
            path: childPath, // home
            name,
            component: resolveViewComponent(viewPart),
            meta: transformMeta(meta)
        }
        ]
    }
    }

  // layout.base：纯容器，children来自后端
  if (componentStr === 'layout.base') {
    const vueRoute = {
      name,
      path,
      component: Layout,
      meta: transformMeta(meta)
    }
    if (hasChildren) {
      vueRoute.children = transformRoutes(children)
      vueRoute.redirect = vueRoute.children[0]?.path
    }
    return vueRoute
  }

  // view.xxx：具体页面，作为子路由使用
  if (componentStr && componentStr.startsWith('view.')) {
    return {
      name,
      path,
      component: resolveViewComponent(componentStr),
      meta: transformMeta(meta)
    }
  }

  // ParentView 占位保留
  if (componentStr === 'ParentView') {
    const vueRoute = {
      name,
      path,
      component: ParentView, // 待后续完善
      meta: transformMeta(meta)
    }
    if (hasChildren) {
      vueRoute.children = transformRoutes(children)
    }
    return vueRoute
  }

  // InnerLink 占位保留
  if (componentStr === 'InnerLink') {
    return {
      name,
      path,
      component: InnerLink, // 待后续完善
      meta: transformMeta(meta)
    }
  }

  console.warn('[storesPermission] 未能识别的component格式，已跳过:', name, componentStr)
  return null
}

/**
 * 解析 view.xxx_yyy_zzz → /src/views/xxx/yyy/zzz.vue
 * 规则：去掉 view. 前缀，_ 转 /
 * 示例：
 *   view.sys_menu              → /src/views/sys/menu.vue
 *   view.multi-menu_first_child → /src/views/multi-menu/first/child.vue
 */
function resolveViewComponent(viewStr) {
  const viewPath = viewStr.replace(/^view\./, '').replaceAll('_', '/')
  const fullPath = `/src/views/${viewPath}.vue`
  const module = modules[fullPath]
  if (module) {
    return () => module()
  }

  console.warn('[storesPermission] 找不到对应的view文件:', fullPath)
    return () => import('@/layout/other/page-404.vue')
}

/**
 * 转换 meta 字段
 */
function transformMeta(meta = {}) {
  return {
    title: meta.title || '',
    icon: meta.icon || '',
    localIcon: meta.localIcon || '',
    keepAlive: meta.keepAlive ?? false,
    hideInMenu: meta.hideInMenu ?? false,
    activeMenu: meta.activeMenu || '',
    multiTab: meta.multiTab ?? false,
    order: meta.order ?? 0,
    query: meta.query || [],
    href: meta.href || '',
    affix: !!meta.fixedIndexInTab  ,
    fixedIndexInTab: meta.fixedIndexInTab
  }
}

/**
 * 找出所有需要固定在 tagView 中的路由
 */
function filterAffixTags(routes) {
  let tags = []
  routes.forEach((route) => {
    if (route.meta?.affix) {
      tags.push(route)
    }
    if (route.children) {
      tags = [...tags, ...filterAffixTags(route.children)]
    }
  })
  return tags
}

/**
 * 动态路由遍历，验证是否具备权限（保留原逻辑）
 */
export function filterDynamicRoutes(routes) {
  const res = []
  routes.forEach((route) => {
    if (route.permissions) {
      if (auth.hasPermiOr(route.permissions)) {
        res.push(route)
      }
    } else if (route.roles) {
      if (auth.hasRoleOr(route.roles)) {
        res.push(route)
      }
    }
  })
  return res
}

export const loadView = (view) => {
  let res = modules['/src/views/' + view + '.vue']
  console.log("res",res);
 if (res) {
      return () => res()
    } else {
      console.warn(`[Permission] 找不到组件路径: ${filePath}，请确认 views 目录下文件是否存在`)
      return () => import('@/layout/other/page-404.vue')
    }
 
}