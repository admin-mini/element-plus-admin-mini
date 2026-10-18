<template>
  <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" class="account-form">
    <el-form-item label="用户名">
      <el-input :model-value="username" disabled placeholder="-" />
    </el-form-item>
    <el-form-item label="当前绑定手机号">
      <el-input :model-value="phone" disabled placeholder="未绑定手机号" />
    </el-form-item>
    <el-form-item label="新手机号" prop="phone">
      <el-input v-model="form.phone" maxlength="11" placeholder="请输入新手机号" />
    </el-form-item>
    <el-form-item label="短信验证码" prop="validCode">
      <div class="captcha-row">
        <el-input
          v-model="form.validCode"
          maxlength="6"
          placeholder="请输入短信验证码"
          @keyup.enter="submit"
        />
        <!-- 复用短信验证码组件：内部完成图片验证码校验并向新手机号发送短信，成功后回传短信请求号 -->
        <nuocao-sms-btn
          :phone="form.phone"
          :image-captcha-api-fn="getAccountPicCaptcha"
          :sms-api-fn="getBindPhoneValidCode"
          @success="(reqId) => (form.validCodeReqId = reqId)"
        />
      </div>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" :loading="loading" @click="submit">绑定</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { bindPhone, getAccountPicCaptcha, getBindPhoneValidCode } from '@/api/sys/user-center-api'
import $rules from '@/utils/rules'
import message from '@/utils/message'

defineProps({
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

const emit = defineEmits(['success'])

/** 绑定新手机号：先通过图片验证码发送短信，再凭短信验证码完成绑定 */
const formRef = ref()
const loading = ref(false)

const form = reactive({
  phone: '',
  validCode: '',
  // 短信验证码请求号，由 nuocao-sms-btn 发送成功后回传
  validCodeReqId: ''
})

const rules = {
  phone: [$rules.required, $rules.phone],
  validCode: [$rules.required]
}

// 新手机号变更后，之前获取的短信验证码失效，清空避免误提交
watch(
  () => form.phone,
  () => {
    form.validCode = ''
    form.validCodeReqId = ''
  }
)

function submit() {
  formRef.value.validate((valid) => {
    if (!valid) return
    if (!form.validCodeReqId) {
      message.warning('请先获取短信验证码')
      return
    }
    loading.value = true
    bindPhone({
      phone: form.phone,
      validCode: form.validCode,
      validCodeReqId: form.validCodeReqId
    })
      .then(() => {
        message.success('手机号绑定成功')
        emit('success', form.phone)
        form.phone = ''
        form.validCode = ''
        form.validCodeReqId = ''
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
