<template>
  <div class="xn-upload" :class="`xn-upload--${mode}`">
    <!-- 图片模式 -->
    <el-upload
      v-if="mode === 'image'"
      ref="uploadRef"
      v-model:file-list="fileList"
      list-type="picture-card"
      class="upload-image"
      :class="{ 'is-full': fileList.length >= limit || disabled }"
      :http-request="httpRequest"
      :auto-upload="autoUpload"
      :accept="accept"
      :multiple="limit > 1"
      :limit="limit"
      :disabled="disabled"
      :on-change="handleChange"
      :on-remove="handleRemove"
      :on-exceed="handleExceed"
      :on-preview="handlePreview"
    >
      <template v-if="!disabled && fileList.length < limit">
        <el-icon><Plus /></el-icon>
        <div class="el-upload__text">{{ uploadText }}</div>
      </template>
    </el-upload>

    <!-- 拖拽模式 -->
    <el-upload
      v-else-if="mode === 'drag'"
      ref="uploadRef"
      v-model:file-list="fileList"
      drag
      class="upload-drag"
      :http-request="httpRequest"
      :auto-upload="autoUpload"
      :accept="accept"
      :multiple="limit > 1"
      :limit="limit"
      :disabled="disabled"
      :on-change="handleChange"
      :on-remove="handleRemove"
      :on-exceed="handleExceed"
    >
      <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
      <div class="el-upload__text">将文件拖到此处，或<em>点击选择</em></div>
      <template v-if="tip" #tip>
        <div class="el-upload__tip">{{ tip }}</div>
      </template>
    </el-upload>

    <!-- 文件列表模式 -->
    <el-upload
      v-else
      ref="uploadRef"
      v-model:file-list="fileList"
      :http-request="httpRequest"
      :auto-upload="autoUpload"
      :accept="accept"
      :multiple="limit > 1"
      :limit="limit"
      :disabled="disabled"
      :on-change="handleChange"
      :on-remove="handleRemove"
      :on-exceed="handleExceed"
    >
      <el-button :icon="Upload" :disabled="disabled">{{ uploadText }}</el-button>
      <template v-if="tip" #tip>
        <div class="el-upload__tip">{{ tip }}</div>
      </template>
    </el-upload>

    <!-- 图片/文件预览 -->
    <el-dialog v-model="previewVisible" :title="previewTitle" width="720px" append-to-body>
      <el-image v-if="mode === 'image'" :src="previewSrc" fit="contain" style="width: 100%" />
      <div v-else>
        <el-link type="primary" :href="previewSrc" target="_blank">{{ previewTitle }}</el-link>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { Plus, Upload, UploadFilled } from '@element-plus/icons-vue'
import message from '@/utils/message'
import * as fileApi from '@/api/dev/file-api'

const props = defineProps({
  // v-model 绑定的返回值（resultCategory=interval 时为逗号分隔字符串，array 时为数组）
  modelValue: { type: [String, Array], default: undefined },
  // 上传展示模式 file | image | drag
  mode: { type: String, default: 'file' },
  // 上传成功后返回文件 id 还是 url
  resultType: { type: String, default: 'url' },
  // 返回值格式 interval(逗号分隔字符串) | array(数组)
  resultCategory: { type: String, default: 'interval' },
  // 最多上传数量
  limit: { type: Number, default: 1 },
  // 存储引擎 local | aliyun | tencent | minio，空字符串走系统默认引擎
  engine: { type: String, default: '' },
  // 允许选择的文件类型
  accept: { type: String, default: '' },
  // 上传按钮文案
  uploadText: { type: String, default: '上传' },
  // 辅助提示文案
  tip: { type: String, default: '' },
  // 是否禁用
  disabled: { type: Boolean, default: false },
  // 是否选择文件后自动上传；false 时需调用组件 submit() 手动触发上传
  autoUpload: { type: Boolean, default: true },
  // resultCategory=array 时是否返回完整文件对象（含 name/url/value/size/type）
  completeResult: { type: Boolean, default: false },
  // resultType=id 时，将 id 转为可预览地址的函数，默认通过下载接口拉取 blob 预览
  idToUrl: { type: Function, default: undefined }
})

const emit = defineEmits(['update:modelValue', 'change', 'success'])

const uploadRef = ref()
const fileList = ref([])
const previewVisible = ref(false)
const previewTitle = ref('')
const previewSrc = ref('')

const accept = computed(() => {
  if (props.accept) return props.accept
  return props.mode === 'image' ? 'image/*' : ''
})

let uidSeed = Date.now()
// 组件自身 emit 回写 modelValue 时，跳过重复重建列表
let syncing = false

function getFileName(url) {
  if (!url) return ''
  try {
    const path = String(url).split('?')[0]
    const name = decodeURIComponent(path.split('/').pop() || '')
    return name || url
  } catch {
    return url
  }
}

