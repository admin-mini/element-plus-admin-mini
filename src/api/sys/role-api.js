import baseRequest from '../base-request.js'

const request=(url,data,method)=>{
   return baseRequest("/sys/role/"+url,data,method);
}
/**
 * 角色管理 分页
 */
export function getRolePage(data) {
  return request("page",data)
}

/**
 * 获取角色详情
 */
export function getRoleDetail(id) {
  return request("detail",{id:id})
}

/**
 * 新增角色
 */
export function addRole( data) {
    return request("add",data,"post")
}

/**
 * 编辑角色
 */
export function editRole( data) {
        return request("edit",data,"post")
}
/**
 * 删除角色
 */
export function deleteByIds( ids) {
  return request("delete",{ids},"post")
}

/**
 * 获取角色权限
 */
export function getRolePermission(id) {
  return request("getPermission",{params:{id}});
}

/**
 * 设置角色权限
 */
export function setRolePermission(data) {
  return request("setPermission",data,"post");
}


/**
 * 获取角色数据权限
 */
export function getRoleDataScope(id) {
  return request("getDataScope",{params:{id}});
}


/**
 * 设置角色数据权限
 */
export function setRoleDataScope(data) {
  return request("setDataScope",data,"post");
}
