<template>

  <div style="display: flex;flex:1;overflow: hidden;">
    <div style="padding:25px; padding-right:0;width:250px;flex-shrink:0;overflow: hidden;">
      <div
        style="background-color: #FFF;height:100%;padding:15px;margin-right:0; box-sizing: border-box; border:1px solid var(--el-border-color)">
        <el-tree :data="deptOptions" :props="{ label: 'label', children: 'children' }" :expand-on-click-node="false"
          :filter-node-method="filterNode" ref="deptTreeRef" node-key="id" highlight-current default-expand-all
          @node-click="handleNodeClick" />
      </div>
    </div>
    <div class="admin-view">
      <admin-table @init="(table) => $table = table" :api="listUser">
        <template #search>
          <el-form ref="queryFrom" @submit.prevent="$table.search" label-width="auto" :model="$table.query">
            <admin-grid :cols="4" :x-gap="20">
              <el-form-item label="用户名称" prop="userName">
                <el-input v-model="$table.query.userName"></el-input>
              </el-form-item>
              <el-form-item label="手机号码" prop="phonenumber">
                <el-input v-model="$table.query.phonenumber" placeholder="请输入手机号码" clearable />
              </el-form-item>
              <el-form-item label="状态">
                <select-dict :dict="$dict.sys_normal_disable" show-all></select-dict>
              </el-form-item>
              <el-form-item label="时间范围">
                <date-picker-range v-model:begin="$table.query.beginTime"
                  v-model:end="$table.query.endTime"></date-picker-range>
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
        <template #table>
          <el-table :data="$table.data" style="width: 100%;" :empty-text="$table.emptyText" v-loading="$table.loading"
            @selection-change="$table.handleSelectionChange">
            <el-table-column type="selection" width="50" />
            <el-table-column label="用户编号" prop="userId" />
            <el-table-column label="用户名称" prop="userName" :show-overflow-tooltip="true" />
            <el-table-column label="用户昵称" prop="nickName" :show-overflow-tooltip="true" />
            <el-table-column label="部门" prop="dept.deptName" :show-overflow-tooltip="true" />
            <el-table-column label="手机号码" prop="phonenumber" width="120" />
            <el-table-column label="状态">
              <template #default="scope">
                <el-switch :model-value="scope.row.status" active-value="0" inactive-value="1"
                  @change="handleStatusChange(scope.row)"></el-switch>
              </template>
            </el-table-column>
            <el-table-column label="创建时间" prop="createTime" width="160">
            </el-table-column>
            <el-table-column label="操作" width="300">
              <template #default="scope">
                <el-space spacer="|" v-if="scope.row.userId !== 1">
                  <el-link v-if="$p(['system:user:edit'])" type="primary" @click="openEdit(scope.row)">修改</el-link>
                  <el-link v-if="$p(['system:user:remove'])" type="primary" @click="openDel(scope.row)">删除</el-link>
                  <el-link v-if="$p(['system:user:resetPwd'])" type="primary"
                    @click="openEdit(scope.row)">重置密码</el-link>
                  <el-link v-if="$p(['system:user:edit'])" type="primary" @click="openEdit(scope.row)">分配角色</el-link>
                </el-space>

              </template>
            </el-table-column>
          </el-table>
        </template>
      </admin-table>
    </div>
  </div>
</template>
<script setup>
import { listUser, deptTreeSelect, delUser, changeUserStatus } from '@/api/system/user'
import { h, ref } from 'vue'
import useAdminDialog from '@/plugins/use-admin-dialog'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getDict } from '@/utils/dict'
import { syncConfirm } from "@/utils/utils"
getDict(['sys_normal_disable', 'sys_user_sex'])
const adminDialog = useAdminDialog()
let $table
const deptOptions = ref([])
deptTreeSelect().then(response => {
  deptOptions.value = response.data.data;
});
/** 通过条件过滤节点  */
const filterNode = (value, data) => {
  if (!value) return true;
  return data.label.indexOf(value) !== -1;
};
/** 节点单击事件 */
function handleNodeClick(data) {
  $table.query.deptId = data.id;
  $table.search();
};
function handleStatusChange(row) {
  let text = row.status === "0" ? "停用" : "启用";
  let status = row.status === "0" ? "1" : "0"
  syncConfirm(
    `确认要${text}${row.userName}吗?`,
    () => changeUserStatus(row.userId, status),
  ).then(function () {
    row.status = status;
  }).catch(() => { })
}
async function openAdd() {
  adminDialog(
    h((await import('./post.vue')).default, {
      onSuccess: () => {
        $table.getTable()
      }
    }),
    { title: '新增' }
  )
}
async function openEdit(row) {
  adminDialog(
    h((await import('./post.vue')).default, {
      row: row,
      onSuccess: () => {
        $table.getTable()
      }
    }),
    { title: '编辑' }
  )
}
async function openPassword(row) {
  adminDialog(
    h((await import('./change-password.vue')).default, {
      row: row,
      onSuccess: () => {
        $table.getTable()
      }
    }),
    { title: '修改密码' }
  )
}
function openDel(row) {
  row.loading = true;
  syncConfirm(
    `确认要删除${row.userName}吗?`,
    () => delUser(row.userId),
  ).then(function () {
    $table.getTable()
  }).catch(() => { }).finally(() => {
    row.loading = false;
  })

}
</script>
<style></style>
