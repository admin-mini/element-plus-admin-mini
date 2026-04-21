import baseRequest from '../base-request.js'


const request=(url,data,method)=>{
   return baseRequest("/sys/menu/"+url,data,method);
}

/**
 * 获取菜单列表
 */
export function getMenuTree() {
  return request("tree")
}

/**
 * 新增菜单
 */
export function getMenu(id) {
  return request("detail",{id:id})
}

/**
 * 新增菜单
 */
export function addMenu( data) {
    return request("add",data,"post")
}

/**
 * 编辑菜单
 */
export function editMenu( data) {
        return request("edit",data,"post")
}
/**
 * 删除菜单
 */
export function deleteById( id) {
  return request("delete",{id},"post")
}
/**
 * 批量删除菜单
 */
export function batchDeleteByIds( ids) {
    return request("edit",ids,"post")
}

/**
 * 获取tree选择菜单
 */
export function getTreeSelector() {
  return request("selector")
}
