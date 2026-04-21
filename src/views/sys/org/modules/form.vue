<template>
  <admin-dialog-content v-loading="loading">
    <el-form ref="formRef" :model="postData" label-width="140px">
      <admin-space cols="2">
        <el-form-item label="上级组织">
          <el-tree-select v-model="postData.parentId" :data="orgTreeOptions"
            :props="{ value: 'id', label: 'orgName', children: 'children' }" value-key="id"
            placeholder="选择上级菜单" check-strictly></el-tree-select>
        </el-form-item>
        <el-form-item label="组织名称" prop="orgName" :rules="[$rules.required]">
          <el-input v-model="postData.orgName" placeholder="请输入组织名称" />
        </el-form-item>
        <el-form-item label="组织编码" prop="orgCode" :rules="[$rules.required]">
          <el-input v-model="postData.orgCode" placeholder="请输入组织编码" />
        </el-form-item>
        <el-form-item label="主管" prop="directorUserId" >
            <user-picker v-model="postData.directorUserId" style="width:100%"></user-picker>
        </el-form-item>
         <el-form-item label="状态" prop="status" :rules="[$rules.required]">
            <select-dict :dict="$dict.common_enabel_status" v-model="postData.status"
                                ></select-dict>
        </el-form-item>
        <el-form-item label="显示排序" prop="sortCode" :rules="[$rules.required]">
          <el-input-number v-model="postData.sortCode" controls-position="right" :min="0" :precision="0" />
        </el-form-item>
       
      </admin-space>
    </el-form>
    <template #footer>
      <el-button @click="emits('end')">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="loading">确定</el-button>
    </template>
  </admin-dialog-content>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import message from '@/utils/message'
import tool from '@/utils/tool'
import { getDict } from '@/utils/dict'

import * as orgApi from '@/api/sys/org-api'

getDict(['common_enabel_status'])

const props = defineProps({
  row: Object,
  parentId: [String, Number]
})
const emits = defineEmits(['end', 'success'])

const loading = ref(false)
const formRef = ref()
const orgTreeOptions=ref([]);


const postData = ref({status:1,parentId:'0',sortCode:0})


/** 查询菜单下拉树结构 */
function getTreeselect() {
  orgApi.getOrgTreeSelector().then(resp=>{
    console.log("resp",resp);
    const options = [{orgName:'顶级菜单',id:"0"},...(resp.data || [])]
    orgTreeOptions.value=options;
  }).catch(ex=>{
    console.log("错误",ex);
  })
}

/** 提交按钮 */
function submitForm() {
  formRef.value?.validate((valid) => {
    if (valid) {
        loading.value = true
        //得到组件路径关系
        let _postData = tool.cloneDeep(postData.value);
      
        const fn = _postData.id ? orgApi.editOrg : orgApi.addOrg
        fn(_postData)
          .then((res) => {
            message.success(res.msg)
            emits('success')
          })
          .finally(() => {
            loading.value = false
          })
    }
  })
}

//加载数据
const initData = async(id)=>{
  orgApi.getOrgDetail(id).then((res) => {
        postData.value=tool.cloneDeep( res.data);
    }).finally(() => {
      loading.value = false
    })
}



onMounted(() => {
  getTreeselect()
  if (props.row?.id) {
    initData(props.row.id);
  }else if(props.parentId){
    postData.value.parentId=props.parentId
  }
})
</script>