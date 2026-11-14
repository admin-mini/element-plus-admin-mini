<template>
  <div class="mfa-bind-panel">
    <div class="mfa-head">
      <div class="mfa-badge">
        <el-icon :size="26"><Iphone /></el-icon>
      </div>
      <h3 class="mfa-title">绑定身份验证器</h3>
      <p class="mfa-sub">系统要求启用双重验证，完成绑定后需要重新登录</p>
    </div>

    <div class="mfa-steps">
      <div class="mfa-step is-active">
        <span class="mfa-step-index">1</span>
        <span>扫描二维码</span>
      </div>
      <i class="mfa-step-line"></i>
      <div class="mfa-step">
        <span class="mfa-step-index">2</span>
        <span>输入动态码</span>
      </div>
    </div>

    <div class="mfa-qr-card">
      <img v-if="qrCodeDataUrl" :src="qrCodeDataUrl" alt="2FA 绑定二维码" />
      <el-empty v-else description="二维码生成失败，请刷新后重试" :image-size="72" />
      <p class="mfa-qr-tip">使用 Google Authenticator、Microsoft Authenticator 等应用扫码</p>
    </div>

    <el-form ref="formRef" :model="form" :rules="rules" @submit.prevent="submit">
      <el-form-item prop="code">
        <el-input
          v-model="form.code"
          class="mfa-code"
          maxlength="6"
          inputmode="numeric"
          placeholder="6 位动态码"
          autocomplete="one-time-code"
          @keyup.enter="submit"
        />
      </el-form-item>
      <el-button native-type="submit" type="primary" size="large" class="mfa-btn" :loading="loading">
        确认绑定
      </el-button>
    </el-form>

    <div class="mfa-timer">
      <el-progress
        :percentage="percent"
        :show-text="false"
        :stroke-width="4"
        :color="progressColor"
        class="mfa-progress"
      />
      <span>
        二维码剩余 <b :class="{ danger: remain <= 60 }">{{ remainText }}</b> 有效，过期请重新登录后再绑定
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Iphone } from '@element-plus/icons-vue'
import * as loginApi from '@/api/auth/auth-login-api'

const props = defineProps({
  mfaReqId: { type: String, required: true },
  userId: { type: [Number, String], required: true },
  bindId: { type: String, required: true },
  qrCodeDataUrl: { type: String, default: '' },
  bindExpiresIn: { type: Number, default: 900 },
  onEnd: { type: Function, default: () => {} }
})

const formRef = ref()
const form = reactive({ code: '' })
const rules = {
  code: [
    { required: true, message: '请输入动态码', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '动态码为 6 位数字', trigger: 'blur' }
  ]
}
const loading = ref(false)
const remain = ref(props.bindExpiresIn)

const remainText = computed(() => {
  const m = String(Math.floor(remain.value / 60)).padStart(2, '0')
  const s = String(remain.value % 60).padStart(2, '0')
  return `${m}:${s}`
})
const percent = computed(() => {
  if (!props.bindExpiresIn) return 0
  return Math.max(0, Math.round((remain.value / props.bindExpiresIn) * 100))
})
const progressColor = computed(() => (remain.value <= 60 ? '#f56c6c' : '#409eff'))

let timer = null
onMounted(() => {
  timer = setInterval(() => {
    remain.value = Math.max(0, remain.value - 1)
    if (remain.value === 0) {
      clearInterval(timer)
      timer = null
    }
  }, 1000)
})
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

function submit() {
  if (loading.value) return
  formRef.value.validate((valid) => {
    if (!valid) return
    loading.value = true
    loginApi
      .mfaBindConfirmByLogin({
        mfaReqId: props.mfaReqId,
        userId: props.userId,
        bindId: props.bindId,
        code: form.code
      })
      .then(() => {
        ElMessage.success('绑定成功，请使用动态码重新登录')
        props.onEnd()
      })
      .catch(() => {
        form.code = ''
      })
      .finally(() => {
        loading.value = false
      })
  })
}
</script>

<style scoped lang="scss">
.mfa-bind-panel {
  padding: 4px 8px 0;

  .mfa-head {
    text-align: center;

    .mfa-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 56px;
      margin-bottom: 12px;
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
      border: 1px solid var(--el-color-primary-light-7);
      border-radius: 50%;
    }

    .mfa-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .mfa-sub {
      margin: 6px 0 0;
      font-size: 13px;
      line-height: 1.6;
      color: var(--el-text-color-secondary);
    }
  }

  .mfa-steps {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 16px 0 14px;

    .mfa-step {
      display: flex;
      gap: 6px;
      align-items: center;
      font-size: 12px;
      color: var(--el-text-color-secondary);

      &.is-active {
        color: var(--el-color-primary);

        .mfa-step-index {
          color: #fff;
          background: var(--el-color-primary);
          border-color: var(--el-color-primary);
        }
      }
    }

    .mfa-step-index {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      font-size: 11px;
      border: 1px solid var(--el-border-color);
      border-radius: 50%;
    }

    .mfa-step-line {
      width: 32px;
      height: 1px;
      margin: 0 10px;
      background: var(--el-border-color);
    }
  }

  .mfa-qr-card {
    padding: 14px 16px 12px;
    margin-bottom: 16px;
    text-align: center;
    background: var(--el-fill-color-lighter);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 14px;

    img {
      width: 180px;
      height: 180px;
      padding: 8px;
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgb(0 0 0 / 6%);
    }

    .mfa-qr-tip {
      margin: 8px 0 0;
      font-size: 12px;
      line-height: 1.5;
      color: var(--el-text-color-secondary);
    }
  }

  :deep(.mfa-code .el-input__wrapper) {
    padding: 0 12px;
    border-radius: 10px;
    box-shadow: 0 0 0 1px var(--el-border-color) inset;

    &.is-focus {
      box-shadow: 0 0 0 1px var(--el-color-primary) inset;
    }
  }

  :deep(.mfa-code .el-input__inner) {
    height: 48px;
    font-size: 22px;
    font-weight: 600;
    letter-spacing: 10px;
    text-align: center;
    text-indent: 10px;
  }

  :deep(.mfa-code .el-input__inner::placeholder) {
    font-size: 14px;
    font-weight: 400;
    letter-spacing: 0;
    color: var(--el-text-color-placeholder);
  }

  .mfa-btn {
    width: 100%;
    margin-top: 2px;
    border-radius: 10px;
  }

  .mfa-timer {
    margin-top: 14px;
    text-align: center;

    .mfa-progress {
      margin-bottom: 8px;
    }

    span {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }

    b {
      color: var(--el-text-color-primary);
      font-variant-numeric: tabular-nums;

      &.danger {
        color: var(--el-color-danger);
      }
    }
  }
}
</style>
