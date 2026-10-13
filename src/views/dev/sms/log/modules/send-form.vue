<template>
  <admin-dialog-content v-loading="loading">
    <el-form ref="formRef" :model="postData" label-width="110px">
      <el-form-item label="短信通道" prop="channelCode" :rules="[$rules.required]">
        <el-select
          v-model="postData.channelCode"
          placeholder="请选择短信通道"
          style="width: 100%"
          @change="onChannelChange"
        >
          <el-option v-for="item in channelOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="短信模板" prop="templateCode" :rules="[$rules.required]">
        <el-select
          v-model="postData.templateCode"
          placeholder="请选择短信模板"
          style="width: 100%"
          no-data-text="该通道下暂无可用模板"
          @change="onTemplateChange"
        >
          <el-option v-for="item in templateOptions" :key="item.code" :label="item.name" :value="item.code" />
        </el-select>
      </el-form-item>
      <el-form-item label="模板内容" v-if="postData.content">
        <el-input v-model="postData.content" type="textarea" :rows="4" readonly />
      </el-form-item>
      <el-form-item label="接收号码" prop="phoneNumber" :rules="[$rules.required, $rules.phone]">
        <el-input v-model="postData.phoneNumber" placeholder="请输入接收手机号" />
      </el-form-item>

      <!-- 变量按模板详情的 variables 生成，需全部填充 -->
      <el-form-item
        v-for="variable in variables"
        :key="variable.name"
        :label="variable.name"
        :prop="`params.${variable.name}`"
        :rules="[$rules.required]"
      >
        <el-input
          v-model="postData.params[variable.name]"
          :type="variable.type === 2 ? 'number' : 'text'"
          :placeholder="`请输入 ${variable.name}`"
        />
      </el-form-item>
      <el-empty
        v-if="!loading && postData.templateCode && !variables.length"
        description="该模板未定义变量"
        :image-size="60"
      />
    </el-form>
    <template #footer>
      <el-button @click="emits('end')">取消</el-button>
      <el-button type="primary" :loading="sending" @click="submitForm">发送</el-button>
    </template>
  </admin-dialog-content>
</template>

<script setup>
import { reactive, ref } from 'vue'
import message from '@/utils/message'
import * as api from '@/api/dev/sms-api'

const emits = defineEmits(['end', 'success'])

const channelOptions = [
  { label: '阿里云', value: 'aliyun' },
  { label: '腾讯云', value: 'tencent' }
]

const loading = ref(false)
const sending = ref(false)
const formRef = ref()
const templateOptions = ref([])
// 模板详情中声明的变量 [{ name, type }]
const variables = ref([])

const postData = reactive({
  channelCode: undefined,
  templateCode: undefined,
  content: '',
  phoneNumber: undefined,
  params: {}
})

async function onChannelChange() {
  postData.templateCode = undefined
  postData.content = ''
  variables.value = []
  postData.params = {}
  templateOptions.value = []
  loading.value = true
  try {
    const response = await api.getTemplatePage({
      channelCode: postData.channelCode,
      size: 1000
    })
    // 仅允许选择启用状态的模板
    templateOptions.value = (response.data?.records || []).filter(item => item.status === 1)
  } finally {
    loading.value = false
  }
}

async function onTemplateChange(templateCode) {
  postData.content = ''
  variables.value = []
  postData.params = {}
  const template = templateOptions.value.find(item => item.code === templateCode)
  if (!template) return
  loading.value = true
  try {
    // 变量与模板内容以详情返回为准
    const response = await api.getTemplateDetail(template.id)
    const data = response.data || {}
    postData.content = data.content || ''
    variables.value = data.variables || []
    variables.value.forEach(variable => {
      postData.params[variable.name] = ''
    })
  } finally {
    loading.value = false
  }
}

function submitForm() {
  formRef.value?.validate(valid => {
    if (!valid) return
    sending.value = true
    api
      .sendSms(postData.channelCode, {
        phoneNumber: postData.phoneNumber,
        templateCode: postData.templateCode,
        params: postData.params
      })
      .then(res => {
        message.success(res.msg || '发送成功')
        emits('success')
      })
      .finally(() => {
        sending.value = false
      })
  })
}
</script>