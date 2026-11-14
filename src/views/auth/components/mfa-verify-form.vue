<template>
  <div class="mfa-panel">
    <div class="mfa-head">
      <div class="mfa-badge">
        <el-icon :size="26"><Lock /></el-icon>
      </div>
      <h3 class="mfa-title">双重验证</h3>
      <p class="mfa-sub">请输入身份验证器中当前显示的 6 位动态码</p>
    </div>

    <div class="mfa-account">
      <el-icon><User /></el-icon>
      <span>{{ username }}</span>
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
        验证并登录
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
        验证请求剩余 <b :class="{ danger: remain <= 60 }">{{ remainText }}</b>，超时后请重新登录
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Lock, User } from '@element-plus/icons-vue'
import * as loginApi from '@/api/auth/auth-login-api'

const props = defineProps({
  mfaReqId: { type: String, required: true },
  userId: { type: [Number, String], required: true },
  username: { type: String, default: '' },
  expiresIn: { type: Number, default: 300 },
  onSuccess: { type: Function, default: () => {} }
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
const remain = ref(props.expiresIn)

const remainText = computed(() => {
  const m = String(Math.floor(remain.value / 60)).padStart(2, '0')
  const s = String(remain.value % 60).padStart(2, '0')
  return `${m}:${s}`
})
const percent = computed(() => {
  if (!props.expiresIn) return 0
  return Math.max(0, Math.round((remain.value / props.expiresIn) * 100))
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
      .loginMfaVerify({
        mfaReqId: props.mfaReqId,
        userId: props.userId,
        code: form.code
      })
      .then((res) => {
        ElMessage.success('验证成功')
        props.onSuccess(res.data)
      })
      .catch(() => {
        // 失败提示由请求拦截器统一处理，前端保留当前请求号供用户重试
        form.code = ''
      })
      .finally(() => {
        loading.value = false
      })
  })
}
</script>

<style scoped lang="scss">
.mfa-panel {
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

  .mfa-account {
    display: flex;
    gap: 6px;
    align-items: center;
    justify-content: center;
    margin: 16px auto 18px;
    padding: 7px 14px;
    width: fit-content;
    font-size: 13px;
    color: var(--el-text-color-regular);
    background: var(--el-fill-color-light);
    border-radius: 999px;
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
    margin-top: 16px;
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
