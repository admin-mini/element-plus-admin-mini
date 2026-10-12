<template>
  <admin-dialog-content v-loading="loading">
    <el-descriptions v-if="detail" :column="1" border class="log-detail">
      <el-descriptions-item v-for="key in detailKeys" :key="key" :label="detailLabels[key]">
        <el-input
          v-if="largeKeys.includes(key)"
          type="textarea"
          resize="vertical"
          readonly
          :rows="5"
          :model-value="formatValue(detail[key])"
        />
        <span v-else class="detail-text">{{ formatValue(detail[key]) }}</span>
      </el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-button @click="emits('end')">关闭</el-button>
    </template>
  </admin-dialog-content>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import * as api from '@/api/dev/log-api'

const props = defineProps({
  row: { type: Object, default: () => ({}) }
})
const emits = defineEmits(['end'])

// 数据量可能较大的字段，使用只读 textarea 展示
const largeKeys = ['reqParams', 'exeMessage', 'resultData']

const detailKeys = [
  'id',
  'category',
  'title',
  'modular',
  'operationType',
  'reqMethod',
  'reqUrl',
  'reqParams',
  'operatorUserName',
  'operatorIp',
  'operatorAddress',
  'operatorBrowser',
  'operatorOs',
  'className',
  'funName',
  'duration',
  'exeStatus',
  'exeMessage',
  'resultData',
  'createTime'
]
const detailLabels = {
  id: 'ID',
  category: '日志分类',
  title: '日志标题',
  modular: '模块',
  operationType: '操作类型',
  reqMethod: '请求方式',
  reqUrl: '请求地址',
  reqParams: '请求参数',
  operatorUserName: '操作人',
  operatorIp: '操作IP',
  operatorAddress: '操作地址',
  operatorBrowser: '浏览器',
  operatorOs: '操作系统',
  className: '类名',
  funName: '方法名',
  duration: '耗时(ms)',
  exeStatus: '执行状态',
  exeMessage: '执行消息',
  resultData: '结果数据',
  createTime: '创建时间'
}

const loading = ref(false)
const detail = ref(null)

// 对象或 JSON 字符串统一格式化为可读文本
function formatValue(val) {
  if (val === null || val === undefined || val === '') return '-'
  if (typeof val === 'object') return JSON.stringify(val, null, 2)
  const str = String(val)
  const trimmed = str.trim()
  const isJson =
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  if (isJson) {
    try {
      return JSON.stringify(JSON.parse(trimmed), null, 2)
    } catch (e) {
      return str
    }
  }
  return str
}

onMounted(() => {
  if (!props.row?.id) {
    detail.value = props.row || {}
    return
  }
  loading.value = true
  api
    .getLogDetail(props.row.id)
    .then(resp => {
      detail.value = resp.data || props.row
    })
    .catch(() => {})
    .finally(() => {
      loading.value = false
    })
})
</script>

<style scoped lang="scss">
.log-detail {
  :deep(.el-descriptions__cell) {
    word-break: break-all;
  }

  .detail-text {
    white-space: pre-wrap;
    word-break: break-all;
  }
}
</style>