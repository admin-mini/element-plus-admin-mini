<template>
  <admin-dialog-content>
    <el-form label-width="130px">
      <el-form-item label="账号">
        <el-input v-model="postData.username" />
      </el-form-item>

      <el-divider content-position="left">上传组件：图片模式</el-divider>
      <el-form-item label="单图(返回url)">
        <upload v-model="postData.singleImage" mode="image" />
      </el-form-item>
      <el-form-item label="单图(返回id)">
        <!-- 编辑回显：将已上传的文件 id 赋给 v-model 即可，id 模式下组件自动通过下载接口生成预览 -->
        <upload v-model="postData.imageId" mode="image" result-type="id" />
      </el-form-item>
      <el-form-item label="单图(手动上传)">
        <!-- auto-upload=false：选择图片后不会自动上传，由页面调用组件 submit() 手动触发 -->
        <div class="manual-row">
          <upload
            ref="manualUploadRef"
            v-model="postData.manualImage"
            mode="image"
            :auto-upload="false"
          />
          <el-button type="primary" plain @click="manualUploadRef?.submit()">开始上传</el-button>
        </div>
      </el-form-item>

      <el-divider content-position="left">上传组件：文件列表 / 拖拽模式</el-divider>
      <el-form-item label="多文件(逗号url)">
        <upload v-model="postData.multiFiles" mode="file" :limit="3" tip="最多上传 3 个文件" />
      </el-form-item>
      <el-form-item label="多文件(id数组)">
        <upload
          v-model="postData.fileIds"
          mode="file"
          result-type="id"
          result-category="array"
          :limit="3"
          tip="返回 id 数组，配合后端展示"
        />
      </el-form-item>
      <el-form-item label="拖拽上传">
        <upload v-model="postData.dragUrl" mode="drag" />
      </el-form-item>

      <el-divider content-position="left">裁剪组件 + 上传</el-divider>
      <el-form-item label="头像(裁剪后上传)">
        <div class="avatar-row">
          <el-avatar v-if="postData.avatar" :size="80" :src="postData.avatar" />
          <el-button type="primary" plain @click="cropRef?.show()">选择并裁剪头像</el-button>
        </div>
      </el-form-item>
    </el-form>

    <!-- 裁剪弹窗：shape 可传 circle/rounded/square；upload-request 传入上传方法后，裁剪确定即自动上传 -->
    <crop-upload ref="cropRef" shape="circle" :upload-request="cropUpload" @successful="handleCrop" />

    <template #footer>
      <el-button type="primary" @click="submitForm">确定</el-button>
      <el-button @click="emits('end')">取消</el-button>
    </template>
  </admin-dialog-content>
</template>

<script setup>
import { reactive, ref } from 'vue'
import message from '@/utils/message'
import * as fileApi from '@/api/dev/file-api'

const emits = defineEmits(['end', 'success'])
const props = defineProps(['row'])

const postData = reactive({
  username: '',
  // 上传组件 v-model 回显：编辑时由 props.row 自动填充
  singleImage: '',
  imageId: '',
  manualImage: '',
  multiFiles: '',
  fileIds: [],
  dragUrl: '',
  // 裁剪上传后的头像地址
  avatar: ''
})
if (props.row) {
  Object.assign(postData, props.row)
}

const cropRef = ref()
const manualUploadRef = ref()

/** 裁剪后直接上传（uploadRequest 为组件提供的外部上传方法），直接传项目 file-api 函数即可 */
function cropUpload(file) {
  return fileApi.uploadReturnUrl(file)
}

/** 裁剪组件上传成功回调：value 为上传返回的 url */
function handleCrop({ value }) {
  postData.avatar = value
  message.success('裁剪上传成功')
}

function submitForm() {
  emits('success', postData)
}
</script>

<style lang="scss" scoped>
.avatar-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.manual-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
</style>
