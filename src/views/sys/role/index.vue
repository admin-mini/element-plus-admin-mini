<template>
  <div class="admin-view">
    <admin-table :api="roleApi.getRolePage" @init="tableInit">
      <template #search>
        <el-form ref="queryFrom" @submit.prevent="$table.search" label-width="auto" :model="$table.query">
          <admin-grid :cols="4" :x-gap="20">
            <el-form-item label="角色名称" prop="searchKey">
              <el-input v-model="$table.query.searchKey"></el-input>
            </el-form-item>
            <template #last>
              <el-button native-type="submit" type="primary" icon="Search" :loading="$table.loading">搜索</el-button>
            </template>
          </admin-grid>
        </el-form>
      </template>
      <template #btn>
        <el-button @click="handleAdd" type="primary" icon="plus">新增角色</el-button>
      </template>
      <template #filterTable>
        <el-table-column prop="name" label="角色名" />
        <el-table-column prop="code" label="角色编码" />
        <el-table-column prop="weight" label="角色权重" />
        <el-table-column prop="sortCode" label="角色排序" />
        <el-table-column label="操作" width="200px">
          <template #default="scope" >
            <el-space spacer="|" v-if="scope.row.code!='superAdmin'">
              <el-link :disabled="scope.row.loading" type="primary" @click="handleEdit(scope.row)">编辑</el-link>
              <el-link :disabled="scope.row.loading" type="primary" @click="handleDel(scope.row)">删除</el-link>
              <el-dropdown>
                <span class="el-dropdown-link">
                权限
                <el-icon class="el-icon--right">
                    <arrow-down />
                </el-icon>
                </span>
                <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item>功能权限</el-dropdown-item>
                    <el-dropdown-item>数据权限</el-dropdown-item>
                </el-dropdown-menu>
                </template>
            </el-dropdown>
            </el-space>
          </template>
        </el-table-column>
      </template>
    </admin-table>
  </div>
</template>
<script setup>
import { userList, userDel } from '@/api'
import { h, ref, useTemplateRef } from 'vue'
import dict from "@/utils/dict"
import useAdminDialog from '@/plugins/use-admin-dialog'
import message from "@/utils/message"

import * as roleApi from "@/api/sys/role-api"
import { scrollbarProps } from 'element-plus'


const adminDialog = useAdminDialog()
let $table;

function tableInit(table) {
  $table = table
}



function handleAdd() {
  adminDialog({
    component: import('./modules/form.vue'),
    props: {
      onSuccess: () => {
        $table.getTable()
      }
    },
    dialogProps: { title: '新增' }
  })
}


async function handleEdit(row) {
  adminDialog({
    component: import('./modules/form.vue'),
    props: {
        row, 
      onSuccess: () => {
        $table.getTable()
      }
    },
    dialogProps: { title: '编辑' }
  })
}

function handleDel(row) {
  message.syncConfirm(`确定删除“${row.name}”？`, () => roleApi.deleteByIds([row.id]))
    .then(function (res) {

      $table.getTable() 

    })
    .catch(() => { })
}
</script>
<style></style>
