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
              <div class="pull-right">{{ profile?.id ?? '-' }}</div>
            </li>
            <li class="list-group-item">
              <svg-icon name="user" />用户姓名
              <div class="pull-right">{{ profile?.name ?? '-' }}</div>
            </li>
            <li class="list-group-item">
              <svg-icon name="phone" />手机号码
              <div class="pull-right">{{ profile?.phone ?? '-' }}</div>
            </li>
            <li class="list-group-item">
              <svg-icon name="email" />用户邮箱
              <div class="pull-right">{{ profile?.email ?? '-' }}</div>
            </li>
            <li class="list-group-item">
              <svg-icon name="user" />性别
              <div class="pull-right">{{ genderLabel }}</div>
            </li>
            <li class="list-group-item">
              <svg-icon name="date" />出生日期
              <div class="pull-right">{{ profile?.birthday ?? '-' }}</div>
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
              <userInfo :user="profile" @success="handleInfoSuccess" />
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
import { getProfile } from "@/api/sys/user-center-api";
import dict, { getDict } from "@/utils/dict";

const systemStore = useSystemStore();
const activeTab = ref("userinfo");

// 个人资料（由 /sys/userCenter/getProfile 获取）
const profile = ref({});

/** 性别显示：字典取标签，字典未加载/无匹配时回退原始值 */
const genderLabel = computed(() => {
  const val = profile.value.gender
  if (val === undefined || val === null || val === '') return '-'
  const item = dict.sys_gender.get(val)
  return item ? item.label : val
})

/** 拉取个人资料，并同步全局用户信息（顶部栏头像/昵称） */
function loadProfile() {
  getProfile().then(res => {
    const data = res.data || {};
    profile.value = data;
    const u = systemStore.state.user || {};
    if (data.id) u.id = data.id;
    if (data.name) u.name = data.name;
    if (data.avatar) u.avatar = data.avatar;
  }).catch(() => {});
}

/** 保存个人信息成功后刷新资料展示 */
function handleInfoSuccess() {
  loadProfile();
}

loadProfile();
getDict(['sys_gender']);
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
