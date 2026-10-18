<template>
  <div class="account-form">
    <el-alert
      v-if="!phone"
      type="warning"
      show-icon
      :closable="false"
      title="当前账号未绑定手机号，请先在「绑定手机号」中完成绑定"
      class="account-alert"
    />
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
      <el-form-item label="用户名">
        <el-input :model-value="username" disabled placeholder="-" />
      </el-form-item>
      <el-form-item label="当前绑定手机号">
        <el-input :model-value="phone" disabled placeholder="未绑定手机号" />
      </el-form-item>
      <el-form-item label="短信验证码" prop="validCode">
        <div class="captcha-row">
          <el-input
            v-model="form.validCode"
            maxlength="6"
            placeholder="请输入短信验证码"
            @keyup.enter="submit"
          />
          <!--
            复用短信验证码组件：短信由后端发送至当前已绑定手机号，成功后回传短信请求号。
            此处展示的是后端返回的脱敏号码，无法通过手机号格式校验，故传 validate-phone=false 跳过校验。
          -->
          <nuocao-sms-btn
            :phone="phone"
            :image-captcha-api-fn="getAccountPicCaptcha"
            :sms-api-fn="getUpdatePwdPhoneValidCode"
            :validate-phone="false"
            @success="(reqId) => (form.validCodeReqId = reqId)"
          />
        </div>
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
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import {
  getAccountPicCaptcha,
  getUpdatePwdPhoneValidCode,
  updatePwdByPhone
} from '@/api/sys/user-center-api'
import $rules from '@/utils/rules'
import message from '@/utils/message'
import smCrypto from '@/utils/smCrypto'

const props = defineProps({
  // 账号（来自账户详情）
  username: {
    type: String,
    default: ''
  },
  // 当前绑定手机号（后端已脱敏，仅用于展示）
  phone: {
    type: String,
    default: ''
  }
})

/** 通过手机验证码修改登录密码 */
const formRef = ref()
const loading = ref(false)

const form = reactive({
  validCode: '',
  // 短信验证码请求号，由 nuocao-sms-btn 发送成功后回传
  validCodeReqId: '',
  newPassword: '',
  confirmPassword: ''
})

const rules = {
  validCode: [$rules.required],
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

function submit() {
  formRef.value.validate((valid) => {
    if (!valid) return
    if (!props.phone) {
      message.warning('当前账号未绑定手机号，请先绑定手机号')
      return
    }
    if (!form.validCodeReqId) {
      message.warning('请先获取短信验证码')
      return
    }
    loading.value = true
    updatePwdByPhone({
      validCode: form.validCode,
      validCodeReqId: form.validCodeReqId,
      // 新密码统一使用 sm2 加密后传输
      newPassword: smCrypto.doEncrypt(form.newPassword)
    })
      .then(() => {
        message.success('密码修改成功')
        form.validCode = ''
        form.validCodeReqId = ''
        form.newPassword = ''
        form.confirmPassword = ''
        formRef.value?.clearValidate()
      })
      .finally(() => {
        loading.value = false
      })
  })
}
</script>

<style lang="scss" scoped>
.account-form {
  max-width: 520px;
}

.account-alert {
  margin-bottom: 16px;
}

.captcha-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;

  .el-input {
    flex: 1;
  }
}
</style>
