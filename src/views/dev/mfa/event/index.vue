<template>
  <div class="admin-view">
    <admin-table :api="api.getMfaEventPage" @init="onTableInit">
      <template #search>
        <el-form :inline="true" :model="$table.query" @submit.prevent="$table.search">
          <admin-grid :cols="4" :x-gap="20">
            <el-form-item label="用户ID">
              <el-input v-model="$table.query.ownerId" clearable />
            </el-form-item>
            <el-form-item label="事件类型">
              <el-select v-model="$table.query.event" clearable placeholder="全部">
                <el-option v-for="item in eventOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="发生时间">
              <el-date-picker
                v-model="timeRange"
                type="datetimerange"
                value-format="YYYY-MM-DD HH:mm:ss"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                @change="onTimeChange"
              />
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
          <el-table-column prop="event" label="事件" width="130">
            <template #default="{ row }">
              <el-tag :type="eventTagType(row.event)">{{ eventLabel(row.event) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="ownerId" label="用户ID" width="180" />
          <el-table-column prop="ownerType" label="主体类型" width="100" />
          <el-table-column prop="refId" label="关联ID" min-width="180" show-overflow-tooltip />
          <el-table-column prop="ip" label="IP" width="140" />
          <el-table-column prop="detail" label="详情" min-width="200" show-overflow-tooltip />
          <el-table-column prop="createUser" label="操作人" width="120" />
          <el-table-column prop="createTime" label="发生时间" width="170" />
        </el-table>
      </template>
    </admin-table>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import * as api from '@/api/dev/mfa-api'

const eventOptions = [
  { label: '发起绑定', value: 'bind_init' },
  { label: '绑定成功', value: 'bind_confirm' },
  { label: '绑定失败', value: 'bind_fail' },
  { label: '验证成功', value: 'verify_ok' },
  { label: '验证失败', value: 'verify_fail' },
  { label: '触发锁定', value: 'locked' },
  { label: '解绑', value: 'unbind' },
  { label: '备用码使用', value: 'recovery_used' },
  { label: '管理员重置', value: 'admin_reset' },
  { label: '管理员失效', value: 'admin_disable' },
  { label: '管理员删除', value: 'admin_delete' }
]

const timeRange = ref([])
let $table

function onTableInit(table) {
  $table = table
}

function onTimeChange(range) {
  if (!$table) return
  $table.query.startTime = range?.[0] || undefined
  $table.query.endTime = range?.[1] || undefined
}

function eventLabel(event) {
  return eventOptions.find((item) => item.value === event)?.label || event || '-'
}

function eventTagType(event) {
  if (event === 'verify_ok' || event === 'bind_confirm') return 'success'
  if (event === 'verify_fail' || event === 'bind_fail') return 'warning'
  if (event === 'locked' || event === 'admin_disable' || event === 'admin_delete') return 'danger'
  return 'info'
}
</script>
