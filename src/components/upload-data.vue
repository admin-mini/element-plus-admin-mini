<template>
  <admin-dialog-content>
    <el-upload ref="uploadRef" :limit="1" accept=".xlsx, .xls" :headers="upload.headers"
      :action="upload.url + '?updateSupport=' + upload.updateSupport" :disabled="loading" :on-progress="() => {
        loading = true
      }
        " :on-success="handleFileSuccess" :auto-upload="false" drag>
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        将文件拖到此处，或
        <em>点击上传</em>
      </div>
      <template #tip>
        <div class="el-upload__tip text-center">
          <div class="el-upload__tip">
            <el-checkbox v-model="upload.updateSupport" />
            是否更新已经存在的数据
          </div>
          <span>仅允许导入xls、xlsx格式文件。</span>
          <el-link type="primary" :underline="false" style="font-size: 12px; vertical-align: baseline"
            @click="importTemplate">
            下载模板
          </el-link>
        </div>
      </template>
    </el-upload>
    <template #footer>
      <el-button @click="emits('end')">取消</el-button>
      <el-button type="primary" @click="submitForm(postForm)" :loading="loading">确定</el-button>
    </template>
  </admin-dialog-content>
</template>

<script setup>
import { download } from '@/api/request'
import { useSystemStore } from '@/stores'
import SETTING from '@/utils/setting'
import { ElMessage, ElMessageBox } from 'element-plus'
const props = defineProps([
  'uploadUrl',
  'templateUrl',
  'fileName'
])
const emits = defineEmits(['end', 'success'])
const loading = ref(false)
const upload = ref({
  url: SETTING.apiUrl + props.uploadUrl,
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的数据
  updateSupport: 0,
  // 设置上传的请求头部
  headers: { Authorization: 'Bearer ' + useSystemStore().state.token }
})
const uploadRef = useTemplateRef('uploadRef')
/** 下载模板操作 */
function importTemplate() {
  download(props.templateUrl, {}, `${props.fileName}-${new Date().getTime()}.xlsx`)
}
/** 文件上传成功处理 */
const handleFileSuccess = (response, file, fileList) => {
  loading.value = false
  uploadRef.value.handleRemove(file)
  ElMessageBox.alert(
    "<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" +
    response.msg +
    '</div>',
    '导入结果',
    {
      dangerouslyUseHTMLString: true,
      beforeClose: function (action, instanse, done) {
        if (response.code == 200) {
          emits('success')
        }
        done()
      }
    }
  )
}
/** 提交上传文件 */
function submitForm() {
  uploadRef.value.submit()
}
</script>

<style lang="scss" scoped></style>
