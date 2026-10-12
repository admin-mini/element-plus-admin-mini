<template>
  <admin-dialog-content v-loading="loading">
    <el-form ref="formRef" :model="postData" label-width="110px">
      <el-form-item label="短信通道">
        <el-input :model-value="channelLabel" disabled />
      </el-form-item>
      <el-form-item label="短信模板">
        <el-input :model-value="record.name" disabled />
      </el-form-item>
      <el-form-item label="模板内容" v-if="postData.content">
        <el-input v-model="postData.content" type="textarea" :rows="4" readonly />
      </el-form-item>
      <el-form-item label="接收号码" prop="phoneNumber" :rules="[$rules.required, $rules.phone]">
        <el-input v-model="postData.phoneNumber" placeholder="请输入接收手机号" />
      </el-form-item>

      <!-- 模板详情的 variables 即需要填充的变量 -->
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
      <el-empty v-if="!loading && !variables.length" description="该模板未定义变量" :image-size="60" />
    </el-form>
    <template #footer>
      <el-button @click="emits('end')">取消</el-button>
      <el-button type="primary" :loading="sending" @click="submitForm">发送</el-button>
    </template>
  </admin-dialog-content>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import message from '@/utils/message'
import * as api from '@/api/dev/sms-api'

const emits = defineEmits(['end', 'success'])
const props = defineProps({
  // 列表行数据，含 id、channelCode、code、name
  record: {
    type: Object,
    default: () => ({})
  }
})

const channelOptions = [
  { label: '阿里云', value: 'aliyun' },
  { label: '腾讯云', value: 'tencent' }
]

const loading = ref(false)
const sending = ref(false)
const formRef = ref()
// 模板变量集合 [{ name, type }]
const variables = ref([])

const postData = reactive({
  channelCode: props.record?.channelCode,
  templateCode: props.record?.code,
  content: '',
  phoneNumber: undefined,
  params: {}
})

const channelLabel = computed(
  () => channelOptions.find(item => item.value === postData.channelCode)?.label || postData.channelCode || '-'
)

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

onMounted(() => {
  if (!props.record?.id) return
  loading.value = true
  // 取模板详情，按返回的 variables 生成需要填充的变量项
  api
    .getTemplateDetail(props.record.id)
    .then(res => {
      const data = res.data || {}
      postData.content = data.content || ''
      variables.value = data.variables || []
      variables.value.forEach(variable => {
        postData.params[variable.name] = ''
      })
    })
    .finally(() => {
      loading.value = false
    })
})
</script>