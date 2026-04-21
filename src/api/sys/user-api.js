import baseRequest from '../base-request.js'

const request=(url,data,method)=>{
   return baseRequest("/sys/user/"+url,data,method);
}
/**
 * 用户管理 分页
 */
export function getUserPage(data) {
  return request("page",data)
}

/**
 * 获取用户详情
 */
export function getUserDetail(id) {
  return request("detail",{id:id})
}

/**
 * 新增用户
 */
export function addUser( data) {
    return request("add",data,"post")
}

/**
 * 编辑用户
 */
export function editUser( data) {
        return request("edit",data,"post")
}
/**
 * 删除用户[id,id]
 */
export function deleteByIds( ids) {
  return request("delete",{ids},"post")
}

/**
 * 禁用用户{id}
 */
export function disableUser(data) {
  return request("disableUser",data,"post");
}


/**
 * 启用用户{id}
 */
export function enableUser(data) {
  return request("enableUser",data,"post");
}

/**
 * 重置用户密码{id}
 */
export function resetUserPassword(data) {
  return request("resetPassword",data,"post");
}

/**
 * 导出用户信息
 */
export function exportUser(data) {
  return request("export",data);
}

/**
 * 获取用户信息
 */
export function getSelectorPage(data) {
  return request("selectorPage",data);
}


/**
 * 获取用户信息
 */
export function getSelectedUsers(userIds) {
  return request("getSelectedUsers",{userIds:userIds});
}