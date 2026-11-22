import { getCurrentInstance, onBeforeUnmount, readonly, ref } from 'vue'
import wsClient from '@/utils/websocket'

/**
 * WebSocket hook：在任意页面拿到连接状态与统一发送方法
 * 只解绑当前组件监听，不会关闭全局连接
 */
export function useWebSocket() {
  const status = ref(wsClient.status)
  const isConnected = ref(wsClient.isConnected)

  const off = wsClient.onStatus((s) => {
    status.value = s
    isConnected.value = wsClient.isConnected
  })

  if (getCurrentInstance()) {
    onBeforeUnmount(off)
  }

  return {
    status: readonly(status),
    isConnected: readonly(isConnected),
    connect: (token) => wsClient.connect(token),
    reconnect: () => wsClient.reconnect(),
    disconnect: () => wsClient.disconnect(),
    send: (type, action, content) => wsClient.send(type, action, content),
    request: (type, action, content, timeout) => wsClient.request(type, action, content, timeout)
  }
}

/**
 * 订阅指定 type 的消息，组件销毁时自动取消订阅
 * @param {string|string[]} type 消息类型，'*' 表示全部
 * @param {(msg: object) => void} handler
 * @returns {() => void} 取消订阅
 */
export function useWebSocketMessage(type, handler) {
  const off = wsClient.subscribe(type, handler)
  if (getCurrentInstance()) {
    onBeforeUnmount(off)
  }
  return off
}

export default useWebSocket
