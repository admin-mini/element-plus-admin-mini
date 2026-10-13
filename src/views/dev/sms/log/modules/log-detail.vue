<template>
  <admin-dialog-content v-loading="loading">
    <el-descriptions :column="1" border>
      <el-descriptions-item v-for="item in fields" :key="item.key" :label="item.label">
        <el-input
          v-if="item.textarea"
          :model-value="displayText(detail[item.key])"
          type="textarea"
          :rows="6"
          readonly
          resize="vertical"
        />
        <span v-else class="detail-text">{{ fieldValue(item) }}</span>
      </el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-button @click="emits('end')">关闭</el-button>
    </template>
  </admin-dialog-content>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import * as api from '@/api/dev/sms-api'

const emits = defineEmits(['end'])
const props = defineProps({
  // 列表行数据，详情接口返回后覆盖
  record: Object
})

const channelOptions = [
  { label: '阿里云', value: 'aliyun' },
  { label: '腾讯云', value: 'tencent' }
]
const typeOptions = [
  { label: '验证码', value: 1 },
  { label: '通知类', value: 2 },
  { label: '营销类', value: 3 }
]

// 可能为长文本的字段用只读 textarea 展示
const fields = [
  { key: 'id', label: '记录ID' },
  { key: 'channelCode', label: '短信通道', format: value => channelOptions.find(i => i.value === value)?.label || value || '-' },
  { key: 'templateCode', label: '模板编码' },
  { key: 'type', label: '短信类型', format: value => typeOptions.find(i => i.value === value)?.label || value || '-' },
  { key: 'phone', label: '手机号' },
  { key: 'signName', label: '签名' },
  { key: 'content', label: '短信内容', textarea: true },
  { key: 'templateParam', label: '发送参数', textarea: true },
  { key: 'userId', label: '接收人ID' },
  { key: 'userType', label: '接收人类型' },
  { key: 'sendTime', label: '发送时间' },
  { key: 'apiResultCode', label: '返回码' },
  { key: 'apiResultMsg', label: '返回消息', textarea: true },
  { key: 'apiRequestId', label: '请求ID' }
]

const loading = ref(false)
const detail = reactive({})

function displayText(value) {
  if (value == null) return ''
  return typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)
}

function fieldValue(item) {
  const value = detail[item.key]
  if (item.format) return item.format(value)
  return value ?? '-'
}

onMounted(() => {
  if (!props.record?.id) return
  loading.value = true
  api
    .getLogDetail(props.record.id)
    .then(res => {
      Object.assign(detail, props.record, res.data || {})
    })
    .finally(() => {
      loading.value = false
    })
})
</script>

<style scoped lang="scss">
.detail-text {
  word-break: break-all;
  white-space: pre-wrap;
}
</style>