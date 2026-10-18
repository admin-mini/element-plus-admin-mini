<template>
  <slot :disabled="isDisabled" :countdown="countdown" :text="btnText">
    <el-button :disabled="isDisabled" :size="size" plain @click="open">{{ btnText }}</el-button>
  </slot>

  <el-dialog
    v-model="visible"
    :title="title"
    width="400px"
    align-center
    append-to-body
    destroy-on-close
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <div class="nuocao-sms-captcha-body">
      <div class="nuocao-sms-captcha-row">
        <el-input
          v-model="form.validCode"
          placeholder="请输入图片验证码"
          :maxlength="6"
          clearable
          @keyup.enter="send"
        />
        <nuocao-image-captcha
          ref="imageCaptchaRef"
          :fn="imageCaptchaApiFn"
          :width="110"
          :height="32"
          @success="handleCaptchaSuccess"
        />
      </div>

      <el-button
        class="nuocao-sms-send-btn"
        type="primary"
        :disabled="!form.validCode"
        :loading="sending"
        @click="send"
      >
        发送短信
      </el-button>

      <div class="nuocao-sms-tip">验证码将发送至手机号 {{ phone }}，点击图片可刷新</div>
    </div>
  </el-dialog>
</template>

<script setup>
import { computed, onUnmounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import $rules from '@/utils/rules'
import NuocaoImageCaptcha from '@/components/nuocao-image-captcha/index.vue'

/**
 * 手机短信验证码组件
 * 参考移动端 nuocao-sms-btn 思路，适配 Element Plus
 *
 * 用法：
 *   <nuocao-sms-btn
 *     :phone="form.phone"
 *     :image-captcha-api-fn="getPicCaptcha"
 *     :sms-api-fn="sendSmsCode"
 *     @success="onSendSuccess" />
 *   先输入图片验证码 -> 校验手机号 -> 发送短信，成功后可拿到接口返回的请求号
 */
const props = defineProps({
  // 接收短信的手机号
  phone: {
    type: String,
    default: ''
  },
  // 获取图片验证码的接口函数（必传）
  imageCaptchaApiFn: {
    type: Function,
    required: true
  },
  // 发送短信验证码的接口函数（必传），入参 { validCode, validCodeReqId, phone }，与后端参数命名一致
  smsApiFn: {
    type: Function,
    required: true
  },
  // 触发按钮尺寸（large / default / small），用于与外部输入框高度对齐
  size: {
    type: String,
    default: 'default'
  },
  // 是否校验手机号：默认开启；部分场景（如已绑定手机号改密）手机号由后端决定且前端仅拿到脱敏号码，可传 false 跳过校验
  validatePhone: {
    type: Boolean,
    default: true
  },
  // 弹窗标题
  title: {
    type: String,
    default: '获取短信验证码'
  }
})

const emit = defineEmits(['success'])

const imageCaptchaRef = ref()
const visible = ref(false)
const sending = ref(false)
const countdown = ref(0)
let timer = null

const form = reactive({
  validCode: '',
  validCodeReqId: ''
})

// 是否禁用按钮：倒计时中，或需要校验手机号但未填写手机号
const isDisabled = computed(
  () => countdown.value > 0 || (props.validatePhone && !props.phone)
)

// 按钮文案
const btnText = computed(() =>
  countdown.value > 0 ? `${countdown.value}s后重新获取` : '获取验证码'
)

// 图片验证码刷新后同步请求号
function handleCaptchaSuccess(data) {
  form.validCodeReqId = data.validCodeReqId
}

// 开始倒计时
function startCountdown() {
  stopCountdown()
  countdown.value = 60
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      stopCountdown()
    }
  }, 1000)
}

function stopCountdown() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

// 关闭弹窗后重置输入，保证下次打开为干净状态
function handleClosed() {
  form.validCode = ''
  form.validCodeReqId = ''
  imageCaptchaRef.value?.clear()
}

// 发送短信
async function send() {
  if (!form.validCode) {
    ElMessage.warning('请填写图片验证码')
    return
  }
  if (!form.validCodeReqId) {
    ElMessage.warning('请点击图片获取验证码')
    return
  }

  sending.value = true
  try {
    const params = { ...form }
    // 仅在需要校验手机号时携带 phone；脱敏号码场景（validatePhone=false）由后端自行确定手机号，不传该参数
    if (props.validatePhone) {
      params.phone = props.phone
    }
    const resp = await props.smsApiFn(params)
    // 兼容接口直接返回数据 或 包一层 data 两种结构
    const data = resp?.data || resp

    ElMessage.success('短信验证码已发送')
    startCountdown()
    visible.value = false
    emit('success', data)
  } catch (e) {
    // 失败时清空图片验证码并刷新，接口异常提示由请求拦截器统一处理
    form.validCode = ''
    imageCaptchaRef.value?.getCaptcha()
    console.error('发送短信验证码失败:', e)
  } finally {
    sending.value = false
  }
}

// 打开弹窗并校验手机号
function open() {
  // validatePhone 为 false 时跳过手机号校验（如脱敏号码场景）
  if (props.validatePhone) {
    if (!props.phone) {
      ElMessage.warning('请输入手机号')
      return
    }
    if (!$rules.phone.pattern.test(props.phone)) {
      ElMessage.warning($rules.phone.message)
      return
    }
  }
  visible.value = true
}

onUnmounted(() => {
  stopCountdown()
})

// 暴露方法给父组件
defineExpose({
  open,
  send,
  startCountdown
})
</script>

<style lang="scss" scoped>
/* 弹窗内容与左右边框之间留出空隙 */
.nuocao-sms-captcha-body {
  padding: 0 16px 8px;
}

.nuocao-sms-captcha-row {
  display: flex;
  align-items: center;
  gap: 10px;

  .el-input {
    flex: 1;
  }
}

.nuocao-sms-send-btn {
  width: 100%;
  margin-top: 16px;
}

.nuocao-sms-tip {
  margin-top: 12px;
  font-size: 12px;
  line-height: 18px;
  text-align: center;
  color: var(--el-text-color-secondary);
}
</style>
