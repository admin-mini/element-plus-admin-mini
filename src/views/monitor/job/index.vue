<template>
  <div class="admin-view">
    <admin-table :api="listJob" @init="(table) => {
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
            <el-form-item label="任务状态">
              <select-dict :dict="$dict.sys_job_status" v-model="$table.query.status" show-all clearable></select-dict>
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
        <el-button type="primary" icon="Plus" @click="handleAdd" v-if="$p(['monitor:job:add'])">
          新增
        </el-button>
        <el-button type="primary" plain icon="Edit" :disabled="$table.selection.length != 1" @click="handleEdit()"
          v-if="$p(['monitor:job:edit'])">
          修改
        </el-button>
        <el-button type="primary" plain icon="Delete" :disabled="$table.selection.length == 0" @click="handleDelete()"
          v-if="$p(['monitor:job:remove'])">
          删除
        </el-button>
        <el-button type="primary" plain icon="VideoPlay" :disabled="$table.selection.length != 1" @click="handleRun()"
          v-if="$p(['monitor:job:changeStatus'])">
          执行一次
        </el-button>
        <el-button type="primary" plain icon="View" @click="handleLog()" v-if="$p(['monitor:job:query'])">
          日志
        </el-button>
        <el-button type="warning" plain icon="Download" @click="handleExport" v-if="$p(['monitor:job:export'])">
          导出
        </el-button>
      </template>

      <template #table>
        <el-table :data="$table.data" v-loading="$table.loading" @selection-change="$table.handleSelectionChange">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="任务编号" align="center" prop="jobId" />
          <el-table-column label="任务名称" align="center" prop="jobName" :show-overflow-tooltip="true" />
          <el-table-column label="任务组名" align="center" prop="jobGroup" />
          <el-table-column label="调用目标字符串" align="center" prop="invokeTarget" :show-overflow-tooltip="true" />
          <el-table-column label="cron执行表达式" align="center" prop="cronExpression" :show-overflow-tooltip="true" />
          <el-table-column label="状态" align="center">
            <template #default="scope">
              <el-switch :model-value="scope.row.status" active-value="0" inactive-value="1"
                @change="handleStatusChange(scope.row)" v-if="$p(['monitor:job:changeStatus'])" />
              <dict-tag v-else :options="$dict.sys_job_status" :value="scope.row.status" />
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="380">
            <template #default="scope">
              <el-space spacer="|">
                <el-link type="primary" @click="handleEdit(scope.row)" v-if="$p(['monitor:job:edit'])">
                  修改
                </el-link>
                <el-link type="primary" @click="handleDelete(scope.row)" v-if="$p(['monitor:job:remove'])">
                  删除
                </el-link>

                <el-link type="primary" @click="handleRun(scope.row)" v-if="$p(['monitor:job:changeStatus'])">
                  执行一次
                </el-link>
                <el-link type="primary" @click="handleDetail(scope.row)" v-if="$p(['monitor:job:query'])">
                  详细
                </el-link>
                <el-link type="primary" @click="handleLog(scope.row)" v-if="$p(['monitor:job:query'])">
                  调度日志
                </el-link>
              </el-space>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </admin-table>
  </div>
</template>

<script setup>
import { listJob, delJob, runJob, changeJobStatus } from '@/api/monitor/job'
import useAdminDialog from '@/plugins/use-admin-dialog'
import { h } from 'vue'
import { ElMessage } from 'element-plus'
import { getDict } from '@/utils/dict'
import { syncConfirm } from '@/utils/utils'
import { useRouter } from 'vue-router'
import { download } from '@/api/request'

getDict(['sys_job_status'])
const adminDialog = useAdminDialog()
const router = useRouter()
let $table

function handleAdd() {
  adminDialog(
    {
      component: import('./job.vue'),
      props: {
        onSuccess: () => {
          $table.getTable()
        }
      },
      dialogProps: { title: '添加任务', width: '700px' }
    }
  )
}

function handleEdit(row) {
  row = row || $table.selection[0]
  adminDialog(
    {
      component: import('./job.vue'),
      props: {
        row: row,
        onSuccess: () => {
          $table.getTable()
        }
      },
      dialogProps: { title: '修改任务', width: '700px' }
    }
  )
}

function handleLog(row) {
  router.push({
    path: '/monitor/job-log/index/' + (row ? row.jobId : 0)
  })
}

function handleDelete(row) {
  const jobIds = row ? [row.jobId] : $table.selection.map((item) => item.jobId)
  syncConfirm(`是否确认删除调度任务编号为"${jobIds.join(',')}"的数据项?`, () =>
    delJob(jobIds.join(','))
  )
    .then(() => {
      ElMessage.success('删除成功')
      $table.getTable()
    })
    .catch(() => { })
}

function handleRun(row) {
  const jobId = row?.jobId || $table.selection[0].jobId
  syncConfirm('确认要立即执行一次任务吗?', () => runJob(jobId))
    .then(() => {
      ElMessage.success('执行成功')
    })
    .catch(() => { })
}

function handleStatusChange(row) {
  const text = row.status === '0' ? '停用' : '启用'
  syncConfirm(`确认要${text}任务吗?`, () =>
    changeJobStatus(row.jobId, row.status === '0' ? '1' : '0')
  )
    .then(() => {
      ElMessage.success(`${text}成功`)
      $table.getTable()
    })
    .catch(() => { })
}

function handleDetail(row) {
  adminDialog(
    {
      component: import('./detail.vue'),
      props: {
        row: row,
        detail: true
      },
      dialogProps: { title: '任务详细', width: '700px' }
    }
  )
}

function handleExport() {
  download(
    'monitor/job/export',
    {
      ...$table.query
    },
    `job_${new Date().getTime()}.xlsx`
  )
}
</script>
