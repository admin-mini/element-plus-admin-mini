<template>
  <admin-dialog-content v-loading="loading">
    <el-form ref="formRef" :model="postData" label-width="100px">
      <el-row :gutter="20">
        <!-- 左侧：基础内容 -->
        <el-col :span="14">

         <el-form-item label="短信类型" prop="type" :rules="[$rules.required]">
            <el-select v-model="postData.type" placeholder="请选择短信类型" style="width: 100%" :disabled="isEdit">
              <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="系统内置" prop="isSys" :rules="[$rules.required]">
            <el-select v-model="postData.isSys" placeholder="请选择是否系统内置" style="width: 100%" :disabled="isEdit">
              <el-option v-for="item in yesNoOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
           <el-form-item label="模板编码" prop="code" :rules="[$rules.required]">
            <el-input v-model="postData.code" placeholder="同一通道下编码唯一"  :disabled="isEdit"/>
          </el-form-item>
          <el-form-item label="模板名称" prop="name" :rules="[$rules.required]">
            <el-input v-model="postData.name" placeholder="请输入模板名称" />
          </el-form-item>
          <el-form-item label="短信通道" prop="channelCode" :rules="[$rules.required]">
            <el-select v-model="postData.channelCode" placeholder="请选择短信通道" style="width: 100%">
              <el-option v-for="item in channelOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="通道模板ID" prop="apiTemplateId" :rules="[$rules.required]">
            <el-input v-model="postData.apiTemplateId" placeholder="请输入通道端模板ID" />
          </el-form-item>
          <el-form-item label="模板内容" prop="content" :rules="[$rules.required, $rules.length({ max: 4000 })]">
            <el-input
              v-model="postData.content"
              type="textarea"
              :rows="9"
              maxlength="4000"
              show-word-limit
              placeholder="请输入模板内容，变量使用 ${code} 形式，例如：您的验证码是 ${code}，请勿泄露"
            />
          </el-form-item>
          <el-form-item label="状态" prop="status" :rules="[$rules.required]">
            <el-switch v-model="postData.status" :active-value="1" :inactive-value="0" />
          </el-form-item>
          
          <el-form-item label="备注">
            <el-input v-model="postData.remark" type="textarea" :rows="2" placeholder="请输入备注" />
          </el-form-item>
        </el-col>

        <!-- 右侧：参数明细 -->
        <el-col :span="10">
          <el-form-item label="模板参数" label-width="80px">
            <div class="variable-panel">
              <div v-if="!variables.length" class="variable-empty">
                模板内容中未检测到变量，请在左侧模板内容中使用 ${变量名} 形式
              </div>
              <div v-for="item in variables" :key="item.name" class="variable-item">
                <span class="variable-name">{{ '${' + item.name + '}' }}</span>
                <el-select v-model="item.type" size="small" class="variable-type">
                  <el-option
                    v-for="opt in variableTypeOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
              </div>
            </div>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="emits('end')">取消</el-button>
      <el-button type="primary" :loading="loading" @click="submitForm">确定</el-button>
    </template>
  </admin-dialog-content>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import message from '@/utils/message'
import * as api from '@/api/dev/sms-api'

const emits = defineEmits(['end', 'success'])
const props = defineProps({
  record: Object
})

// 编辑模式：type、isSys 仅允许新增时设置，编辑时不可修改
const isEdit = computed(() => !!props.record?.id)

// 取值与后端 SmsChannelEnum 保持一致
const channelOptions = [
  { label: '阿里云', value: 'aliyun' },
  { label: '腾讯云', value: 'tencent' }
]

// 取值与后端 DevSmsTypeEnum 保持一致
const typeOptions = [
  { label: '验证码', value: 1 },
  { label: '通知类', value: 2 },
  { label: '营销类', value: 3 }
]

// 取值与后端 CommonYesNoEnum 保持一致
const yesNoOptions = [
  { label: '是', value: 1 },
  { label: '否', value: 0 }
]

