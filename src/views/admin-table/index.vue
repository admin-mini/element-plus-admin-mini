<template>
  <div class="admin-view">
    <admin-table :api="userList" @init="tableInit">
      <template #search>

        <el-form ref="queryFrom" @submit.prevent="$table.search" label-width="auto" :model="$table.query">
          <admin-grid :cols="4" :x-gap="20">
            <el-form-item label="帐号" prop="username">
              <el-input v-model="$table.query.username"></el-input>
            </el-form-item>
            <el-form-item label="用户名" prop="username">
              <el-input v-model="$table.query.username"></el-input>
            </el-form-item>

            <el-form-item label="下拉">
              <select-dict :dict="$dict.userType" show-all></select-dict>
            </el-form-item>
            <el-form-item label="时间范围">
              <date-picker-range v-model:begin="$table.query.beginTime"
                v-model:end="$table.query.endTime"></date-picker-range>
            </el-form-item>
            <el-form-item label="类型" prop="username">
              <el-input v-model="$table.query.username"></el-input>
            </el-form-item>
            <template #last>
              <el-button native-type="submit" type="primary" icon="Search" :loading="$table.loading">搜索</el-button>
            </template>
          </admin-grid>
        </el-form>
      </template>
      <template #btn>
        <el-button @click="openAdd" type="primary" icon="plus">新增</el-button>
      </template>
      <template #filterTable>
        <el-table-column prop="username" label="帐号" />
        <el-table-column prop="userType" label="类型" :formatter="$formatter.dict($dict.userType)">

        </el-table-column>
        <el-table-column prop="nickName" label="用户姓名" />
        <el-table-column prop="userType1" label="类型" :formatter="$formatter.dict($dict.userType)" />
        <el-table-column prop="loginTime" label="登陆时间" :formatter="$formatter.date(true)" />
        <el-table-column prop="createTime" label="登陆时间" :formatter="$formatter.date()" />
        <el-table-column label="操作" width="400px">
          <template #default="scope">
            <el-space spacer="|">
              <el-link :disabled="scope.row.loading" type="primary" @click="openEdit(scope.row)">编辑</el-link>
              <el-link :disabled="scope.row.loading" type="primary" @click="openDel(scope.row)">删除</el-link>
              <el-link :disabled="scope.row.loading" type="primary" @click="openPassword(scope.row)">修改密码</el-link>
            </el-space>
          </template>
        </el-table-column>
      </template>
      <!-- <template #table>
        <el-table border :data="$table.data" :empty-text="$table.emptyText" v-loading="$table.loading"
          table-layout="auto">
          <el-table-column prop="username" label="帐号" />
          <el-table-column prop="userType" label="类型">
            <template #default="scope">
              <el-tag :type="scope.row.userTypeObj.color">
                {{ scope.row.userTypeObj.label }}
              </el-tag>

            </template>
          </el-table-column>
          <el-table-column prop="nickName" label="用户姓名" />
          <el-table-column prop="userType" label="类型" :formatter="$formatter.dict($dict.userType)" />
          <el-table-column prop="loginTime" label="登陆时间$formatter.date(true)" :formatter="$formatter.date(true)" />
          <el-table-column prop="createTime" label="登陆时间$formatter.date()" :formatter="$formatter.date()" />
          <el-table-column label="操作" width="400px">
            <template #default="scope">
              <el-space spacer="|">
                <el-link :disabled="scope.row.loading" type="primary" @click="openEdit(scope.row)">编辑</el-link>
                <el-link :disabled="scope.row.loading" type="primary" @click="openDel(scope.row)">删除</el-link>
                <el-link :disabled="scope.row.loading" type="primary" @click="openPassword(scope.row)">修改密码</el-link>
              </el-space>
            </template>
          </el-table-column>
        </el-table>

      </template> -->

    </admin-table>
  </div>
</template>
<script setup>
import { userList, userDel } from '@/api'
import { h, ref, useTemplateRef } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dict from "@/utils/dict"
import useAdminDialog from '@/plugins/use-admin-dialog'
import { syncConfirm } from '@/utils/utils'
const adminDialog = useAdminDialog()
let $table;
const queryFrom = useTemplateRef("queryFrom")
function tableInit(table) {
  $table = table
  $table.ref = queryFrom
  //格式化请求数据，入参的query已经JSON.stringify 解除引用关系
  $table.parseQuery = (query) => {
    query.ccc = 1;
    return query
  }
  //格式化列表响应数据，返回一个数组
  $table.parse = (data) => {
    data.data.map(item => {
      item.userTypeObj = dict.userType.get(item.userType)
    })
    return data.data;
  }
}



function openAdd() {
  adminDialog({
    component: import('./post.vue'),
    props: {
      onSuccess: () => {
        $table.getTable()
      }
    },
    dialogProps: { title: '新增' }
  })
}


async function openEdit(row) {
  adminDialog({
    component: import('./post.vue'),
    props: {
      onSuccess: () => {
        $table.getTable()
      }
    },
    dialogType: "drawer",
    dialogProps: { title: '编辑' }
  })
}
async function openPassword(row) {
  adminDialog({
    component: import('./change-password.vue'),
    props: {
      row,
      onSuccess: () => {
        $table.getTable()
      }
    },
    dialogProps: { title: '修改密码' }
  })

}
function openDel(row) {
  syncConfirm("确定删除？", () => userDel({ userId: row.userId }))
    .then(function () {
      row.status = status
    })
    .catch(() => { })
}
</script>
<style></style>
