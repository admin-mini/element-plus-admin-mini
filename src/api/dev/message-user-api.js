import ajax from '../ajax.js'
import SETTING from '@/utils/setting'

/**
 * 站内信（用户中心）接口封装
 * 对应后端 /dev/message-user/** —— 面向所有登录用户的站内信能力
 * 说明：管理端的 /dev/message/** 单独维护，勿混用
 */
const base = '/dev/message-user'

// GET 请求统一走 query 方式（后端 Swagger 中参数均声明为 in: query）
const getQuery = (url, data = {}) => ajax.get(`${base}/${url}`, { params: data })

/**
 * 站内信分类目录配置
 * 说明：page 接口的 category 取值需与后端约定一致，如后端分类不同请在此处调整
 * sent 为“我发送的”特殊目录，走 getSentMessagePage（当前为模拟接口）
 */
export const MESSAGE_CATEGORIES = [
  { value: 'msg', label: '收件箱', icon: 'Message' },
  { value: 'sys', label: '系统通知', icon: 'Bell' },
  { value: 'audit', label: '审批消息', icon: 'Stamp' },
  { value: 'task', label: '待办任务', icon: 'List' },
  { value: 'sent', label: '我发送的', icon: 'Promotion', sent: true }
]

/**
 * 站内信分类头像/颜色配置（按业务类型区分）
 * msg 为用户消息（头像优先 sender.avatar，文字取 sender.name/nickname）
 * 其余一般为系统消息（senderUserId 为 0 或为空），按业务类型显示不同头像文字与颜色
 * 说明：category 取值需与后端约定一致，如需新增业务类型在此处补充即可
 */
export const MESSAGE_CATEGORY_CONFIG = {
  msg: { label: '用户', color: '#6366f1' },
  notice: { label: '通知', color: '#10b981' },
  approval: { label: '审批', color: '#f59e0b' },
  task: { label: '待办', color: '#ef4444' },
  inbox: { label: '收件', color: '#0ea5e9' },
  system: { label: '系统', color: '#909399' }
}

/** 按分类获取展示配置，未知分类回退为系统消息 */
export function getMessageCategoryConfig(category) {
  return MESSAGE_CATEGORY_CONFIG[category] || MESSAGE_CATEGORY_CONFIG.system
}

/**
 * 建立 SSE 长连接的完整 URL（交由 EventSourcePolyfill 使用）
 * 注意：此处不走 ajax，需自行拼出 /api 前缀，路径必须与 base 保持一致
 * @param {string} clientId 客户端唯一标识（首次可为空，服务端会分配）
 */
export function getSseUrl(clientId) {
  return SETTING.formatUrl(
    `dev/message-user/createSseConnect?clientId=${encodeURIComponent(clientId)}`
  )
}

/**
 * 获取未读消息列表（最新 limit 条，用于角标未读数/抽屉列表）
 * @param {number} limit 获取条数，默认 10
 */
export function getMessageList(limit = 10) {
  return getQuery('list', { limit })
}

/**
 * 收到的站内信分页列表（按目录 category 分目录查询）
 * 注意：接收人由后端取当前登录用户，前端无需传 receiverUserId
 * @param {Object} data { category, keywords, read, current, size }
 */
export function getMessagePage(data = {}) {
  return getQuery('page', data)
}

/**
 * 获取消息详情（后端会将消息标记为已读）
 * @param {number|string} id 消息ID
 */
export function getMessageDetail(id) {
  return ajax.get(`${base}/detail/${id}`)
}

/**
 * 将自己的消息全部标记为已读
 */
export function markAllMessageRead() {
  return ajax.post(`${base}/allRead`)
}

/**
 * 发送站内信
 * 后端会将 category 固定为 msg、senderUserId 取当前登录用户
 * @param {Object} data { title(必填), receiverIdList(必填,接收人ID数组), content }
 */
export function sendMessage(data) {
  return ajax.post(`${base}/message/send`, null, {
    params: data,
    // 数组序列化为 receiverIdList=1&receiverIdList=2 形式，便于 Spring 绑定 List 参数
    paramsSerializer: { indexes: null }
  })
}

/**
 * “我发送的”消息分页列表
 * 注意：发送人由后端取当前登录用户；该接口不返回 receiverInfoList
 * @param {Object} data { keywords, current, size }
 */
export function getSentMessagePage(data = {}) {
  return getQuery('sendPage', data)
}

/**
 * “我发送的”消息详情（含接收人集合 receiverInfoList）
 * @param {number|string} id 消息ID
 */
export function getSentMessageDetail(id) {
  return ajax.get(`${base}/sendDetail/${id}`)
}
