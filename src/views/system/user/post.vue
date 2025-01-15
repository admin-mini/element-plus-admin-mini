<template>
  <el-form ref="postForm" label-position="right" label-width="100px" :model="postData" :rules="rules">
    <div style="height:1px;padding-top:10px;overflow:hidden; ">
      <input type="text" name="userName" style="color:#FFF;border:none;outline:none;">
      <input type="password" name="password" style="color:#FFF;border:none;outline:none;">
    </div>
    <admin-space>
      <el-form-item label="用户昵称" prop="nickName">
        <el-input v-model="postData.nickName" placeholder="请输入用户昵称" maxlength="30" />
      </el-form-item>
      <el-form-item label="归属部门" prop="deptId">
        <el-tree-select v-model="postData.deptId" :data="deptOptions"
          :props="{ value: 'id', label: 'label', children: 'children' }" value-key="id" placeholder="请选择归属部门"
          check-strictly />
      </el-form-item>
      <el-form-item label="账号" prop="手机号码">
        <el-input v-model="postData.手机号码"></el-input>
      </el-form-item>
      <el-form-item label="账号" prop="email">
        <el-input v-model="postData.email"></el-input>
      </el-form-item>
      <el-form-item label="账号" prop="username" :rules="[$rules.required]">
        <el-input v-model="postData.username"></el-input>
      </el-form-item>

      <el-form-item label="密码" prop="passWord" v-if="!props.row"
        :rules="[$rules.required, $rules.checkPassword(postData, 'rePassWord', postForm)]">
        <el-input v-model="postData.passWord" type="password" show-password></el-input>
      </el-form-item>
      <el-form-item label="重复密码" prop="rePassWord" v-if="!props.row"
        :rules="[$rules.required, $rules.checkPassword(postData, 'passWord', postForm)]">
        <el-input v-model="postData.rePassWord" type="password" show-password></el-input>
      </el-form-item>
      <el-form-item label="性别" prop="sex">
        <select-dict :dict='$dict.sys_user_sex' v-model="postData.sex"></select-dict>
      </el-form-item>
      <el-form-item label="性别" prop="sex">
        <el-radio-group v-model="postData.status">
          <el-radio v-for="status in $dict.sys_normal_disable" :key="status.value" :label="status.value">{{ status.label
            }}</el-radio>
        </el-radio-group>
      </el-form-item>

    </admin-space>
    <el-form-item class="admin-dialog-btns">
      <el-button type="primary" @click="submitForm(postForm)" :loading="loading">确定</el-button>
      <el-button @click="emits('end')">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { systemUserDeptTree, updateUser, addUser, } from '@/api';
import { getDict } from '@/utils/dict';
import { ElMessage } from 'element-plus';
import { ref, } from 'vue'
getDict(['sys_normal_disable', 'sys_user_sex'])
const emits = defineEmits(['end', 'success'])
const props = defineProps(["row"]);
const postForm = ref()
const loading = ref(false);
const deptOptions = ref([])
const postData = ref({
  username: '',
  passWord: '',
  rePassWord: '',
  nickName: "",
  status: "0"
})
systemUserDeptTree().then(res => {
  if (res.data.code == 200) {
    deptOptions.value = res.data.data
  }
}
)
if (props.row) {
  Object.assign(postData.value, props.row)
}
const rules = {}

const submitForm = (formEl) => {
  formEl.validate((valid) => {
    if (valid) {
      let fn = props.row ? updateUser : addUser;
      fn(postData.value).then(res => {
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