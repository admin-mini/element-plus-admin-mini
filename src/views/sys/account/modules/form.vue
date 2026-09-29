<template>
  <admin-dialog-content v-loading="loading">
    <el-form ref="formRef" :model="postData" :rules="rules" label-position="right" label-width="100px">
      <admin-space cols="2">
        <el-form-item v-if="!props.row?.id" label="账号" prop="username" :rules="[$rules.required]">
          <el-input v-model="postData.username" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname" :rules="[$rules.required]">
          <el-input v-model="postData.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item v-if="!props.row?.id" label="密码" prop="password">
          <el-input v-model="postData.password" type="password" show-password placeholder="请输入密码">
            <template #append>
              <el-button @click="randomPassword">随机</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone" :rules="[$rules.phone]">
          <el-input v-model="postData.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email" :rules="[$rules.email]">
          <el-input v-model="postData.email" placeholder="请输入邮箱" />
        </el-form-item>
      </admin-space>
    </el-form>
    <template #footer>
      <el-button @click="emits('end')">取消</el-button>
      <el-button type="primary" :loading="loading" @click="submitForm">确定</el-button>
    </template>
  </admin-dialog-content>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import message from '@/utils/message'
import tool from '@/utils/tool'
import * as accountApi from '@/api/sys/account-api'
import smCrypto from '@/utils/smCrypto'
import password from '@/utils/password'

const props = defineProps({ row: Object })
const emits = defineEmits(['end', 'success'])

const formRef = ref()
const loading = ref(false)
const postData = ref({
  username: '',
  nickname: '',
  password: '',
  phone: '',
  email: ''
})

const rules = {}

const isEditing = () => !!props.row?.id

function randomPassword() {
  postData.value.password = password.generateRandomPassword()
}

function submitForm() {
  formRef.value?.validate((valid) => {
    if (!valid) {
      message.error('请填写完整信息')
      return
    }
    let payload = tool.cloneDeep(postData.value)
    if (isEditing()) {
      delete payload.username
      delete payload.password
    }else{
        payload.password = smCrypto.doEncrypt(payload.password)
    }
    loading.value = true
    const fn = isEditing() ? accountApi.editAccount : accountApi.addAccount
    fn(payload)
      .then((resp) => {
        message.success(resp.msg || '保存成功')
        emits('success')
      })
      .finally(() => {
        loading.value = false
      })
  })
}

onMounted(() => {
  if (props.row?.id) {
    loading.value = true
    accountApi.getAccountDetail(props.row.id).then((resp) => {
      postData.value = Object.assign({}, postData.value, resp.data || {})
    }).finally(() => {
      loading.value = false
    })
  }
})
</script>