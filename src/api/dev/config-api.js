import baseRequest from '../base-request.js'
const request = (url, data, method) => baseRequest(`/dev/config/${url}`, data, method)
export const getConfigPage = data => request('page', data)
export const getConfigDetail = id => request('detail', { id })
export const addConfig = data => request('add', data, 'post')
export const editConfig = data => request('edit', data, 'post')
export const deleteConfig = data => request('delete', data, 'post')
