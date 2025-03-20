<template>
  <admin-dialog-content>
    <el-form ref="formRef" :model="postData" label-width="120px">
      <admin-space cols="2">
        <el-form-item label="任务编号">
          {{ postData.jobId }}
        </el-form-item>
        <el-form-item label="任务名称">
          {{ postData.jobName }}
        </el-form-item>
        <el-form-item label="任务组名">
          {{ postData.jobGroup }}
        </el-form-item>
        <el-form-item label="调用目标字符串">
          {{ postData.invokeTarget }}
        </el-form-item>
        <el-form-item label="cron表达式">
          {{ postData.cronExpression }}
        </el-form-item>
        <el-form-item label="下次执行时间">
          {{ postData.nextValidTime }}
        </el-form-item>
        <el-form-item label="是否并发">
          <dict-tag :options="[
            { label: '允许', value: '0' },
            { label: '禁止', value: '1' }
          ]" :value="postData.concurrent" />
        </el-form-item>
        <el-form-item label="执行策略">
          <dict-tag :options="[
            { label: '立即执行', value: '1' },
            { label: '执行一次', value: '2' },
            { label: '放弃执行', value: '3' }
          ]" :value="postData.misfirePolicy" />
        </el-form-item>
        <el-form-item label="任务状态">
          <dict-tag :options="$dict.sys_job_status" :value="postData.status" />
        </el-form-item>
        <el-form-item label="创建时间">
          {{ postData.createTime }}
        </el-form-item>
        <el-form-item label="备注">
          {{ postData.remark }}
        </el-form-item>
      </admin-space>
    </el-form>
    <template #footer>
      <el-button @click="emits('end')">关闭</el-button>
    </template>
  </admin-dialog-content>
</template>

<script setup>
import { ref } from 'vue'
import { getJob } from '@/api/monitor/job'
import { getDict } from '@/utils/dict'

getDict(['sys_job_status'])
const emits = defineEmits('end')
const props = defineProps({
  row: {
    type: Object,
    required: true
  }
})

const postData = ref({
  jobId: undefined,
  jobName: undefined,
  jobGroup: undefined,
  invokeTarget: undefined,
  cronExpression: undefined,
  nextValidTime: undefined, // 添加下次执行时间字段
  misfirePolicy: undefined,
  concurrent: undefined,
  status: undefined,
  createTime: undefined,
  remark: undefined
})

getJob(props.row.jobId).then((res) => {
  Object.assign(postData.value, res.data)
})
</script>
