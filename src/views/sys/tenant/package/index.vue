<template>
  <div class="admin-view">
    <admin-table :api="tenantApi.getTenantPackagePage" @init="tableInit">
      <template #search>
        <el-form ref="queryFrom" @submit.prevent="$table.search" label-width="auto" :model="$table.query">
          <admin-grid :cols="4" :x-gap="20">
            <el-form-item label="套餐名称" prop="name">
              <el-input v-model="$table.query.name" clearable />
            </el-form-item>
            <template #last>
              <el-button native-type="submit" type="primary" icon="Search" :loading="$table.loading">搜索</el-button>
            </template>
          </admin-grid>
        </el-form>
      </template>
      <template #btn>
        <el-button @click="handleAdd" v-if="$p(['sys:tenant:package:add'])" type="primary" icon="plus">新增套餐</el-button>
      </template>
      <template #filterTable>
        <el-table-column prop="name" label="套餐名称" min-width="180" />
        <el-table-column prop="remark" label="备注说明" min-width="220" show-overflow-tooltip />
        <el-table-column prop="enableStatus" label="启用状态" width="110" align="center">
          <template #default="scope">
            <dict-label tag type="common_enable_status" :value="scope.row.enableStatus" />
          </template>
        </el-table-column>
        <el-table-column prop="createdTime" label="创建时间" min-width="160" />
        <el-table-column prop="updatedTime" label="更新时间" min-width="160" />
        <el-table-column label="操作" width="200px" align="center">
          <template #default="{ row }">
            <el-space spacer="|" v-if="!row.loading">
              <el-link type="primary" @click="handleEdit(row)" v-if="$p(['sys:tenant:package:edit'])">编辑</el-link>
              <el-link type="primary" @click="handleDel(row)" v-if="$p(['sys:tenant:package:delete'])">删除</el-link>
            </el-space>
          </template>
        </el-table-column>
      </template>
    </admin-table>
  </div>
</template>
<script setup>
import useAdminDialog from '@/plugins/use-admin-dialog'
import message from '@/utils/message'
import { getDict } from '@/utils/dict'
import * as tenantApi from '@/api/sys/tenant-api'

getDict(['common_enable_status'])
const adminDialog = useAdminDialog()
let $table

function tableInit(table) {
  $table = table
  // 后端分页使用 PAGE_NO / PAGE_SIZE，将 admin-table 内部的分页字段映射过去
  $table.parseQuery = (query) => {
    const { page, size, current, params, ...rest } = query
    return { ...rest, PAGE_NO: current || page || 1, PAGE_SIZE: size || 10 }
  }
}
function refresh() {
  $table?.getTable()
}
function handleAdd() {
  adminDialog({ component: import('./modules/form.vue'), props: { onSuccess: refresh }, dialogProps: { title: '新增套餐', width: '720px' } })
}
function handleEdit(row) {
  adminDialog({ component: import('./modules/form.vue'), props: { row, onSuccess: refresh }, dialogProps: { title: '编辑套餐', width: '720px' } })
}
function handleDel(row) {
  message.syncConfirm(`确定删除套餐“${row.name}”？`, () => tenantApi.deleteTenantPackage([row.id])).then(refresh).catch(() => {})
}
</script>