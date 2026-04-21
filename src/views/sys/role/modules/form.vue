<template>
  <admin-dialog-content v-loading="loading">
    <el-form ref="postForm" label-position="right" label-width="100px" :model="postData" :rules="rules">
      <el-form-item label="角色名称" prop="name" :rules="[$rules.required]">
        <el-input v-model="postData.name"></el-input>
      </el-form-item>
      <el-form-item label="角色编码" prop="code" :rules="[$rules.required]">
        <el-input v-model="postData.code"></el-input>
      </el-form-item>
      <el-form-item label="权重值" prop="weigth" :rules="[$rules.required]">
        <el-input-number v-model="postData.weigth" :precision="0" />
      </el-form-item>
      <el-form-item label="角色排序" prop="sortCode" :rules="[$rules.required]">
        <el-input-number v-model="postData.sortCode" :precision="0" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" @click="submitForm(postForm)" :loading="loading">确定</el-button>
      <el-button @click="emits('end')">取消</el-button>
    </template>
  </admin-dialog-content>
</template>

<script setup>
import { userAdd, userEdit } from '@/api';
import { ref, reactive,onMounted } from 'vue'
import messsage from "@/utils/message"
import * as roleApi from "@/api/sys/role-api"



const emits = defineEmits(['end', 'success'])
const props = defineProps(["row"]);
const postForm = ref()
const loading = ref(false);
const postData = reactive({
  name: '',
  code: '',
  weight: 0,
  sortCode: 0
})

const rules = {}


onMounted(()=>{
    if (props.row && props.row.id) {
        roleApi.getRoleDetail(props.row.id).then(resp=>{
             Object.assign(postData, resp.data)
        })
    }
})

const submitForm = (formEl) => {
  formEl.validate((valid) => {
    if (valid) {
      let fn = !postData.id ? roleApi.addRole : roleApi.editRole;
      loading.value = true
      let _postData = JSON.parse(JSON.stringify(postData))

      fn(_postData).then(res => {
          message.success('保存成功')
          emits("success")
      }).finally(() => {
        loading.value = false;
      })
    } else {
      message.error("请填写完整信息")
    }
  })
}

</script>

<style lang="scss" scoped></style>