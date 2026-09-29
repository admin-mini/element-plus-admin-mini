<template>
  <div class="admin-view">
    <admin-table :api="userApi.getUserPage" @init="tableInit">
      <template #search>
        <el-form ref="queryFrom" @submit.prevent="$table.search" label-width="auto" :model="$table.query">
          <admin-grid :cols="4" :x-gap="20">
            <el-form-item label="账号" prop="username">
              <el-input v-model="$table.query.username"></el-input>
            </el-form-item>
            <el-form-item label="姓名" prop="searchKey">
              <el-input v-model="$table.query.name"></el-input>
            </el-form-item>
            <el-form-item label="昵称" prop="nickname">
              <el-input v-model="$table.query.nickname"></el-input>
            </el-form-item>
            <el-form-item label="姓名" prop="searchKey">
              <el-input v-model="$table.query.name"></el-input>
            </el-form-item>
            <template #last>
              <el-button native-type="submit" type="primary" icon="Search" :loading="$table.loading">搜索</el-button>
            </template>
          </admin-grid>
        </el-form>
      </template>
      <template #btn>
        <el-button @click="handleAdd" v-if="$p('sys:user:add') && TENANT_ENABLE"  type="primary" icon="plus">邀请加入</el-button>
        <el-button @click="handleJoin" v-if="$p('sys:user:add') && !TENANT_ENABLE"  type="primary" icon="plus">新增用户</el-button>
        <el-button @click="handleDelBatch" v-if="$p('sys:user:delete')"  type="danger" icon="delete">批量删除用户</el-button>
      </template>
      <template #filterTable>
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="username" label="用户账号" />
        <el-table-column prop="orgName" label="所在部门" />
        <el-table-column prop="roleNames" label="用户角色" />
        <el-table-column prop="status" label="用户状态" width="100">
          <template #default="scope">
            <dict-label type="common_enable_status" :value="scope.row.status" v-if="!$p('sys:user:enable')"></dict-label>
            <div v-else>
              <el-switch
                :model-value="scope.row.status"
                size="small"
                :active-value="1"
                :inactive-value="0"
                @change="(newValue)=>switchEnable(scope.row,newValue)"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="latestLoginTime" label="最后登录时间" />
        <el-table-column label="操作" width="200px">
          <template #default="scope" >
            <el-space spacer="|" v-if="!scope.row.isTenantAdmin">
              <el-link :disabled="scope.row.loading" type="primary" v-if="$p('sys:user:edit')" @click="handleEdit(scope.row)">编辑</el-link>
              <el-link :disabled="scope.row.loading" type="primary" v-if="$p('sys:user:delete')" @click="handleDel(scope.row)">删除</el-link>
              <el-dropdown @command="(command)=>handleCommand(command,scope.row)">
                <span class="el-dropdown-link">
                更多
                <el-icon class="el-icon--right">
                    <arrow-down />
                </el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                      <el-dropdown-item command="setRoles" v-if="$p('sys:user:roleSet')">分配角色</el-dropdown-item>
                      <el-dropdown-item command="resetPwd" v-if="!$env.VITE_TENANT_ENABLE && $p('sys:user:resetPwd')">重置密码</el-dropdown-item>
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
import smCrypto from '@/utils/smCrypto'

import * as userApi from "@/api/sys/user-api"


const adminDialog = useAdminDialog()
let $table;
const TENANT_ENABLE = import.meta.env.VITE_TENANT_ENABLE === 'true'

function tableInit(table) {
  $table = table
}



function handleAdd() {
  adminDialog({
    component: import('./modules/form.vue'),
    props: {
      isTenant: true,
      onSuccess: () => {
        $table.getTable()
      }
    },
    dialogProps: { title: '邀请加入' }
  })
}

function handleJoin() {
  adminDialog({
    component: import('./modules/form.vue'),
    props: {
      isTenant: false,
      onSuccess: () => {
        $table.getTable()
      }
    },
    dialogProps: { title: '新增用户' }
  })
}

async function handleEdit(row) {
  adminDialog({
    component: import('./modules/form.vue'),
    props: {
        row, 
        isTenant: TENANT_ENABLE,
      onSuccess: () => {
        $table.getTable()
      }
    },
    dialogProps: { title: '编辑' }
  })
}

const switchEnable=(row,newValue)=>{
  // 刷新重新赋值导致程序性跳变（row.status 已被更新为服务器值），非用户操作，忽略
  if(row.status===newValue)return
  const prev=row.status
  row.status=newValue // 乐观更新，保持 switch 显示
  const fn = newValue==1?userApi.enableUser:userApi.disableUser;
  fn({id:row.id}).then(resp=>{

  }).catch(er=>{
    row.status=prev; // 失败回滚
  })
}

const handleDel=(row)=>{
  message.syncConfirm(`确定删除“${row.name || row.nickname}”？`, () => userApi.deleteByIds([row.id]))
    .then(function (res) {
      $table.getTable() 
    })
    .catch(() => { })
}


const handleDelBatch = ()=> {
  if($table.selection.length==0){
    message.error("请选择要删除的用户")
    return;
  }
  const userIds = $table.selection.map(item=>item.id);
  message.syncConfirm(`确定删除所选的${userIds.length}个用户吗？`, () => userApi.deleteByIds(userIds))
    .then(function (res) {
      $table.getTable() 
    })
    .catch(() => { })
}


const handleCommand = (command,row) => {
  console.log(command);
  if(command=='dataScope'){
    
  }else if(command=='setRoles'){
    adminDialog({
      component: import('./modules/role.vue'),
      props: {
        row,
        onSuccess: () => {
          $table.getTable()
        }
      },
      dialogProps: { title: '分配角色' }
    })
  }else if(command=='resetPwd'){
      userApi.resetUserPassword({id:row.id}).then(resp=>{
        message.alert(`新密码${smCrypto.doEncrypt(resp.data)}`,'密码重置成功')
      })
  }
}

</script>
<style></style>
