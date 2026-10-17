<template>
  <admin-dialog-content v-loading="loading">
    <el-form ref="formRef" :model="postData" :rules="rules" label-position="right" label-width="110px">
      <admin-space cols="2">
        <el-form-item label="套餐名称" prop="name" :rules="[$rules.required]">
          <el-input v-model="postData.name" placeholder="请输入套餐名称" />
        </el-form-item>
        <el-form-item label="启用状态" prop="enableStatus" :rules="[$rules.required]">
          <el-switch v-model="postData.enableStatus" active-text="启用" inactive-text="停用" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="备注说明" prop="remark">
          <el-input v-model="postData.remark" type="textarea" :rows="3" placeholder="请输入备注说明" />
        </el-form-item>
      </admin-space>

      <el-divider content-position="left">菜单授权</el-divider>
      <el-form-item label="授权菜单" prop="menuIds">
        <!-- 授权精确到每个操作按钮：菜单行勾选代表授权其下全部菜单与按钮，操作授权列可单独勾选某个按钮 -->
        <el-table
          class="menu-permission-table"
          :data="menuTree"
          row-key="id"
          border
          default-expand-all
          max-height="320"
          :tree-props="{ children: 'children' }"
        >
          <el-table-column prop="title" label="菜单名称" min-width="180">
            <template #default="{ row }">
              <el-checkbox :model-value="isNodeChecked(row)" :indeterminate="isNodeIndeterminate(row)" @change="(checked) => toggleNode(row, checked)">{{ row.title || row.name }}</el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="操作授权" min-width="420">
            <template #default="{ row }">
              <el-space wrap>
                <el-checkbox v-for="button in getButtons(row)" :key="button.id" :model-value="selectedIds.has(normalizeId(button.id))" @change="(checked) => toggleId(button.id, checked)">{{ button.title || button.name }}</el-checkbox>
              </el-space>
              <span v-if="!getButtons(row).length" class="muted-text">—</span>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="emits('end')">取消</el-button>
      <el-button type="primary" :loading="loading" @click="submitForm">确定</el-button>
    </template>
  </admin-dialog-content>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import baseRequest from '@/api/base-request.js'
import message from '@/utils/message'
import tool from '@/utils/tool'
import { getDict } from '@/utils/dict'
import * as tenantApi from '@/api/sys/tenant-api'

getDict(['common_enable_status'])

const props = defineProps({ row: Object })
const emits = defineEmits(['end', 'success'])

const formRef = ref()
const loading = ref(false)
const menuTree = ref([])
const selectedIds = ref(new Set())
const isEditing = computed(() => !!props.row?.id)

const postData = ref({
  name: '',
  remark: '',
  enableStatus: 1,
  menuIds: []
})

const rules = {}

const normalizeId = (id) => String(id)
const childrenOf = (node) => (Array.isArray(node?.children) ? node.children : [])
const getButtons = (node) => childrenOf(node).filter((item) => String(item.type).toLowerCase() === 'button')
function flatten(node, result = []) {
  if (!node) return result
  result.push(node)
  childrenOf(node).forEach((child) => flatten(child, result))
  return result
}
function descendants(node) {
  return flatten(node).map((item) => normalizeId(item.id))
}
function isNodeChecked(node) {
  const ids = descendants(node)
  return ids.length > 0 && ids.every((id) => selectedIds.value.has(id))
}
function isNodeIndeterminate(node) {
  const ids = descendants(node)
  const count = ids.filter((id) => selectedIds.value.has(id)).length
  return count > 0 && count < ids.length
}
function toggleId(id, checked) {
  const next = new Set(selectedIds.value)
  checked ? next.add(normalizeId(id)) : next.delete(normalizeId(id))
  selectedIds.value = next
}
function toggleNode(node, checked) {
  const next = new Set(selectedIds.value)
  descendants(node).forEach((id) => (checked ? next.add(id) : next.delete(id)))
  selectedIds.value = next
}

/** 加载带按钮的菜单树 */
function loadMenuTree() {
  baseRequest('/sys/menu/treeButton').then((resp) => { menuTree.value = resp.data || [] }).catch(() => {})
}

/** 编辑时回显套餐详情 */
function loadDetail(id) {
  loading.value = true
  tenantApi.getTenantPackageDetail(id).then((resp) => {
    const data = resp.data || {}
    postData.value = Object.assign({}, postData.value, data, { enableStatus: data.enableStatus ?? 1 })
    selectedIds.value = new Set((Array.isArray(data.menuIds) ? data.menuIds : []).map(normalizeId))
  }).catch(() => {}).finally(() => { loading.value = false })
}

function submitForm() {
  formRef.value?.validate((valid) => {
    if (!valid) {
      message.error('请填写完整信息')
      return
    }
    // 提交精确到按钮的授权集合：菜单与按钮 id 均在此集合中，按钮即 type 为 button 的菜单记录
    const payload = tool.cloneDeep(postData.value)
    payload.menuIds = Array.from(selectedIds.value)
    loading.value = true
    const fn = isEditing.value ? tenantApi.editTenantPackage : tenantApi.addTenantPackage
    fn(payload).then((resp) => {
      message.success(resp.msg || '保存成功')
      emits('success')
    }).finally(() => { loading.value = false })
  })
}

onMounted(() => {
  loadMenuTree()
  if (isEditing.value) loadDetail(props.row.id)
})
</script>

<style scoped>
.menu-permission-table {
  width: 100%;
}
.muted-text {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
</style>
