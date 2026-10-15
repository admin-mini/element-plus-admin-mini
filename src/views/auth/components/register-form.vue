<template>
  <admin-dialog-content>
    <el-form ref="formRef" :model="regForm" :rules="rules" label-width="90px">
      <el-form-item label="姓名" prop="name">
        <el-input v-model="regForm.name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="账号" prop="username">
        <el-input v-model="regForm.username" placeholder="请输入账号" autocomplete="off" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="regForm.password" type="password" show-password placeholder="须含数字、字母（区分大小写）、符号至少2种" autocomplete="off" />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input v-model="regForm.confirmPassword" type="password" show-password placeholder="请再次输入密码" autocomplete="off" />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="regForm.phone" placeholder="请输入手机号" maxlength="11" />
      </el-form-item>
      <el-form-item v-if="props.smsEnable" label="短信验证码" prop="validCode">
        <div class="captcha-row">
          <el-input v-model="regForm.validCode" placeholder="请输入短信验证码" maxlength="6" />
          <nuocao-sms-btn
            :phone="regForm.phone"
            :image-captcha-api-fn="loginApi.getLoginPicCaptcha"
            :sms-api-fn="loginApi.getPhoneRegValidCode"
            @success="(reqId) => (regForm.validCodeReqId = reqId)"
          />
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="emits('end')">取消</el-button>
      <el-button type="primary" :loading="loading" @click="submitForm">注 册</el-button>
    </template>
  </admin-dialog-content>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import message from '@/utils/message'
import * as loginApi from '@/api/auth/auth-login-api'
import $rules from '@/utils/rules'
import smCrypto from '@/utils/smCrypto'

// smsEnable：注册是否需要短信验证码（对应系统配置 account_register_sms_code_enable）
const props = defineProps({ smsEnable: Boolean })
const emits = defineEmits(['end', 'success'])

const formRef = ref()
const loading = ref(false)
const regForm = reactive({
  name: '',
  username: '',
  password: '',
  confirmPassword: '',
  phone: '',
  validCode: '',
  validCodeReqId: ''
})

const rules = computed(() => ({
  name: [$rules.required],
  username: [$rules.required, $rules.username],
  password: [$rules.required, $rules.passwordStrength],
  confirmPassword: [
    $rules.required,
    {
      validator: (rule, value, callback) => {
        if (value && value !== regForm.password) {
          callback(new Error('两次密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  // 开启注册短信验证时手机号必填，否则仅校验格式
  phone: props.smsEnable ? [$rules.required, $rules.phone] : [$rules.phone],
  ...(props.smsEnable ? { validCode: [$rules.required] } : {})
}))

function submitForm() {
  formRef.value.validate((valid) => {
    if (!valid) return
    if (props.smsEnable && !regForm.validCodeReqId) {
      message.warning('请先获取短信验证码')
      return
    }
    const postData = {
      name: regForm.name,
      username: regForm.username,
      password: smCrypto.doEncrypt(regForm.password),
      phone: regForm.phone
    }
    if (props.smsEnable) {
      postData.validCode = regForm.validCode
      postData.validCodeReqId = regForm.validCodeReqId
    }
    loading.value = true
    loginApi
      .register(postData)
      .then(() => {
        message.success('注册成功，请登录')
        // 回传注册的账号，登录页用于回填；success 事件触发后弹窗自动关闭
        emits('success', regForm.username)
      })
      .finally(() => {
        loading.value = false
      })
  })
}
</script>
