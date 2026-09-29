import baseRequest from '../base-request.js'
const request = (url, data, method) => baseRequest(`/dev/log/${url}`, data, method)

// 日志分页
export const getLogPage = data => request('page', data)
// 日志详情
export const getLogDetail = id => request('detail', { id })
// 清空日志（后端按 category 整体清空，不支持单条删除）
export const clearLog = category => request('delete', { category }, 'post')

// 访问日志折线图数据
export const getVisLineChartData = () => request('vis/lineChartData')
// 访问日志饼状图数据
export const getVisPieChartData = () => request('vis/pieChartData')
// 操作日志柱状图数据
export const getOpBarChartData = () => request('op/barChartData')
// 操作日志饼状图数据
export const getOpPieChartData = () => request('op/pieChartData')
