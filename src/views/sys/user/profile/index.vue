<template>
  <div class="admin-view">
    <el-row :gutter="20">
      <el-col :span="8" :xs="24">
        <el-card class="box-card">
          <template #header>
            <div class="clearfix">
              <span>个人信息</span>
            </div>
          </template>
          <div class="avatar-wrap">
            <userAvatar />
          </div>
          <ul class="list-group list-group-striped">
            <li class="list-group-item">
              <svg-icon name="user" />用户ID
              <div class="pull-right">{{ user?.id ?? '-' }}</div>
            </li>
            <li class="list-group-item">
              <svg-icon name="user" />用户姓名
              <div class="pull-right">{{ user?.name ?? '-' }}</div>
            </li>
          </ul>
        </el-card>
      </el-col>
      <el-col :span="16" :xs="24">
        <el-card>
          <template v-slot:header>
            <div class="clearfix">
              <span>基本资料</span>
            </div>
          </template>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本资料" name="userinfo">
              <userInfo :user="user" />
            </el-tab-pane>
            <el-tab-pane label="修改密码" name="resetPwd">
              <resetPwd />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import userAvatar from "./userAvatar.vue";
import userInfo from "./userInfo.vue";
import resetPwd from "./resetPwd.vue";
import { useSystemStore } from "@/stores";

const systemStore = useSystemStore();
const activeTab = ref("userinfo");

// 当前登录用户信息（登录时由 store 从 /auth/user/getLoginUser 获取）
const user = computed(() => systemStore.state?.user || {});
</script>
<style scoped>
.avatar-wrap {
  text-align: center;
  padding: 8px 0 16px;
}

.list-group-striped>.list-group-item {
  border-left: 0;
  border-right: 0;
  border-radius: 0;
  padding-left: 0;
  padding-right: 0;
}

.list-group {
  padding-left: 0px;
  list-style: none;
}

.list-group-item {
  border-bottom: 1px solid #e7eaec;
  border-top: 1px solid #e7eaec;
  margin-bottom: -1px;
  padding: 11px 0px;
  font-size: 13px;
}

.list-group-item .el-icon {
  margin-right: 10px;
}

.list-group-item .pull-right {
  float: right;
}
</style>
