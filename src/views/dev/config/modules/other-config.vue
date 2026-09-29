<template>
  <admin-table :api="api.getConfigPage" @init="onTableInit">
    <template #search>
      <el-form :inline="true" :model="$table.query" @submit.prevent="$table.search">
        <admin-grid :cols="4" :x-gap="20">
          <el-form-item label="配置键">
            <el-input v-model="$table.query.configKey" clearable />
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
      <el-button type="primary" icon="Plus" @click="handleAdd">新增</el-button>
    </template>

    <template #table>
      <el-table :data="$table.data" v-loading="$table.loading">
        <el-table-column prop="configKey" label="配置键" min-width="240" show-overflow-tooltip />
        <el-table-column prop="configValue" label="配置值" min-width="240" show-overflow-tooltip />
        <el-table-column prop="remark" label="备注" min-width="180" show-overflow-tooltip />
        <el-table-column prop="sortCode" label="排序" width="90" align="center" />
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </template>
  </admin-table>
</template>

<script setup>
import * as api from '@/api/dev/config-api'
import useAdminDialog from '@/plugins/use-admin-dialog'
import message from '@/utils/message'
import { syncConfirm } from '@/utils/utils'

const adminDialog = useAdminDialog()

let $table
function onTableInit(table) {
  $table = table
}

function handleAdd() {
  adminDialog({
    component: import('./other-form.vue'),
    props: {
      onSuccess: () => $table.getTable()
    },
    dialogProps: { title: '新增配置', width: '560px' }
  })
}

function handleEdit(record) {
  adminDialog({
    component: import('./other-form.vue'),
    props: {
      record,
      onSuccess: () => $table.getTable()
    },
    dialogProps: { title: '编辑配置', width: '560px' }
  })
}

function handleDelete(record) {
  syncConfirm(`是否确认删除配置"${record.configKey}"吗?`, () =>
    api.deleteConfig([{ id: record.id }])
  )
    .then(() => {
      message.success('删除成功')
      $table.getTable()
    })
    .catch(() => {})
}
</script>
