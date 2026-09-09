<template>
  <div class="admin-view">
    <admin-table :api="roleApi.getRolePage" @init="tableInit">
      <template #search>
        <el-form ref="queryFrom" @submit.prevent="$table.search" label-width="auto" :model="$table.query">
          <admin-grid :cols="4" :x-gap="20">
            <el-form-item label="角色名称" prop="searchKey"><el-input v-model="$table.query.searchKey" clearable /></el-form-item>
            <template #last><el-button native-type="submit" type="primary" icon="Search" :loading="$table.loading">搜索</el-button></template>
          </admin-grid>
        </el-form>
      </template>
      <template #btn><el-button @click="handleAdd" v-if="$p(['sys:role:add'])" type="primary" icon="plus">新增角色</el-button></template>
      <template #filterTable>
        <el-table-column prop="name" label="角色名" />
        <el-table-column prop="code" label="角色编码" />
        <el-table-column prop="weight" label="角色权重" />
        <el-table-column prop="sortCode" label="角色排序" />
        <el-table-column label="操作" width="240px">
          <template #default="{ row }">
            <el-space spacer="|" v-if="row.code !== 'superAdmin'">
              <el-link :disabled="row.loading" type="primary" @click="handleEdit(row)">编辑</el-link>
              <el-link :disabled="row.loading" type="primary" @click="handleDel(row)">删除</el-link>
              <el-dropdown>
                <el-link class="el-dropdown-link">权限<el-icon class="el-icon--right"><arrow-down /></el-icon></el-link>
                <template #dropdown><el-dropdown-menu>
                  <el-dropdown-item v-if="$p(['sys:role:permission'])" @click="openPermission(row)">功能权限</el-dropdown-item>
                  <el-dropdown-item v-if="$p(['sys:role:data-space'])" @click="openDataScope(row)">数据权限</el-dropdown-item>
                </el-dropdown-menu></template>
              </el-dropdown>
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
import * as roleApi from '@/api/sys/role-api'
const adminDialog = useAdminDialog()
let $table
function tableInit(table) { $table = table }
function refresh() { $table?.getTable() }
function handleAdd() { adminDialog({ component: import('./modules/form.vue'), props: { onSuccess: refresh }, dialogProps: { title: '新增' } }) }
function handleEdit(row) { adminDialog({ component: import('./modules/form.vue'), props: { row, onSuccess: refresh }, dialogProps: { title: '编辑' } }) }
function handleDel(row) { message.syncConfirm(`确定删除“${row.name}”？`, () => roleApi.deleteByIds([row.id])).then(refresh).catch(() => {}) }
function openPermission(row) { adminDialog({ component: import('./modules/permission.vue'), props: { role: { id: row.id, name: row.name }, mode: 'permission' }, dialogProps: { title: `功能权限 - ${row.name}`, width: '1000px', direction: 'rtl' }, dialogType: 'drawer' }) }
function openDataScope(row) { adminDialog({ component: import('./modules/permission.vue'), props: { role: { id: row.id, name: row.name }, mode: 'data' }, dialogProps: { title: `数据权限 - ${row.name}`, width: '600px', direction: 'rtl' }, dialogType: 'drawer' }) }
</script>
