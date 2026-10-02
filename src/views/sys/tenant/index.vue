<template>
  <div class="admin-view">
    <admin-table :api="tenantApi.getTenantPage" @init="tableInit">
      <template #search>
        <el-form ref="queryFrom" @submit.prevent="$table.search" label-width="auto" :model="$table.query">
          <admin-grid :cols="4" :x-gap="20">
            <el-form-item label="租户名称" prop="tenantName">
              <el-input v-model="$table.query.tenantName" clearable />
            </el-form-item>
            <el-form-item label="系统名称" prop="sysName">
              <el-input v-model="$table.query.sysName" clearable />
            </el-form-item>
            <el-form-item label="联系人" prop="contactsUser">
              <el-input v-model="$table.query.contactsUser" clearable />
            </el-form-item>
            <el-form-item label="状态" prop="enableStatus">
              <select-dict :dict="$dict.common_enable_status" v-model="$table.query.enableStatus" show-all />
            </el-form-item>
            <template #last>
              <el-button native-type="submit" type="primary" icon="Search" :loading="$table.loading">搜索</el-button>
            </template>
          </admin-grid>
        </el-form>
      </template>
      <template #btn>
        <el-button @click="handleAdd" v-if="$p(['sys:tenant:add'])" type="primary" icon="plus">新增租户</el-button>
      </template>
      <template #filterTable>
        <el-table-column prop="tenantName" label="租户名称" min-width="140" />
        <el-table-column prop="tenantCode" label="租户编码" min-width="120" />
        <el-table-column prop="sysName" label="系统名称" min-width="140" />
        <el-table-column prop="orgName" label="组织分组" min-width="120" />
        <el-table-column prop="packageName" label="套餐" min-width="120" />
        <el-table-column prop="contactName" label="联系人" min-width="110" />
        <el-table-column prop="contactTel" label="联系电话" min-width="130" />
        <el-table-column prop="expireTime" label="到期时间" min-width="150" />
        <el-table-column prop="enableStatus" label="可用状态" width="110" align="center">
          <template #default="scope">
            <dict-label tag type="common_enable_status" :value="scope.row.enableStatus" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200px" align="center">
          <template #default="{ row }">
            <el-space spacer="|" v-if="!row.loading">
              <el-link type="primary" @click="handleView(row)" v-if="$p(['sys:tenant:view'])">查看</el-link>
              <el-link type="primary" @click="handleEdit(row)" v-if="$p(['sys:tenant:edit'])">编辑</el-link>
              <el-link type="primary" @click="handleDel(row)" v-if="$p(['sys:tenant:delete'])">删除</el-link>
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
function handleView(row) {
  adminDialog({ component: import('./view.vue'), props: { row }, dialogProps: { title: '租户详情', width: '760px' } })
}
function handleAdd() {
  adminDialog({ component: import('./modules/form.vue'), props: { onSuccess: refresh }, dialogProps: { title: '新增租户', width: '720px' } })
}
function handleEdit(row) {
  adminDialog({ component: import('./modules/form.vue'), props: { row, onSuccess: refresh }, dialogProps: { title: '编辑租户', width: '720px' } })
}
function handleDel(row) {
  message.syncConfirm(`确定删除租户“${row.tenantName}”？`, () => tenantApi.deleteTenant([row.id])).then(refresh).catch(() => {})
}
</script>