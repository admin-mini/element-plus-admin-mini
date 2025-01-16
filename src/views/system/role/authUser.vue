<template>
   <div class="admin-view">
      <admin-table :api="allocatedUserList" @init="(table) => { $table = table }" :query="route.params">
         <template #search>
            <el-form ref="queryFrom" @submit.prevent="$table.search" :inline="true" :model="$table.query">
               <admin-grid :cols="4" :x-gap="20">
                  <el-form-item label="角色名称">
                     <el-input v-model="$table.query.roleName" clearable></el-input>
                  </el-form-item>
                  <el-form-item label="权限字符">
                     <el-input v-model="$table.query.roleKey" clearable />
                  </el-form-item>
                  <el-form-item label="状态">
                     <select-dict :dict="$dict.sys_normal_disable" v-model="$table.query.status" show-all></select-dict>
                  </el-form-item>
                  <el-form-item label="创建时间">
                     <date-picker-range v-model:begin="$table.query.beginTime"
                        v-model:end="$table.query.endTime"></date-picker-range>
                  </el-form-item>
                  <template #last>
                     <el-button native-type="submit" type="primary" icon="Search"
                        :loading="$table.loading">搜索</el-button>
                  </template>
               </admin-grid>
            </el-form>
         </template>

         <template #btn>
            <el-button type="primary" icon="Plus" @click="openAdd" v-if="$p(['system:role:add'])">新增</el-button>
            <el-button type="primary" plain icon="Edit" :disabled="$table.selection.length != 1" @click="openEdit()"
               v-if="$p(['system:role:edit'])">修改</el-button>
            <el-button type="primary" plain icon="Delete" :disabled="$table.selection.length == 0" @click="openDel()"
               v-if="$p(['system:role:remove'])">删除</el-button>
            <el-button type="primary" plain icon="Download" @click="handleExport"
               v-if="$p(['system:role:export'])">导出</el-button>
         </template>
         <template #table>
            <el-table :data="$table.data" table-layout="auto" style="width: 100%;" :empty-text="$table.emptyText"
               v-loading="$table.loading" @selection-change="$table.handleSelectionChange">
               <el-table-column type="selection" width="55" align="center" />
               <el-table-column label="角色编号" prop="roleId" />
               <el-table-column label="角色名称" prop="roleName" :show-overflow-tooltip="true" />
               <el-table-column label="权限字符" prop="roleKey" :show-overflow-tooltip="true" />
               <el-table-column label="显示顺序" prop="roleSort" />
               <el-table-column label="状态">
                  <template #default="scope">
                     <el-switch :model-value="scope.row.status" active-value="0" inactive-value="1"
                        @change="handleStatusChange(scope.row)"></el-switch>
                  </template>
               </el-table-column>
               <el-table-column label="创建时间" prop="createTime">
               </el-table-column>
               <el-table-column label="操作" width="300">
                  <template #default="scope">
                     <el-space spacer="|">
                        <el-link v-if="$p(['system:role:edit'])" type="primary"
                           @click="openEdit(scope.row)">修改</el-link>
                        <el-link v-if="$p(['system:role:remove'])" type="primary"
                           @click="openDel(scope.row)">删除</el-link>
                        <el-link v-if="$p(['system:role:edit'])" type="primary"
                           @click="openAuth(scope.row)">分配用户</el-link>
                     </el-space>
                  </template>
               </el-table-column>
            </el-table>
         </template>
      </admin-table>
   </div>
</template>
<script setup>

import { h, ref } from 'vue'
import useAdminDialog from '@/plugins/use-admin-dialog'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getDict } from '@/utils/dict'
import { changeRoleStatus, delRole, allocatedUserList } from '@/api/system/role'
import { download } from "@/api/request"
import { syncConfirm } from "@/utils/utils"
import { useRoute } from "vue-router";
getDict(['sys_normal_disable'])
const adminDialog = useAdminDialog()
let $table;

const route = useRoute();


/** 角色状态修改 */
function handleStatusChange(row) {
   let text = row.status === "0" ? "停用" : "启用";
   let status = row.status === "0" ? "1" : "0"
   syncConfirm(
      `确认要${text}${row.roleName}角色吗?`,
      () => changeRoleStatus(row.roleId, status),
   ).then(function () {
      row.status = status;
   }).catch(() => { })
}
function handleExport() {
   download("system/role/export", {
      ...$table.query,
   }, `role_${new Date().getTime()}.xlsx`);
}
function openAdd() {
   adminDialog({
      component: import('./post.vue'),
      props: {},
      dialogProps: {
         title: '新增',
         width: "500px",
      },
      onSuccess: () => {
         $table.getTable()
      }
   })

}
async function openEdit(row) {
   row = row || $table.selection[0]
   adminDialog(
      h((await import('./post.vue')).default, {
         row: row,
         onSuccess: () => {
            $table.getTable()
         }
      }),
      { title: '修改', width: "500px" }
   )
}

function openDel(row) {
   let ids = row ? [row.roleId] : $table.selection.map(item => item.roleId)
   ElMessageBox.confirm(`确定删除${ids.length}条数据？`, "提示", {
      type: "warning",
      beforeClose: (action, instance, done) => {
         if (action === 'confirm') {
            instance.confirmButtonLoading = true
            delRole(ids.join()).then(res => {
               if (res.data.code == 200) {
                  $table.getTable()
               } else {
                  ElMessage.error(res.data.msg)
               }
            }).finally(() => {
               instance.confirmButtonLoading = false
               done()
            })
         } else {
            done()
         }
      }
   }).catch(() => { })
}
</script>
<style></style>