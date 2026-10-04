<template>
  <admin-dialog-content>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="标题" prop="title">
        <el-input v-model="form.title" placeholder="请输入消息标题" maxlength="100" show-word-limit />
      </el-form-item>
      <el-form-item label="接收人" prop="receiverIdList">
        <user-picker v-model="form.receiverIdList" multiple />
      </el-form-item>
      <el-form-item label="内容" prop="content">
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="6"
          placeholder="请输入消息正文"
          maxlength="1000"
          show-word-limit
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="emits('end')">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">发送</el-button>
    </template>
  </admin-dialog-content>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { sendMessage } from '@/api/sys/message-api'

const emits = defineEmits(['end', 'success'])

const formRef = ref()
const submitting = ref(false)
const form = reactive({
  title: '',
  receiverIdList: [], // user-picker 多选返回用户ID数组
  content: ''
})

const rules = {
  title: [{ required: true, message: '请输入消息标题', trigger: 'blur' }],
  receiverIdList: [
    { type: 'array', required: true, min: 1, message: '请选择至少一位接收人', trigger: 'change' }
  ]
}

// 发送消息
const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      await sendMessage({ ...form })
      ElMessage.success('消息发送成功')
      emits('success')
    } catch (e) {
      // 接口异常由拦截器统一提示
    } finally {
      submitting.value = false
    }
  })
}
</script>
