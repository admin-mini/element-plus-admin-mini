import { onBeforeUnmount } from 'vue'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { useSystemStore } from '@/stores'
import { useMessageStore } from '@/stores/message'
import { getSseUrl } from '@/api/dev/message-user-api'
import tool from '@/utils/tool'

/**
 * 站内信 SSE 实时连接
 * 实现参考：qslinks-admin-ui 的 message.vue（EventSourcePolyfill + clientId 握手）
 *
 * 服务端协议：
 * - 初次握手：{ code: 0, data: 服务端分配的 clientId } → 本地存储，断线重连时复用
 * - 未读推送：{ code: 200, data: 未读数 } → 直接更新角标
 * - 连接异常：close 后 5s 自动重连
 *
 * 使用 EventSourcePolyfill 是因为原生 EventSource 无法携带自定义请求头（Token/Tenant-Id）
 */
export function useSse() {
  const messageStore = useMessageStore()
  const systemStore = useSystemStore()

  let source = null
  let retryTimer = null
  let closed = false

  // 读取本地存储的 clientId（首次为空，握手后由服务端分配）
  const getClientId = () => tool.data.get('clientid') || ''

  function createSseConnect() {
    // 组件已销毁或手动停止时不再建立连接
    if (closed) return

    const clientId = getClientId()
    const headers = {}
    if (systemStore.state.token) headers['Token'] = systemStore.state.token
    if (systemStore.state.tenantId) headers['Tenant-Id'] = systemStore.state.tenantId

    source = new EventSourcePolyfill(getSseUrl(clientId), {
      headers,
      heartbeatTimeout: 300000 // 心跳超时监测
    })

    // 连接打开
    source.addEventListener('open', () => {})

    // 消息事件
    source.addEventListener('message', (e) => {
      try {
        const result = JSON.parse(e.data)
        if (result.code === 200) {
          // 服务端推送未读数
          messageStore.unreadCount = result.data
        } else if (result.code === 0) {
          // 初次建立连接，服务端分配客户端id，本地存储后重连复用
          tool.data.set('clientid', result.data)
        }
      } catch (err) {
        console.warn('[message] SSE 数据解析失败：', err)
      }
    })

    // 错误事件：断开后 5s 重连
    source.addEventListener('error', () => {
      console.error('[message] 消息实时推送已断开，5s 后尝试重新连接...')
      source?.close()
      source = null
      if (!closed) {
        retryTimer = setTimeout(createSseConnect, 5000)
      }
    })
  }

  function start() {
    closed = false
    createSseConnect()
  }

  function stop() {
    closed = true
    if (retryTimer) {
      clearTimeout(retryTimer)
      retryTimer = null
    }
    source?.close()
    source = null
  }

  onBeforeUnmount(stop)

  return { start, stop }
}
