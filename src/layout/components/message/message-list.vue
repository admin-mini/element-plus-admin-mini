<template>
  <admin-dialog-content v-loading="loading">
    <div v-if="messageList.length > 0" class="message-list">
      <div
        v-for="item in messageList"
        :key="item.id"
        class="message-item"
        @click="handleMessageDetail(item)"
      >
        <div class="message-item-container">
          <div class="message-avatar">
            <el-avatar
              :size="36"
              :src="getAvatarUrl(item)"
              :style="{ backgroundColor: getAvatarColor(item) }"
            >
              {{ getAvatarText(item) }}
            </el-avatar>
          </div>

          <div class="message-content">
            <div class="content-top">
              <span class="message-title">{{ item.title }}</span>
              <el-tag size="small" type="danger" effect="plain" v-if="!item.read">未读</el-tag>
            </div>

            <div class="content-bottom">
              <span class="message-sender">{{ getSenderName(item) }}</span>
              <span class="divider">·</span>
              <span class="message-time">{{ item.createTime || '' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <el-empty v-else description="暂无未读消息" :image-size="100" />
    <template #footer>
      <el-button v-if="messageStore.unreadCount > 0" variant="text" @click="handleMarkAllRead">全部设为已读</el-button>
      <el-button type="primary" @click="handleGoCenter">消息中心</el-button>
    </template>
  </admin-dialog-content>
</template>

<script setup name="DevUserMessage">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import useAdminDialog from '@/plugins/use-admin-dialog'
import { getMessageList, getMessageCategoryConfig, markAllMessageRead } from '@/api/dev/message-user-api'
import { useMessageStore } from '@/stores/message'

const router = useRouter()
const adminDialog = useAdminDialog()
const messageStore = useMessageStore()

const emits = defineEmits(['end', 'success'])

const loading = ref(false)
const messageList = ref([])

// 拉取消息列表
const loadList = async () => {
  loading.value = true
  try {
    const res = await getMessageList(100)
    messageList.value = res?.data || []
    // 列表含已读/未读，未读数按未读项统计
    messageStore.unreadCount = messageList.value.filter((m) => !m.read).length
  } catch (e) {
    // 接口异常由拦截器统一提示
  } finally {
    loading.value = false
  }
}

/**
 * 发送人名称：
 * - category 为 msg（用户消息）：依次取 sender.name → sender.nickname
 * - 其他分类（系统消息）：按业务分类显示分类文字
 */
const getSenderName = (item) => {
  if (item.category === 'msg' && item.sender) {
    return item.sender.name || item.sender.nickname || '用户'
  }
  return getMessageCategoryConfig(item.category).label
}

/**
 * 头像图片地址：仅用户消息（msg）使用 sender.avatar，系统消息显示文字头像
 */
const getAvatarUrl = (item) => {
  if (item.category === 'msg' && item.sender?.avatar) return item.sender.avatar
  return ''
}

/** 头像文字（取首字） */
const getAvatarText = (item) => getSenderName(item).charAt(0)

/**
 * 头像颜色：
 * - 用户消息（msg）：根据姓名哈希取固定色
 * - 系统消息：按分类字典取固定色
 */
const getAvatarColor = (item) => {
  if (item.category === 'msg') {
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
    const name = getSenderName(item)
    let hash = 0
    for (let i = 0; i < name?.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }
  return getMessageCategoryConfig(item.category).color
}

// 查看消息详情（详情接口会将消息置为已读）
const handleMessageDetail = (row) => {
  adminDialog(
    {
      component: import('./message-view.vue'), // 调起组件
      props: {
        row,
        onSuccess: () => {
          loadList() // 详情已读后刷新未读列表
        }
      },
      dialogType: 'dialog',
      dialogProps: { title: '消息详情', width: '600px' }
    }
  )
}

// 全部标记为已读
const handleMarkAllRead = async () => {
  try {
    await markAllMessageRead()
    ElMessage.success('已全部标记为已读')
    loadList()
  } catch (e) {
    // 接口异常由拦截器统一提示
  }
}

// 跳转消息中心
const handleGoCenter = () => {
  emits('end')
  router.push('/sys/message')
}

onMounted(() => {
  loadList()
})
</script>

<style lang="scss" scoped>
.message-list {
  .message-item {
    padding: 14px 16px;
    cursor: pointer;
    border-bottom: 1px solid var(--el-border-color-extra-light);
    transition: all 0.25s ease;

    &:hover {
      background-color: var(--el-fill-color-light);
    }

    &:last-child {
      border-bottom: none;
    }

    .message-item-container {
      display: flex;
      align-items: flex-start;

      .message-avatar {
        margin-right: 12px;
        flex-shrink: 0;
      }

      .message-content {
        flex: 1;
        min-width: 0; // 防止溢出

        .content-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;

          .message-title {
            font-size: 14px;
            font-weight: 600;
            color: var(--el-text-color-primary);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            padding-right: 8px;
          }
        }

        .content-bottom {
          display: flex;
          align-items: center;
          font-size: 12px;
          color: var(--el-text-color-secondary);

          .message-sender {
            color: var(--el-text-color-regular);
            font-weight: 500;
          }

          .divider {
            margin: 0 6px;
            color: var(--el-text-color-placeholder);
          }

          .message-time {
            font-size: 11px;
          }
        }
      }
    }
  }
}
</style>
