<template>
  <div class="admin-view">
    <admin-table
      :api="list"
      @init="
        (table) => {
          $table = table
        }
      "
    >
      <template #btn>
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="$table.selection.length == 0"
          @click="handleForceLogout()"
          v-if="$p(['monitor:online:forceLogout'])"
        >
          强退
        </el-button>
      </template>

      <template #table>
        <el-table
          :data="$table.data"
          v-loading="$table.loading"
          @selection-change="$table.handleSelectionChange"
        >
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="会话编号" align="center" prop="tokenId" />
          <el-table-column label="用户名称" align="center" prop="userName" />
          <el-table-column label="登录IP地址" align="center" prop="ipaddr" />
          <el-table-column label="登录地点" align="center" prop="loginLocation" />
          <el-table-column label="浏览器" align="center" prop="browser" />
          <el-table-column label="操作系统" align="center" prop="os" />
          <el-table-column label="登录时间" align="center" prop="loginTime" width="180" />
          <el-table-column label="操作" align="center" width="150">
            <template #default="scope">
              <el-link
                type="primary"
                @click="handleForceLogout(scope.row)"
                v-if="$p(['monitor:online:forceLogout'])"
              >
                强退
              </el-link>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </admin-table>
  </div>
</template>

<script setup>
import { list, forceLogout } from '@/api/monitor/online'
import { ElMessage } from 'element-plus'
import { syncConfirm } from '@/utils/utils'

let $table

function handleForceLogout(row) {
  const tokenIds = row ? [row.tokenId] : $table.selection.map((item) => item.tokenId)
  syncConfirm(`是否确认强退用户"${tokenIds.join(',')}"的会话吗?`, () =>
    forceLogout(tokenIds.join(','))
  )
    .then(() => {
      ElMessage.success('强退成功')
      $table.getTable()
    })
    .catch(() => {})
}
</script>
