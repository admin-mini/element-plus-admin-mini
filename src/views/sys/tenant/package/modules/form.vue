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
        <div class="menu-tree-wrap">
          <el-tree
            ref="menuTreeRef"
            :data="menuTree"
            node-key="id"
            show-checkbox
            default-expand-all
            :props="{ label: 'title', children: 'children' }"
            :check-strictly="false"
          >
            <template #default="{ data }">
              <span>{{ data.title }}</span>
            </template>
          </el-tree>
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="emits('end')">取消</el-button>
      <el-button type="primary" :loading="loading" @click="submitForm">确定</el-button>
    </template>
  </admin-dialog-content>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import message from '@/utils/message'
import tool from '@/utils/tool'
import { getDict } from '@/utils/dict'
import * as menuApi from '@/api/sys/menu-api'
import * as tenantApi from '@/api/sys/tenant-api'

getDict(['common_enable_status'])

const props = defineProps({ row: Object })
const emits = defineEmits(['end', 'success'])

const formRef = ref()
const loading = ref(false)
const menuTreeRef = ref()
const menuTree = ref([])
const isEditing = computed(() => !!props.row?.id)

const postData = ref({
  name: '',
  remark: '',
  enableStatus: 1,
  menuIds: []
})

const rules = {}

/** 加载菜单树 */
function loadMenuTree() {
  menuApi.getMenuTree().then((resp) => { menuTree.value = resp.data || [] }).catch(() => {})
}

/** 编辑时回显套餐详情 */
function loadDetail(id) {
  loading.value = true
  tenantApi.getTenantPackageDetail(id).then((resp) => {
    const data = resp.data || {}
    postData.value = Object.assign({}, postData.value, data, { enableStatus: data.enableStatus ?? 1 })
    if (Array.isArray(data.menuIds) && data.menuIds.length) {
      // 等待菜单树渲染后再回显勾选（el-tree 级联会自动把“子全部选中”的父级置为勾选，
      // 部分选中的父级自动置为半选，因此这里只需回填已选节点）
      nextTick(() => {
        menuTreeRef.value?.setCheckedKeys(data.menuIds, false)
      })
    }
  }).catch(() => {}).finally(() => { loading.value = false })
}

function submitForm() {
  formRef.value?.validate((valid) => {
    if (!valid) {
      message.error('请填写完整信息')
      return
    }
    // 收集勾选菜单：仅取“完全选中”的节点。
    // el-tree 级联规则下，父级只有在所有子级都选中时才会被勾选（部分选中为半选状态），
    // 因此无需合并半选节点，否则回显时会把未授权的子菜单一并勾选。
    const payload = tool.cloneDeep(postData.value)
    payload.menuIds = menuTreeRef.value?.getCheckedKeys() || []
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
.menu-tree-wrap {
  width: 100%;
  max-height: 320px;
  overflow: auto;
  padding: 8px;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  box-sizing: border-box;
}
</style>