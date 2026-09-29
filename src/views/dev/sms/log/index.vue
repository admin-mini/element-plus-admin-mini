<template>
  <div class="admin-view">
    <admin-table :api="api.getLogPage" @init="onTableInit">
      <template #search>
        <el-form :inline="true" :model="$table.query" @submit.prevent="$table.search">
          <admin-grid :cols="4" :x-gap="20">
            <el-form-item label="短信通道">
              <el-select v-model="$table.query.channelCode" clearable placeholder="全部">
                <el-option v-for="item in channelOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="$table.query.phone" clearable />
            </el-form-item>
            <el-form-item label="模板编码">
              <el-input v-model="$table.query.templateCode" clearable />
            </el-form-item>
            <el-form-item label="短信内容">
              <el-input v-model="$table.query.content" clearable />
            </el-form-item>
            <template #last>
              <el-button native-type="submit" type="primary" icon="Search" :loading="$table.loading">
                搜索
              </el-button>
            </template>
          </admin-grid>
        </el-form>
      </template>

      <template #btn>
        <el-button type="primary" icon="Promotion" @click="handleSend">发送短信</el-button>
      </template>

      <template #table>
        <el-table :data="$table.data" v-loading="$table.loading">
          <el-table-column prop="phone" label="手机号" width="130" />
          <el-table-column prop="channelCode" label="通道" width="100">
            <template #default="{ row }">{{ channelLabel(row.channelCode) }}</template>
          </el-table-column>
          <el-table-column prop="templateCode" label="模板编码" width="150" show-overflow-tooltip />
          <el-table-column prop="type" label="短信类型" width="100">
            <template #default="{ row }">{{ typeLabel(row.type) }}</template>
          </el-table-column>
          <el-table-column prop="signName" label="签名" width="130" show-overflow-tooltip />
          <el-table-column prop="content" label="短信内容" min-width="240" show-overflow-tooltip />
          <el-table-column prop="apiResultCode" label="返回码" width="100" show-overflow-tooltip />
          <el-table-column prop="sendTime" label="发送时间" width="180" />
          <el-table-column label="操作" width="140" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="handleDetail(row)">详情</el-button>
              <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </admin-table>

    <el-dialog v-model="detailVisible" title="发送记录详情" width="760px">
      <el-descriptions :column="2" border>
        <el-descriptions-item v-for="key in detailKeys" :key="key" :label="detailLabels[key]">
          {{ current[key] ?? '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import * as api from '@/api/dev/sms-api'
import useAdminDialog from '@/plugins/use-admin-dialog'
import message from '@/utils/message'
import { syncConfirm } from '@/utils/utils'

const channelOptions = [
  { label: '阿里云', value: 'aliyun' },
  { label: '腾讯云', value: 'tencent' }
]
const typeOptions = [
  { label: '验证码', value: 1 },
  { label: '通知类', value: 2 },
  { label: '营销类', value: 3 }
]

const detailKeys = [
  'id',
  'channelCode',
  'templateCode',
  'type',
  'phone',
  'signName',
  'content',
  'templateParam',
  'userId',
  'userType',
  'sendTime',
  'apiResultCode',
  'apiResultMsg',
  'apiRequestId'
]
const detailLabels = {
  id: '记录ID',
  channelCode: '短信通道',
  templateCode: '模板编码',
  type: '短信类型',
  phone: '手机号',
  signName: '签名',
  content: '短信内容',
  templateParam: '发送参数',
  userId: '接收人ID',
  userType: '接收人类型',
  sendTime: '发送时间',
  apiResultCode: '返回码',
  apiResultMsg: '返回消息',
  apiRequestId: '请求ID'
}

const adminDialog = useAdminDialog()
const detailVisible = ref(false)
const current = reactive({})

let $table
function onTableInit(table) {
  $table = table
}

function channelLabel(channelCode) {
  return channelOptions.find(item => item.value === channelCode)?.label || channelCode || '-'
}
function typeLabel(type) {
  return typeOptions.find(item => item.value === type)?.label || type || '-'
}

function handleSend() {
  adminDialog({
    component: import('./modules/send-form.vue'),
    props: {
      onSuccess: () => $table.getTable()
    },
    dialogProps: { title: '发送短信', width: '620px' }
  })
}

async function handleDetail(row) {
  const response = await api.getLogDetail(row.id)
  Object.assign(current, response.data || row)
  detailVisible.value = true
}

function handleDelete(row) {
  syncConfirm(`是否确认删除该条发送记录吗?`, () => api.deleteLog([{ id: row.id }]))
    .then(() => {
      message.success('删除成功')
      $table.getTable()
    })
    .catch(() => {})
}
</script>
