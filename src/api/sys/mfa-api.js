import baseRequest from '../base-request.js'

const request = (url, data, method) => baseRequest(`/dev/mfa/${url}`, data, method)

/**
 * 2FA 绑定分页
 * @param {Object} data { tenantId, ownerType, ownerId, ownerName, status, current, size }
 */
export const getMfaPage = (data) => request('page', data)

/**
 * 2FA 绑定详情
 * @param {Object} data { tenantId, ownerType, ownerId }
 */
export const getMfaDetail = (data) => request('detail', data)

/**
 * 重置失败次数并解锁
 * @param {Object} data { tenantId, ownerType, ownerId }
 */
export const resetMfa = (data) => request('reset', data, 'post')

/**
 * 失效绑定（不删除记录，用户下次登录需重新绑定）
 * @param {Object} data { tenantId, ownerType, ownerId }
 */
export const disableMfa = (data) => request('disable', data, 'post')

/**
 * 删除绑定（逻辑删除，用户下次登录可重新绑定）
 * @param {Object} data { tenantId, ownerType, ownerId }
 */
export const deleteMfa = (data) => request('delete', data, 'post')

const requestEvent = (url, data, method) => baseRequest(`/dev/mfaEvent/${url}`, data, method)

/**
 * 2FA 操作事件分页（只读审计）
 * @param {Object} data { tenantId, ownerType, ownerId, event, startTime, endTime, current, size }
 */
export const getMfaEventPage = (data) => requestEvent('page', data)
