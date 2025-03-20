<template>
  <div class="admin-login-container">
    <div class="admin-login">
      <div class="admin-login-form">
        <h3 class="title">
          <el-icon size="40px">
            <Notification />
          </el-icon>
          {{ $env.VITE_APP_NAME }}
        </h3>

        <el-form :model="postData" :rules="rules" @submit.prevent="submit" ref="postForm">
          <el-form-item label="" prop="userName" style="margin-bottom: 40px">
            <el-input autocomplete="off" v-model="postData.userName" placeholder="请输入登录账号"></el-input>
          </el-form-item>
          <el-form-item label="" prop="passWord" style="margin-bottom: 40px">
            <el-input v-model="postData.passWord" type="password" placeholder="请输入登录密码"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button
              native-type="submit"
              autocomplete="off"
              :loading="loading"
              type="primary"
              class="admin-block-button login-btn"
            >
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
import { useTagView } from '@/stores/tag-view'
const router = useRouter()
const postForm = ref()
const systemStore = useSystemStore()
const postData = reactive({
  userName: 'admin',
  passWord: "123456"
})
useTagView().clearAll();
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
  justify-self: center;

  .admin-login {
    width: 500px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
    /* 渐变背景 */
    border: 1px solid rgba(255, 255, 255, 0.05);
    /* 透明白色背景 */
    border-radius: 15px;
    // backdrop-filter: blur(10px);
    /* 毛玻璃效果 */
    // box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    // background: linear-gradient(135deg, rgba(255, 255, 255, 1), rgba(255, 255, 255, 1));
    /* 渐变背景 */
  }

  .login-btn {
    height: 45px;
    line-height: 45px;
    font-size: 20px;
    padding: 0;
  }

  .admin-login-form {
    width: 100%;
    padding: 15px 30px;

    .title {
      display: flex;
      align-items: center;
      // justify-content: center;
      font-size: 35px;
      font-weight: normal;
      color: var(--el-color-primary);
      font-weight: 300;
    }

    .el-input__inner {
      height: 45px;
      line-height: 45px;
      font-size: 18px;
    }
  }
}
</style>