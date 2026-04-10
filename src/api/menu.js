import ajax from './ajax.js'

/**
 * 获取用户菜单routers
 */
export function getRouters() {
   return ajax.get("/route/getUserRoutes")
}
