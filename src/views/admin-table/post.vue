<template>
  <el-form ref="postForm" label-position="right" label-width="100px" :model="postData" :rules="rules">
    <div style="height:1px;padding-top:10px;overflow:hidden; ">
      <input type="text" name="userName" style="color:#FFF;border:none;outline:none;">
      <input type="password" name="password" style="color:#FFF;border:none;outline:none;">
    </div>
    <el-form-item label="账号" prop="username" :rules="[$rules.required]">
      <el-input v-model="postData.username"></el-input>
    </el-form-item>
    <el-form-item label="用户姓名" prop="nickName" :rules="[$rules.required]">
      <el-input v-model="postData.nickName"></el-input>
    </el-form-item>
    <el-form-item label="密码" prop="passWord" v-if="!props.row"
      :rules="[$rules.required, $rules.checkPassword(postData, 'rePassWord', postForm)]">
      <el-input v-model="postData.passWord" type="password"></el-input>
    </el-form-item>
    <el-form-item label="重复密码" prop="rePassWord" v-if="!props.row"
      :rules="[$rules.required, $rules.checkPassword(postData, 'passWord', postForm)]">
      <el-input v-model="postData.rePassWord" type="password"></el-input>
    </el-form-item>
    <el-form-item class="admin-dialog-btns">
      <el-button type="primary" @click="submitForm(postForm)" :loading="loading">确定</el-button>
      <el-button @click="emits('end')">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import md5 from '@/utils/md5.js'
import { userAdd, userEdit } from '@/api';
import { ElMessage } from 'element-plus';
import { ref, reactive, } from 'vue'
const emits = defineEmits(['end', 'success'])
const props = defineProps(["row"]);
const postForm = ref()
const loading = ref(false);
const postData = reactive({
  username: '',
  passWord: '',
  rePassWord: '',
  nickName: ""
})
if (props.row) {
  Object.assign(postData, props.row)
}
const rules = {}

const submitForm = (formEl) => {
  formEl.validate((valid) => {
    if (valid) {
      let fn = props.row ? userEdit : userAdd;
      loading.value = true
      let _postData = JSON.parse(JSON.stringify(postData))
      _postData.passWord = md5(_postData.passWord, 32)
      delete _postData.rePassWord;
      if (props.row) {
        delete _postData.passWord;
      }
      fn(_postData).then(res => {
        if (res.data.code == 0) {
          ElMessage.success(res.data.msg)
          emits("success")
        } else {
          ElMessage.error(res.data.msg)
        }
      }).finally(() => {
        loading.value = false;
      })
    } else {
      ElMessage.error("请填写完整信息")
    }
  })
}

</script>

<style lang="scss" scoped></style>