import ajax from '../ajax.js'
import baseRequest from '../base-request.js'
const request = (url, data, method) => baseRequest(`/dev/file/${url}`, data, method)

// 文件分页
export const getFilePage = data => request('page', data)
// 文件列表
export const getFileList = data => request('list', data)
// 文件详情
export const getFileDetail = id => request('detail', { id })
// 删除文件
export const deleteFile = data => request('delete', data, 'post')
// 根据文件url集合获取文件集合
export const getFileListByUrlList = data => request('getFileListByUrlList', data, 'post')

/**
 * 上传文件
 * @param {String} type uploadReturnId | uploadReturnUrl
 * @param {File} file 文件对象
 * @param {String} engine 存储引擎 local|aliyun|tencent|minio，不传使用系统默认引擎
 */
const upload = (type, file, engine) => {
  const formData = new FormData()
  formData.append('file', file)
  return baseRequest(`/dev/file/${type}${engine ? '/' + engine : ''}`, formData, 'post')
}
// 动态上传文件返回文件id
export const uploadReturnId = (file, engine) => upload('uploadReturnId', file, engine)
// 动态上传文件返回文件url
export const uploadReturnUrl = (file, engine) => upload('uploadReturnUrl', file, engine)

// 下载文件（后端返回二进制流）
export const downloadFile = id =>
  ajax.get('/dev/file/download', { params: { id }, responseType: 'blob' })
