<template>
  <div class="admin-view">
    <admin-table :api="api.getTemplatePage" @init="onTableInit">
      <template #search>
        <el-form :inline="true" :model="$table.query" @submit.prevent="$table.search">
          <admin-grid :cols="4" :x-gap="20">
            <el-form-item label="短信通道">
              <el-select v-model="$table.query.channelCode" clearable placeholder="全部">
                <el-option v-for="item in channelOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="模板名称">
              <el-input v-model="$table.query.name" clearable />
            </el-form-item>
            <el-form-item label="模板编码">
              <el-input v-model="$table.query.code" clearable />
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
        <el-button type="primary" icon="Plus" @click="handleAdd">新增模板</el-button>
      </template>

      <template #table>
        <el-table :data="$table.data" v-loading="$table.loading">
          <el-table-column prop="name" label="模板名称" min-width="160" show-overflow-tooltip />
          <el-table-column prop="code" label="模板编码" min-width="160" show-overflow-tooltip />
          <el-table-column prop="channelCode" label="短信通道" width="110">
            <template #default="{ row }">{{ channelLabel(row.channelCode) }}</template>
          </el-table-column>
          <el-table-column prop="apiTemplateId" label="通道模板ID" width="150" show-overflow-tooltip />
          <el-table-column prop="content" label="模板内容" min-width="240" show-overflow-tooltip />
          <el-table-column prop="status" label="状态" width="90">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'info'">
                {{ row.status === 1 ? '启用' : '停用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="isSys" label="系统内置" width="100">
            <template #default="{ row }">{{ row.isSys === 1 ? '是' : '否' }}</template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip />
          <el-table-column label="操作" width="140" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
              <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </admin-table>
  </div>
</template>

<script setup>
import * as api from '@/api/dev/sms-api'
import useAdminDialog from '@/plugins/use-admin-dialog'
import message from '@/utils/message'
import { syncConfirm } from '@/utils/utils'

const channelOptions = [
  { label: '阿里云', value: 'aliyun' },
  { label: '腾讯云', value: 'tencent' }
]

const adminDialog = useAdminDialog()

let $table
function onTableInit(table) {
  $table = table
}

function channelLabel(channelCode) {
  return channelOptions.find(item => item.value === channelCode)?.label || channelCode || '-'
}

function handleAdd() {
  adminDialog({
    component: import('./modules/template-form.vue'),
    props: {
      onSuccess: () => $table.getTable()
    },
    dialogProps: { title: '新增短信模板', width: '620px' }
  })
}

function handleEdit(record) {
  adminDialog({
    component: import('./modules/template-form.vue'),
    props: {
      record,
      onSuccess: () => $table.getTable()
    },
    dialogProps: { title: '编辑短信模板', width: '620px' }
  })
}

function handleDelete(record) {
  syncConfirm(`是否确认删除短信模板"${record.name}"吗?`, () =>
    api.deleteTemplate([{ templateId: record.id }])
  )
    .then(() => {
      message.success('删除成功')
      $table.getTable()
    })
    .catch(() => {})
}
</script>
