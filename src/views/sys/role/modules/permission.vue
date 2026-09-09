<template>
  <div class="permission-panel" v-loading="loading">
    <div class="permission-header">
      <div class="permission-title">{{ roleName }}</div>
      <el-select v-if="mode === 'data'" v-model="scopeType" class="scope-select" placeholder="选择数据权限" @change="handleScopeChange"><el-option v-for="item in scopeOptions" :key="item.value" :label="item.label" :value="item.value" /></el-select>
    </div>
    <el-alert v-if="mode === 'data' && scopeType === 'custom'" title="请选择允许访问的部门" type="info" :closable="false" show-icon />
    <el-table v-if="mode === 'permission'" class="permission-table" :data="treeData" row-key="id" border default-expand-all :tree-props="{ children: 'children' }">
      <el-table-column prop="title" label="菜单名称" min-width="180">
        <template #default="{ row }"><el-checkbox :model-value="isNodeChecked(row)" :indeterminate="isNodeIndeterminate(row)" @change="(checked) => toggleNode(row, checked)">{{ row.title || row.name }}</el-checkbox></template>
      </el-table-column>
      <el-table-column label="操作授权" min-width="460">
        <template #default="{ row }">
          <el-space wrap><el-checkbox v-for="button in getButtons(row)" :key="button.id" :model-value="selectedIds.has(normalizeId(button.id))" @change="(checked) => toggleId(button.id, checked)">{{ button.title || button.name }}</el-checkbox></el-space>
          <span v-if="!getButtons(row).length" class="muted-text">—</span>
        </template>
      </el-table-column>
    </el-table>
    <el-tree v-if="mode === 'data' && scopeType === 'custom'" ref="orgTreeRef" class="org-tree" :data="orgTree" node-key="id" show-checkbox default-expand-all :props="{ label: 'orgName', children: 'children' }" @check="handleOrgCheck" />
    <div class="permission-footer"><el-button type="primary" :loading="saving" @click="submit">保存</el-button><el-button @click="emits('end')">取消</el-button></div>
  </div>
</template>
<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import baseRequest from '@/api/base-request.js'
import * as roleApi from '@/api/sys/role-api'
import message from '@/utils/message'
const props = defineProps({ role: { type: Object, required: true }, mode: { type: String, default: 'permission' } })
const emits = defineEmits(['end', 'success'])
const loading = ref(false), saving = ref(false), treeData = ref([]), orgTree = ref([]), selectedIds = ref(new Set()), selectedOrgIds = ref([]), scopeType = ref('all'), orgTreeRef = ref()
const roleId = computed(() => props.role.id), roleName = computed(() => props.role.name || '')
const scopeOptions = [{ value: 'all', label: '全部数据' }, { value: 'custom', label: '自定义数据' }, { value: 'only', label: '本部门数据' }, { value: 'child', label: '本部门级子部门数据' }, { value: 'self', label: '仅本人自己数据' }]
const normalizeId = (id) => String(id)
const childrenOf = (node) => Array.isArray(node?.children) ? node.children : []
const getButtons = (node) => childrenOf(node).filter((item) => String(item.type).toLowerCase() === 'button')
function flatten(node, result = []) { if (!node) return result; result.push(node); childrenOf(node).forEach((child) => flatten(child, result)); return result }
function descendants(node) { return flatten(node).map((item) => normalizeId(item.id)) }
function isNodeChecked(node) { const ids = descendants(node); return ids.length > 0 && ids.every((id) => selectedIds.value.has(id)) }
function isNodeIndeterminate(node) { const ids = descendants(node); const count = ids.filter((id) => selectedIds.value.has(id)).length; return count > 0 && count < ids.length }
function toggleId(id, checked) { const next = new Set(selectedIds.value); checked ? next.add(normalizeId(id)) : next.delete(normalizeId(id)); selectedIds.value = next }
function toggleNode(node, checked) { const next = new Set(selectedIds.value); descendants(node).forEach((id) => checked ? next.add(id) : next.delete(id)); selectedIds.value = next }
function handleOrgCheck(_node, state) { selectedOrgIds.value = (state.checkedKeys || []).map(normalizeId) }
function handleScopeChange(value) { if (value !== 'custom') selectedOrgIds.value = []; if (value === 'custom' && !orgTree.value.length) loadOrgTree() }
async function loadOrgTree() { const response = await baseRequest('/sys/org/tree'); orgTree.value = response.data || []; await nextTick(); orgTreeRef.value?.setCheckedKeys(selectedOrgIds.value) }
async function load() { loading.value = true; try { const [menuResponse, permissionResponse] = await Promise.all([baseRequest('/sys/menu/treeButton'), props.mode === 'permission' ? roleApi.getRolePermission(roleId.value) : roleApi.getRoleDataScope(roleId.value)]); treeData.value = menuResponse.data || []; const data = permissionResponse.data || {}; selectedIds.value = new Set((data.menuIds || (props.mode === 'permission' ? data.ids : []) || []).map(normalizeId)); if (props.mode === 'data') { scopeType.value = data.scopeType || 'all'; selectedOrgIds.value = (data.ids || []).map(normalizeId); if (scopeType.value === 'custom') await loadOrgTree() } } finally { loading.value = false } }
async function submit() { if (props.mode === 'data' && scopeType.value === 'custom' && !selectedOrgIds.value.length) { message.error('自定义数据权限至少选择一个部门'); return } saving.value = true; try { const data = props.mode === 'permission' ? { id: roleId.value, menuIds: Array.from(selectedIds.value) } : { id: roleId.value, scopeType: scopeType.value, ids: scopeType.value === 'custom' ? selectedOrgIds.value : Array.from(selectedIds.value) }; await (props.mode === 'permission' ? roleApi.setRolePermission(data) : roleApi.setRoleDataScope(data)); message.success('保存成功'); emits('success') } finally { saving.value = false } }
onMounted(load)
</script>
<style scoped>
.permission-panel { height: 100%; display: flex; flex-direction: column; overflow: hidden; padding: 20px 24px; box-sizing: border-box; }
.permission-header { display: flex; justify-content: space-between; align-items: center; gap: 20px; padding: 0 0 18px; border-bottom: 1px solid var(--el-border-color-lighter); }
.permission-title { font-size: 18px; font-weight: 600; color: var(--el-text-color-primary); }
.scope-select { width: 220px; }
.permission-subtitle, .muted-text { color: var(--el-text-color-secondary); font-size: 13px; }
.permission-table { flex: 1; margin-top: 18px; overflow: auto; border-radius: 6px; }
.permission-footer { flex-shrink: 0; padding-top: 18px; text-align: right; }
.org-tree { margin-top: 18px; padding: 12px; border: 1px solid var(--el-border-color); border-radius: 4px; max-height: 280px; overflow: auto; }
</style>
