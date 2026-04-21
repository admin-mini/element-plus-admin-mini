<template>
  <admin-dialog-content v-loading="loading">
    <el-form ref="postForm" label-position="right" label-width="100px" :model="postData" :rules="rules">
      <el-form-item label="角色名称" prop="name" :rules="[$rules.required]">
        <el-input v-model="postData.name"></el-input>
      </el-form-item>
      <el-form-item label="角色编码" prop="code" :rules="[$rules.required]">
        <el-input v-model="postData.code"></el-input>
      </el-form-item>
      <el-form-item  prop="weight"  :rules="[$rules.required]">
        <template #label>
          角色权重
           <el-tooltip
        class="box-item"
        effect="dark"
        content="分配角色时，权重高的角色可以分配权重低的"
        placement="top-start"
      >
                  <el-icon><QuestionFilled /></el-icon>
      </el-tooltip>
        </template>
        <el-input-number v-model="postData.weight" :min="0" :max="99" :precision="0" />
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
import message from "@/utils/message"
import tool from "@/utils/tool"
import * as roleApi from "@/api/sys/role-api"



const emits = defineEmits(['end', 'success'])
const props = defineProps(["row"]);
const postForm = ref()
const loading = ref(false);
const postData = ref({
  name: '',
  code: '',
  weight: 0,
  sortCode: 0
})

const rules = {}


onMounted(()=>{
    if (props.row && props.row.id) {
        roleApi.getRoleDetail(props.row.id).then(resp=>{
          console.log("aaa",tool);
             postData.value = tool.cloneDeep(resp.data);
        })
    }
})

const submitForm = (formEl) => {
  formEl.validate((valid) => {
    if (valid) {
      let _postData = tool.cloneDeep(postData.value);

      let fn = !_postData.id ? roleApi.addRole : roleApi.editRole;
      loading.value = true

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