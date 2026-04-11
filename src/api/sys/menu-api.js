import ajax from '../ajax.js'

const request=(url,data,method="get")=>{
   const fn = method=="post"?ajax.post:ajax.get;
   return fn("/sys/menu/"+url,data);
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
  return request("detail",{params:{id:id}})
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
  return request("delete",{params:{id:id}})
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
