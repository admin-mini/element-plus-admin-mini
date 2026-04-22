<template>
  <admin-dialog-content v-loading="loading">
    <el-form ref="postForm" label-position="right" label-width="100px" :model="postData" :rules="rules">
      <admin-space cols="2">
        <el-form-item label="所在部门" prop="orgId" :rules="[$rules.required]" :span="2">
          <el-input v-model="postData.orgId"></el-input>
        </el-form-item>
        <el-form-item label="用户名" prop="username" :rules="[$rules.required,$rules.username]">
          <el-input v-model="postData.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password" :rules="[$rules.required]">
          <el-input type="password" v-model="postData.password"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="name" :rules="[$rules.required,$rules.phone]">
          <el-input v-model="postData.name"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email" :rules="[$rules.email]">
          <el-input v-model="postData.email"></el-input>
        </el-form-item>
        <el-form-item label="姓名" prop="name" >
          <el-input v-model="postData.name"></el-input>
        </el-form-item>
        <el-form-item label="昵称" prop="nickname" >
          <el-input v-model="postData.nickname"></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="gender" >
          <el-input v-model="postData.gender"></el-input>
        </el-form-item>
        <el-form-item label="生日" prop="birthday" >
          <el-input v-model="postData.birthday"></el-input>
        </el-form-item>
        <el-form-item label="用户角色" prop="orgId" :rules="[$rules.required]" :span="2">
          <el-input v-model="postData.roleIds"></el-input>
        </el-form-item>
      </admin-space>
     
    </el-form>
    <template #footer>
      <el-button type="primary" @click="submitForm(postForm)" :loading="loading">确定</el-button>
      <el-button @click="emits('end')">取消</el-button>
    </template>
  </admin-dialog-content>
</template>

<script setup>
import { userAdd, userEdit } from '@/api';
import { ref, reactive,onMounted } from 'vue'
import message from "@/utils/message"
import tool from "@/utils/tool"
import * as roleApi from "@/api/sys/role-api"



const emits = defineEmits(['end', 'success'])
const props = defineProps(["row"]);
const postForm = ref()
const loading = ref(false);
const postData = ref({
  orgId: '0',
  gender: 1,
  roleIds: []
})

const rules = {}


onMounted(()=>{
    if (props.row && props.row.id) {
        roleApi.getRoleDetail(props.row.id).then(resp=>{
          console.log("aaa",tool);
             postData.value = tool.cloneDeep(resp.data);
        })
    }
})

const submitForm = (formEl) => {
  formEl.validate((valid) => {
    if (valid) {
      let _postData = tool.cloneDeep(postData.value);

      let fn = !_postData.id ? roleApi.addRole : roleApi.editRole;
      loading.value = true

      fn(_postData).then(res => {
          message.success('保存成功')
          emits("success")
      }).finally(() => {
        loading.value = false;
      })
    } else {
      message.error("请填写完整信息")
    }
  })
}

</script>

<style lang="scss" scoped></style>