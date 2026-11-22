import { ElMessage } from 'element-plus'
import SETTING from '@/utils/setting'

/**
 * 全局 WebSocket 客户端（单例）
 *
 * 协议（见 docs/websocket-frontend.md）：
 * - 连接：ws://host/ws?token=xxx&client=web
 * - 上行：{ type, action?, reqId?, content? }
 * - 下行：{ code, msg, type, action, reqId, content }，code === 0 表示成功
 *
 * 职责：
 * 1. 断线自动重连（指数退避 + 抖动，1008 登录失效不重连）
 * 2. 按 type 订阅消息（全局有效，与页面生命周期无关）
 * 3. 统一发送封装 send(type, action, content) => reqId
 * 4. 请求/响应配对 request(type, action, content) => Promise
 */

export const WS_STATUS = {
  IDLE: 'idle',
  CONNECTING: 'connecting',
  OPEN: 'open',
  RECONNECTING: 'reconnecting',
  CLOSED: 'closed'
}

class WebSocketClient {
  constructor() {
    this.socket = null
    this.token = ''
    this.status = WS_STATUS.IDLE
    this.retryCount = 0
    this.retryTimer = null
    this.manualClosed = true
    /** Map<type, Set<handler>> */
    this.subscribers = new Map()
    this.statusHandlers = new Set()
    /** Map<reqId, { resolve, reject, timer }> */
    this.pending = new Map()
    this.seq = 0
  }

  get isConnected() {
    return this.status === WS_STATUS.OPEN && this.socket?.readyState === WebSocket.OPEN
  }

  /** 生成请求号，用于配对请求与响应 */
  nextReqId() {
    this.seq = (this.seq + 1) % 100000
    return `${Date.now().toString(36)}-${this.seq.toString(36)}`
  }

  /** 拼接连接地址：未显式配置时按环境自动推导 */
  buildUrl() {
    let url = SETTING.websocketUrl
    if (!url) {
      const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
      url = import.meta.env.DEV
        ? `${protocol}//${location.hostname}:${SETTING.websocketDevPort}/ws`
        : `${protocol}//${location.host}/ws`
    }
    const query = [
      `token=${encodeURIComponent(this.token || '')}`,
      `client=${encodeURIComponent(SETTING.websocketClient || 'web')}`
    ].join('&')
    return `${url}${url.includes('?') ? '&' : '?'}${query}`
  }

