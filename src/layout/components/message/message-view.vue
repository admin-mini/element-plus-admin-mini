<template>
  <admin-dialog-content v-loading="messageLoading">
    <div class="message-detail-container" >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="主题">
          <span class="title-text">{{ postData.title }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="发送人">
          <el-tag size="small" effect="light">{{ postData.sender }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="发送时间">
          <span class="time-text">{{ postData.createTime }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-badge is-dot :type="postData.read ? 'info' : 'danger'">
            <span :style="{ color: postData.read ? '#909399' : '#f56c6c' }">
              {{ postData.read ? '已读' : '未读' }}
            </span>
          </el-badge>
        </el-descriptions-item>
      </el-descriptions>

      <div class="message-body-wrapper">
        <div class="body-label">内容详情</div>
        <div class="body-content">
          {{ postData.content || '暂无内容' }}
        </div>
      </div>
    </div>

    <template #footer>
      <el-button type="primary" @click="handleConfirm">我知道了</el-button>
      <el-button @click="emits('end')">返回</el-button>
    </template>
  </admin-dialog-content>
</template>

<script setup>
import { onMounted, reactive,ref } from 'vue';

const emits = defineEmits(['end', 'success']);
const props = defineProps(["row"]);

const messageLoading=ref(false);

// 基础数据结构
const postData = reactive({
  id: '',
  title: '',
  sender: '',
  createTime: '',
  content: '',
  read: false
});

// 数据回显
if (props.row) {
 
}

onMounted(()=>{
    messageLoading.value=true;
    setTimeout(() => {
        messageLoading.value=false;
    //可以改为服务器端接口处理，如get(props.row.id)
        Object.assign(postData, props.row);
    }, 5000);
})

function handleConfirm() {
  // 触发成功事件，通常用于通知父组件更新未读状态
  emits("success", postData);
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