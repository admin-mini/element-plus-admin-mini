<template>
  <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" class="account-form">
    <el-form-item label="旧密码" prop="password">
      <el-input
        v-model="form.password"
        type="password"
        show-password
        placeholder="请输入旧密码"
        autocomplete="off"
      />
    </el-form-item>
    <el-form-item label="新密码" prop="newPassword">
      <el-input
        v-model="form.newPassword"
        type="password"
        show-password
        placeholder="须含数字、字母（区分大小写）、符号至少2种"
        autocomplete="off"
      />
    </el-form-item>
    <el-form-item label="确认密码" prop="confirmPassword">
      <el-input
        v-model="form.confirmPassword"
        type="password"
        show-password
        placeholder="请再次输入新密码"
        autocomplete="off"
      />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" :loading="loading" @click="submit">保存</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { updatePwdByOld } from '@/api/sys/user-center-api'
import $rules from '@/utils/rules'
import message from '@/utils/message'
import smCrypto from '@/utils/smCrypto'

/** 通过旧密码修改登录密码 */
const formRef = ref()
const loading = ref(false)

const form = reactive({
  password: '',
  newPassword: '',
  confirmPassword: ''
})

const rules = {
  password: [$rules.required],
  newPassword: [$rules.required, $rules.passwordStrength],
  confirmPassword: [
    $rules.required,
    {
      validator: (rule, value, callback) => {
        if (value && value !== form.newPassword) {
          callback(new Error('两次密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

function reset() {
  form.password = ''
  form.newPassword = ''
  form.confirmPassword = ''
  formRef.value?.clearValidate()
}

function submit() {
  formRef.value.validate((valid) => {
    if (!valid) return
    loading.value = true
    // 密码统一使用 sm2 加密后传输，与登录 / 注册 / 找回密码保持一致
    updatePwdByOld({
      password: smCrypto.doEncrypt(form.password),
      newPassword: smCrypto.doEncrypt(form.newPassword)
    })
      .then(() => {
        message.success('密码修改成功')
        reset()
      })
      .finally(() => {
        loading.value = false
      })
  })
}
</script>

<style lang="scss" scoped>
.account-form {
  max-width: 480px;
}
</style>
