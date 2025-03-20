<template>
  <admin-dialog-content>
    <el-form ref="formRef" :model="postData" label-width="80px">
      <admin-space cols="1">
        <el-form-item label="岗位名称" prop="postName" :rules="[$rules.required]">
          <el-input v-model="postData.postName" placeholder="请输入岗位名称" />
        </el-form-item>
        <el-form-item label="岗位编码" prop="postCode" :rules="[$rules.required]">
          <el-input v-model="postData.postCode" placeholder="请输入编码名称" />
        </el-form-item>
        <el-form-item label="岗位顺序" prop="postSort" :rules="[$rules.required]">
          <el-input-number v-model="postData.postSort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="岗位状态">
          <el-radio-group v-model="postData.status">
            <el-radio v-for="dict in $dict.sys_normal_disable" :key="dict.value" :label="dict.value">
              {{ dict.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="postData.remark" type="textarea" placeholder="请输入内容"></el-input>
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
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getPost, addPost, updatePost } from '@/api/system/post'
import { getDict } from '@/utils/dict'

getDict(['sys_normal_disable'])

const props = defineProps({
  row: Object
})
const emits = defineEmits(['end', 'success'])

const loading = ref(false)
const formRef = ref()

const postData = ref({
  postId: undefined,
  postCode: undefined,
  postName: undefined,
  postSort: 0,
  status: '0',
  remark: undefined
})

if (props.row) {
  getPost(props.row.postId).then((res) => {
    Object.assign(postData.value, res.data)
  })
}

function submitForm() {
  formRef.value?.validate((valid) => {
    if (valid) {
      loading.value = true
      const fn = postData.value.postId ? updatePost : addPost
      fn(postData.value)
        .then((res) => {
          ElMessage.success(res.msg)
          emits('success')
        })
        .finally(() => {
          loading.value = false
        })
    }
  })
}
</script>
