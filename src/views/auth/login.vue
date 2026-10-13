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

        <el-form :model="postData" :rules="rules" @submit.prevent="submit" ref="postForm">
          <el-form-item prop="username">
            <el-input autocomplete="off" v-model="postData.username" placeholder="请输入用户名" :prefix-icon="User" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="postData.password"
              type="password"
              show-password
              placeholder="请输入密码"
              :prefix-icon="Lock"
              @keyup.enter="submit"
            />
          </el-form-item>
          <el-form-item>
            <el-button native-type="submit" autocomplete="off" :loading="loading" type="primary"
              class="admin-block-button login-btn">
              登 录
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'
import  * as loginApi  from '@/api/auth/auth-login-api'
import * as configApi from '@/api/dev/config-api'
import { useSystemStore } from '@/stores/index'
import $rules from '@/utils/rules'
import { useRouter } from 'vue-router'
import { useTagView } from '@/stores/tag-view'
import smCrypto from '@/utils/smCrypto'
// 登录页左侧科技感配图（本地资源，避免外链过期）
import bannerUrl from '@/assets/images/login-banner.jpg'

const router = useRouter()
const postForm = ref()
const systemStore = useSystemStore()

// 系统基础信息，由 sysConfigList 的 key/value 列表转换而来
const sysInfo = reactive({
  sys_title: '',
  sys_tel: '',
  sys_email: '',
  login_mode: '',
  register_enable: ''
})
const postData = reactive({
  username: import.meta.env.DEV?'superAdmin':'',
  password: import.meta.env.DEV?"123456":""
})
useTagView().clearAll();
const rules = reactive({
  username: [$rules.required],
  password: [$rules.required]
})
const loading = ref(false)

function submit() {
  postForm.value.validate((valid) => {
    if (valid) {
      let _postData = Object.assign({}, postData)
      _postData.password = smCrypto.doEncrypt(_postData.password)
      loading.value = true
      loginApi.login(_postData)
        .then((res) => {
          systemStore.login(res.data)
          router.replace('/')
        })
        .finally(() => {
          loading.value = false
        })
    } else {
      ElMessage.warning('请填写完整信息')
    }
  })
}

onMounted(() => {
  // 加载系统基础配置，将 [{configKey, configValue}] 列表转为 key/value 使用
  configApi
    .getSysConfigList()
    .then(res => {
      ;(res.data || []).forEach(item => {
        if (item?.configKey) sysInfo[item.configKey] = item.configValue
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
</style>
