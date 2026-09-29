<template>
  <el-form ref="formRef" v-loading="loading" :model="form" label-width="200px" class="config-form">
    <el-empty v-if="!loading && !fields.length" description="暂无可配置项" />

    <template v-else>
      <el-form-item
        v-for="field in fields"
        :key="field.key"
        :label="field.label"
        :prop="field.key"
        :rules="field.rules"
      >
        <!-- 开关 -->
        <el-switch
          v-if="field.type === 'switch'"
          v-model="form[field.key]"
          active-value="true"
          inactive-value="false"
        />
        <!-- 单选 / 下拉 / 多选 -->
        <dict-input
          v-else-if="CHOICE_TYPES.includes(field.type)"
          v-model="form[field.key]"
          :type="field.type"
          :dict="field.options || []"
        />
        <!-- 数字 -->
        <el-input-number
          v-else-if="field.type === 'number'"
          v-model="form[field.key]"
          controls-position="right"
          :min="field.min"
          :max="field.max"
          :step="field.step || 1"
        />
        <!-- 日期 -->
        <el-date-picker
          v-else-if="field.type === 'date'"
          v-model="form[field.key]"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择日期"
        />
        <el-date-picker
          v-else-if="field.type === 'datetime'"
          v-model="form[field.key]"
          type="datetime"
          value-format="YYYY-MM-DD HH:mm:ss"
          placeholder="请选择日期时间"
        />
        <!-- 上传文件，值为文件 url -->
        <div v-else-if="field.type === 'upload'" class="config-upload">
          <el-upload
            :show-file-list="false"
            :disabled="uploadingKey === field.key"
            :http-request="options => handleUpload(options, field)"
          >
            <el-button :loading="uploadingKey === field.key">上传文件</el-button>
          </el-upload>
          <template v-if="form[field.key]">
            <el-link type="primary" :href="form[field.key]" target="_blank">{{ form[field.key] }}</el-link>
            <el-button link type="danger" @click="form[field.key] = ''">清除</el-button>
          </template>
        </div>
        <!-- 多行文本 / JSON -->
        <el-input
          v-else-if="field.type === 'textarea' || field.type === 'json'"
          v-model="form[field.key]"
          type="textarea"
          :rows="3"
          clearable
          :placeholder="field.placeholder"
        />
        <!-- 密钥类 -->
        <el-input
          v-else-if="field.type === 'password'"
          v-model="form[field.key]"
          type="password"
          show-password
          clearable
          :placeholder="field.placeholder"
        />
        <!-- 单行文本 -->
        <el-input v-else v-model="form[field.key]" clearable :placeholder="field.placeholder" />

        <div class="config-key">
          {{ field.key }}
          <span v-if="field.tip">｜{{ field.tip }}</span>
        </div>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :loading="saving" @click="save">保存配置</el-button>
        <el-button @click="load">重置</el-button>
      </el-form-item>
    </template>
  </el-form>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import message from '@/utils/message'
import * as configApi from '@/api/dev/config-api'
import * as fileApi from '@/api/dev/file-api'
import { getConfigField } from '../config-field'

const props = defineProps({
  // 配置分类，取值参考后端 DevConfigCategoryEnum
  category: {
    type: String,
    required: true
  }
})

// 使用选项渲染的控件类型
const CHOICE_TYPES = ['radio', 'select', 'checkbox']

const loading = ref(false)
const saving = ref(false)
const uploadingKey = ref('')
const formRef = ref()
const items = ref([])
const form = reactive({})

/** 未在 config-field.js 中声明的 configKey，按名称自动推断控件类型 */
function guessType(key) {
  if (/(_open|_flag|_enable)$/i.test(key)) return 'switch'
  if (/json/i.test(key)) return 'json'
  if (/lang/i.test(key)) return 'textarea'
  if (/password|secret|access_key|token/i.test(key)) return 'password'
  return 'input'
}

/** 配置项与字段定义合并后的渲染列表 */
const fields = computed(() =>
  items.value.map(item => {
    const def = getConfigField(item.configKey)
    return {
      ...def,
      key: item.configKey,
      type: def.type || guessType(item.configKey),
      label: def.label || item.remark || item.configKey
    }
  })
)

/** 接口返回的配置值 → 表单值（数字转 number，多选转数组） */
function toFormValue(type, configValue) {
  const value = configValue ?? ''
  if (type === 'number') {
    return value === '' ? undefined : Number(value)
  }
  if (type === 'checkbox') {
    return value === '' ? [] : String(value).split(',').filter(Boolean)
  }
  return value
}

/** 表单值 → 接口提交值（后端 configValue 为字符串） */
function toConfigValue(field) {
  const value = form[field.key]
  if (field.type === 'checkbox') return (value || []).join(',')
  if (value === null || value === undefined) return ''
  return String(value)
}

async function load() {
  loading.value = true
  try {
    const response = await configApi.getConfigList({ configCategory: props.category })
    items.value = response.data || []
    // 重置表单，避免残留上一次分类的数据
    Object.keys(form).forEach(key => delete form[key])
    items.value.forEach(item => {
      const type = getConfigField(item.configKey).type || guessType(item.configKey)
      form[item.configKey] = toFormValue(type, item.configValue)
    })
    // 重置后清掉上一次的校验提示
    formRef.value?.clearValidate()
  } finally {
    loading.value = false
  }
}

/** 上传文件并把返回的 url 写入表单（type === 'upload' 的配置项） */
async function handleUpload(options, field) {
  uploadingKey.value = field.key
  try {
    const response = await fileApi.uploadReturnUrl(options.file)
    form[field.key] = response.data
    message.success('上传成功')
  } catch {
    // 失败提示已由请求拦截器统一处理
  } finally {
    uploadingKey.value = ''
  }
}

async function save() {
  if (!formRef.value) return
  // 校验规则来自 config-field.js 中各配置项的 rules 声明
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    await configApi.editConfigBatch(
      fields.value.map(field => ({
        configKey: field.key,
        configValue: toConfigValue(field)
      }))
    )
    message.success('保存成功')
    await load()
  } finally {
    saving.value = false
  }
}

watch(() => props.category, load, { immediate: true })

defineExpose({ load })
</script>

<style scoped lang="scss">
.config-form {
  max-width: 900px;
}

.config-upload {
  display: flex;
  align-items: center;
  gap: 12px;
}

.config-key {
  width: 100%;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 18px;
}
</style>
