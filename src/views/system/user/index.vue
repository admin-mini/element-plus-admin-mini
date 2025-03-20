<template>
  <div style="display: flex; flex: 1; overflow: hidden">
    <div style="padding: 25px; padding-right: 0; width: 250px; flex-shrink: 0; overflow: hidden">
      <div style="
          background-color: var(--el-fill-color-blank);
          height: 100%;
          padding: 15px;
          margin-right: 0;
          box-sizing: border-box;
          border: 1px solid var(--el-border-color);
        ">
        <el-tree :data="deptOptions" :props="{ label: 'label', children: 'children' }" :expand-on-click-node="false"
          :filter-node-method="filterNode" ref="deptTreeRef" node-key="id" highlight-current default-expand-all
          @node-click="handleNodeClick" />
      </div>
    </div>
    <div class="admin-view">
      <admin-table @init="(table) => ($table = table)" :api="listUser">
        <template #search>
          <el-form ref="queryFrom" @submit.prevent="$table.search" label-width="auto" :model="$table.query">
            <admin-grid :cols="4" :x-gap="20">
              <el-form-item label="用户名称" prop="userName">
                <el-input v-model="$table.query.userName"></el-input>
              </el-form-item>
              <el-form-item label="用户类型" prop="userType">
                <select-dict :dict="$dict.userType" v-model="$table.query.userType" show-all></select-dict>
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
                <el-button native-type="submit" type="primary" icon="Search" :loading="$table.loading">
                  搜索
                </el-button>
              </template>
            </admin-grid>
          </el-form>
        </template>
        <template #btn>
          <el-button @click="handleAdd" type="primary" icon="plus" v-if="$p(['system:user:add'])">
            新增
          </el-button>
          <el-button type="primary" plain icon="Edit" :disabled="$table.selection.length != 1" @click="handleEdit()"
            v-if="$p(['system:user:edit'])">
            修改
          </el-button>
          <el-button type="primary" plain icon="Delete" :disabled="$table.selection.length == 0" @click="handleDel()"
            v-if="$p(['system:user:remove'])">
            删除
          </el-button>
          <el-button @click="handleUpload" plain type="primary" v-if="$p(['system:user:import'])">
            导入
          </el-button>
          <el-button type="primary" plain icon="Download" @click="handleExport" v-if="$p(['system:user:export'])">
            导出
          </el-button>
        </template>
        <template #table>
          <el-table :data="$table.data" style="width: 100%" :empty-text="$table.emptyText" v-loading="$table.loading"
            @selection-change="$table.handleSelectionChange">
            <el-table-column type="selection" width="50" />
            <el-table-column label="用户编号" prop="userId" />
            <el-table-column label="用户名称" prop="userName" :show-overflow-tooltip="true" />
            <el-table-column label="用户类型" prop="userType" :formatter="$formatter.dict($dict.userType)" />
            <el-table-column label="用户昵称" prop="nickName" :show-overflow-tooltip="true" />
            <el-table-column label="部门" prop="dept.deptName" :show-overflow-tooltip="true" />
            <el-table-column label="手机号码" prop="phonenumber" width="120" />
            <el-table-column label="状态">
              <template #default="scope">
                <el-switch :model-value="scope.row.status" active-value="0" inactive-value="1"
                  @change="handleStatusChange(scope.row)"></el-switch>
              </template>
            </el-table-column>
            <el-table-column label="创建时间" prop="createTime" width="160"></el-table-column>
            <el-table-column label="操作" width="300">
              <template #default="scope">
                <el-space spacer="|" v-if="scope.row.userId !== 1">
                  <el-link v-if="$p(['system:user:edit'])" type="primary" @click="handleEdit(scope.row)">
                    修改
                  </el-link>
                  <el-link v-if="$p(['system:user:remove'])" type="primary" @click="handleDel(scope.row)">
                    删除
                  </el-link>
                  <el-link v-if="$p(['system:user:resetPwd'])" type="primary" @click="handleResetPassword(scope.row)">
                    重置密码
                  </el-link>
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
import {
  listUser,
  deptTreeSelect,
  delUser,
  changeUserStatus,
  resetUserPwd
} from '@/api/system/user'
import { h, ref } from 'vue'
import useAdminDialog from '@/plugins/use-admin-dialog'
import { dialogProps, ElMessage, ElMessageBox } from 'element-plus'
import { getDict } from '@/utils/dict'
import { syncConfirm } from '@/utils/utils'
import { download } from '@/api/request'
getDict(['sys_normal_disable', 'sys_user_sex'])
const adminDialog = useAdminDialog()
let $table
const deptOptions = ref([])
deptTreeSelect().then((response) => {
  deptOptions.value = response.data
})
/** 通过条件过滤节点  */
const filterNode = (value, data) => {
  if (!value) return true
  return data.label.indexOf(value) !== -1
}
/** 节点单击事件 */
function handleNodeClick(data) {
  $table.query.deptId = data.id
  $table.search()
}
function handleStatusChange(row) {
  let text = row.status === '0' ? '停用' : '启用'
  let status = row.status === '0' ? '1' : '0'
  syncConfirm(`确认要${text}${row.userName}吗?`, () => changeUserStatus(row.userId, status))
    .then(function () {
      row.status = status
    })
    .catch(() => { })
}
function handleAdd() {
  adminDialog(
    {
      component: import('./post.vue'),
      props: {
        onSuccess: () => {
          $table.getTable()
        }
      },
      dialogProps: { title: '新增', width: '800px' }
    }
  )
}
function handleUpload() {
  adminDialog({
    component: () => import('@/components/upload-data.vue'),
    props: {
      uploadUrl: '/system/user/importData',
      templateUrl: '/system/user/importTemplate',
      fileName: 'user',
      onSuccess: () => {
        $table.getTable()
      }
    },
    dialogProps: { title: '导入', width: '500px' }
  })
}
function handleExport() {
  download(
    'system/user/export',
    {
      ...$table.query
    },
    `user_${new Date().getTime()}.xlsx`
  )
}
function handleEdit(row) {
  row = row || $table.selection[0]
  adminDialog(
    {
      component: import('./post.vue'),
      props: {
        row: row,
        onSuccess: () => {
          $table.getTable()
        }
      },
      dialogProps: { title: '修改', width: '800px' }
    }
  )
}
function handleResetPassword(row) {
  ElMessageBox.prompt('请输入"' + row.userName + '"的新密码', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    closeOnClickModal: false,
    inputPattern: /^.{5,20}$/,
    inputErrorMessage: '用户密码长度必须介于 5 和 20 之间'
  })
    .then(({ value }) => {
      resetUserPwd(row.userId, value).then((response) => {
        ElMessage.success('修改成功，新密码是：' + value)
      })
    })
    .catch(() => { })
}
function handleDel(row) {
  let ids = row ? [row.userId] : $table.selection.map((item) => item.userId)
  syncConfirm(`确定删除${ids.length}条数据？`, () => delUser(ids.join()))
    .then(function () {
      $table.getTable()
    })
    .catch(() => { })
    .finally(() => {
      row.loading = false
    })
}
</script>
<style></style>
