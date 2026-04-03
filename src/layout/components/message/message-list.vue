<template>
  <admin-dialog-content v-loading="messageLoading">
    <div v-if="messageList.length > 0" class="message-list">
    <div 
        v-for="item in messageList" 
        :key="item.id" 
        class="message-item" 
        @click="handleMessageDetail(item)"
    >
        <div class="message-item-container">
        <div class="message-avatar">
            <el-avatar :size="36" :style="{ backgroundColor: getAvatarColor(item.sender) }">
            {{ item.sender?.substring(0, 1) }}
            </el-avatar>
        </div>

        <div class="message-content">
            <div class="content-top">
            <span class="message-title">{{ item.title }}</span>
            <el-tag size="small" :type="item.tagType" effect="plain" class="message-tag">
                {{ item.tagText }}
            </el-tag>
            </div>
            
            <div class="content-bottom">
            <span class="message-sender">{{ item.sender }}</span>
            <span class="divider">·</span>
            <span class="message-time">{{ item.createTime }}</span>
            </div>
        </div>
        </div>
    </div>
    </div>
    <el-empty v-else description="暂无新消息" :image-size="100" />
    <template #footer>
        <el-button v-if="unreadMessageNum > 0" variant="text" @click="handleMarkAllRead">全部设为已读</el-button>
        <el-button type="primary" @click="handleGoCenter"> 消息中心 </el-button>
    </template>
  </admin-dialog-content>
</template>

<script setup name="DevUserMessage">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import useAdminDialog from '@/plugins/use-admin-dialog';
const adminDialog = useAdminDialog()


const messageLoading = ref(false)
const messageList = ref([])
const unreadMessageNum = ref(4)
const emits = defineEmits(['end', 'success'])

// 模拟接口请求，增加了发送人和标签信息
const mockGetMessageList = () => {
  messageLoading.value = true
  setTimeout(() => {
    messageList.value = [
      { 
        id: '1', 
        title: '系统维护通知', 
        sender: '系统管理员',
        tagText: '通知',
        tagType: 'warning',
        createTime: '2026-04-03 09:00' 
      },
      { 
        id: '2', 
        title: '项目审核通过', 
        sender: '审核组',
        tagText: '审批',
        tagType: 'success',
        createTime: '2026-04-02 14:30' 
      },
      { 
        id: '3', 
        title: '新功能上线：低代码模块', 
        sender: '产品团队',
        tagText: '更新',
        tagType: '', // primary
        createTime: '2026-04-01 10:00' 
      },
      { 
        id: '4', 
        title: '您的 Nuocao 账号异地登录', 
        sender: '安全中心',
        tagText: '安全',
        tagType: 'danger',
        createTime: '2026-03-31 22:15' 
      }
    ]
    messageLoading.value = false
  }, 500)
}

// 根据发送人生成固定颜色
const getAvatarColor = (name) => {
  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
  let hash = 0
  for (let i = 0; i < name?.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

const handleMarkAllRead = () => {
  messageList.value = []
  unreadMessageNum.value = 0
  ElMessage.success('已全部标记为已读')
}

const handleMessageDetail = (row) => {
  console.log('查看详情:', row)
   adminDialog(
        {
            component: import('./message-view.vue'),//调起组件
            row,
            props: {
                onSuccess: (eventData) => {
                    
                }
            },
            dialogType:  'dialog',
            dialogProps: { title: '消息详情', width: "600px" }
        }
      )
  if (unreadMessageNum.value > 0) unreadMessageNum.value--
}

const handleGoCenter = () => {
  emits("end")
}

onMounted(() => {
  mockGetMessageList()
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

            .message-tag {
              flex-shrink: 0;
              border-radius: 4px;
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

  .drawer-footer {
    border-top: 1px solid var(--el-border-color-light);
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--el-bg-color);
  }
</style>