// 变量类型：字符串=1、数字=2，默认字符串
const variableTypeOptions = [
  { label: '字符串', value: 1 },
  { label: '数字', value: 2 }
]
const DEFAULT_VARIABLE_TYPE = 1
// 匹配 ${xxx} 形式的模板变量
const VARIABLE_PATTERN = /\$\{\s*([^}]+?)\s*\}/g

const loading = ref(false)
const formRef = ref()

const postData = ref({
  id: undefined,
  channelCode: undefined,
  type: undefined,
  isSys: 0,
  code: undefined,
  name: undefined,
  apiTemplateId: undefined,
  content: '',
  status: 1,
  remark: undefined
})

// 模板变量明细：由模板内容自动解析得到，用户只需选择类型
const variables = ref([])

// 解析 content 中出现的变量名（去重并保持出现顺序）
function parseVariableNames(content) {
  const names = []
  let match
  VARIABLE_PATTERN.lastIndex = 0
  while ((match = VARIABLE_PATTERN.exec(String(content || ''))) !== null) {
    const name = match[1]
    if (name && !names.includes(name)) names.push(name)
  }
  return names
}

// 内容变化时同步变量明细，已存在的变量保留其已选类型
function syncVariables() {
  const typeMap = new Map(variables.value.map(item => [item.name, item.type]))
  variables.value = parseVariableNames(postData.value.content).map(name => ({
    name,
    type: typeMap.has(name) ? typeMap.get(name) : DEFAULT_VARIABLE_TYPE
  }))
}

watch(
  () => postData.value.content,
  () => syncVariables()
)

function submitForm() {
  formRef.value?.validate(valid => {
    if (!valid) return
    loading.value = true
    const { id, channelCode, code, name, apiTemplateId, content, status, remark, type, isSys } =
      postData.value
    // type、isSys 仅新增时可设置，编辑时控件禁用，随表单原值提交（后端字段为 @NotNull）
    const params = {
      channelCode,
      code,
      name,
      apiTemplateId,
      content,
      status,
      remark,
      type,
      isSys,
      variables: variables.value.map(item => ({ name: item.name, type: item.type }))
    }
    const fn = id ? api.editTemplate : api.addTemplate
    fn(id ? { id, ...params } : params)
      .then(res => {
        message.success(res.msg || '保存成功')
        emits('success')
      })
      .finally(() => {
        loading.value = false
      })
  })
}

onMounted(() => {
  if (!props.record?.id) return
  loading.value = true
  // 列表接口只返回模板基本信息，模板内容与变量明细需取详情回显
  api
    .getTemplateDetail(props.record.id)
    .then(res => {
      const data = res.data || {}
      // 列表行数据兜底，详情数据覆盖，保证 type/isSys 等字段回显
      Object.assign(postData.value, props.record, data)
      // 变量类型优先取详情返回值，其余按 content 解析结果默认字符串
      const typeMap = new Map((data.variables || []).map(item => [item.name, item.type]))
      variables.value = parseVariableNames(postData.value.content).map(name => ({
        name,
        type: typeMap.get(name) ?? DEFAULT_VARIABLE_TYPE
      }))
    })
    .finally(() => {
      loading.value = false
    })
})
</script>

<style scoped lang="scss">
.variable-panel {
  width: 100%;
  max-height: 462px;
  overflow: auto;
  padding: 8px 12px;
  box-sizing: border-box;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
}

.variable-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 0;

  & + .variable-item {
    border-top: 1px dashed var(--el-border-color-lighter);
  }
}

.variable-name {
  font-family: Consolas, Monaco, monospace;
  color: var(--el-color-primary);
  word-break: break-all;
}

.variable-type {
  width: 110px;
  flex-shrink: 0;
}

.variable-empty {
  padding: 8px 0;
  color: var(--el-text-color-secondary);
  font-size: 13px;
  line-height: 1.6;
}
</style>