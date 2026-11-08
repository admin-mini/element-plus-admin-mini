import ajax from '@/api/ajax'
import { ElMessage } from 'element-plus'

/**
 * 代码生成接口
 * add/edit 后端未使用 @Body，需按 x-www-form-urlencoded 提交
 */

function formPost(url, data) {
  const body = new URLSearchParams()
  Object.keys(data || {}).forEach((key) => {
    const value = data[key]
    if (value !== undefined && value !== null) {
      body.append(key, value)
    }
  })
  return ajax.post(url, body.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  })
}

// 分页
export const getGenPage = (data) => ajax.get('/gen/table/page', { params: data })

// 详情
export const getGenDetail = (id) => ajax.get('/gen/table/detail', { params: { id } })

// 新增配置
export const addGenTable = (data) => formPost('/gen/table/add', data)

// 编辑基础信息
export const editGenTable = (data) => formPost('/gen/table/edit', data)

// 删除配置（原始 JSON 数组）
export const deleteGenTable = (list) => ajax.post('/gen/table/delete', list)

// 数据库表列表
export const getDbTables = () => ajax.get('/gen/table/dbTables')

// 数据库字段
export const getDbTableColumns = (dataSourceName, tableName) =>
  ajax.get('/gen/table/dbTableColumns', { params: { dataSourceName, tableName } })

// 可用菜单树
export const getMenuTree = () => ajax.get('/gen/table/menuTree')

// 字段列表
export const getColumnList = (tableId) => ajax.get('/gen/table/columnList', { params: { tableId } })

// 保存字段配置（裸 JSON 数组）
export const saveColumns = (tableId, list) =>
  ajax.post('/gen/table/editColumns', list, { params: { tableId } })

// 预览代码
export const previewCode = (id) => ajax.get('/gen/code/preview', { params: { id } })

// 生成压缩包
export const execGenZip = (id) =>
  ajax.get('/gen/code/execGenZip', { params: { id }, responseType: 'blob' })

// 生成到项目目录
export const execGenProject = (id) => ajax.post('/gen/code/execGenProject', null, { params: { id } })

/**
 * 下载二进制响应
 * 后端异常时可能仍返回 JSON，这里做一次兜底提示
 * @param {Blob} blob
 * @param {string} fileName
 */
export async function downloadBlob(blob, fileName = '') {
  if (blob?.type && blob.type.includes('application/json')) {
    try {
      const result = JSON.parse(await blob.text())
      ElMessage.error(result.msg || '生成失败')
    } catch (e) {
      ElMessage.error('生成失败')
    }
    return false
  }
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.style.display = 'none'
  link.download = fileName
  link.href = url
  document.body.appendChild(link)
  link.click()
  URL.revokeObjectURL(url)
  document.body.removeChild(link)
  return true
}
