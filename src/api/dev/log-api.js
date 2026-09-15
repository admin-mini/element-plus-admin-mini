import baseRequest from '../base-request.js'
const request = (url, data, method) => baseRequest(`/dev/log/${url}`, data, method)
export const getLogPage = data => request('page', data)
export const getLogDetail = id => request('detail', { id })
export const deleteLog = data => request('delete', data, 'post')
