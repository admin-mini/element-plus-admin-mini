import baseRequest from '../base-request.js'
const request = (url, data, method) => baseRequest(`/dev/config/${url}`, data, method)

// 配置分页（后端固定只查询 other 分类）
export const getConfigPage = data => request('page', data)
// 获取系统基础配置（sys_config）
export const getSysConfigList = () => request('sysConfigList')
// 按配置分类获取配置列表
export const getConfigList = data => request('list', data)
// 配置详情
export const getConfigDetail = id => request('detail', { id })
// 新增配置
export const addConfig = data => request('add', data, 'post')
// 编辑配置
export const editConfig = data => request('edit', data, 'post')
// 删除配置
export const deleteConfig = data => request('delete', data, 'post')
// 批量更新配置值
export const editConfigBatch = data => request('editBatch', data, 'post')
