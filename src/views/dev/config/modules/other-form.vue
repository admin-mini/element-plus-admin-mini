<template>
  <admin-dialog-content v-loading="loading">
    <el-form ref="formRef" :model="postData" label-width="100px">
      <el-form-item label="配置键" prop="configKey" :rules="[$rules.required]">
        <el-input v-model="postData.configKey" :disabled="!!postData.configId" placeholder="请输入配置键" />
      </el-form-item>
      <el-form-item label="配置值" prop="configValue" :rules="[$rules.required]">
        <el-input v-model="postData.configValue" placeholder="请输入配置值" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="postData.remark" placeholder="请输入备注" />
      </el-form-item>
      <el-form-item label="排序" prop="sortCode" :rules="[$rules.required]">
        <el-input-number v-model="postData.sortCode" controls-position="right" :min="0" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="emits('end')">取消</el-button>
      <el-button type="primary" :loading="loading" @click="submitForm">确定</el-button>
    </template>
  </admin-dialog-content>
</template>

<script setup>
import { ref } from 'vue'
import message from '@/utils/message'
import * as configApi from '@/api/dev/config-api'

const emits = defineEmits(['end', 'success'])
const props = defineProps({
  record: Object
})

const loading = ref(false)
const formRef = ref()

const postData = ref({
  // 分页/列表接口返回的是实体字段 id，编辑接口接收的是 configId
  configId: props.record?.id,
  configKey: props.record?.configKey,
  configValue: props.record?.configValue ?? '',
  remark: props.record?.remark,
  sortCode: props.record?.sortCode ?? 0
})

function submitForm() {
  formRef.value?.validate(valid => {
    if (!valid) return
    loading.value = true
    const fn = postData.value.configId ? configApi.editConfig : configApi.addConfig
    fn(postData.value)
      .then(res => {
        message.success(res.msg || '保存成功')
        emits('success')
      })
      .finally(() => {
        loading.value = false
      })
  })
}
</script>
