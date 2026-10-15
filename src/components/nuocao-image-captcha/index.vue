<template>
  <div
    class="nuocao-image-captcha"
    :style="{ width: widthX, height: heightX }"
    title="点击刷新验证码"
    @click="getCaptcha"
  >
    <el-icon v-if="captcha.loading" class="is-loading captcha-state-icon">
      <Loading />
    </el-icon>
    <img
      v-else-if="captcha.validCodeBase64"
      class="captcha-img"
      :src="captcha.validCodeBase64"
      alt="验证码"
    />
    <el-icon v-else class="captcha-state-icon">
      <Picture />
    </el-icon>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive } from 'vue'
import { Loading, Picture } from '@element-plus/icons-vue'

/**
 * 图片验证码组件
 * 参考移动端 nuocao-image-captcha 思路，适配 Element Plus
 *
 * 用法：
 *   <nuocao-image-captcha :fn="getLoginPicCaptcha" @success="onCaptchaSuccess" />
 *   fn 为返回验证码的接口函数，响应体兼容 { image | validCodeBase64, validCodeReqId | validCodeReqNo }
 *   success 事件回传 { validCodeBase64, validCodeReqId }
 */
const props = defineProps({
  // 获取验证码的接口函数（必传）
  fn: {
    type: Function,
    required: true
  },
  // 宽度，数字按 px 处理，也可直接传 '120px' / '100%'
  width: {
    type: [String, Number],
    default: 100
  },
  // 高度，数字按 px 处理，也可直接传 '38px' / '100%'
  height: {
    type: [String, Number],
    default: 35
  }
})

const emit = defineEmits(['success'])

const widthX = computed(() => (typeof props.width === 'number' ? `${props.width}px` : props.width))
const heightX = computed(() => (typeof props.height === 'number' ? `${props.height}px` : props.height))

const captcha = reactive({
  loading: false,
  validCodeReqId: '',
  validCodeBase64: ''
})

// 清空当前验证码
function clear() {
  captcha.validCodeReqId = ''
  captcha.validCodeBase64 = ''
}

// 获取验证码（点击图片可刷新）
async function getCaptcha() {
  // 请求中忽略重复点击，避免并发请求导致 reqNo 与图片不一致
  if (captcha.loading) return

  clear()
  captcha.loading = true
  try {
    const resp = await props.fn()
    // 兼容接口直接返回数据 或 包一层 data 两种结构
    const data = resp?.data || resp || {}

    // 后端 CommonPicValidCodeResult 图片字段为 image，移动端版本为 validCodeBase64，这里做兼容
    captcha.validCodeBase64 = data.image || data.validCodeBase64 || data.validCodeImg || ''
    captcha.validCodeReqId = data.validCodeReqId || data.validCodeReqNo || ''

    emit('success', { ...captcha })
  } catch (e) {
    // 接口异常提示由请求拦截器统一处理，此处仅记录，避免重复弹窗
    console.error('获取图片验证码失败:', e)
  } finally {
    captcha.loading = false
  }
}

onMounted(() => {
  getCaptcha()
})

// 暴露方法给父组件
defineExpose({
  getCaptcha,
  clear
})
</script>

<style lang="scss" scoped>
.nuocao-image-captcha {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-sizing: border-box;
  overflow: hidden;
  cursor: pointer;
  user-select: none;
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  background-color: var(--el-fill-color-light);
  transition: border-color 0.2s;

  &:hover {
    border-color: var(--el-border-color-hover);
  }

  .captcha-img {
    display: block;
    width: 100%;
    height: 100%;
    /* 防止图片干扰点击刷新事件 */
    pointer-events: none;
  }

  .captcha-state-icon {
    font-size: 18px;
    color: var(--el-text-color-secondary);
  }
}
</style>
