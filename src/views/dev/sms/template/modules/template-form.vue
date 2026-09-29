<template>
  <admin-dialog-content v-loading="loading">
    <el-form ref="formRef" :model="postData" label-width="110px">
      <el-form-item label="短信通道" prop="channelCode" :rules="[$rules.required]">
        <el-select v-model="postData.channelCode" placeholder="请选择短信通道" style="width: 100%">
          <el-option v-for="item in channelOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="模板编码" prop="code" :rules="[$rules.required]">
        <el-input v-model="postData.code" placeholder="同一通道下编码唯一" />
      </el-form-item>
      <el-form-item label="模板名称" prop="name" :rules="[$rules.required]">
        <el-input v-model="postData.name" placeholder="请输入模板名称" />
      </el-form-item>
      <el-form-item label="通道模板ID" prop="apiTemplateId" :rules="[$rules.required]">
        <el-input v-model="postData.apiTemplateId" placeholder="请输入通道端模板ID" />
      </el-form-item>
      <el-form-item label="模板内容" v-if="postData.content">
        <el-input v-model="postData.content" type="textarea" :rows="3" readonly />
      </el-form-item>
      <el-form-item label="状态" prop="status" :rules="[$rules.required]">
        <el-switch v-model="postData.status" :active-value="1" :inactive-value="0" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="postData.remark" type="textarea" :rows="2" placeholder="请输入备注" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="emits('end')">取消</el-button>
      <el-button type="primary" :loading="loading" @click="submitForm">确定</el-button>
    </template>
  </admin-dialog-content>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import message from '@/utils/message'
import * as api from '@/api/dev/sms-api'

const emits = defineEmits(['end', 'success'])
const props = defineProps({
  record: Object
})

// 取值与后端 SmsChannelEnum 保持一致
const channelOptions = [
  { label: '阿里云', value: 'aliyun' },
  { label: '腾讯云', value: 'tencent' }
]

const loading = ref(false)
const formRef = ref()

const postData = ref({
  id: undefined,
  channelCode: undefined,
  code: undefined,
  name: undefined,
  apiTemplateId: undefined,
  content: '',
  status: 1,
  remark: undefined
})

function submitForm() {
  formRef.value?.validate(valid => {
    if (!valid) return
    loading.value = true
    const { id, channelCode, code, name, apiTemplateId, status, remark } = postData.value
    const params = { channelCode, code, name, apiTemplateId, status, remark }
    const fn = id ? api.editTemplate : api.addTemplate
    fn(id ? { id, ...params } : params)
      .then(res => {
        message.success(res.msg || '保存成功')
        emits('success')
      })
      .finally(() => {
        loading.value = false
      })
  })
}

onMounted(() => {
  if (!props.record?.id) return
  loading.value = true
  // 列表接口只返回模板基本信息，模板参数 params 需取详情回显
  api
    .getTemplateDetail(props.record.id)
    .then(res => {
      Object.assign(postData.value, res.data || {})
    })
    .finally(() => {
      loading.value = false
    })
})
</script>
