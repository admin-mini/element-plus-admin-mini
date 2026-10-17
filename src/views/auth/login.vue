<template>
  <div class="admin-login-container">
    <div class="admin-login">
      <!-- 左侧：科技感配图 -->
      <div class="admin-login-banner">
        <img class="banner-img" :src="bannerUrl" alt="科技感配图" />
        <!-- 左下角版权信息，取自系统配置 -->
        <div class="banner-footer">
          <p class="footer-title">
            <el-icon><Notification /></el-icon>
            {{ sysInfo.sys_title || '管理平台' }}
          </p>
          <p v-if="sysInfo.sys_tel">客服电话：{{ sysInfo.sys_tel }}</p>
          <p v-if="sysInfo.sys_email">联系邮箱：{{ sysInfo.sys_email }}</p>
        </div>
      </div>

      <!-- 右侧：登录表单 -->
      <div class="admin-login-form">
        <h3 class="title">
          <el-icon size="32">
            <Notification />
          </el-icon>
          欢迎登录
        </h3>
        <p class="sub-title">请输入账号信息以继续</p>

        <!-- 账号密码登录 -->
        <el-form
          v-if="loginMethod === 'password'"
          :model="pwdForm"
          :rules="pwdRules"
          @submit.prevent="submitPassword"
          ref="pwdFormRef"
        >
          <el-form-item prop="username">
            <el-input autocomplete="off" v-model="pwdForm.username" placeholder="请输入用户名" :prefix-icon="User" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="pwdForm.password"
              type="password"
              show-password
              placeholder="请输入密码"
              :prefix-icon="Lock"
            />
          </el-form-item>
          <el-form-item v-if="captchaOpen" prop="validCode">
            <div class="captcha-row">
              <el-input
                v-model="pwdForm.validCode"
                placeholder="请输入验证码"
                :prefix-icon="Key"
                maxlength="6"
              />
              <nuocao-image-captcha
                ref="loginCaptchaRef"
                :fn="loginApi.getLoginPicCaptcha"
                :width="120"
                :height="45"
                @success="onLoginCaptcha"
              />
            </div>
          </el-form-item>
          <el-form-item>
            <el-button native-type="submit" autocomplete="off" :loading="loading" type="primary"
              class="admin-block-button login-btn">
              登 录
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 手机验证码登录 -->
        <el-form
          v-else
          :model="smsForm"
          :rules="smsRules"
          @submit.prevent="submitSms"
          ref="smsFormRef"
        >
          <el-form-item prop="phone">
            <el-input v-model="smsForm.phone" placeholder="请输入手机号" :prefix-icon="Iphone" maxlength="11" />
          </el-form-item>
          <el-form-item prop="validCode">
            <div class="captcha-row">
              <el-input
                v-model="smsForm.validCode"
                placeholder="请输入短信验证码"
                :prefix-icon="Message"
                maxlength="6"
              />
              <nuocao-sms-btn
                :phone="smsForm.phone"
                :image-captcha-api-fn="loginApi.getLoginPicCaptcha"
                :sms-api-fn="loginApi.getPhoneLoginValidCode"
                size="large"
                @success="(reqId) => (smsForm.validCodeReqId = reqId)"
              />
            </div>
          </el-form-item>
          <el-form-item>
            <el-button native-type="submit" autocomplete="off" :loading="loading" type="primary"
              class="admin-block-button login-btn">
              登 录
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 登录方式切换 -->
        <div v-if="loginMethods.length > 1" class="login-method-switch">
          <template v-for="(m, index) in loginMethods" :key="m">
            <el-divider v-if="index > 0" direction="vertical" />
            <el-button link :type="m === loginMethod ? 'primary' : 'info'" @click="switchMethod(m)">
              {{ methodLabels[m] }}
            </el-button>
          </template>
        </div>

        <!-- 注册 / 找回密码入口 -->
        <div v-if="registerEnable || findPasswordEnable" class="login-extra-links">
          <el-button v-if="registerEnable" link type="primary" @click="openRegister">注册账号</el-button>
          <el-button v-if="findPasswordEnable" link type="info" @click="openFindPassword">忘记密码</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { User, Lock, Key, Iphone, Message } from '@element-plus/icons-vue'
import * as loginApi from '@/api/auth/auth-login-api'
import * as configApi from '@/api/dev/config-api'
import { useSystemStore } from '@/stores/index'
import $rules from '@/utils/rules'
import { useRouter } from 'vue-router'
import { useTagView } from '@/stores/tag-view'
import useAdminDialog from '@/plugins/use-admin-dialog'
import smCrypto from '@/utils/smCrypto'
// 登录页左侧科技感配图（本地资源，避免外链过期）
import bannerUrl from '@/assets/images/login-banner.jpg'

const router = useRouter()
const systemStore = useSystemStore()
useTagView().clearAll()

