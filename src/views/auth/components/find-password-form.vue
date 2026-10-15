<template>
  <admin-dialog-content>
    <el-form ref="formRef" :model="findForm" :rules="rules" label-width="90px">
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="findForm.phone" placeholder="请输入手机号" maxlength="11" />
      </el-form-item>
      <el-form-item label="短信验证码" prop="validCode">
        <div class="captcha-row">
          <el-input v-model="findForm.validCode" placeholder="请输入短信验证码" maxlength="6" />
          <nuocao-sms-btn
            :phone="findForm.phone"
            :image-captcha-api-fn="loginApi.getLoginPicCaptcha"
            :sms-api-fn="loginApi.getPhoneFindPasswordValidCode"
            @success="(reqId) => (findForm.validCodeReqId = reqId)"
          />
        </div>
      </el-form-item>
      <el-form-item label="新密码" prop="password">
        <el-input v-model="findForm.password" type="password" show-password placeholder="须含数字、字母（区分大小写）、符号至少2种" autocomplete="off" />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input v-model="findForm.confirmPassword" type="password" show-password placeholder="请再次输入新密码" autocomplete="off" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="emits('end')">取消</el-button>
      <el-button type="primary" :loading="loading" @click="submitForm">重置密码</el-button>
    </template>
  </admin-dialog-content>
</template>

<script setup>
import { reactive, ref } from 'vue'
import message from '@/utils/message'
import * as loginApi from '@/api/auth/auth-login-api'
import $rules from '@/utils/rules'
import smCrypto from '@/utils/smCrypto'

const emits = defineEmits(['end', 'success'])

const formRef = ref()
const loading = ref(false)
const findForm = reactive({
  phone: '',
  validCode: '',
  validCodeReqId: '',
  password: '',
  confirmPassword: ''
})

// 新密码两次输入是否相同由前端校验
const rules = reactive({
  phone: [$rules.required, $rules.phone],
  validCode: [$rules.required],
  password: [$rules.required, $rules.passwordStrength],
  confirmPassword: [
    $rules.required,
    {
      validator: (rule, value, callback) => {
        if (value && value !== findForm.password) {
          callback(new Error('两次密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

function submitForm() {
  formRef.value.validate((valid) => {
    if (!valid) return
    if (!findForm.validCodeReqId) {
      message.warning('请先获取短信验证码')
      return
    }
    loading.value = true
    loginApi
      .phoneFindPassword({
        phone: findForm.phone,
        validCode: findForm.validCode,
        validCodeReqId: findForm.validCodeReqId,
        // 新密码加密传输，与登录保持一致
        newPassword: smCrypto.doEncrypt(findForm.password)
      })
      .then(() => {
        message.success('密码重置成功，请使用新密码登录')
        emits('success')
      })
      .finally(() => {
        loading.value = false
      })
  })
}
</script>
