import baseRequest from '../base-request.js'

const request = (url, data, method) => baseRequest('/sys/tenant/' + url, data, method)

/** 租户管理 分页 */
export function getTenantPage(data) {
  return request('page', data)
}

/** 获取租户详情 */
export function getTenantDetail(id) {
  return request('detail', { id })
}

/** 新增租户 */
export function addTenant(data) {
  return request('add', data, 'post')
}

/** 编辑租户 */
export function editTenant(data) {
  return request('edit', data, 'post')
}

/** 删除租户（ids 为租户ID数组） */
export function deleteTenant(ids) {
  return request('delete', { sysTenantIdParamList: ids.map((id) => ({ id })) }, 'post')
}

/** 获取租户展示信息 */
export function getTenantView(id) {
  return request('view', { id })
}

/** 平台租户下拉（用于选择列表） */
export function getTenantSelector() {
  return request('get-selector')
}

/** 租户套餐 分页 */
export function getTenantPackagePage(data) {
  return baseRequest('/sys/tenant/package/page', data)
}

/** 获取租户套餐详情 */
export function getTenantPackageDetail(id) {
  return baseRequest('/sys/tenant/package/detail', { id })
}

/** 新增租户套餐 */
export function addTenantPackage(data) {
  return baseRequest('/sys/tenantpackage/add', data, 'post')
}

/** 编辑租户套餐 */
export function editTenantPackage(data) {
  return baseRequest('/sys/tenant/package/edit', data, 'post')
}

/** 删除租户套餐（ids 为套餐ID数组） */
export function deleteTenantPackage(ids) {
  return baseRequest('/sys/tenant/package/delete', { sysTenantPackageIdParamList: ids.map((id) => ({ id })) }, 'post')
}

/** 套餐下拉（用于租户表单选择套餐） */
export function getPackageSelector() {
  return baseRequest('/sys/tenant/package/selector')
}