  /** 建立连接（幂等：已连接/连接中直接返回） */
  connect(token) {
    if (!SETTING.websocketEnable) return
    if (token !== undefined) this.token = token
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return
    }
    this.manualClosed = false
    this.open()
  }

  /** 手动重新连接（重置退避次数） */
  reconnect() {
    this.manualClosed = false
    this.retryCount = 0
    this.clearRetryTimer()
    this.closeSocketSilently()
    this.open()
  }

  /** 主动断开，不再重连 */
  disconnect() {
    this.manualClosed = true
    this.retryCount = 0
    this.clearRetryTimer()
    this.closeSocketSilently()
    this.rejectAllPending(new Error('WebSocket 已断开'))
    this.setStatus(WS_STATUS.CLOSED)
  }

  open() {
    if (!SETTING.websocketEnable) return
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return
    }
    this.setStatus(WS_STATUS.CONNECTING)

    let socket
    try {
      socket = new WebSocket(this.buildUrl())
    } catch (err) {
      console.error('[websocket] 创建连接失败：', err)
      this.scheduleReconnect()
      return
    }
    this.socket = socket

    socket.onopen = () => {
      this.retryCount = 0
      this.setStatus(WS_STATUS.OPEN)
    }
    socket.onmessage = (event) => this.handleMessage(event)
    socket.onerror = () => {
      // 浏览器通常随后触发 onclose，重连统一在 onclose 中处理
      console.warn('[websocket] 连接异常')
    }
    socket.onclose = (event) => this.handleClose(event)
  }

  closeSocketSilently() {
    if (!this.socket) return
    this.socket.onclose = null
    this.socket.onmessage = null
    this.socket.onerror = null
    this.socket.onopen = null
    this.socket.close()
    this.socket = null
  }

  clearRetryTimer() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer)
      this.retryTimer = null
    }
  }

  handleClose(event) {
    this.socket = null
    this.rejectAllPending(new Error('WebSocket 连接已断开'))

    if (this.manualClosed) {
      this.setStatus(WS_STATUS.CLOSED)
      return
    }
    // 1008：token 失效，服务端主动断开，重连无意义
    if (event?.code === 1008) {
      this.manualClosed = true
      this.setStatus(WS_STATUS.CLOSED)
      ElMessage.warning('登录状态已失效，WebSocket 连接已断开，请重新登录')
      return
    }
    if (!SETTING.websocketReconnect) {
      this.setStatus(WS_STATUS.CLOSED)
      return
    }
    const maxRetry = SETTING.websocketMaxRetry || 0
    if (maxRetry > 0 && this.retryCount >= maxRetry) {
      this.setStatus(WS_STATUS.CLOSED)
      console.warn(`[websocket] 已达到最大重连次数（${maxRetry}），停止重连`)
      return
    }
    this.scheduleReconnect()
  }

  /** 指数退避 + 20% 抖动 */
  scheduleReconnect() {
    this.setStatus(WS_STATUS.RECONNECTING)
    const base = SETTING.websocketReconnectDelay || 3000
    const max = SETTING.websocketReconnectMaxDelay || 30000
    const delay = Math.min(base * Math.pow(2, this.retryCount), max)
    const jitter = delay * (0.8 + Math.random() * 0.4)
    this.retryCount++
    console.warn(`[websocket] ${Math.round(jitter)}ms 后尝试第 ${this.retryCount} 次重连`)
    this.retryTimer = setTimeout(() => this.open(), Math.round(jitter))
  }

  handleMessage(event) {
    let msg
    try {
      msg = JSON.parse(event.data)
    } catch (err) {
      console.warn('[websocket] 报文解析失败：', event.data)
      return
    }

    // 请求 / 响应配对
    if (msg.reqId && this.pending.has(msg.reqId)) {
      const task = this.pending.get(msg.reqId)
      this.pending.delete(msg.reqId)
      clearTimeout(task.timer)
      if (msg.code === 0) {
        task.resolve(msg)
      } else {
        task.reject(new Error(msg.msg || `WebSocket 错误码 ${msg.code}`))
      }
    } else if (msg.code !== 0) {
      console.warn('[websocket] 服务端返回异常：', msg)
    }

    this.dispatch(msg)
  }

  dispatch(msg) {
    const handlers = new Set()
    const typed = this.subscribers.get(msg.type)
    if (typed) typed.forEach((fn) => handlers.add(fn))
    const wildcard = this.subscribers.get('*')
    if (wildcard) wildcard.forEach((fn) => handlers.add(fn))

    handlers.forEach((fn) => {
      try {
        fn(msg)
      } catch (err) {
        console.error('[websocket] 消息处理异常：', err)
      }
    })
  }

  /**
   * 订阅指定消息类型
   * @param {string|string[]} type 消息类型，'*' 表示全部
   * @param {(msg: object) => void} handler
   * @returns {() => void} 取消订阅
   */
  subscribe(type, handler) {
    if (typeof handler !== 'function') return () => {}
    const types = Array.isArray(type) ? type : [type]
    types.forEach((t) => {
      if (!this.subscribers.has(t)) this.subscribers.set(t, new Set())
      this.subscribers.get(t).add(handler)
    })
    return () => {
      types.forEach((t) => {
        const set = this.subscribers.get(t)
        if (!set) return
        set.delete(handler)
        if (set.size === 0) this.subscribers.delete(t)
      })
    }
  }

  /** 订阅连接状态变化，注册时立即回调一次当前状态 */
  onStatus(handler) {
    if (typeof handler !== 'function') return () => {}
    this.statusHandlers.add(handler)
    handler(this.status)
    return () => this.statusHandlers.delete(handler)
  }

  setStatus(status) {
    if (this.status === status) return
    this.status = status
    this.statusHandlers.forEach((fn) => {
      try {
        fn(status)
      } catch (err) {
        console.error('[websocket] 状态回调异常：', err)
      }
    })
  }

  /**
   * 统一发送封装
   * @param {string} type 消息类型
   * @param {string} [action] 子操作
   * @param {*} [content] 消息内容
   * @returns {string|null} 请求号，未连接时返回 null
   */
  send(type, action, content) {
    return this.sendWithReqId(type, action, content, this.nextReqId())
  }

  sendWithReqId(type, action, content, reqId) {
    if (!this.isConnected) {
      console.warn(`[websocket] 未连接，消息已丢弃：${type}`)
      return null
    }
    const payload = { type, reqId, content }
    if (action) payload.action = action
    try {
      this.socket.send(JSON.stringify(payload))
    } catch (err) {
      console.error('[websocket] 发送失败：', err)
      return null
    }
    return reqId
  }

  /**
   * 发送并等待该 reqId 的响应
   * @param {string} type
   * @param {string} [action]
   * @param {*} [content]
   * @param {number} [timeout]
   * @returns {Promise<object>} 服务端下行报文
   */
  request(type, action, content, timeout = SETTING.websocketRequestTimeout || 10000) {
    const reqId = this.nextReqId()
    const sent = this.sendWithReqId(type, action, content, reqId)
    if (!sent) return Promise.reject(new Error('WebSocket 未连接'))
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(reqId)
        reject(new Error(`WebSocket 请求超时：${type}`))
      }, timeout)
      this.pending.set(reqId, { resolve, reject, timer })
    })
  }

  rejectAllPending(error) {
    this.pending.forEach((task) => {
      clearTimeout(task.timer)
      task.reject(error)
    })
    this.pending.clear()
  }
}

export const wsClient = new WebSocketClient()

export default wsClient
