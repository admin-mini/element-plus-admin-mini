import baseRequest from '../base-request.js'
const request = (url, data, method) => baseRequest(`/dev/sms/${url}`, data, method)

// 短信发送记录分页
export const getLogPage = data => request('log/page', data)
// 短信发送记录详情
export const getLogDetail = id => request('log/detail', { id })
// 删除短信发送记录
export const deleteLog = data => request('log/delete', data, 'post')
// 使用指定通道发送短信
export const sendSms = (channelCode, data) =>
  baseRequest(`/dev/sms/send/${channelCode}`, data, 'post')

// 短信模板分页
export const getTemplatePage = data => request('template/page', data)
// 短信模板详情
export const getTemplateDetail = templateId => request('template/detail', { templateId }, 'post')
// 新增短信模板
export const addTemplate = data => request('template/add', data, 'post')
// 编辑短信模板
export const editTemplate = data => request('template/edit', data, 'post')
// 删除短信模板
export const deleteTemplate = data => request('template/delete', data, 'post')
