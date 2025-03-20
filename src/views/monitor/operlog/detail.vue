<template>
  <admin-dialog-content>
    <el-descriptions :column="1" border>
      <el-descriptions-item label="操作模块">{{ props.row.title }}</el-descriptions-item>
      <el-descriptions-item label="登录信息">
        {{ props.row.operName }} / {{ props.row.operIp }} / {{ props.row.operLocation }}
      </el-descriptions-item>
      <el-descriptions-item label="请求地址">{{ props.row.operUrl }}</el-descriptions-item>
      <el-descriptions-item label="请求方式">{{ props.row.requestMethod }}</el-descriptions-item>
      <el-descriptions-item label="操作方法">{{ props.row.method }}</el-descriptions-item>
      <el-descriptions-item label="请求参数">{{ props.row.operParam }}</el-descriptions-item>
      <el-descriptions-item label="返回参数">{{ props.row.jsonResult }}</el-descriptions-item>
      <el-descriptions-item label="操作状态">
        <dict-tag :options="$dict.sys_common_status" :value="props.row.status" />
      </el-descriptions-item>
      <el-descriptions-item label="操作时间">{{ props.row.operTime }}</el-descriptions-item>
      <el-descriptions-item label="消耗时间">{{ props.row.costTime }} ms</el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-button @click="emits('end')">关闭</el-button>
    </template>
  </admin-dialog-content>
</template>

<script setup>
import { getDict } from '@/utils/dict'

getDict(['sys_common_status'])

const props = defineProps({
  row: Object
})
const emits = defineEmits(['end'])
</script>
