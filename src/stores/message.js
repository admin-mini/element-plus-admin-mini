import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getMessageList } from '@/api/sys/message-api'

/**
 * 站内信全局状态
 * 铃铛角标、消息抽屉、详情弹窗、消息中心共享未读数，一处刷新全端同步
 */
export const useMessageStore = defineStore('message', () => {
  // 未读消息数
  const unreadCount = ref(0)

  // 拉取最新未读数（失败时保留原值，不打断页面）
  async function refreshUnread() {
    try {
      const res = await getMessageList(10)
      // 列表含已读/未读，未读数按未读项统计
      unreadCount.value = (res?.data || []).filter((m) => !m.read).length
    } catch (e) {
      // 接口异常时保留原值
    }
    return unreadCount.value
  }

  return { unreadCount, refreshUnread }
})
