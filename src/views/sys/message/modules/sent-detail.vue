<template>
  <admin-dialog-content v-loading="loading">
    <div class="message-detail-container">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="主题">
          <span class="title-text">{{ detail.title }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="发送人">
          <el-tag size="small" effect="light">{{ detail.createUser || '我' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="发送时间">
          <span class="time-text">{{ detail.createTime || '—' }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="接收人">
          <template v-if="receivers.length > 0">
            <el-tag
              v-for="(r, i) in receivers"
              :key="i"
              size="small"
              effect="light"
              class="receiver-tag"
            >
              {{ getReceiverName(r) }}
            </el-tag>
          </template>
          <span v-else class="time-text">—</span>
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
import { getSentMessageDetail } from '@/api/dev/message-user-api'

const emits = defineEmits(['end', 'success'])
const props = defineProps({
  row: { type: Object, default: () => ({}) }
})

const loading = ref(false)
const detail = reactive({
  id: '',
  title: '',
  content: '',
  category: '',
  createUser: '',
  createTime: '',
  receiverInfoList: []
})

const receivers = computed(() => detail.receiverInfoList || [])

// 接收人显示名称（DevMessageReceiverInfoDTO 字段以后端为准）
function getReceiverName(info) {
  return info?.name || info?.nickname || (info?.receiverUserId ? `用户${info.receiverUserId}` : '—')
}

onMounted(async () => {
  if (!props.row?.id) return
  loading.value = true
  try {
    const res = await getSentMessageDetail(props.row.id)
    Object.assign(detail, res?.data || {})
  } catch (e) {
    // 接口异常由拦截器统一提示
  } finally {
    loading.value = false
  }
})

function handleConfirm() {
  // 触发成功事件，通知父组件刷新列表并关闭弹窗
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

  .receiver-tag {
    margin: 0 6px 6px 0;
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
