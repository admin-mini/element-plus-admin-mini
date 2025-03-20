<template>
  <div class="admin-view">
    <admin-table :api="listPost" @init="(table) => {
      $table = table
    }
      ">
      <template #search>
        <el-form ref="queryForm" @submit.prevent="$table.search" :model="$table.query" label-width="auto">
          <admin-grid :cols="4" :x-gap="20">
            <el-form-item label="筛选文本">
              <choose-user v-model="$table.query.user" single></choose-user>
            </el-form-item>
            <el-form-item label="筛选文本">
              <choose-user v-model="$table.query.user" limit="3"></choose-user>
            </el-form-item>
            <el-form-item label="筛选数字">
              <el-input-number v-model="$table.query.postName" clearable controls-position="right"></el-input-number>
            </el-form-item>
            <el-form-item label="筛选字典">
              <select-dict :dict="$dict.sys_normal_disable" v-model="$table.query.dict" show-all
                clearable></select-dict>
            </el-form-item>
            <el-form-item label="筛选时间">
              <date-picker-range v-model:begin="$table.query.params.beginTime"
                v-model:end="$table.query.params.endTime"></date-picker-range>
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
        <el-button type="primary" icon="Plus" @click="handleAdd" v-if="$p(['system:post:add'])">
          新增
        </el-button>
        <el-button type="primary" plain icon="Edit" :disabled="$table.selection.length != 1" @click="handleEdit()"
          v-if="$p(['system:post:edit'])">
          修改
        </el-button>
        <el-button type="primary" plain icon="Delete" :disabled="$table.selection.length == 0" @click="handleDel()"
          v-if="$p(['system:post:remove'])">
          删除
        </el-button>
        <el-button @click="handleUpload" plain type="primary" v-if="$p(['system:user:import'])">
          导入
        </el-button>
        <el-button type="warning" plain icon="Download" @click="handleExport" v-if="$p(['system:post:export'])">
          导出
        </el-button>
      </template>
      <template #filterTable>
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="岗位编号" prop="postId" width="120" />
        <el-table-column label="岗位编码" prop="postCode" />
        <el-table-column label="岗位名称" prop="postName" />
        <el-table-column label="岗位排序" prop="postSort" />
        <el-table-column label="状态" prop="status"
          :formatter="$formatter.dict($dict.sys_normal_disable)"></el-table-column>
        <el-table-column label="状态">
          <template #default="scope">
            <el-switch :model-value="scope.row.status" active-value="0" inactive-value="1"
              @change="handleStatusChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" width="180" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-space spacer="|">
              <el-link type="primary" @click="handleEdit(scope.row)" v-if="$p(['system:post:edit'])">
                修改
              </el-link>
              <el-link type="primary" @click="handleDel(scope.row)" v-if="$p(['system:post:remove'])">
                删除
              </el-link>
            </el-space>
          </template>
        </el-table-column>
      </template>
    </admin-table>
  </div>
</template>

<script setup>
import { listPost, delPost } from '@/api/system/post'
import useAdminDialog from '@/plugins/use-admin-dialog'
import { ElMessage } from 'element-plus'
import { syncConfirm } from '@/utils/utils'
import { download } from '@/api/request'
import { changeUserStatus } from '@/api/system/user'

const adminDialog = useAdminDialog()
let $table

function handleAdd() {
  adminDialog({
    component: import('./post.vue'),
    props: {
      onSuccess: () => {
        $table.getTable()
      }
    },
    dialogType: 'drawer',
    dialogProps: { title: '新增岗位', width: '800px' }
  })
}
function handleUpload() {
  adminDialog({
    component: import('@/components/upload-data.vue'),
    props: {
      uploadUrl: 'system/post/importData',
      templateUrl: 'system/user/importTemplate',
      fileName: '标准模版',
      onSuccess: () => {
        $table.getTable()
      }
    },
    dialogProps: { title: '导入', width: '500px' }
  })
}
function handleEdit(row) {
  row = row || $table.selection[0]
  adminDialog({
    component: import('./post.vue'),
    props: {
      row: row,
      onSuccess: () => {
        $table.getTable()
      }
    },
    dialogProps: { title: '修改岗位', width: '500px' }
  })
}

function handleDel(row) {
  let ids = row ? [row.postId] : $table.selection.map((item) => item.postId)
  syncConfirm(`是否确认删除岗位编号为"${ids.join(',')}"的数据项?`, () => delPost(ids.join(',')))
    .then(() => {
      ElMessage.success('删除成功')
      $table.getTable()
    })
    .catch(() => { })
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
// 导出按钮操作
function handleExport() {
  download(
    'system/post/export',
    {
      ...$table.query
    },
    `post_${new Date().getTime()}.xlsx`
  )
}
</script>
