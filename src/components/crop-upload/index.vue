<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="780px"
    append-to-body
    :close-on-click-modal="false"
    @closed="handleClear"
  >
    <!-- 顶部工具栏 -->
    <div class="crop-toolbar">
      <el-space wrap>
        <el-button-group>
          <el-button size="small" @click="cropperRef?.changeScale(1)">放大</el-button>
          <el-button size="small" @click="cropperRef?.changeScale(-1)">缩小</el-button>
        </el-button-group>
        <el-button-group>
          <el-button size="small" @click="cropperRef?.rotateLeft()">左旋</el-button>
          <el-button size="small" @click="cropperRef?.rotateRight()">右旋</el-button>
        </el-button-group>
      </el-space>
      <div class="crop-toolbar-actions">
        <el-upload
          :show-file-list="false"
          :http-request="() => {}"
          accept="image/*"
          :before-upload="beforeUpload"
          @change="handleFileChange"
        >
          <el-button size="small" type="primary" :icon="Picture">选择图片</el-button>
        </el-upload>
        <div class="crop-tip">建议上传 2M 以内的图片</div>
      </div>
    </div>

    <!-- 裁剪主体 -->
    <div class="crop-body">
      <div class="crop-stage">
        <VueCropper
          ref="cropperRef"
          :img="img"
          :output-size="1"
          :output-type="outputType"
          :info="true"
          :fixed="true"
          :fixed-number="cropperProps.fixedNumber"
          :fixed-box="cropperProps.fixedBox"
          :can-move-box="cropperProps.canMoveBox"
          :can-move="true"
          :can-scale="true"
          :auto-crop="true"
          :auto-crop-width="cropperProps.autoCropWidth"
          :auto-crop-height="cropperProps.autoCropHeight"
          :center-box="false"
          :high="true"
          :max-img-size="3000"
          @img-load="handleImgLoad"
          @real-time="handleRealTime"
        />
      </div>

      <!-- 预览区 -->
      <div class="crop-side">
        <div class="side-item">
          <div class="side-label">裁剪预览</div>
          <div
            class="preview-clip"
            :style="clipStyle(previewSize)"
          >
            <div v-if="preview.url" class="preview-stage" :style="stageStyle(previewSize)">
              <img :src="preview.url" :style="preview.img" />
            </div>
            <div v-else class="preview-empty">未选择图片</div>
          </div>
        </div>
        <div class="side-item">
          <div class="side-label">小图预览</div>
          <div
            class="preview-clip"
            :style="clipStyle(smallSize)"
          >
            <div v-if="preview.url" class="preview-stage" :style="stageStyle(smallSize)">
              <img :src="preview.url" :style="preview.img" />
            </div>
            <div v-else class="preview-empty">未选择图片</div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleOk">确定裁剪</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { Picture } from '@element-plus/icons-vue'
import { VueCropper } from 'vue-cropper'
import 'vue-cropper/dist/index.css'
import message from '@/utils/message'

const props = defineProps({
  // 需要裁剪的图片地址（远程地址 / base64），可打开后在弹窗内重新选择
  imgSrc: { type: String, default: '' },
  // 裁剪形状 circle(圆形头像) | rounded(圆角) | square(直角)
  shape: { type: String, default: 'square' },
  // shape=rounded 时的圆角半径(px)
  radius: { type: Number, default: 8 },
  // 裁剪宽高比 w/h（如 1=1:1, 1.78=16:9），shape=circle 时强制 1:1
  aspectRatio: { type: Number, default: 1 },
  // 裁剪框宽度(px)，高度按 aspectRatio 自动计算
  autoCropWidth: { type: Number, default: 200 },
  // 裁剪输出格式 png | jpeg | webp
  outputType: { type: String, default: 'png' },
  // 弹窗标题
  title: { type: String, default: '图片裁剪' }
})

const emit = defineEmits(['successful'])

const visible = ref(false)
const cropperRef = ref()
const img = ref('')
const fileName = ref('')

// 实时裁剪预览：data.url 为原图，必须配合 data.img(尺寸+位移) 放入裁剪框容器裁剪展示
const preview = reactive({ url: '', w: 0, h: 0, img: {} })

