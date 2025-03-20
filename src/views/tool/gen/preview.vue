<template>
  <admin-dialog-content>
    <el-tabs v-model="activeName">
      <el-tab-pane v-for="(value, key) in preview" :key="key"
        :label="key.substring(key.lastIndexOf('/') + 1).slice(0, -3)" :name="key">
        <el-link :underline="false" icon="document" @click="copyText(value)" style="float: right">
          复制
        </el-link>
        <pre v-if="activeName === key"><code class="hljs" v-html="highlightedCode(value)"></code></pre>
      </el-tab-pane>
    </el-tabs>
    <template #footer>
      <el-button @click="emits('end')">关闭</el-button>
    </template>
  </admin-dialog-content>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { previewTable } from '@/api/tool/gen'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

import { useClipboard } from '@vueuse/core'
const { copy, copied } = useClipboard({
  legacy: true
})
const props = defineProps({
  tableId: {
    type: [String, Number],
    required: true
  }
})

const emits = defineEmits(['end'])

const activeName = ref('')
const preview = ref({})

/** 高亮显示 */
function highlightedCode(code) {
  const result = hljs.highlightAuto(code)
  return result.value
}

/** 复制代码成功 */
function copyText(text) {
  copy(text).then(() => {
    ElMessage.success('复制成功')
  })
}

/** 查询表详细信息 */
function getPreviewTable() {
  previewTable(props.tableId).then((res) => {
    preview.value = res.data
    activeName.value = Object.keys(res.data)[0]
  })
}

onMounted(() => {
  getPreviewTable()
})
</script>

<style lang="scss" scoped>
pre {
  margin: 0;
  padding: 0.6rem;
  overflow: auto;

  code {
    padding: 0;
    font-size: 14px;
    display: block;
    overflow-x: auto;
    color: #333;
    background: #f8f8f8;
  }
}
</style>
