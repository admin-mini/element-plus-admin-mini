<template>
  <admin-dialog>
    <el-form ref="postForm" label-position="right" label-width="100px" :model="postData" :rules="rules">
      <admin-space cols="1">
        <el-form-item label="角色名称" prop="roleName" :rules="[$rules.required]">
          <el-input v-model="postData.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item prop="roleKey" :rules="[$rules.required]">
          <template #label>
            <span>
              <el-tooltip content="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasRole('admin')`)" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
              权限字符
            </span>
          </template>
          <el-input v-model="postData.roleKey" placeholder="请输入权限字符" />
        </el-form-item>
        <el-form-item label="角色顺序" prop="roleSort" :rules="[$rules.required]">
          <el-input-number v-model="postData.roleSort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="postData.status">
            <el-radio v-for="dict in $dict.sys_normal_disable" :key="dict.value" :value="dict.value">{{ dict.label
              }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单权限">
          <div style="width: 100%;">
            <el-checkbox v-model="menuExpand" @change="handleCheckedTreeExpand($event, 'menu')">展开/折叠</el-checkbox>
            <el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll($event, 'menu')">全选/全不选</el-checkbox>
            <el-checkbox v-model="postData.menuCheckStrictly"
              @change="handleCheckedTreeConnect($event, 'menu')">父子联动</el-checkbox>
          </div>
          <div
            style="width:100%;height:200px; overflow-y: auto;padding:10px; border:1px solid var(--el-border-color);border-radius: var(--el-border-radius-base);">
            <el-tree class="tree-border" :data="menuOptions" show-checkbox ref="menuRef" node-key="id"
              :check-strictly="!postData.menuCheckStrictly" empty-text="加载中，请稍候"
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
import { roleMenuTreeselect, treeselect, } from '@/api/system/menu';
import { addRole, updateRole, getRole } from '@/api/system/role';
import { getDict } from '@/utils/dict';
import { ElMessage } from 'element-plus';
import { nextTick, ref, useTemplateRef, } from 'vue'
getDict(['sys_normal_disable'])
const emits = defineEmits(['end', 'success'])
const props = defineProps(["row"]);
const postForm = ref()
const loading = ref(false);
const menuOptions = ref([])
const menuNodeAll = ref(false)
const menuExpand = ref(false)
const menuRef = useTemplateRef('menuRef')
const rules = {}
const postData = ref({
  roleSort: 0,
  status: '0'
})

if (!props.row) {
  treeselect().then(response => {
    menuOptions.value = response.data.data;
  });
} else {
  getRole(props.row.roleId).then((res) => {
    if (res.data.code == 200) {
      postData.value = res.data.data
    }
  }).then(() => {
    nextTick(() => {
      roleMenuTreeselect(props.row.roleId).then((res) => {
        menuOptions.value = res.data.menus;
        let checkedKeys = res.data.checkedKeys;
        checkedKeys.forEach((v) => {
          nextTick(() => {
            menuRef.value.setChecked(v, true, false);
          });
        });
      });
    })
  })

}
/** 树权限（展开/折叠）*/
function handleCheckedTreeExpand(value) {
  let treeList = menuOptions.value;
  for (let i = 0; i < treeList.length; i++) {
    menuRef.value.store.nodesMap[treeList[i].id].expanded = value;
  }
}
/** 树权限（全选/全不选） */
function handleCheckedTreeNodeAll(value) {
  menuRef.value.setCheckedNodes(value ? menuOptions.value : []);
}


function getMenuAllCheckedKeys() {
  // 目前被选中的菜单节点
  let checkedKeys = menuRef.value.getCheckedKeys();
  // 半选中的菜单节点
  let halfCheckedKeys = menuRef.value.getHalfCheckedKeys();
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