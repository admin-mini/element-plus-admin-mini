<template>
  <div class="admin-view">
    <admin-table :api="listJobLog" @init="(table) => {
        $table = table
      }
      ">
      <template #search>
        <el-form ref="queryForm" @submit.prevent="$table.search" :model="$table.query">
          <admin-grid :cols="3" :x-gap="20">
            <el-form-item label="任务名称">
              <el-input v-model="$table.query.jobName" clearable></el-input>
            </el-form-item>
            <el-form-item label="任务组名">
              <el-input v-model="$table.query.jobGroup" clearable></el-input>
            </el-form-item>
            <el-form-item label="执行状态">
              <select-dict :dict="$dict.sys_common_status" v-model="$table.query.status" show-all
                clearable></select-dict>
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
        <el-button type="danger" plain icon="Delete" :disabled="$table.selection.length == 0" @click="handleDelete"
          v-if="$p(['monitor:job:remove'])">
          删除
        </el-button>
        <el-button type="danger" plain icon="Delete" @click="handleClean" v-if="$p(['monitor:job:remove'])">
          清空
        </el-button>
        <el-button type="warning" plain icon="Download" @click="handleExport" v-if="$p(['monitor:job:export'])">
          导出
        </el-button>
      </template>

      <template #table>
        <el-table :data="$table.data" v-loading="$table.loading" @selection-change="$table.handleSelectionChange">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="日志编号" align="center" prop="jobLogId" />
          <el-table-column label="任务名称" align="center" prop="jobName" :show-overflow-tooltip="true" />
          <el-table-column label="任务组名" align="center" prop="jobGroup" />
          <el-table-column label="调用目标字符串" align="center" prop="invokeTarget" :show-overflow-tooltip="true" />
          <el-table-column label="日志信息" align="center" prop="jobMessage" :show-overflow-tooltip="true" />
          <el-table-column label="执行状态" align="center">
            <template #default="scope">
              <dict-tag :options="$dict.sys_common_status" :value="scope.row.status" />
            </template>
          </el-table-column>
          <el-table-column label="执行时间" align="center" prop="createTime" width="180" />
          <el-table-column label="操作" align="center" width="100">
            <template #default="scope">
              <el-button type="text" icon="View" @click="handleView(scope.row)" v-if="$p(['monitor:job:query'])">
                详细
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>

      <template #pagination>
        <el-pagination v-model:current-page="$table.query.pageNum" v-model:page-size="$table.query.pageSize"
          :total="$table.total" :page-sizes="[10, 20, 50, 100]" :layout="$table.pageLayout"
          @size-change="$table.handleSizeChange" @current-change="$table.handleCurrentChange" />
      </template>
    </admin-table>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getDict } from '@/utils/dict'
import { syncConfirm } from '@/utils/utils'
import { cleanJobLog, delJobLog, listJobLog } from '@/api/monitor/jobLog'
import { download } from '@/api/request'
import useAdminTable from '@/plugins/use-admin-table'
import useAdminDialog from '@/plugins/use-admin-dialog'
const adminDialog = useAdminDialog()
getDict(['sys_common_status'])

let $table

// 如果是从任务管理跳转过来，需要设置初始查询条件
const route = useRoute()
if (route.query.jobName) {
  $table = useAdminTable({
    api: listJobLog,
    query: {
      jobName: route.query.jobName,
      jobGroup: route.query.jobGroup
    }
  })
} else {
  $table = useAdminTable({
    api: listJobLog
  })
}

function handleClean() {
  syncConfirm('是否确认清空所有定时任务日志数据项?', () => cleanJobLog())
    .then(() => {
      ElMessage.success('清空成功')
      $table.getTable()
    })
    .catch(() => { })
}

function handleExport() {
  download(
    'monitor/jobLog/export',
    {
      ...$table.query
    },
    `job-log_${new Date().getTime()}.xlsx`
  )
}

function handleView(row) {
  adminDialog(
    {
      component: import('./log-detail.vue'),
      props: {
        row: row
      },
      dialogProps: { title: '调度日志详细信息', width: '700px' }
    }
  )
}

function handleDelete() {
  const jobLogIds = $table.selection.map((item) => item.jobLogId)
  if (!jobLogIds.length) {
    ElMessage.warning('请选择要删除的数据')
    return
  }
  syncConfirm(`是否确认删除调度日志编号为${jobLogIds.join(',')}的数据项?`, () =>
    delJobLog(jobLogIds.join(','))
  )
    .then(() => {
      ElMessage.success('删除成功')
      $table.getTable()
    })
    .catch(() => { })
}
</script>
