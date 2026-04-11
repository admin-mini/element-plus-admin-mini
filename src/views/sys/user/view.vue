<template>
  <admin-dialog-content>
    <el-descriptions
        class="margin-top"
        :title="'用户信息'"
        :column="2"
        :size="small"
        border
      >
        <template #extra>
          
        </template>
        
        <el-descriptions-item label="用户类型"> <dict-tag :options="$dict.userType" :value="postData.userType" /></el-descriptions-item>
        <el-descriptions-item label="用户昵称">{{ postData.nickName }}</el-descriptions-item>
        <el-descriptions-item label="所属地区/部门"> {{postData.deptNames}} </el-descriptions-item>
        <el-descriptions-item label="手机号码">{{ postData.phonenumber }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ postData.email }}</el-descriptions-item>
        <el-descriptions-item label="登录账号">{{ postData.userName }}</el-descriptions-item>
        <el-descriptions-item label="性别"><dict-tag :options="$dict.sys_user_sex" :value="postData.sex" /></el-descriptions-item>
        <el-descriptions-item label="状态"><dict-tag :options="$dict.sys_normal_disable" :value="postData.status" /></el-descriptions-item>
        <el-descriptions-item label="审核情况"><dict-tag :options="$dict.audit_status" :value="postData.auditStatus" /></el-descriptions-item>
        <el-descriptions-item label="角色"></el-descriptions-item>
      </el-descriptions>
    <template #footer>
      <el-button @click="emits('end')">关闭</el-button>
      <audit-button :infoId="postData.userId" 
      :infoType="$CONSTANTS.AUDIT_INFO_TYPE.SYS_USER.value"
      :title="postData.username+'[审核]'"
       :auditStatus="postData.auditStatus"
       :audit="$p(['system:user:audit'])"
       @success="()=>{
        getUser();
          emits('success')
       }"
       ></audit-button>
    </template>
  </admin-dialog-content>
</template>

<script setup>
import { deptTreeSelect, updateUser, addUser, getUser } from '@/api/system/user'
import AuditButton from '@/components/audit-box/audit-button'

import { getDict } from '@/utils/dict'
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import { checkRules } from "@/utils/utils"
getDict(['audit_status'])
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
