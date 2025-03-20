<template>
  <admin-dialog-content>
    <el-form ref="formRef" :model="postData" label-width="120px">
      <admin-space cols="2">
        <el-form-item label="日志编号">
          {{ postData.jobLogId }}
        </el-form-item>
        <el-form-item label="任务名称">
          {{ postData.jobName }}
        </el-form-item>
        <el-form-item label="任务组名">
          {{ postData.jobGroup }}
        </el-form-item>
        <el-form-item label="执行状态">
          <dict-tag :options="$dict.sys_common_status" :value="postData.status" />
        </el-form-item>
        <el-form-item label="调用目标字符串" span="2">
          {{ postData.invokeTarget }}
        </el-form-item>
        <el-form-item label="日志信息" span="2">
          {{ postData.jobMessage }}
        </el-form-item>

        <el-form-item label="异常信息" v-if="postData.status === '1'" span="2">
          <el-alert :title="postData.exceptionInfo" type="error" :closable="false" show-icon />
        </el-form-item>
        <el-form-item label="创建时间" span="2">
          {{ postData.createTime }}
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
import { getDict } from '@/utils/dict'

getDict(['sys_common_status'])

const props = defineProps({
  row: {
    type: Object,
    required: true
  }
})

const emits = defineEmits(['end'])

const postData = ref({
  jobLogId: undefined,
  jobName: undefined,
  jobGroup: undefined,
  invokeTarget: undefined,
  jobMessage: undefined,
  status: undefined,
  exceptionInfo: undefined,
  createTime: undefined
})

// 直接使用传入的数据，因为日志详情数据已经完整
Object.assign(postData.value, props.row)
</script>
