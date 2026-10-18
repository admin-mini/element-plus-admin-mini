<template>
  <div class="admin-view">
    <el-card>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="修改密码" name="pwdByOld">
          <updatePwdByOld />
        </el-tab-pane>
        <el-tab-pane label="绑定手机号" name="bindPhone">
          <bindPhone :username="detail.username" :phone="detail.phone" @success="loadDetail" />
        </el-tab-pane>
        <el-tab-pane label="手机号改密" name="pwdByPhone">
          <updatePwdByPhone :username="detail.username" :phone="detail.phone" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import updatePwdByOld from './modules/update-pwd-by-old.vue'
import bindPhone from './modules/bind-phone.vue'
import updatePwdByPhone from './modules/update-pwd-by-phone.vue'
import { getAccountDetail } from '@/api/sys/user-center-api'

// 账号设置：集中管理密码修改与手机号绑定，原先散落在个人信息页的修改密码已统一迁移至此
const activeTab = ref('pwdByOld')

// 账户详情（/sys/accountCenter/detail），其中 phone 由后端脱敏返回，用于展示当前绑定手机号
const detail = ref({})

/** 拉取当前登录账户详情 */
function loadDetail() {
  getAccountDetail()
    .then((res) => {
      detail.value = res.data || {}
    })
    .catch(() => {
      // 失败提示由请求拦截器统一处理，不影响页面展示
    })
}

loadDetail()
</script>
