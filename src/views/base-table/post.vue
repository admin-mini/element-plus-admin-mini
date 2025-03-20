<template>
  <admin-dialog-content v-loading="loading">
    <el-form ref="formRef" :model="postData" label-width="auto">
      <admin-space cols="1">
        <el-form-item label="文本框" prop="input" :rules="[$rules.required]">
          <el-input v-model="postData.input" />
        </el-form-item>
        <el-form-item label="数字框" prop="number">
          <el-input-number :min="0" :max="100" :step="1" controls-position="right" v-model="postData.number"
            placeholder="可以设置min max step" />
        </el-form-item>
        <el-form-item label="文本域" prop="textarea">
          <el-input type="textarea" v-model="postData.textarea" />
        </el-form-item>
        <el-form-item label="下拉框" prop="select">
          <!-- 如果需要后端字典，需要再下方导入getDict，并执行getDict(['dictKey']) -->
          <dict-input type="select" :dict="$dict.sys_user_sex" v-model="postData.select" />
        </el-form-item>
        <el-form-item label="单选框">
          <dict-input type="radio" :dict="$dict.sys_normal_disable" v-model="postData.radio" />
        </el-form-item>
        <el-form-item label="复选框">
          <dict-input type="checkbox" :dict="$dict.sys_normal_disable" v-model="postData.checkbox" />
        </el-form-item>
        <el-form-item label="单个日期" prop="date">
          <el-date-picker value-format="YYYY-MM-DD" type="date" v-model="postData.date" />
        </el-form-item>
        <el-form-item label="日期范围" prop="dateRange">
          <!-- 
          type 默认为daterange 日期范围
          value-format 默认为YYYY-MM-DD
           -->
          <date-picker-range v-model:begin="postData.beginTime" v-model:end="postData.endTime"></date-picker-range>
        </el-form-item>

        <el-form-item label="文件上传" prop="file-upload">
          <upload-file v-model="postData.fileUpload" />
        </el-form-item>
        <el-form-item label="图片上传" prop="img-upload">
          <upload-img v-model="postData.imgUpload" />
        </el-form-item>
        <el-form-item label="富文本" prop="editor">
          <editor v-model="postData.editor" :min-height="192" />
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
import { ElMessage } from 'element-plus'
import { getPost, addPost, updatePost } from '@/api/system/post'
import { getDict } from '@/utils/dict'
import { checkRules } from '@/utils/utils'

getDict(['sys_normal_disable', 'sys_user_sex'])

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
  loading.value = true
  getPost(props.row.postId).then((res) => {
    Object.assign(postData.value, res.data)
  }).finally(() => {
    loading.value = false
  })
}


async function submitForm() {
  try {
    await checkRules(formRef)
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
  } catch (err) {
    return
  }


}
</script>
