<template>
   <div class="admin-view">
      <el-row :gutter="20">
         <el-col :span="6" :xs="24">
            <el-card class="box-card">
               <template #header>
                  <div class="clearfix">
                     <span>个人信息</span>
                  </div>
               </template>
               <div>
                  <div style="text-align:center">
                     <userAvatar />
                  </div>
                  <ul class="list-group list-group-striped">
                     <li class="list-group-item">
                        <svg-icon name="user" />用户名称
                        <div class="pull-right">{{ state.user.userName }}</div>
                     </li>
                     <li class="list-group-item">
                        <svg-icon name="phone" />手机号码
                        <div class="pull-right">{{ state.user.phonenumber }}</div>
                     </li>
                     <li class="list-group-item">
                        <svg-icon name="email" />用户邮箱
                        <div class="pull-right">{{ state.user.email }}</div>
                     </li>
                     <li class="list-group-item">
                        <svg-icon name="tree" />所属部门
                        <div class="pull-right" v-if="state.user.dept">{{ state.user.dept.deptName }} / {{
                           state.postGroup }}</div>
                     </li>
                     <li class="list-group-item">
                        <svg-icon name="peoples" />所属角色
                        <div class="pull-right">{{ state.roleGroup }}</div>
                     </li>
                     <li class="list-group-item">
                        <svg-icon name="date" />创建日期
                        <div class="pull-right">{{ state.user.createTime }}</div>
                     </li>
                  </ul>
               </div>
            </el-card>
         </el-col>
         <el-col :span="18" :xs="24">
            <el-card>
               <template v-slot:header>
                  <div class="clearfix">
                     <span>基本资料</span>
                  </div>
               </template>
               <el-tabs v-model="activeTab">
                  <el-tab-pane label="基本资料" name="userinfo">
                     <userInfo :user="state.user" />
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
import { getUserProfile } from "@/api/system/user";

const activeTab = ref("userinfo");
const state = ref({
   user: {},
   roleGroup: {},
   postGroup: {}
});

function getUser() {
   getUserProfile().then(response => {
      state.value.user = response.data;
      state.value.roleGroup = response.roleGroup;
      state.value.postGroup = response.postGroup;
   });
};

getUser();
</script>
<style scoped>
.avatar-upload-preview {
   position: absolute;
   top: 50%;
   transform: translate(50%, -50%);
   width: 200px;
   height: 200px;
   border-radius: 50%;
   box-shadow: 0 0 4px #ccc;
   overflow: hidden;
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