// 系统配置，由 sysConfigList 的 [{configKey, configValue}] 转为 key/value
const sysInfo = reactive({
  sys_title: '',
  sys_tel: '',
  sys_email: '',
  auth_login_captcha_open: '',
  account_register_enable: '',
  account_register_sms_code_enable: '',
  account_login_methods: '',
  account_find_password_enable: ''
})

// 配置值兼容 '1' 与 'true' 两种开启写法（配置管理页 switch 存 'true'/'false'）
const isOn = (val) => val === '1' || val === 'true'

// 登录图片验证码开关（auth_login_captcha_open）
const captchaOpen = computed(() => isOn(sysInfo.auth_login_captcha_open))
// 注册开关
const registerEnable = computed(() => isOn(sysInfo.account_register_enable))
// 注册短信验证码开关
const registerSmsEnable = computed(() => isOn(sysInfo.account_register_sms_code_enable))
// 找回密码开关
const findPasswordEnable = computed(() => isOn(sysInfo.account_find_password_enable))

// 登录方式：解析 account_login_methods（逗号分隔，如 password,sms），缺省仅密码登录
const methodLabels = { password: '账号密码登录', sms: '手机验证码登录' }
const loginMethods = computed(() => {
  const list = (sysInfo.account_login_methods || '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => methodLabels[s])
  return list.length ? list : ['password']
})
const loginMethod = ref('password')
// 配置加载后若当前方式不可用，回退到第一个可用方式
watch(loginMethods, (list) => {
  if (!list.includes(loginMethod.value)) loginMethod.value = list[0]
})

const loading = ref(false)

/* ---------------- 账号密码登录 ---------------- */
const pwdFormRef = ref()
const loginCaptchaRef = ref()
const pwdForm = reactive({
  username: import.meta.env.DEV ? 'superAdmin' : '',
  password: import.meta.env.DEV ? '123456' : '',
  validCode: '',
  validCodeReqId: ''
})
const pwdRules = computed(() => ({
  username: [$rules.required],
  password: [$rules.required],
  // 仅在开启图片验证码时校验必填
  ...(captchaOpen.value ? { validCode: [$rules.required] } : {})
}))

// 图片验证码刷新成功后同步请求号
function onLoginCaptcha(data) {
  pwdForm.validCodeReqId = data.validCodeReqId
}

function submitPassword() {
  // 重入守卫：回车/点击/双击只触发一次提交
  if (loading.value) return
  pwdFormRef.value.validate((valid) => {
    if (!valid) {
      ElMessage.warning('请填写完整信息')
      return
    }
    const postData = {
      username: pwdForm.username,
      password: smCrypto.doEncrypt(pwdForm.password)
    }
    // 开启验证码时携带验证码与请求号
    if (captchaOpen.value) {
      postData.validCode = pwdForm.validCode
      postData.validCodeReqId = pwdForm.validCodeReqId
    }
    loading.value = true
    loginApi
      .login(postData)
      .then((res) => {
        systemStore.login(res.data)
        router.replace('/')
      })
      .catch(() => {
        // 登录失败刷新图片验证码，避免旧请求号复用
        if (captchaOpen.value) {
          pwdForm.validCode = ''
          loginCaptchaRef.value?.getCaptcha()
        }
      })
      .finally(() => {
        loading.value = false
      })
  })
}

/* ---------------- 手机验证码登录 ---------------- */
const smsFormRef = ref()
const smsForm = reactive({
  phone: '',
  validCode: '',
  // 短信验证码请求号，由 nuocao-sms-btn 发送成功后回传
  validCodeReqId: ''
})
const smsRules = reactive({
  phone: [$rules.required, $rules.phone],
  validCode: [$rules.required]
})

function submitSms() {
  // 重入守卫：回车/点击/双击只触发一次提交
  if (loading.value) return
  smsFormRef.value.validate((valid) => {
    if (!valid) {
      ElMessage.warning('请填写完整信息')
      return
    }
    if (!smsForm.validCodeReqId) {
      ElMessage.warning('请先获取短信验证码')
      return
    }
    loading.value = true
    loginApi
      .loginByPhone({
        phone: smsForm.phone,
        validCode: smsForm.validCode,
        validCodeReqId: smsForm.validCodeReqId
      })
      .then((res) => {
        systemStore.login(res.data)
        router.replace('/')
      })
      .finally(() => {
        loading.value = false
      })
  })
}

// 切换登录方式时清理校验状态
function switchMethod(m) {
  loginMethod.value = m
  pwdFormRef.value?.clearValidate()
  smsFormRef.value?.clearValidate()
}

/* ---------------- 注册 / 找回密码（adminDialog 编程式弹窗） ---------------- */
const adminDialog = useAdminDialog()

// 注册：成功后回填账号并切到密码登录，减少重复输入
function openRegister() {
  adminDialog({
    component: import('./components/register-form.vue'),
    props: {
      smsEnable: registerSmsEnable.value,
      onSuccess: (username) => {
        pwdForm.username = username
        pwdForm.password = ''
        loginMethod.value = 'password'
      }
    },
    dialogProps: { title: '注册账号', width: '480px' }
  })
}

function openFindPassword() {
  adminDialog({
    component: import('./components/find-password-form.vue'),
    dialogProps: { title: '找回密码', width: '480px' }
  })
}

onMounted(() => {
  // 加载系统基础配置，将 [{configKey, configValue}] 列表转为 key/value 使用
  configApi
    .getSysConfigList()
    .then((res) => {
      ;(res.data || []).forEach((item) => {
        if (item?.configKey && item.configKey in sysInfo) sysInfo[item.configKey] = item.configValue
      })
    })
    // 基础信息非登录必需，失败时不打断登录页
    .catch(() => {})
})
</script>

<style lang="scss">
.admin-login-container {
  width: 100%;
  height: 100%;
  background-color: #ecf3ff;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 800 400'%3E%3Cdefs%3E%3CradialGradient id='a' cx='396' cy='281' r='514' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='0' stop-color='%23C7DAED'/%3E%3Cstop offset='1' stop-color='%23ECF3FF'/%3E%3C/radialGradient%3E%3ClinearGradient id='b' gradientUnits='userSpaceOnUse' x1='400' y1='148' x2='400' y2='333'%3E%3Cstop offset='0' stop-color='%23FFFFFF' stop-opacity='0'/%3E%3Cstop offset='1' stop-color='%23FFFFFF' stop-opacity='0.5'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23a)' width='800' height='400'/%3E%3Cg fill-opacity='0.4'%3E%3Ccircle fill='url(%23b)' cx='267.5' cy='61' r='300'/%3E%3Ccircle fill='url(%23b)' cx='532.5' cy='61' r='300'/%3E%3Ccircle fill='url(%23b)' cx='400' cy='30' r='300'/%3E%3C/g%3E%3C/svg%3E");
  background-attachment: fixed;
  background-size: cover;
  display: flex;
  align-items: center;
  justify-content: center;

  .admin-login {
    width: 900px;
    max-width: calc(100% - 40px);
    min-height: 520px;
    margin: 0 auto;
    display: flex;
    align-items: stretch;
    overflow: hidden;
    box-sizing: border-box;
    border-radius: 16px;
    background-color: #fff;
    box-shadow: 0 20px 60px rgba(31, 66, 135, 0.15);
  }

  /* 左侧图片区域 */
  .admin-login-banner {
    position: relative;
    flex: 0 0 45%;
    overflow: hidden;
    background: linear-gradient(135deg, #1f6feb, #4c9aff);

    .banner-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    /* 左下角版权信息 */
    .banner-footer {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      padding: 24px 32px 26px;
      color: #fff;
      font-size: 13px;
      line-height: 1.8;
      background: linear-gradient(180deg, rgba(6, 26, 66, 0) 0%, rgba(6, 26, 66, 0.65) 100%);

      p {
        margin: 0;
      }

      .footer-title {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 4px;
        font-size: 16px;
        font-weight: 600;
        letter-spacing: 1px;
      }
    }
  }

  /* 右侧表单区域 */
  .admin-login-form {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 48px 56px;
    box-sizing: border-box;

    .title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      font-size: 26px;
      font-weight: 500;
      color: var(--el-color-primary);
    }

    .sub-title {
      margin: 10px 0 32px;
      font-size: 14px;
      color: #8a94a6;
    }

    .el-input__inner {
      height: 45px;
      line-height: 45px;
      font-size: 16px;
    }
  }

  /* 验证码输入行（登录页大输入框场景） */
  .admin-login-form .captcha-row {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;

    .el-input {
      flex: 1;
    }

    /* 获取验证码按钮与 45px 大输入框高度对齐（覆盖 EP large 按钮的 40px） */
    > .el-button {
      height: 45px;
      padding: 0 18px;
      flex-shrink: 0;
    }
  }

  /* 登录方式切换 */
  .login-method-switch {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 4px;
  }

  /* 注册 / 找回密码入口 */
  .login-extra-links {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 8px;
  }

  .login-btn {
    margin-top: 8px;
    height: 45px;
    line-height: 45px;
    font-size: 17px;
    letter-spacing: 4px;
    padding: 0;
  }

  /* 小屏幕下隐藏左侧配图，表单占满 */
  @media (max-width: 768px) {
    .admin-login {
      min-height: auto;
    }

    .admin-login-banner {
      display: none;
    }

    .admin-login-form {
      padding: 40px 28px;
    }
  }
}

/* 对话框内验证码输入行（默认高度输入框场景），非 scoped 以覆盖弹窗 */
.el-dialog .captcha-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;

  .el-input {
    flex: 1;
  }
}
</style>
