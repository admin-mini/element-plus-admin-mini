<template>
  <div class="admin-view">
    <admin-table :api="accountApi.getAccountPage" @init="tableInit">
      <template #search>
        <el-form ref="queryFrom" @submit.prevent="$table.search" label-width="auto" :model="$table.query">
          <admin-grid :cols="4" :x-gap="20">
            <el-form-item label="账号" prop="username">
              <el-input v-model="$table.query.username" clearable />
            </el-form-item>
            <el-form-item label="昵称" prop="nickname">
              <el-input v-model="$table.query.nickname" clearable />
            </el-form-item>
            <el-form-item label="手机" prop="phone">
              <el-input v-model="$table.query.phone" clearable />
            </el-form-item>
            <template #last>
              <el-button native-type="submit" type="primary" icon="Search" :loading="$table.loading">搜索</el-button>
            </template>
          </admin-grid>
        </el-form>
      </template>
      <template #btn>
        <el-button @click="handleAdd" v-if="$p('sys:account:add')" type="primary" icon="plus">新增账户</el-button>
      </template>
      <template #filterTable>
        <el-table-column prop="username" label="账号" />
        <el-table-column prop="nickname" label="昵称" />
        <el-table-column prop="phone" label="手机" />
        <el-table-column prop="status" label="账户状态" width="100">
          <template #default="{ row }">
            <dict-label type="common_enable_status" :value="row.status" v-if="!$p('sys:account:enable')"></dict-label>
            <div v-else>
              <el-switch
                :model-value="row.status"
                size="small"
                :active-value="1"
                :inactive-value="0"
                @change="(newValue)=>switchEnable(row,newValue)"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240px">
          <template #default="{ row }">
            <el-space spacer="|">
              <el-link :disabled="row.loading" type="primary" v-if="$p('sys:account:edit')" @click="handleEdit(row)">编辑</el-link>
              <el-link :disabled="row.loading" type="primary" v-if="$p('sys:account:delete')" @click="handleDel(row)">删除</el-link>
              <el-dropdown>
                <span class="el-dropdown-link">
                  更多
                  <el-icon class="el-icon--right"><arrow-down /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="resetPwd(row)">重置密码</el-dropdown-item>
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
import { ElMessageBox } from 'element-plus'
import useAdminDialog from '@/plugins/use-admin-dialog'
import message from '@/utils/message'
import password from '@/utils/password'
import * as accountApi from '@/api/sys/account-api'

const adminDialog = useAdminDialog()
let $table
function tableInit(table) { $table = table }
function refresh() { $table?.getTable() }

function handleAdd() {
  adminDialog({
    component: import('./modules/form.vue'),
    props: { onSuccess: refresh },
    dialogProps: { title: '新增账户' }
  })
}

function handleEdit(row) {
  adminDialog({
    component: import('./modules/form.vue'),
    props: { row, onSuccess: refresh },
    dialogProps: { title: '编辑账户' }
  })
}

function handleDel(row) {
  message.syncConfirm(`确定删除账户“${row.username || row.nickname}”？`, () => accountApi.deleteAccounts([row.id]))
    .then(()=>{
        refresh;
        message.success('删除完成')
    })
    .catch(() => {})
}

function switchEnable(row, newValue) {
  // 刷新重新赋值导致程序性跳变（row.status 已被更新为服务器值），非用户操作，忽略
  if (row.status === newValue) return
  const prev = row.status
  row.status = newValue // 乐观更新，保持 switch 显示
  const fn = newValue === 1 ? accountApi.enableAccount : accountApi.disableAccount
  fn(row.id)
    .then(() => message.success('操作成功'))
    .catch(() => {
      row.status = prev // 失败回滚
    })
}

function resetPwd(row) {
  const newPassword = password.generateRandomPassword()
  accountApi.resetAccountPassword({ id: row.id, newPassword })
    .then((resp) => {
      ElMessageBox.alert(`新密码：<b>${newPassword}</b>`, '密码重置成功', {
        confirmButtonText: '复制并关闭',
        dangerouslyUseHTMLString: true,
        callback: (action) => {
          if (action === 'confirm') {
            copyText(newPassword)
          }
        }
      })
    })
    .catch(() => {})
}

function copyText(text) {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => message.success('已复制到剪切板'))
      .catch(() => message.error('复制失败，请手动复制'))
  } else {
    // 兼容非安全上下文（非 https / localhost）的兜底方案
    const textarea = document.createElement('textarea')
    textarea.value = text
    document.body.appendChild(textarea)
    textarea.select()
    try {
      document.execCommand('copy')
      message.success('已复制到剪切板')
    } catch (e) {
      message.error('复制失败，请手动复制')
    } finally {
      document.body.removeChild(textarea)
    }
  }
}
</script>