// resultType=id 时解析预览地址：优先使用外部传入的 idToUrl，否则调用下载接口生成 blob 预览
function resolveIdUrl(id) {
  if (typeof props.idToUrl === 'function') {
    return Promise.resolve(props.idToUrl(id))
  }
  return fileApi
    .downloadFile(id)
    .then((blob) => URL.createObjectURL(blob))
    .catch(() => '')
}

/** 根据默认值构造已上传文件列表项 */
function buildEchoItem(raw) {
  let value = raw
  let name = ''
  let url = ''
  if (raw && typeof raw === 'object') {
    value = raw.value ?? raw.id ?? raw.url
    name = raw.name || ''
    url = raw.url || ''
  }
  const item = {
    uid: ++uidSeed,
    name: name || (props.resultType === 'url' ? getFileName(value) : String(value ?? '')),
    status: 'success',
    value,
    url: ''
  }
  if (props.resultType === 'url') {
    item.url = url || value || ''
  } else if (value) {
    // id 模式异步解析预览地址（图片模式用于缩略图展示）
    resolveIdUrl(value).then((u) => {
      if (u) item.url = u
    })
  }
  return item
}

function normalizeValues(val) {
  if (!val) return []
  if (props.resultCategory === 'interval') {
    return String(val).split(',').filter(Boolean)
  }
  return Array.isArray(val) ? val.slice() : []
}

watch(
  () => props.modelValue,
  (val) => {
    if (syncing) return
    fileList.value = normalizeValues(val).map(buildEchoItem)
  },
  { immediate: true, deep: true }
)

/** 自定义上传：复用 file-api 的 uploadReturnId / uploadReturnUrl（自动携带 Token） */
function httpRequest({ file, onSuccess, onError }) {
  const uploadFile = fileList.value.find((f) => f.raw === file)
  // 上传前先生成本地预览地址，保证图片模式成功后有缩略图
  if (uploadFile && !uploadFile.url) {
    uploadFile.url = URL.createObjectURL(file)
  }
  const request = props.resultType === 'id' ? fileApi.uploadReturnId : fileApi.uploadReturnUrl
  request(file, props.engine)
    .then((response) => {
      const value = response.data
      if (uploadFile) {
        uploadFile.value = value
        // url 模式用服务端返回地址展示，id 模式保留本地预览
        if (props.resultType === 'url') uploadFile.url = value
      }
      onSuccess(response)
      emit('success', value)
    })
    .catch((error) => {
      // 移除失败的文件项，避免留下错误状态
      if (uploadFile) {
        const index = fileList.value.indexOf(uploadFile)
        if (index > -1) fileList.value.splice(index, 1)
      }
      message.error('上传失败，请重试')
      onError(error)
    })
}

/** 从当前文件列表收集返回值 */
function collectResult() {
  const doneItems = fileList.value.filter((f) => f.status === 'success')
  if (props.resultCategory === 'interval') {
    return doneItems
      .map((f) => f.value)
      .filter(Boolean)
      .join(',')
  }
  if (props.completeResult) {
    return doneItems.map((f) => ({
      name: f.name,
      url: f.url,
      value: f.value,
      size: f.size,
      type: f.type
    }))
  }
  return doneItems
    .map((f) => f.value)
    .filter(Boolean)
}

function emitValue(result) {
  syncing = true
  emit('update:modelValue', result)
  emit('change', result)
  nextTick(() => {
    syncing = false
  })
}

function syncValue() {
  if (props.disabled) return
  const result = collectResult()
  emitValue(props.resultCategory === 'interval' ? result || '' : result || [])
}

/** 仅在文件上传完成时同步返回值，避免选择文件阶段触发 */
function handleChange(uploadFile) {
  if (uploadFile.status === 'success') {
    nextTick(syncValue)
  }
}

function handleRemove() {
  nextTick(syncValue)
}

function handleExceed(files) {
  // 单文件场景自动替换旧文件
  if (props.limit === 1 && uploadRef.value) {
    uploadRef.value.clearFiles()
    fileList.value = []
    uploadRef.value.handleStart(files[0])
    // handleStart 仅加入列表不触发上传，自动上传模式下需手动补一次 submit
    if (props.autoUpload) {
      nextTick(() => uploadRef.value.submit())
    }
    return
  }
  message.warning(`最多只能上传 ${props.limit} 个文件`)
}

function handlePreview(file) {
  if (!file.url) return
  previewTitle.value = file.name
  previewSrc.value = file.url
  previewVisible.value = true
}

/** 手动触发上传：对处于 ready 状态的文件执行上传 */
function submit() {
  uploadRef.value?.submit()
}

/** 清空已选/已传文件 */
function clear() {
  uploadRef.value?.clearFiles()
  fileList.value = []
  syncValue()
}

defineExpose({ submit, clear })
</script>

<style scoped lang="scss">
.upload-drag {
  width: 100%;
}

// 图片模式：已满额或禁用时，整体隐藏"添加图片"触发框（含边框）
.upload-image {
  &.is-full {
    :deep(.el-upload--picture-card) {
      display: none;
    }
  }
}
</style>
