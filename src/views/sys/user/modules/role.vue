<template>
  <admin-dialog-content v-loading="loading">
    <el-form label-position="right" label-width="100px">
      <el-form-item label="用户">
        <el-input :model-value="props.row?.name || props.row?.nickname || props.row?.username" disabled />
      </el-form-item>
      <el-form-item label="当前角色">
        <div class="current-roles">
          <el-tag v-for="r in currentRoles" :key="r.id" type="info" style="margin-right: 8px">{{ r.name }}</el-tag>
          <span v-if="!currentRoles.length" class="empty-roles">暂无角色</span>
        </div>
      </el-form-item>
      <el-form-item label="重新分配">
        <el-select v-model="selectedIds" multiple placeholder="请选择要分配的角色" style="width: 100%" filterable>
          <el-option v-for="r in roleOptions" :key="r.id" :label="r.name" :value="r.id" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="emits('end')">取消</el-button>
      <el-button type="primary" :loading="loading" @click="submitForm">确定</el-button>
    </template>
  </admin-dialog-content>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import message from '@/utils/message'
import * as roleApi from '@/api/sys/role-api'
import * as userApi from '@/api/sys/user-api'

const props = defineProps({ row: Object })
const emits = defineEmits(['end', 'success'])

const loading = ref(false)
const roleOptions = ref([])
const currentRoles = ref([])
const selectedIds = ref([])

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

function submitForm() {
  loading.value = true
  userApi.setUserRoles({ userId: props.row.id, roleIds: selectedIds.value })
    .then((resp) => {
      message.success(resp.msg || '分配成功')
      emits('success')
    })
    .finally(() => {
      loading.value = false
    })
}

onMounted(() => {
  loading.value = true
  roleApi.getAssignableRoles().then((resp) => {
    roleOptions.value = flattenRoles(resp.data || [])
  }).finally(() => {})
  if (props.row?.id) {
    userApi.getUserRoles({ id: props.row.id }).then((resp) => {
      const roles = flattenRoles(resp.data || [])
      currentRoles.value = roles
      selectedIds.value = roles.map((r) => r.id)
    }).catch(() => {}).finally(() => {
      loading.value = false
    })
  } else {
    loading.value = false
  }
})
</script>

<style lang="scss" scoped>
.current-roles {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  min-height: 24px;
  line-height: 24px;
}
.empty-roles {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
</style>