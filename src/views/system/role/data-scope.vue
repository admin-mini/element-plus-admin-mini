<template>
  <admin-dialog>
    <el-form ref="postForm" label-position="right" label-width="100px" :model="postData" :rules="rules">
      <admin-space cols="1">
        <el-form-item label="角色名称">
          <el-input v-model="postData.roleName" :disabled="true" />
        </el-form-item>
        <el-form-item label="权限字符">
          <el-input v-model="postData.roleKey" :disabled="true" />
        </el-form-item>
        <el-form-item label="权限字符">
          <select-dict :dict="$dict.dataScopeOptions" v-model="postData.dataScope"></select-dict>
        </el-form-item>
        <el-form-item label="菜单权限">
          <div style="width: 100%;">
            <el-checkbox v-model="menuExpand" @change="handleCheckedTreeExpand($event)">展开/折叠</el-checkbox>
            <el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll($event)">全选/全不选</el-checkbox>
            <el-checkbox v-model="postData.menuCheckStrictly"
              @change="handleCheckedTreeConnect($event)">父子联动</el-checkbox>
          </div>
          <div
            style="width:100%;height:200px; overflow-y: auto;padding:10px; border:1px solid var(--el-border-color);border-radius: var(--el-border-radius-base);">
            <el-tree default-expand-all class="tree-border" :data="deptOptions" show-checkbox ref="deptRef "
              node-key="id" :check-strictly="!postData.menuCheckStrictly" empty-text="加载中，请稍候"
              :props="{ label: 'label', children: 'children' }"></el-tree>
          </div>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="postData.remark" type="textarea" placeholder="请输入内容"></el-input>
        </el-form-item>
      </admin-space>
    </el-form>
    <template #footer>
      <el-button @click="emits('end')">取消</el-button>
      <el-button type="primary" @click="submitForm(postForm)" :loading="loading">确定</el-button>
    </template>
  </admin-dialog>
</template>

<script setup>
import { treeselect, } from '@/api/system/menu';
import { addRole, updateRole, getRole, deptTreeSelect } from '@/api/system/role';
import { getDict } from '@/utils/dict';
import { ElMessage } from 'element-plus';
import { nextTick, ref, useTemplateRef, } from 'vue'
getDict(['sys_normal_disable'])
const emits = defineEmits(['end', 'success'])
const props = defineProps(["row"]);
const postForm = ref()
const loading = ref(false);
const deptOptions = ref([])
const menuNodeAll = ref(false)
const menuExpand = ref(true)
const deptRef = useTemplateRef('deptRef ')
const rules = {}
const postData = ref({
  roleSort: 0,
  status: '0'
})

getRole(props.row.roleId).then((res) => {
  if (res.data.code == 200) {
    postData.value = res.data.data
  }
}).then(() => {
  nextTick(() => {
    deptTreeSelect(props.row.roleId).then((res) => {
      deptOptions.value = res.data.depts;
      let checkedKeys = res.data.checkedKeys;
      checkedKeys.forEach((v) => {
        nextTick(() => {
          deptRef.value.setChecked(v, true, false);
          handleCheckedTreeExpand(true)
        });
      });
    });
  })
})
/** 树权限（展开/折叠）*/
function handleCheckedTreeExpand(value) {
  let treeList = deptOptions.value;
  for (let i = 0; i < treeList.length; i++) {
    deptRef.value.store.nodesMap[treeList[i].id].expanded = value;
  }
}
/** 树权限（全选/全不选） */
function handleCheckedTreeNodeAll(value) {
  deptRef.value.setCheckedNodes(value ? deptOptions.value : []);
}


function getMenuAllCheckedKeys() {
  // 目前被选中的菜单节点
  let checkedKeys = deptRef.value.getCheckedKeys();
  // 半选中的菜单节点
  let halfCheckedKeys = deptRef.value.getHalfCheckedKeys();
  checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);
  return checkedKeys;
}
const submitForm = (formEl) => {
  formEl.validate((valid) => {
    if (valid) {
      let fn = props.row ? updateRole : addRole;
      fn({ ...postData.value, menuIds: getMenuAllCheckedKeys() }).then(res => {
        if (res.data.code == 200) {
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