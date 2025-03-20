<template>
  <admin-dialog-content>
    <el-form ref="postForm" label-position="right" label-width="100px" :model="postData">
      <div style="height: 1px; padding-top: 10px; overflow: hidden">
        <input type="text" name="userName" style="color: #fff; border: none; outline: none" />
        <input type="password" name="password" style="color: #fff; border: none; outline: none" />
      </div>
      <admin-space>
        <el-form-item label="用户类型" prop="userType" :rules="[$rules.required]">
          <select-dict :dict="$dict.userType" v-model="postData.userType"></select-dict>
        </el-form-item>
        <el-form-item label="用户昵称" prop="nickName" :rules="[$rules.required]">
          <el-input v-model="postData.nickName" placeholder="请输入用户昵称" maxlength="30" />
        </el-form-item>
        <el-form-item label="归属部门" prop="deptId">
          <el-tree-select v-model="postData.deptId" :data="deptOptions"
            :props="{ value: 'id', label: 'label', children: 'children' }" value-key="id" placeholder="请选择归属部门"
            check-strictly class="w-100%" clearable />
        </el-form-item>
        <el-form-item label="手机号码" prop="phonenumber" :rules="[$rules.required]">
          <el-input v-model="postData.phonenumber"></el-input>

        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="postData.email"></el-input>
        </el-form-item>
        <el-form-item label="账号" prop="userName" :rules="[$rules.required]">
          <el-input v-model="postData.userName"></el-input>
        </el-form-item>

        <el-form-item label="密码" prop="password" v-if="!props.row" :rules="[$rules.required]">
          <el-input v-model="postData.password" type="password" show-password></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <select-dict :dict="$dict.sys_user_sex" v-model="postData.sex"></select-dict>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="postData.status">
            <el-radio v-for="status in $dict.sys_normal_disable" :key="status.value" :value="status.value">
              {{ status.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="岗位">
          <el-select v-model="postData.postIds" multiple placeholder="请选择">
            <el-option v-for="item in postOptions" :key="item.postId" :label="item.postName" :value="item.postId"
              :disabled="item.status == 1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="角色" :rules="[$rules.required]">
          <el-select v-model="postData.roleIds" multiple placeholder="请选择">
            <el-option v-for="item in roleOptions" :key="item.roleId" :label="item.roleName" :value="item.roleId"
              :disabled="item.status == 1"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="备注" span="2">
          <el-input v-model="postData.remark" type="textarea" placeholder="请输入内容"></el-input>
        </el-form-item>
      </admin-space>
    </el-form>
    <template #footer>
      <el-button @click="emits('end')">取消</el-button>
      <el-button type="primary" @click="submitForm()" :loading="loading">确定</el-button>
    </template>
  </admin-dialog-content>
</template>

<script setup>
import { deptTreeSelect, updateUser, addUser, getUser } from '@/api/system/user'
import { getDict } from '@/utils/dict'
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import { checkRules } from "@/utils/utils"
const emits = defineEmits(['end', 'success'])
const props = defineProps(['row'])
const postForm = ref()
const loading = ref(false)
const deptOptions = ref([])
const postOptions = ref([])
const roleOptions = ref([])
const postData = ref({
  userName: '',
  password: '',
  nickName: '',
  status: '0'
})
deptTreeSelect().then((res) => {
  deptOptions.value = res.data
})
getUser(props.row?.userId).then((res) => {
  postOptions.value = res.posts
  roleOptions.value = res.roles
  if (props.row) {
    postData.value = res.data
    postData.value.postIds = res.postIds
    postData.value.roleIds = res.roleIds
    postData.value.password = ''
  }
})

const submitForm = async () => {

  try {
    await checkRules(postForm)
    let fn = props.row ? updateUser : addUser
    fn(postData.value)
      .then((res) => {
        ElMessage.success(res.msg)
        emits('success')
      })
      .finally(() => {
        loading.value = false
      })
  } catch (error) {
    console.log(error)
    return

  }

}
</script>

<style lang="scss" scoped></style>
