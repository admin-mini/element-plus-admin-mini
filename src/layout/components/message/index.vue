<template>
  <div class="message-component">
    <el-badge :value="messageStore.unreadCount" :max="99" :hidden="messageStore.unreadCount == 0">
      <el-button link type="default" size="large" @click="openMessageList">
        <el-icon class="icon-btn"><BellFilled /></el-icon>
      </el-button>
    </el-badge>
  </div>
</template>

<script setup name="DevUserMessage">
import { onMounted } from 'vue'
import useAdminDialog from '@/plugins/use-admin-dialog'
import { useMessageStore } from '@/stores/message'
import { useSse } from './useSse'

const adminDialog = useAdminDialog()
const messageStore = useMessageStore()
const { start } = useSse()

// 打开消息列表抽屉
const openMessageList = () => {
  adminDialog(
    {
      component: import('./message-list.vue'), // 调起组件
      props: {
        // 抽屉关闭后刷新未读数
        onEnd: () => {
          messageStore.refreshUnread()
        }
      },
      dialogType: 'drawer',
      dialogProps: { title: '消息列表', width: '400px' }
    }
  )
}

onMounted(() => {
  // 初始拉取未读数
  messageStore.refreshUnread()
  // 建立 SSE 长连接，实时接收新消息推送
  start()
})
</script>

<style lang="scss" scoped>
.message-component {
  display: inline-block;
  cursor: pointer;
  .icon-btn {
    color: var(--el-text-color-primary); // 默认使用 Element 的主题色
    transition: transform 0.3s;
    &:hover {
      transform: scale(1.1);
    }
  }
}
</style>
