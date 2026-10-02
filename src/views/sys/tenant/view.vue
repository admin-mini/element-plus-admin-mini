<template>
  <admin-dialog-content v-loading="loading">
    <el-descriptions v-if="viewData" title="租户信息" :column="2" border class="tenant-view">
      <el-descriptions-item label="租户名称">{{ viewData.tenantName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="租户编码">{{ viewData.tenantCode || '-' }}</el-descriptions-item>
      <el-descriptions-item label="系统名称">{{ viewData.sysName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="组织分组">{{ viewData.orgName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="套餐">{{ viewData.packageName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="可用状态">
        <dict-label tag type="common_enable_status" :value="viewData.enableStatus" />
      </el-descriptions-item>
      <el-descriptions-item label="联系人">{{ viewData.contactsUser || '-' }}</el-descriptions-item>
      <el-descriptions-item label="联系电话">{{ viewData.contactsPhone || '-' }}</el-descriptions-item>
      <el-descriptions-item label="联系地址" :span="2">{{ viewData.contactsAddress || '-' }}</el-descriptions-item>
      <el-descriptions-item label="租户管理员">{{ viewData.tenantAdminName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="账号个数">{{ viewData.accountCount ?? '-' }}</el-descriptions-item>
      <el-descriptions-item label="到期时间" :span="2">{{ viewData.expireTime || '-' }}</el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-button @click="emits('end')">关闭</el-button>
    </template>
  </admin-dialog-content>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getDict } from '@/utils/dict'
import * as tenantApi from '@/api/sys/tenant-api'

getDict(['common_enable_status'])

const props = defineProps({ row: Object })
const emits = defineEmits(['end'])

const loading = ref(false)
const viewData = ref(null)

onMounted(() => {
  if (!props.row?.id) return
  loading.value = true
  tenantApi.getTenantView(props.row.id).then((resp) => {
    viewData.value = resp.data || {}
  }).catch(() => {}).finally(() => { loading.value = false })
})
</script>

<style scoped>
.tenant-view {
  padding-bottom: 8px;
}
</style>