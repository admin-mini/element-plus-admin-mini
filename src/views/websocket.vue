<template>
  <admin-dialog-content>
    <div class="ws-demo">
      <!-- 连接状态与操作 -->
      <div class="ws-toolbar">
        <div class="ws-status">
          <el-tag :type="statusTagType" effect="dark" size="small">{{ statusText }}</el-tag>
          <span class="ws-url">{{ wsUrl }}</span>
        </div>
        <div class="ws-actions">
          <el-button size="small" :disabled="isConnected" @click="handleConnect">连接</el-button>
          <el-button size="small" :disabled="isConnected" @click="handleReconnect">重连</el-button>
          <el-button size="small" type="danger" plain :disabled="!isConnected" @click="handleDisconnect">
            断开
          </el-button>
        </div>
      </div>

      <!-- 业务操作演示 -->
      <div class="ws-panel">
        <div class="panel-title">发送消息</div>
        <el-form :inline="true" class="ws-form">
          <el-form-item label="demo.chat 内容">
            <el-input v-model="chatContent" placeholder="输入聊天内容" style="width: 220px" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" :disabled="!isConnected" @click="sendChat">
              发送 chat
            </el-button>
            <el-button size="small" :disabled="!isConnected" @click="requestVersion">
              请求版本
            </el-button>
            <el-button size="small" @click="clearLogs">清空日志</el-button>
          </el-form-item>
        </el-form>
        <div class="panel-tip">
          本页仅订阅 demo.time / demo.version / demo.chat 三类消息，其他类型不会进入日志。
        </div>
      </div>

      <!-- 消息日志 -->
      <div class="ws-panel">
        <div class="panel-title">
          消息日志
          <span class="log-count">{{ logs.length }} 条</span>
        </div>
        <el-scrollbar height="340px">
          <div v-if="logs.length === 0" class="ws-empty">
            <el-empty description="暂无消息，等待服务端推送..." :image-size="80" />
          </div>
          <div v-for="item in logs" :key="item.id" class="log-item" :class="item.direction">
            <div class="log-head">
              <span class="log-time">{{ item.time }}</span>
              <el-tag size="small" :type="item.direction === 'in' ? 'success' : 'primary'" effect="plain">
                {{ item.direction === 'in' ? '下行' : '上行' }}
              </el-tag>
              <span class="log-type">{{ item.type }}</span>
              <span v-if="item.action" class="log-action">action: {{ item.action }}</span>
              <span v-if="item.reqId" class="log-reqid">reqId: {{ item.reqId }}</span>
            </div>
            <div class="log-body">{{ formatContent(item.content) }}</div>
          </div>
        </el-scrollbar>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </admin-dialog-content>
</template>

<script setup name="WebSocketDemo">
import { computed, ref } from 'vue'
import SETTING from '@/utils/setting'
import { useWebSocket, useWebSocketMessage } from '@/utils/use-websocket'

const emit = defineEmits(['end', 'success'])

const { status, isConnected, connect, reconnect, disconnect, send } = useWebSocket()

const chatContent = ref('hello websocket')
const logs = ref([])
let logSeq = 0

const statusTextMap = {
  idle: '未连接',
  connecting: '连接中',
  open: '已连接',
  reconnecting: '重连中',
  closed: '已断开'
}
const statusText = computed(() => statusTextMap[status.value] || status.value)
const statusTagType = computed(() => {
  if (status.value === 'open') return 'success'
  if (status.value === 'connecting' || status.value === 'reconnecting') return 'warning'
  return 'info'
})

// 展示当前连接地址（隐藏 token 明文的展示风险，仅做脱敏）
const wsUrl = computed(() => {
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
  const base = SETTING.websocketUrl
    || (import.meta.env.DEV
      ? `${protocol}//${location.hostname}:${SETTING.websocketDevPort}/ws`
      : `${protocol}//${location.host}/ws`)
  return `${base}?token=***&client=${SETTING.websocketClient || 'web'}`
})

function nowTime() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${String(d.getMilliseconds()).padStart(3, '0')}`
}

function addLog(entry) {
  logSeq++
  logs.value.unshift({ id: logSeq, time: nowTime(), ...entry })
}

function formatContent(content) {
  if (content === undefined || content === null) return '-'
  if (typeof content === 'string' || typeof content === 'number') return String(content)
  try {
    return JSON.stringify(content)
  } catch {
    return String(content)
  }
}

/* ---------------- 仅订阅演示用三个 type ---------------- */

function onTimeMessage(msg) {
  const ts = Number(msg.content)
  addLog({
    direction: 'in',
    type: msg.type,
    action: msg.action,
    reqId: msg.reqId,
    content: Number.isFinite(ts) ? `${msg.content}（${new Date(ts * 1000).toLocaleString()}）` : msg.content
  })
}

function onVersionMessage(msg) {
  addLog({
    direction: 'in',
    type: msg.type,
    action: msg.action,
    reqId: msg.reqId,
    content: msg.content
  })
}

function onChatMessage(msg) {
  addLog({
    direction: 'in',
    type: msg.type,
    action: msg.action,
    reqId: msg.reqId,
    content: msg.content
  })
}

useWebSocketMessage('demo.time', onTimeMessage)
useWebSocketMessage('demo.version', onVersionMessage)
useWebSocketMessage('demo.chat', onChatMessage)

/* ---------------- 操作 ---------------- */

function handleConnect() {
  connect()
}

function handleReconnect() {
  reconnect()
}

function handleDisconnect() {
  disconnect()
}

function sendChat() {
  const content = chatContent.value?.trim?.() ?? ''
  if (!content) return
  const reqId = send('demo.chat', 'send', { text: content, time: Date.now() })
  if (reqId) {
    addLog({ direction: 'out', type: 'demo.chat', action: 'send', reqId, content: { text: content } })
  }
}

function requestVersion() {
  // 下行由统一 dispatch 分发到 onVersionMessage
  const reqId = send('demo.version')
  addLog({ direction: 'out', type: 'demo.version', reqId, content: '-' })
}

function clearLogs() {
  logs.value = []
}

function handleClose() {
  emit('end')
}
</script>

<style lang="scss" scoped>
.ws-demo {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .ws-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;

    .ws-status {
      display: flex;
      align-items: center;
      gap: 10px;

      .ws-url {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        word-break: break-all;
      }
    }
  }

  .ws-panel {
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;
    padding: 12px;

    .panel-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .log-count {
        font-size: 12px;
        font-weight: normal;
        color: var(--el-text-color-secondary);
      }
    }

    .panel-tip {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }

    .ws-form {
      :deep(.el-form-item) {
        margin-bottom: 8px;
      }
    }
  }

  .ws-empty {
    padding: 20px 0;
  }

  .log-item {
    padding: 8px 10px;
    border-bottom: 1px solid var(--el-border-color-extra-light);

    &.out {
      background: var(--el-color-primary-light-9);
    }

    .log-head {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      font-size: 12px;

      .log-time {
        color: var(--el-text-color-secondary);
        font-family: monospace;
      }

      .log-type {
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      .log-action,
      .log-reqid {
        color: var(--el-text-color-secondary);
        font-family: monospace;
      }
    }

    .log-body {
      margin-top: 4px;
      font-size: 13px;
      color: var(--el-text-color-regular);
      word-break: break-all;
    }
  }
}
</style>
