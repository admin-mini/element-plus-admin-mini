import ajax from '../ajax.js'
import SETTING from '@/utils/setting'

/**
 * 站内信接口封装（/sys/userCenter/message/**）
 * 接口定义参考 Swagger：/sys/userCenter/message 相关接口
 */
const base = '/sys/userCenter/message'

// GET 请求统一走 query 方式（后端 Swagger 中参数均声明为 in: query）
const getQuery = (url, data = {}) => ajax.get(`${base}/${url}`, { params: data })

/**
 * 站内信分类目录配置
 * 说明：page 接口的 category 取值需与后端约定一致，如后端分类不同请在此处调整
 * sent 为“我发送的”特殊目录，走 getSentMessagePage（当前为模拟接口）
 */
export const MESSAGE_CATEGORIES = [
  { value: 'inbox', label: '收件箱', icon: 'Message' },
  { value: 'notice', label: '系统通知', icon: 'Bell' },
  { value: 'approval', label: '审批消息', icon: 'Stamp' },
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
 * 建立 SSE 长连接的完整 URL（配合 fetch 流式读取使用）
 * @param {string} clientId 客户端唯一标识（建议传当前用户ID）
 */
export function getSseUrl(clientId) {
  return SETTING.formatUrl(
    `sys/userCenter/message/createSseConnect?clientId=${encodeURIComponent(clientId)}`
  )
}

/**
 * 获取最新未读消息列表（用于角标未读数/抽屉列表）
 * @param {number} limit 获取条数，默认 100
 */
export function getMessageList(limit = 10) {
  return getQuery('list', { limit })
}

/**
 * 站内信分页列表（按目录 category 分目录查询）
 * @param {Object} data { category(必填), keywords, read, senderUserId, current, size }
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
 * 将所有消息标记为已读
 */
export function markAllMessageRead() {
  return ajax.post(`${base}/allRead`)
}

/**
 * 发送站内信
 * @param {Object} data { title(必填), receiverIdList(必填,接收人ID数组), content }
 */
export function sendMessage(data) {
  return ajax.post(`${base}/send`, null, {
    params: data,
    // 数组序列化为 receiverIdList=1&receiverIdList=2 形式，便于 Spring 绑定 List 参数
    paramsSerializer: { indexes: null }
  })
}

/**
 * “我发送的”消息分页列表
 * TODO: 后端暂无对应列表接口，先返回模拟数据占位，接口就绪后替换为真实请求即可
 * @param {Object} query { current, size, keywords }
 */
export function getSentMessagePage(query = {}) {
  const current = query.current || 1
  const size = query.size || 10
  const all = buildSentMock()
  const records = all.slice((current - 1) * size, current * size)
  return Promise.resolve({
    code: 200,
    msg: 'ok',
    data: { total: all.length, records }
  })
}

// 发送记录模拟数据（可替换为真实接口）
function buildSentMock() {
  return [
    {
      id: 101,
      title: '关于下周项目评审的通知',
      content: '各位同事，请于下周一上午 10:00 在会议室参加项目阶段评审，请提前准备相关材料。',
      category: 'sent',
      read: 1,
      receiverNames: '张三、李四 等2人',
      createTime: '2026-10-02 09:30'
    },
    {
      id: 102,
      title: '账号安全提醒',
      content: '系统检测到您的账号近期在异地登录，请及时修改密码，保障账号安全。',
      category: 'sent',
      read: 1,
      receiverNames: '王五',
      createTime: '2026-09-28 15:12'
    },
    {
      id: 103,
      title: '本周工作汇报',
      content: '请各部门在本周五 18:00 前提交本周工作汇报，格式参考模板。',
      category: 'sent',
      read: 0,
      receiverNames: '张三、李四、王五 等5人',
      createTime: '2026-10-03 11:00'
    },
    {
      id: 104,
      title: '系统升级维护通知',
      content: '系统将于本周六 22:00 进行升级维护，预计持续 2 小时，期间服务暂不可用。',
      category: 'sent',
      read: 0,
      receiverNames: '全体员工',
      createTime: '2026-10-04 08:40'
    }
  ]
}
