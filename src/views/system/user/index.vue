<template>
  <div class="admin-view">

    <div class="admin-view-search">
      <el-form ref="queryFrom" @submit.prevent="$table.search" :inline="true" :model="$table.query">
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
            <el-button native-type="submit" type="primary" :loading="$table.loading">搜索</el-button>
          </template>
        </admin-grid>
      </el-form>
    </div>
    <div class="admin-view-body">
      <div class="admin-table-btns">
        <el-button @click="openAdd" type="primary" icon="plus">新增</el-button>
      </div>
      <div class="admin-table-list">
        <el-table border :data="$table.data" style="width: 100%;" :empty-text="$table.emptyText"
          v-loading="$table.loading" @selection-change="$table.handleSelectionChange">
          <el-table-column type="selection" width="50" />
          <el-table-column label="用户编号" prop="userId" />
          <el-table-column label="用户名称" prop="userName" :show-overflow-tooltip="true" />
          <el-table-column label="用户昵称" prop="nickName" :show-overflow-tooltip="true" />
          <el-table-column label="部门" prop="dept.deptName" :show-overflow-tooltip="true" />
          <el-table-column label="手机号码" prop="status" width="120"
            :formatter="$formatter.dict($dict.sys_normal_disable)" />
          <el-table-column label="状态">
            <template #default="scope">
              <el-switch v-model="scope.row.status" active-value="0" inactive-value="1"
                @change="handleStatusChange(scope.row)"></el-switch>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" prop="createTime" width="160">
          </el-table-column>
          <el-table-column label="操作" width="300">
            <template #default="scope">
              <el-space spacer="|" v-if="scope.row.userId !== 1">
                <el-link v-if="$p(['system:user:edit'])" type="primary" @click="openEdit(scope.row)">修改</el-link>
                <el-link v-if="$p(['system:user:remove'])" type="primary" @click="openEdit(scope.row)">删除</el-link>
                <el-link v-if="$p(['system:user:resetPwd'])" type="primary" @click="openEdit(scope.row)">重置密码</el-link>
                <el-link v-if="$p(['system:user:edit'])" type="primary" @click="openEdit(scope.row)">分配角色</el-link>
              </el-space>

            </template>
          </el-table-column>
        </el-table>
        <div class="admin-pager-container">
          <el-pagination :layout="$table.pageLayout" background v-model:current-page="$table.query.page"
            :page-size="$table.query.size" :total="$table.total" @size-change="$table.handleSizeChange"
            @current-change="$table.handleCurrentChange" />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { systemUserList, systemUserDeptTree, delUser, systemUserChangeStatus } from '@/api'
import { h, ref } from 'vue'
import useAdminDialog from '@/plugins/use-admin-dialog'
import useAdminTable from '@/plugins/use-admin-table'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getDict } from '@/utils/dict'
getDict(['sys_normal_disable', 'sys_user_sex'])
const adminDialog = useAdminDialog()
const $table = useAdminTable()
$table.api = systemUserList
const queryFrom = ref()
$table.ref = queryFrom
$table.query.username = "test"

function handleStatusChange(row) {
  let text = row.status === "0" ? "启用" : "停用";
  ElMessageBox.confirm('确认要"' + text + '""' + row.userName + '"用户吗?').then(function () {
    systemUserChangeStatus(row).then(res => {
      if (res.data.code == 200) {
        ElMessage.success(res.data.msg)
      } else {
        ElMessage.error(res.data.msg)
      }
    })
  }).catch(function () {
    row.status = row.status === "0" ? "1" : "0";
  });
};
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
  ElMessageBox.confirm("确定删除？", "提示", { type: "warning" }).then(() => {
    delUser({
      userId: row.userId
    }).then(res => {
      if (res.data.code == 0) {
        $table.getTable()
      } else {
        ElMessage.error(res.data.msg)
      }
    }).finally(() => {
      row.loading = false;
    })
  }).catch(() => { row.loading = false; })

}
</script>
<style></style>
