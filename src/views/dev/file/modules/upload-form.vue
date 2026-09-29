<template>
  <admin-dialog-content v-loading="loading">
    <el-form ref="formRef" :model="postData" label-width="90px">
      <el-form-item label="存储引擎">
        <el-select v-model="postData.engine" clearable placeholder="不选择则使用系统默认引擎">
          <el-option v-for="item in engineOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="选择文件">
        <el-upload
          ref="uploadRef"
          drag
          class="upload-box"
          :auto-upload="false"
          :limit="1"
          :file-list="fileList"
          :on-change="onChange"
          :on-remove="onRemove"
          :on-exceed="onExceed"
        >
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">将文件拖到此处，或<em>点击选择</em></div>
        </el-upload>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="emits('end')">取消</el-button>
      <el-button type="primary" :loading="loading" @click="submitForm">上传</el-button>
    </template>
  </admin-dialog-content>
</template>

<script setup>
import { ref } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
import message from '@/utils/message'
import * as api from '@/api/dev/file-api'

const emits = defineEmits(['end', 'success'])

const engineOptions = [
  { label: '本地', value: 'local' },
  { label: '阿里云', value: 'aliyun' },
  { label: '腾讯云', value: 'tencent' },
  { label: 'MinIO', value: 'minio' }
]

const loading = ref(false)
const formRef = ref()
const uploadRef = ref()
const fileList = ref([])

const postData = ref({
  engine: ''
})

function onChange(uploadFile) {
  // 只允许保留一个待上传文件
  fileList.value = [uploadFile]
}
function onRemove() {
  fileList.value = []
}
function onExceed() {
  uploadRef.value.clearFiles()
  fileList.value = []
}

function submitForm() {
  const raw = fileList.value[0]?.raw
  if (!raw) {
    message.warning('请选择需要上传的文件')
    return
  }
  loading.value = true
  api
    .uploadReturnUrl(raw, postData.value.engine)
    .then(() => {
      message.success('上传成功')
      emits('success')
    })
    .finally(() => {
      loading.value = false
    })
}
</script>

<style scoped lang="scss">
.upload-box {
  width: 100%;
}
</style>
