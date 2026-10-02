<template>
  <admin-dialog-content v-loading="loading">
    <el-form ref="formRef" :model="postData" :rules="rules" label-position="right" label-width="110px">
      <el-alert v-if="isEditing" type="info" :closable="false" title="租户编码与管理员账号在创建后不可修改，请谨慎操作。" show-icon class="tenant-tip" />
      <admin-space cols="2">
        <el-form-item label="租户名称" prop="tenantName" :rules="[$rules.required]">
          <el-input v-model="postData.tenantName" placeholder="请输入租户名称" />
        </el-form-item>
        <el-form-item label="租户编码" prop="tenantCode" :rules="[$rules.required]">
          <el-input v-model="postData.tenantCode" placeholder="数字/字母组合，创建后不可修改" :disabled="isEditing" />
        </el-form-item>
        <el-form-item label="组织分组" prop="orgId" :rules="[$rules.required]">
          <el-tree-select
            v-model="postData.orgId"
            :data="orgTree"
            :props="{ value: 'id', label: 'orgName', children: 'children' }"
            value-key="id"
            placeholder="请选择组织分组"
            check-strictly
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="套餐" prop="packageId" :rules="[$rules.required]">
          <el-select v-model="postData.packageId" placeholder="请选择套餐" style="width: 100%">
            <el-option v-for="pkg in packageOptions" :key="pkg.id" :label="pkg.name" :value="pkg.id" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="!isEditing" label="管理员账号" prop="adminAccount">
          <admin-account-picker v-model="adminUser" style="width: 100%" />
        </el-form-item>
        <el-form-item label="系统名称" prop="sysName" :rules="[$rules.required]">
          <el-input v-model="postData.sysName" placeholder="请输入系统名称" />
        </el-form-item>
        <el-form-item label="联系人" prop="contactName" :rules="[$rules.required]">
          <el-input v-model="postData.contactName" placeholder="请输入联系人" />
        </el-form-item>
        <el-form-item label="联系电话" prop="contactTel" :rules="[$rules.required, $rules.phone]">
          <el-input v-model="postData.contactTel" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="联系地址" prop="contactAddress">
          <el-input v-model="postData.contactAddress" placeholder="请输入联系地址" />
        </el-form-item>
        <el-form-item label="数据规则形式" prop="dataRule" v-if="false">
          <el-input v-model="postData.dataRule" placeholder="请填写数据规则形式（可选）" />
        </el-form-item>
        <el-form-item label="到期时间" prop="expireTime" :rules="[$rules.required]">
          <el-date-picker v-model="postData.expireTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="请选择到期时间" style="width: 100%" />
        </el-form-item>
        <el-form-item label="可用状态" prop="enableStatus" :rules="[$rules.required]">
          <el-switch v-model="postData.enableStatus" active-text="启用" inactive-text="停用" active-value="1" inactive-value="0" />
        </el-form-item>
      </admin-space>
    </el-form>
    <template #footer>
      <el-button @click="emits('end')">取消</el-button>
      <el-button type="primary" :loading="loading" @click="submitForm">确定</el-button>
    </template>
  </admin-dialog-content>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import message from '@/utils/message'
import tool from '@/utils/tool'
import { getDict } from '@/utils/dict'
import * as orgApi from '@/api/sys/org-api'
import * as tenantApi from '@/api/sys/tenant-api'

getDict(['common_enable_status'])

const props = defineProps({ row: Object })
const emits = defineEmits(['end', 'success'])

const formRef = ref()
const loading = ref(false)
const orgTree = ref([])
const packageOptions = ref([])
const isEditing = computed(() => !!props.row?.id)

const postData = ref({
  tenantName: '',
  tenantCode: '',
  orgId: '',
  packageId: '',
  dataRule: '',
  contactsUser: '',
  contactsPhone: '',
  contactsAddress: '',
  sysName: '',
  tenantAdminId: '',
  adminAccount: '',
  expireTime: '',
  enableStatus: '1'
})

// 新增时选定的租户管理员账号（来自 admin-account-picker）
const adminUser = ref(null)

const rules = {}

/** 加载组织树与套餐列表 */
function loadSelectData() {
  orgApi.getOrgTree().then((resp) => { orgTree.value = resp.data || [] }).catch(() => {})
  tenantApi.getPackageSelector().then((resp) => { packageOptions.value = resp.data || [] }).catch(() => {})
}

/** 编辑时回显租户详情 */
function loadDetail(id) {
  loading.value = true
  tenantApi.getTenantDetail(id).then((resp) => {
    const data = resp.data || {}
    postData.value = Object.assign({}, postData.value, data)
    if (!data.expireTime) postData.value.expireTime = ''
    if (data.enableStatus === undefined || data.enableStatus === null) postData.value.enableStatus = '1'
  }).catch(() => {}).finally(() => { loading.value = false })
}

function submitForm() {
  formRef.value?.validate((valid) => {
    if (!valid) {
      message.error('请填写完整信息')
      return
    }
    const payload = tool.cloneDeep(postData.value)
    // 编辑时后端不接受租户编码与管理员账号字段
    if (isEditing.value) {
      delete payload.tenantCode
      delete payload.tenantAdminId
      delete payload.adminAccount
    } else {
      // 新增时需确认管理员账号，由查询确认的管理员填充
      if (!adminUser.value) {
        message.error('请查询并确认租户管理员账号')
        return
      }
      const admin = adminUser.value
      payload.tenantAdminId = admin.userId ?? admin.id
      payload.adminAccount = admin.username
    }
    if (!payload.dataRule) delete payload.dataRule
    if (!payload.expireTime) payload.expireTime = null
    loading.value = true
    const fn = isEditing.value ? tenantApi.editTenant : tenantApi.addTenant
    fn(payload).then((resp) => {
      message.success(resp.msg || '保存成功')
      emits('success')
    }).finally(() => { loading.value = false })
  })
}

onMounted(() => {
  loadSelectData()
  if (isEditing.value) loadDetail(props.row.id)
})
</script>

<style scoped>
.tenant-tip {
  margin-bottom: 16px;
}
</style>