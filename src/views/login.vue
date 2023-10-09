<template>
  <div class="admin-login-container">
    <div class="header" @click="systemStore.increment">
      <el-icon size="54px">
        <Notification />
      </el-icon>
      管理平台
    </div>
    <div class="admin-login">
      <div class="admin-login-banner">
        <img src="/static/login-banner.png" />
      </div>
      <div class="admin-login-form">
        <h3 class="title">管理员登录</h3>

        <el-form :model="postData" :rules="rules" @submit.prevent="submit" ref="postForm">
          <el-form-item label="" prop="userName" style="margin-bottom: 40px">
            <el-input autocomplete="off" v-model="postData.userName" placeholder="请输入登录账号"></el-input>
          </el-form-item>
          <el-form-item label="" prop="passWord" style="margin-bottom: 40px">
            <el-input v-model="postData.passWord" type="password" placeholder="请输入登录密码"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button native-type="submit" autocomplete="off" :loading="loading" type="primary"
              class="admin-block-button login-btn">
              登录
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import md5 from '@/utils/md5.js'
import { ElMessage } from 'element-plus'
import { reactive, ref } from 'vue'
import { userLogin } from '@/api/index'
import { useSystemStore } from '@/stores/index'
import $rules from '@/utils/rules'
import { useRouter } from 'vue-router'
const router = useRouter()
const postForm = ref()
const systemStore = useSystemStore()
const postData = reactive({
  userName: 'admin',
  passWord: "123456"
})

const rules = reactive({
  userName: [$rules.required]
})
const loading = ref(false)

function submit() {
  postForm.value.validate((valid) => {
    if (valid) {
      let _postData = Object.assign({}, postData)
      _postData.passWord = md5(_postData.passWord, 32)
      loading.value = true
      userLogin(_postData)
        .then((res) => {
          if (res.data.code == 0) {
            systemStore.login(res.data.data)
            router.replace('/')
          } else {
            ElMessage.error(res.data.msg)
          }
        })
        .finally(() => {
          loading.value = false
        })
    } else {
      ElMessage.warning('请填写完整信息')
    }
  })
}
</script>

<style lang="scss">
.admin-login-container {
  width: 100%;
  height: 100%;
  background: url('/static/login-bg.png') no-repeat;
  background-attachment: fixed;
  background-size: cover;
  overflow: auto;

  .login-download {
    display: flex;
    justify-content: space-between;
    padding: 0 20px;
  }

  .header {
    display: flex;
    align-items: center;
    font-size: 36px;
    color: #fff;
    padding: 50px;

    img {
      margin-right: 24px;
    }
  }

  .admin-login {
    background: #ffffff;
    border-radius: 10px;
    padding: 30px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 1260px;
    height: 700px;
    box-sizing: border-box;
  }

  .admin-login-banner {
    overflow: hidden;
    height: 100%;
    display: flex;
    align-items: center;

    img {
      height: 100%;
    }
  }

  .login-btn {
    height: 54px;
    line-height: 54px;
    font-size: 20px;
    padding: 0;
  }

  .admin-login-form {
    width: 378px;
    flex-shrink: 0;
    padding: 0 90px;

    .title {
      text-align: center;
      font-size: 30px;
      color: $color-primary;
    }

    .el-input__inner {
      border-color: #9dc0fc;
      height: 54px;
      line-height: 54px;
      font-size: 18px;
    }
  }
}
</style>