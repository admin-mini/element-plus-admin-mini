<template>
  <div class="mfa-bind-setting">
    <el-descriptions :column="2" border>
      <el-descriptions-item label="绑定状态">
        <el-tag :type="statusTagType">{{ status.statusName || (status.bound ? '已启用' : '未绑定') }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="连续失败次数">{{ status.failedAttempts ?? 0 }}</el-descriptions-item>
      <el-descriptions-item label="启用时间">{{ status.activatedAt || '-' }}</el-descriptions-item>
      <el-descriptions-item label="最近验证时间">{{ status.lastUsedAt || '-' }}</el-descriptions-item>
      <el-descriptions-item label="锁定截止时间">{{ status.lockedUntil || '-' }}</el-descriptions-item>
      <el-descriptions-item label="说明">
        绑定后登录需要输入身份验证器中的动态码
      </el-descriptions-item>
    </el-descriptions>

    <div class="mfa-bind-actions">
      <el-button v-if="!status.bound" type="primary" :loading="initLoading" @click="handleBindInit">
        立即绑定身份验证器
      </el-button>
      <span v-else class="mfa-bound-tip">已启用双重验证，如需重置请联系管理员</span>
    </div>

    <div v-if="bindInfo.bindId" class="mfa-bind-box">
      <div class="mfa-bind-qr">
        <img v-if="bindInfo.qrCodeDataUrl" :src="bindInfo.qrCodeDataUrl" alt="2FA 绑定二维码" />
        <el-empty v-else description="二维码生成失败，请重新发起绑定" :image-size="80" />
      </div>
      <div class="mfa-bind-form">
        <p class="mfa-bind-tip">
          使用手机身份验证器（如 Google Authenticator）扫描二维码，然后输入生成的动态码完成绑定。
        </p>
        <el-form ref="formRef" :model="form" :rules="rules" @submit.prevent="handleConfirm">
          <el-form-item prop="code">
            <el-input v-model="form.code" maxlength="8" placeholder="请输入 6 位动态码" />
          </el-form-item>
          <el-form-item>
            <el-button native-type="submit" type="primary" :loading="confirmLoading">确认绑定</el-button>
            <el-button @click="resetBind">取消</el-button>
          </el-form-item>
        </el-form>
        <p class="mfa-bind-countdown">二维码剩余 {{ remain }} 秒有效</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import * as api from '@/api/sys/user-center-api'
import message from '@/utils/message'

const status = reactive({
  bound: false,
  statusName: '',
  activatedAt: '',
  lastUsedAt: '',
  lockedUntil: '',
  failedAttempts: 0
})
const bindInfo = reactive({ bindId: '', qrCodeDataUrl: '', expiresIn: 0 })
const formRef = ref()
const form = reactive({ code: '' })
const rules = {
  code: [{ required: true, message: '请输入动态码', trigger: 'blur' }]
}
const initLoading = ref(false)
const confirmLoading = ref(false)
const remain = ref(0)

const statusTagType = computed(() => (status.bound ? 'success' : 'info'))

let timer = null
function startCountdown(seconds) {
  remain.value = seconds
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    remain.value = Math.max(0, remain.value - 1)
    if (remain.value === 0) {
      clearInterval(timer)
      timer = null
    }
  }, 1000)
}
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

function loadStatus() {
  api
    .getMfaStatus()
    .then((res) => {
      Object.assign(status, res.data || {})
    })
    .catch(() => {})
}

function handleBindInit() {
  initLoading.value = true
  api
    .mfaBindInit()
    .then((res) => {
      const data = res.data || {}
      bindInfo.bindId = data.bindId
      bindInfo.qrCodeDataUrl = data.qrCodeDataUrl
      bindInfo.expiresIn = data.expiresIn || 0
      form.code = ''
      startCountdown(data.expiresIn || 0)
    })
    .catch(() => {})
    .finally(() => {
      initLoading.value = false
    })
}

function handleConfirm() {
  formRef.value.validate((valid) => {
    if (!valid) return
    confirmLoading.value = true
    api
      .mfaBindConfirm({ bindId: bindInfo.bindId, code: form.code })
      .then(() => {
        message.success('绑定成功')
        resetBind()
        loadStatus()
      })
      .catch(() => {
        form.code = ''
      })
      .finally(() => {
        confirmLoading.value = false
      })
  })
}

function resetBind() {
  bindInfo.bindId = ''
  bindInfo.qrCodeDataUrl = ''
  form.code = ''
  if (timer) clearInterval(timer)
  timer = null
}

loadStatus()
</script>

<style scoped lang="scss">
.mfa-bind-setting {
  .mfa-bind-actions {
    margin-top: 18px;
  }

  .mfa-bound-tip {
    font-size: 13px;
    color: #909399;
  }

  .mfa-bind-box {
    display: flex;
    gap: 24px;
    margin-top: 20px;
    padding: 18px;
    border: 1px solid #ebeef5;
    border-radius: 8px;
    background: #fafcff;
  }

  .mfa-bind-qr img {
    width: 180px;
    height: 180px;
    padding: 6px;
    border: 1px solid #ebeef5;
    border-radius: 8px;
    background: #fff;
  }

  .mfa-bind-form {
    flex: 1;
    max-width: 360px;
    padding-top: 8px;

    .mfa-bind-tip {
      margin: 0 0 14px;
      font-size: 13px;
      line-height: 1.7;
      color: #5c6470;
    }

    .mfa-bind-countdown {
      margin: 0;
      font-size: 12px;
      color: #909399;
    }
  }
}
</style>
