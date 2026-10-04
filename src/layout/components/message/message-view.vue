<template>
  <admin-dialog-content v-loading="loading">
    <div class="message-detail-container">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="主题">
          <span class="title-text">{{ detail.title }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="发送人">
          <el-tag size="small" effect="light">{{ senderName }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="发送时间">
          <span class="time-text">{{ detail.createTime || '—' }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag size="small" :type="detail.read ? 'info' : 'danger'" effect="plain">
            {{ detail.read ? '已读' : '未读' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <div class="message-body-wrapper">
        <div class="body-label">内容详情</div>
        <div class="body-content">
          {{ detail.content || '暂无内容' }}
        </div>
      </div>
    </div>

    <template #footer>
      <el-button type="primary" @click="handleConfirm">我知道了</el-button>
    </template>
  </admin-dialog-content>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { getMessageCategoryConfig, getMessageDetail } from '@/api/sys/message-api'
import { useMessageStore } from '@/stores/message'

const emits = defineEmits(['end', 'success'])
const props = defineProps({
  row: { type: Object, default: () => ({}) }
})

const messageStore = useMessageStore()

const loading = ref(false)
const detail = reactive({
  id: '',
  title: '',
  content: '',
  senderUserId: '',
  createTime: '',
  category: '',
  read: 0
})

// 发送人：用户消息取 sender.name/nickname，系统消息按分类显示分类文字
const senderName = computed(() => {
  const d = detail
  if (d.sender?.name || d.sender?.nickname) {
    return d.sender.name || d.sender.nickname
  }
  if (d.category && d.category !== 'msg') {
    return getMessageCategoryConfig(d.category).label
  }
  return d.senderUserId ? `用户${d.senderUserId}` : '系统通知'
})

onMounted(async () => {
  if (!props.row?.id) return
  loading.value = true
  try {
    // 详情接口会将消息标记为已读
    const res = await getMessageDetail(props.row.id)
    Object.assign(detail, res?.data || {})
  } catch (e) {
    // 接口异常由拦截器统一提示
  } finally {
    loading.value = false
  }
})

function handleConfirm() {
  // 消息已在查看详情时被置为已读，同步刷新全局未读数
  messageStore.refreshUnread()
  // 触发成功事件，通知父组件更新列表并关闭弹窗
  emits('success', detail)
}
</script>

<style lang="scss" scoped>
.message-detail-container {
  padding: 10px 5px;

  .title-text {
    font-weight: bold;
    color: var(--el-text-color-primary);
  }

  .time-text {
    color: var(--el-text-color-secondary);
    font-size: 13px;
  }

  .message-body-wrapper {
    margin-top: 20px;

    .body-label {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 10px;
      color: var(--el-text-color-regular);
      display: flex;
      align-items: center;

      &::before {
        content: '';
        width: 3px;
        height: 14px;
        background: var(--el-color-primary);
        margin-right: 8px;
        border-radius: 2px;
      }
    }

    .body-content {
      padding: 16px;
      background-color: var(--el-fill-color-lighter);
      border-radius: 8px;
      line-height: 1.6;
      font-size: 14px;
      color: var(--el-text-color-primary);
      min-height: 120px;
      white-space: pre-wrap; // 保留换行
      border: 1px solid var(--el-border-color-lighter);
    }
  }
}

// 深度覆盖描述列表样式，使其更紧凑
:deep(.el-descriptions__label) {
  width: 100px !important;
  background-color: var(--el-fill-color-light) !important;
}
</style>
