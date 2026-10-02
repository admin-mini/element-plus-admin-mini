<template>
  <div class="admin-account-picker">
    <!-- 已确认账号 -->
    <div v-if="confirmedUser" class="account-confirmed">
      <div class="account-line">账号：<b>{{ confirmedUser.username }}</b></div>
      <div class="account-line">昵称：{{ confirmedUser.nickname || '-' }}</div>
      <el-button size="small" @click="reset">重新选择</el-button>
    </div>

    <!-- 查询确认流程 -->
    <template v-else>
      <div class="account-query-row">
        <el-input
          v-model="account"
          placeholder="请输入完整登录账号进行查询"
          :disabled="loading"
          clearable
          @keyup.enter="query"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-button type="primary" icon="Search" :loading="loading" :disabled="!account.trim()" @click="query">查询</el-button>
      </div>

      <div v-if="foundUser" class="account-card">
        <div class="account-line">账号：<b>{{ foundUser.username }}</b></div>
        <div v-if="foundUser.nickname" class="account-line">昵称：{{ foundUser.nickname }}</div>
        <div v-if="foundUser.phone" class="account-line">手机：{{ foundUser.phone }}</div>
        <el-button type="primary" class="account-confirm-btn" size="small" @click="confirm">确认该账号</el-button>
      </div>
      <el-alert v-else-if="queried && notFound" type="warning" :closable="false" show-icon title="未找到该账号，请核对后重试" />
      <el-alert v-else-if="queried && errorMsg" type="error" :closable="false" show-icon :title="errorMsg" />
      <div v-else class="account-tip">请输入正确的登录账号进行查询并确认</div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { queryUserByAccount } from '@/api/sys/account-api'

const props = defineProps({
  modelValue: { type: Object, default: null },
  disabled: { type: Boolean, default: false }
})
const emits = defineEmits(['update:modelValue'])

const account = ref('')
const loading = ref(false)
const queried = ref(false)
const notFound = ref(false)
const errorMsg = ref('')
const foundUser = ref(null)
const confirmedUser = ref(null)

/** 已传入默认值时，视为已确认 */
onMounted(() => {
  if (props.modelValue) {
    confirmedUser.value = props.modelValue
    account.value = props.modelValue.username || ''
  }
})

/** 按完整账号查询平台用户 */
function query() {
  if (!account.value.trim() || loading.value) return
  loading.value = true
  queried.value = false
  notFound.value = false
  errorMsg.value = ''
  foundUser.value = null
  queryUserByAccount(account.value.trim())
    .then((resp) => {
      queried.value = true
      if (resp.data && (resp.data.username || resp.data.id)) {
        foundUser.value = resp.data
      } else {
        notFound.value = true
      }
    })
    .catch((err) => {
      queried.value = true
      errorMsg.value = err?.msg || err?.message || '查询失败'
    })
    .finally(() => {
      loading.value = false
    })
}

/** 确认为管理员 */
function confirm() {
  if (!foundUser.value) return
  confirmedUser.value = foundUser.value
  emits('update:modelValue', foundUser.value)
}

/** 重新选择 */
function reset() {
  confirmedUser.value = null
  foundUser.value = null
  queried.value = false
  emits('update:modelValue', null)
}
</script>

<style scoped>
.admin-account-picker { display: flex; flex-direction: column; }
.account-query-row { display: flex; gap: 12px; width: 100%; }
.account-confirmed,
.account-card { padding: 12px 16px; border-radius: 6px; background: #f0f9eb; border: 1px solid #b7eb8f; }
.account-card { background: #f0f9eb; }
.account-confirmed { background: #f4f4f5; border-color: var(--el-border-color); }
.account-line { margin: 2px 0; font-size: 14px; color: var(--el-text-color-regular); }
.account-sub { margin: 2px 0 8px; font-size: 12px; color: var(--el-text-color-secondary); }
.account-confirm-btn { margin-top: 8px; }
.account-tip { font-size: 13px; color: var(--el-text-color-secondary); margin-top: 4px; }
</style>