<template>
  <div class="admin-view">
   
    <div class="admin-view-search">
      <el-form ref="queryFrom" @submit.prevent="$table.search" :inline="true" :model="$table.query">
        <el-form-item label="帐号" prop="username" :rules="[$rules.required]">
          <el-input v-model="$table.query.username"></el-input>
        </el-form-item>
        <el-form-item label="下拉">
          <select-dict :dict="$dict.userType" show-all></select-dict>
        </el-form-item>
        <el-form-item label="时间范围">
          <date-picker-range v-model:begin="$table.query.beginTime"
            v-model:end="$table.query.endTime"></date-picker-range>
        </el-form-item>
        <el-form-item>
          <el-button native-type="submit" type="primary" :loading="$table.loading">搜索</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="admin-view-body">
      <div class="admin-table-btns">
        <el-button @click="openAdd" type="primary" icon="plus">新增</el-button>
      </div>
      <div class="admin-table-list">
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
        <div class="admin-pager-container">
          <el-pagination :layout="$table.pageLayout" background v-model:current-page="$table.query.page"
            :page-size="$table.query.size" :total="$table.total" @size-change="$table.handleSizeChange"
            @current-change="$table.handleCurrentChange" />
        </div>
      </div>
    </div>
  </div>
</template>
<script  setup>
import { userList, userDel } from '@/api'
import { h, ref } from 'vue'
import useAdminDialog from '@/plugins/use-admin-dialog'
import useAdminTable from '@/plugins/use-admin-table'
import { ElMessage, ElMessageBox } from 'element-plus'
import dict from "@/utils/dict"
const adminDialog = useAdminDialog()
const $table = useAdminTable()
$table.api = userList
const queryFrom = ref()
$table.ref = queryFrom
$table.query.username = "test"
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
    userDel({
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
