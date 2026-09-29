import baseRequest from '../base-request.js'

const request = (url, data, method) => {
  return baseRequest('/sys/account/' + url, data, method)
}

/**
 * 按账号查询系统登录账户（多租户邀请模式用）
 */
export function queryUserByAccount(username) {
  return request('queryUserByAccount', { username })
}

/**
 * 账户管理 分页
 */
export function getAccountPage(data) {
  return request('page', data)
}

/**
 * 获取账户详情
 */
export function getAccountDetail(id) {
  return request('detail', { id })
}

/**
 * 新增账户
 */
export function addAccount(data) {
  return request('add', data, 'post')
}

/**
 * 编辑账户
 */
export function editAccount(data) {
  return request('edit', data, 'post')
}

/**
 * 删除账户
 */
export function deleteAccounts(ids) {
  return request('delete', { sysAccountIdParamList: ids }, 'post')
}

/**
 * 启用账户
 */
export function enableAccount(id) {
  return request('enable', { id }, 'post')
}

/**
 * 禁用账户
 */
export function disableAccount(id) {
  return request('disable', { id }, 'post')
}

/**
 * 重置账户密码
 */
export function resetAccountPassword(id) {
  return request('resetPassword', { id }, 'post')
}