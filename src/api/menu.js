import ajax from './ajax.js'

/**
 * 获取用户菜单routers
 */
export const getRouters=()=> {
   return ajax.get("/route/getUserRoutes")
}
