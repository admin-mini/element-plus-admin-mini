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
        <el-form-item label="菜单权限" v-if="postData.dataScope == 2">
          <div style="width: 100%;">
            <el-checkbox v-model="expandAll" @change="expandAllChange()">展开/折叠</el-checkbox>
            <el-checkbox v-model="nodeAll" @change="handleCheckedTreeNodeAll()">全选/全不选</el-checkbox>
            <el-checkbox v-model="postData.deptCheckStrictly">父子联动</el-checkbox>
          </div>
          <div
            style="width:100%;height:200px; overflow-y: auto;padding:10px; border:1px solid var(--el-border-color);border-radius: var(--el-border-radius-base);">
            <el-tree :default-expand-all="expandAll" class="tree-border" :data="treeOptions" show-checkbox ref="treeRef"
              node-key="id" :check-strictly="!postData.deptCheckStrictly" empty-text="加载中，请稍候"
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
import { dataScope, getRole, deptTreeSelect } from '@/api/system/role';
import { getDict } from '@/utils/dict';
import { tree2arr } from '@/utils/utils';
import { ElMessage } from 'element-plus';
import { nextTick, onMounted, ref, useTemplateRef, } from 'vue'
getDict(['sys_normal_disable'])
const emits = defineEmits(['end', 'success'])
const props = defineProps(["row"]);
const postForm = ref()
const loading = ref(false);
const treeOptions = ref([])
const nodeAll = ref(false)
const expandAll = ref(true)
const treeRef = useTemplateRef('treeRef')
const rules = {}
const postData = ref({
  roleSort: 0,
  status: '0'
})
let allTreeNode = [];//记录一维数组
onMounted(() => {
  getRole(props.row.roleId).then((res) => {
    if (res.data.code == 200) {
      postData.value = res.data.data
    }
  }).then(() => {
    deptTreeSelect(props.row.roleId).then((res) => {
      treeOptions.value = res.data.depts;
      allTreeNode = tree2arr(treeOptions.value)
      console.log(allTreeNode)
      let checkedKeys = res.data.checkedKeys;
      checkedKeys.forEach((v) => {
        nextTick(() => {
          treeRef.value.setChecked(v, true, false);

        });
      });
    });
  })
})
function expandAllChange() {
  for (let i = 0; i < allTreeNode.length; i++) {
    treeRef.value.store.nodesMap[allTreeNode[i].id].expanded = expandAll.value;
  }
}
/** 树权限（全选/全不选） */
function handleCheckedTreeNodeAll() {
  treeRef.value.setCheckedNodes(nodeAll.value ? allTreeNode : []);
}

function getAllCheckedKeys() {
  // 目前被选中的菜单节点
  let checkedKeys = treeRef.value.getCheckedKeys();
  // 半选中的菜单节点
  let halfCheckedKeys = treeRef.value.getHalfCheckedKeys();
  return checkedKeys.concat(halfCheckedKeys);;
}
const submitForm = (formEl) => {
  formEl.validate((valid) => {
    if (valid) {
      dataScope({ ...postData.value, deptIds: getAllCheckedKeys() }).then(res => {
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