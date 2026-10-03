<template>
  <div class="user-info-head" @click="openCropper">
    <el-avatar :size="120" :src="avatar" class="avatar-img">
      {{ (systemStore.state?.user?.name || 'U').substring(0, 1) }}
    </el-avatar>
    <div class="avatar-mask">点击修改</div>

    <!-- 复用项目裁剪组件：圆形头像裁剪，裁剪确认后由 uploadRequest 直接上传 -->
    <crop-upload
      ref="cropRef"
      :img-src="avatar"
      shape="circle"
      :aspect-ratio="1"
      :auto-crop-width="200"
      output-type="png"
      title="修改头像"
      :upload-request="updateAvatar"
      @successful="handleCropSuccess"
    />
  </div>
</template>

<script setup>
import cropUpload from '@/components/crop-upload/index.vue'
import { updateAvatar } from '@/api/sys/user-center-api'
import { useSystemStore } from '@/stores'
import message from '@/utils/message'

const systemStore = useSystemStore()
const cropRef = useTemplateRef('cropRef')

// 当前头像地址（跟随 store 实时刷新）
const avatar = computed(() => systemStore.state?.user?.avatar || '')

/** 点击头像打开裁剪弹窗 */
function openCropper() {
  cropRef.value?.show()
}

/** 上传后返回的路径若为相对路径，补全为根路径开头，保证可展示 */
function normalizeAvatar(url) {
  if (!url) return url
  if (/^(https?:\/\/|data:|\/)/i.test(url)) return url
  return '/' + url
}

/** 裁剪弹窗上传成功回调（uploadRequest 已自动完成上传并回传后端 data） */
function handleCropSuccess(payload) {
  if (!payload.value) return
  systemStore.state.user.avatar = normalizeAvatar(payload.value)
  message.success('头像修改成功')
}
</script>

<style lang="scss" scoped>
.user-info-head {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

.avatar-mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #eee;
  font-size: 14px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.2s;
}

.user-info-head:hover .avatar-mask {
  opacity: 1;
}
</style>