// 裁剪框配置：circle 固定 1:1 居中不可移动，rounded/square 按 aspectRatio 可移动可缩放
const cropperProps = computed(() => {
  const isCircle = props.shape === 'circle'
  const aspect = isCircle ? 1 : props.aspectRatio
  const w = Math.round(props.autoCropWidth)
  const h = Math.max(Math.round(w / aspect), 1)
  return {
    autoCropWidth: w,
    autoCropHeight: h,
    fixedNumber: [aspect, 1],
    // circle 锁定裁剪框大小与位置（拖动图片调整），其他形状可缩放裁剪框但保持比例
    fixedBox: isCircle,
    canMoveBox: !isCircle
  }
})

// 预览区域圆角：circle=50%，rounded=radius，square=0
const clipRadius = computed(() => {
  if (props.shape === 'circle') return '50%'
  if (props.shape === 'rounded') return `${props.radius}px`
  return '0'
})

/** 预览框尺寸：宽度固定，高度跟随裁剪比例，避免留边 */
function clipStyle(size) {
  const aspect = props.shape === 'circle' ? 1 : Math.max(props.aspectRatio, 0.01)
  return {
    width: `${size}px`,
    height: `${Math.max(Math.round(size / aspect), 1)}px`,
    borderRadius: clipRadius.value
  }
}

const previewSize = 132
const smallSize = 64

function getBase64(file, callback) {
  const reader = new FileReader()
  reader.addEventListener('load', () => callback(reader.result))
  reader.readAsDataURL(file)
}

function beforeUpload(file) {
  if (!file.type.startsWith('image/')) {
    message.warning('只能上传图片文件')
    return false
  }
  if (file.size > 2 * 1024 * 1024) {
    message.warning('图片大小不能超过 2M')
    return false
  }
  return true
}

function handleFileChange(uploadFile) {
  const raw = uploadFile.raw || uploadFile
  getBase64(raw, (dataUrl) => {
    fileName.value = uploadFile.name || 'crop.png'
    img.value = dataUrl
    // 等待 vue-cropper 重新加载后由 realTime 刷新预览
  })
}

function handleImgLoad(e) {
  if (e === 'error') {
    message.error('图片加载失败，请更换图片')
  }
}

/** vue-cropper realTime 事件：data 为原图 + 裁剪位移信息 */
function handleRealTime(data) {
  preview.url = data.url
  preview.w = data.w
  preview.h = data.h
  preview.img = data.img
}

/** 将裁剪框内容缩放到指定预览尺寸（overflow hidden 由外层裁剪） */
function stageStyle(size) {
  const scale = preview.w ? size / Math.max(preview.w, preview.h) : 1
  return {
    width: `${preview.w}px`,
    height: `${preview.h}px`,
    transform: `scale(${scale})`,
    transformOrigin: 'top left'
  }
}

function handleOk() {
  if (!img.value) {
    message.warning('请先选择需要裁剪的图片')
    return
  }
  cropperRef.value.getCropBlob((blob) => {
    const file = new File([blob], fileName.value || 'crop.png', {
      type: blob.type || 'image/png'
    })
    emit('successful', { fileName: file.name, blobData: blob, file })
    visible.value = false
  })
}

function handleClear() {
  visible.value = false
  preview.url = ''
  preview.w = 0
  preview.h = 0
  preview.img = {}
  fileName.value = ''
  if (!props.imgSrc) {
    img.value = ''
  }
}

/** 打开裁剪弹窗 */
function show() {
  if (props.imgSrc) {
    img.value = props.imgSrc
  }
  visible.value = true
}

defineExpose({ show })
</script>

<style scoped lang="scss">
.crop-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid #e4e7ed;

  .crop-toolbar-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .crop-tip {
    color: #909399;
    font-size: 12px;
  }
}

.crop-body {
  display: flex;
  gap: 16px;
  align-items: flex-start;

  .crop-stage {
    flex: 1;
    min-width: 0;
    // 必须给父容器显式高度：vue-cropper 根元素是 height:100%，reload 时
    // getComputedStyle 取不到高度会按 0 计算导致图片不显示、无法缩放
    height: 340px;

    :deep(.vue-cropper) {
      height: 100%;
      background: #f5f7fa;
      border: 1px solid #e4e7ed;
      border-radius: 4px;
    }
  }

  .crop-side {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 8px;
    background: #fafafa;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
  }

  .side-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .side-label {
    font-size: 12px;
    color: #606266;
  }
}

.preview-clip {
  position: relative;
  overflow: hidden;
  background: #fff;
  border: 1px solid #dcdfe6;

  .preview-empty {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: #c0c4cc;
    background: #fafafa;
  }

  .preview-stage {
    position: relative;
    line-height: 0;

    img {
      max-width: none;
    }
  }
}
</style>
