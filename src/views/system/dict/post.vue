<template>
  <admin-dialog-content>
    <el-form ref="formRef" :model="postData" label-width="80px">
      <admin-space cols="1">
        <el-form-item label="字典名称" prop="dictName" :rules="[$rules.required]">
          <el-input v-model="postData.dictName" placeholder="请输入字典名称" />
        </el-form-item>
        <el-form-item label="字典类型" prop="dictType" :rules="[$rules.required]">
          <el-input v-model="postData.dictType" placeholder="请输入字典类型" />
        </el-form-item>
        <el-form-item label="数据类型" prop="dictValueType">
          <select-dict v-model="postData.dictValueType" :dict="$dict.dictValueType"></select-dict>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="postData.status">
            <el-radio v-for="dict in $dict.sys_normal_disable" :key="dict.value" :label="dict.value">
              {{ dict.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="postData.remark" type="textarea" placeholder="请输入内容"></el-input>
        </el-form-item>
      </admin-space>
    </el-form>
    <template #footer>
      <el-button @click="emits('end')">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="loading">确定</el-button>
    </template>
  </admin-dialog-content>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getType, addType, updateType } from '@/api/system/dict/type'
import { getDict } from '@/utils/dict'

getDict(['sys_normal_disable'])

const props = defineProps({
  row: Object
})
const emits = defineEmits(['end', 'success'])

const loading = ref(false)
const formRef = ref()

const postData = ref({
  dictId: undefined,
  dictName: undefined,
  dictType: undefined,
  status: '0',
  remark: undefined
})

if (props.row) {
  getType(props.row.dictId).then((res) => {
    Object.assign(postData.value, res.data)
  })
}

function submitForm() {
  formRef.value?.validate((valid) => {
    if (valid) {
      loading.value = true
      const fn = postData.value.dictId ? updateType : addType
      fn(postData.value)
        .then((res) => {
          ElMessage.success(res.msg)
          emits('success')
        })
        .finally(() => {
          loading.value = false
        })
    }
  })
}
</script>
