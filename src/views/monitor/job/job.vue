<template>
  <admin-dialog-content>
    <el-form ref="formRef" :model="postData" label-width="auto">
      <admin-space cols="1">
        <el-form-item label="任务名称" prop="jobName" :rules="[$rules.required]">
          <el-input v-model="postData.jobName" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="任务组名" prop="jobGroup" :rules="[$rules.required]">
          <el-select v-model="postData.jobGroup" placeholder="请选择任务组名">
            <el-option v-for="dict in $dict.sys_job_group" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="调用目标字符串" prop="invokeTarget" :rules="[$rules.required]">
          <el-input v-model="postData.invokeTarget" placeholder="请输入调用目标字符串">
            <template #append>
              <el-tooltip placement="top">
                <template #content>
                  Bean调用示例：ryTask.ryNoParams
                  <br />
                  Class类调用示例：com.ruoyi.quartz.task.RyTask.ryNoParams
                  <br />
                  参数说明：支持字符串，布尔类型，长整型，浮点型，整型
                </template>
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="cron表达式" prop="cronExpression" :rules="[$rules.required]">
          <el-input v-model="postData.cronExpression" placeholder="请输入cron执行表达式">
            <template #append>
              <el-button type="primary" link @click="handleCron">
                生成表达式
                <el-icon>
                  <timer />
                </el-icon>
              </el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="是否并发" prop="concurrent">
          <el-radio-group v-model="postData.concurrent">
            <el-radio label="0">允许</el-radio>
            <el-radio label="1">禁止</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="执行策略" prop="misfirePolicy">
          <el-radio-group v-model="postData.misfirePolicy">
            <el-radio label="1">立即执行</el-radio>
            <el-radio label="2">执行一次</el-radio>
            <el-radio label="3">放弃执行</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="任务状态" prop="status">
          <el-radio-group v-model="postData.status">
            <el-radio v-for="dict in $dict.sys_job_status" :key="dict.value" :label="dict.value">
              {{ dict.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="postData.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </admin-space>
    </el-form>
    <template #footer>
      <el-button @click="emits('end')">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="loading" v-if="!props.detail">
        确定
      </el-button>
    </template>
  </admin-dialog-content>
</template>

<script setup>
import { h, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getJob, addJob, updateJob } from '@/api/monitor/job'
import { getDict } from '@/utils/dict'
import useAdminDialog from '@/plugins/use-admin-dialog'

const adminDialog = useAdminDialog()
getDict(['sys_job_group', 'sys_job_concurrent', 'sys_job_misfire', 'sys_job_status'])

const props = defineProps({
  row: Object,
  detail: {
    type: Boolean,
    default: false
  }
})
const emits = defineEmits(['end', 'success'])

const loading = ref(false)
const formRef = ref()
const showCron = ref(false)

const postData = ref({
  jobId: undefined,
  jobName: undefined,
  jobGroup: undefined,
  invokeTarget: undefined,
  cronExpression: undefined,
  misfirePolicy: '1',
  concurrent: '1',
  status: '0',
  remark: undefined
})

if (props.row) {
  getJob(props.row.jobId).then((res) => {
    Object.assign(postData.value, res.data)
  })
}

function handleCron() {
  adminDialog(
    {
      component: import('./Crontab/index.vue'),
      props: {
        expression: postData.value.cronExpression,
        onSuccess: (str) => {
          postData.value.cronExpression = str
        }
      },
      dialogProps: { title: '生成表达式', width: '900px' }
    }
  )
}

function submitForm() {
  formRef.value?.validate((valid) => {
    if (valid) {
      loading.value = true
      const fn = postData.value.jobId ? updateJob : addJob
      fn(postData.value)
        .then(() => {
          ElMessage.success('保存成功')
          emits('success')
        })
        .finally(() => {
          loading.value = false
        })
    }
  })
}
</script>
