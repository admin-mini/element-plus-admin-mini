import baseRequest from '../base-request.js'
const request = (url, data, method) => baseRequest(`/dev/file/${url}`, data, method)
export const getFilePage = data => request('page', data)
export const getFileDetail = id => request('detail', { id })
export const deleteFile = data => request('delete', data, 'post')
