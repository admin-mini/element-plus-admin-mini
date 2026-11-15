<template>
  <div class="admin-view">
    <admin-table :api="api.getMfaPage" @init="onTableInit">
      <template #search>
        <el-form :inline="true" :model="$table.query" @submit.prevent="$table.search">
          <admin-grid :cols="4" :x-gap="20">
            <el-form-item label="用户类型">
              <el-select v-model="$table.query.ownerType" clearable placeholder="全部">
                <el-option v-for="item in ownerTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="用户名">
              <el-input v-model="$table.query.username" clearable placeholder="请输入完整用户名" />
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="$table.query.status" clearable placeholder="全部">
                <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <template #last>
              <el-button native-type="submit" type="primary" icon="Search" :loading="$table.loading">
                搜索
              </el-button>
            </template>
          </admin-grid>
        </el-form>
      </template>

      <template #table>
        <el-table :data="$table.data" v-loading="$table.loading">
          <el-table-column prop="ownerName" label="用户名" min-width="140" show-overflow-tooltip>
            <template #default="{ row }">{{ row.ownerName || '-' }}</template>
          </el-table-column>
          <el-table-column prop="ownerType" label="用户类型" width="100">
            <template #default="{ row }">{{ ownerTypeLabel(row.ownerType) }}</template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="statusTagType(row.status)">{{ statusLabel(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="failedAttempts" label="失败次数" width="90" />
          <el-table-column prop="lockedUntil" label="锁定截止" width="170" />
          <el-table-column prop="activatedAt" label="启用时间" width="170" />
          <el-table-column prop="lastUsedAt" label="最近验证" width="170" />
          <el-table-column prop="createTime" label="创建时间" width="170" />
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" v-if="$p('sys:mfa:reset')" @click="handleReset(row)">重置</el-button>
              <el-button
                link
                type="warning"
                v-if="$p('sys:mfa:disable')"
                :disabled="row.status === 4"
                @click="handleDisable(row)"
              >失效</el-button>
              <el-button link type="danger" v-if="$p('sys:mfa:delete')" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </admin-table>
  </div>
</template>

<script setup>
import * as api from '@/api/sys/mfa-api'
import message from '@/utils/message'
import { syncConfirm } from '@/utils/utils'

const ownerTypeOptions = [
  { label: '账号', value: 'account' },
  { label: '用户', value: 'user' }
]

const statusOptions = [
  { label: '绑定中', value: 1 },
  { label: '已启用', value: 9 },
  { label: '已失效', value: 4 }
]

let $table

function onTableInit(table) {
  $table = table
}

function ownerTypeLabel(ownerType) {
  return ownerTypeOptions.find((item) => item.value === ownerType)?.label || '-'
}

function statusLabel(status) {
  return statusOptions.find((item) => item.value === status)?.label || '-'
}

function statusTagType(status) {
  if (status === 9) return 'success'
  if (status === 1) return 'warning'
  return 'info'
}

// 管理端接口以 (tenantId, ownerType, ownerId) 定位唯一绑定
function ownerParam(row) {
  return { tenantId: row.tenantId, ownerType: row.ownerType, ownerId: row.ownerId }
}

function displayName(row) {
  return row.ownerName || '该用户'
}

function handleReset(row) {
  syncConfirm(`确定重置用户“${displayName(row)}”的2FA失败次数并解锁？`, () => api.resetMfa(ownerParam(row)))
    .then(() => {
      message.success('重置成功')
      $table.getTable()
    })
    .catch(() => {})
}

function handleDisable(row) {
  syncConfirm(
    `确定失效用户“${displayName(row)}”的2FA绑定？失效后该用户下次登录需要重新绑定。`,
    () => api.disableMfa(ownerParam(row))
  )
    .then(() => {
      message.success('操作成功')
      $table.getTable()
    })
    .catch(() => {})
}

function handleDelete(row) {
  syncConfirm(
    `确定删除用户“${displayName(row)}”的2FA绑定？删除后该用户下次登录需要重新绑定。`,
    () => api.deleteMfa(ownerParam(row))
  )
    .then(() => {
      message.success('删除成功')
      $table.getTable()
    })
    .catch(() => {})
}
</script>
