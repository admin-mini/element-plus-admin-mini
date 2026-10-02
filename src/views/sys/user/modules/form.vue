<template>
  <admin-dialog-content v-loading="loading">
    <!-- 多租户邀请：新增用户时先按账号查询并确认平台用户 -->
    <div v-if="showInviteStep" class="invite-block">
      <h3 class="invite-title">邀请会员加入</h3>
      <p class="invite-subtitle">请查询并确认要邀请的平台账号</p>
      <admin-account-picker v-model="inviteUser" />
    </div>

    <!-- 正式表单 -->
    <el-form v-else ref="formRef" :model="postData" :rules="rules" label-position="right" label-width="100px">
      <el-descriptions v-if="isTenant && inviteUser" title="邀请用户信息" :column="3" border class="invite-desc">
        <el-descriptions-item label="登录账号">{{ inviteUser.username }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ inviteUser.nickname || '-' }}</el-descriptions-item>
        <el-descriptions-item label="手机">{{ inviteUser.phone || '-' }}</el-descriptions-item>
      </el-descriptions>
      <admin-space cols="2">
        <el-form-item label="所在部门" prop="orgId" :rules="[$rules.required]">
          <el-tree-select
            v-model="postData.orgId"
            :data="orgTree"
            :props="{ value: 'id', label: 'orgName', children: 'children' }"
            value-key="id"
            placeholder="请选择组织"
            check-strictly
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item v-if="isTenant" label="登录账号">
          <el-input v-model="postData.username" disabled />
        </el-form-item>
        <template v-else>
          <el-form-item label="用户名" prop="username" :rules="[$rules.required, $rules.username]">
            <el-input v-model="postData.username" :disabled="!!props.row?.id" />
          </el-form-item>
          <el-form-item v-if="!props.row?.id" label="密码" prop="password" :rules="[$rules.required]">
            <el-input v-model="postData.password" type="password" show-password />
          </el-form-item>
        </template>

        <el-form-item label="姓名" prop="name" :rules="[$rules.required]">
          <el-input v-model="postData.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone" :rules="[$rules.required, $rules.phone]">
          <el-input v-model="postData.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email" :rules="[$rules.required, $rules.email]">
          <el-input v-model="postData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="postData.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <select-dict :dict="$dict.sys_gender" v-model="postData.gender" />
        </el-form-item>
        <el-form-item label="生日" prop="birthday">
          <el-input v-model="postData.birthday" placeholder="如 1990-01-01" />
        </el-form-item>

        <el-form-item label="用户角色" prop="roleIds" :span="2" v-if="!isEditing">
          <el-select v-model="postData.roleIds" multiple placeholder="请选择角色" style="width: 100%">
            <el-option v-for="r in roleOptions" :key="r.id" :label="r.name" :value="r.id" />
          </el-select>
        </el-form-item>
      </admin-space>
    </el-form>

    <template #footer>
      <el-button @click="emits('end')">取消</el-button>
      <el-button v-if="!showInviteStep" type="primary" :loading="loading" @click="submitForm">确定</el-button>
    </template>
  </admin-dialog-content>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import message from '@/utils/message'
import tool from '@/utils/tool'
import { getDict } from '@/utils/dict'
import * as orgApi from '@/api/sys/org-api'
import * as roleApi from '@/api/sys/role-api'
import * as userApi from '@/api/sys/user-api'

const props = defineProps({
  row: Object,
  isTenant: {
    type: Boolean,
    default: false
  }
})
const emits = defineEmits(['end', 'success'])

const formRef = ref()
const loading = ref(false)
const orgTree = ref([])
const roleOptions = ref([])

// 邀请查询状态（查询/反馈/确认由 admin-account-picker 组件完成）
const inviteUser = ref(null)
const inviteConfirmed = ref(false)
const isEditing = computed(() => !!props.row?.id)
const showInviteStep = computed(() => props.isTenant && !isEditing.value && !inviteConfirmed.value)

const postData = ref({
  orgId: '',
  username: '',
  password: '',
  name: '',
  nickname: '',
  gender: '',
  birthday: '',
  phone: '',
  email: '',
  roleIds: []
})

const rules = {}

/** 加载组织树与可授权角色列表 */
function loadSelectData() {
  orgApi.getOrgTree().then((resp) => {
    orgTree.value = resp.data || []
  }).catch(() => {})
  roleApi.getAssignableRoles().then((resp) => {
    roleOptions.value = flattenRoles(resp.data || [])
  }).catch(() => {})
}

/** 角色列表扁平化（兼容带 children 的树形结构） */
function flattenRoles(list, result = []) {
  ;(list || []).forEach((item) => {
    result.push({ id: item.id, name: item.name })
    if (item.children && item.children.length) {
      flattenRoles(item.children, result)
    }
  })
  return result
}

/** 组件确认账号后，将账号信息预填到表单并进入正式表单 */
watch(inviteUser, (val) => {
  if (val && (val.username || val.id)) {
    postData.value.username = val.username || ''
    postData.value.name = val.nickname || val.username || ''
    postData.value.phone = val.phone || ''
    inviteConfirmed.value = true
  }
})

/** 编辑时回显用户详情 */
function loadDetail(id) {
  loading.value = true
  userApi.getUserDetail(id).then((resp) => {
    const data = resp.data || {}
    postData.value = Object.assign({}, postData.value, data)
    if (data.orgId !== undefined && data.orgId !== null) postData.value.orgId = data.orgId
    if (data.roleIds) postData.value.roleIds = data.roleIds
    else postData.value.roleIds = []
  }).catch(() => {}).finally(() => {
    loading.value = false
  })
}

/** 提交表单 */
function submitForm() {
  formRef.value?.validate((valid) => {
    if (!valid) {
      message.error('请填写完整信息')
      return
    }
    let payload = tool.cloneDeep(postData.value)
    if (payload.gender !== '' && payload.gender !== null && payload.gender !== undefined) {
      payload.gender = Number(payload.gender)
    }
    // 编辑不提交用户名/密码
    if (isEditing.value) {
      delete payload.username
      delete payload.password
    }
    // 多租户邀请新增不提交密码（使用平台账号）
    if (props.isTenant && !isEditing.value) {
      delete payload.password
    }
    loading.value = true
    const fn = isEditing.value ? userApi.editUser : userApi.addUser
    fn(payload)
      .then((resp) => {
        message.success(resp.msg || '保存成功')
        emits('success')
      })
      .finally(() => {
        loading.value = false
      })
  })
}

onMounted(() => {
  getDict(['sys_gender'])
  loadSelectData()
  if (isEditing.value) {
    loadDetail(props.row.id)
  }
})
</script>

<style lang="scss" scoped>
.invite-block {
  padding: 4px 0;
  min-height: 200px;
}
.invite-title {
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.invite-subtitle {
  margin: 0 0 16px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.invite-query-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}
.invite-query-row .el-input {
  max-width: 320px;
}
.invite-user-card {
  padding: 16px;
  border: 1px solid #b7eb8f;
  border-radius: 8px;
  background: #f6ffed;
}
.invite-user-line {
  margin: 4px 0;
  font-size: 14px;
  color: var(--el-text-color-regular);
}
.invite-confirm-btn {
  margin-top: 12px;
}
.invite-tip {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.invite-desc {
  margin-bottom: 16px;
}
</style>