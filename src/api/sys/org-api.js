import baseRequest from '../base-request.js'


const request=(url,data,method)=>{
   return baseRequest("/sys/org/"+url,data,method);
}

/**
 * 获取我能管理的部门tree
 */
export function getOrgTree() {
  return request("tree")
}

/**
 * 获取所有组织tree
 */
export function getOrgTreeAll() {
  return request("treeAll")
}

/**
 * 获取组织详情
 */
export function getOrgDetail(id) {
  return request("detail",{id:id})
}

/**
 * 新增组织
 */
export function addOrg( data) {
    return request("add",data,"post")
}

/**
 * 编辑组织
 */
export function editOrg( data) {
        return request("edit",data,"post")
}

/**
 * 删除组织
 */
export function deleteOrgByIds( ids) {
    return request("delete",{ids},"post")
}

/**
 * 获取tree选择菜单
 */
export function getOrgTreeSelector() {
  return request("selector")
}
