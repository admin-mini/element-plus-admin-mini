<template>
  <div class="admin-view">
    <admin-table :api="api.getFilePage" @init="onTableInit">
      <template #search>
        <el-form :inline="true" :model="$table.query" @submit.prevent="$table.search">
          <admin-grid :cols="4" :x-gap="20">
            <el-form-item label="存储引擎">
              <el-select v-model="$table.query.engine" clearable placeholder="全部">
                <el-option v-for="item in engineOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="文件名">
              <el-input v-model="$table.query.name" clearable />
            </el-form-item>
            <template #last>
              <el-button native-type="submit" type="primary" icon="Search" :loading="$table.loading">
                搜索
              </el-button>
            </template>
          </admin-grid>
        </el-form>
      </template>

      <template #btn>
        <el-button type="primary" icon="Upload" @click="handleUpload">上传文件</el-button>
      </template>

      <template #table>
        <el-table :data="$table.data" v-loading="$table.loading">
          <el-table-column prop="name" label="文件名称" min-width="220" show-overflow-tooltip />
          <el-table-column prop="suffix" label="后缀" width="90" />
          <el-table-column prop="engine" label="存储引擎" width="110">
            <template #default="{ row }">{{ engineLabel(row.engine) }}</template>
          </el-table-column>
          <el-table-column prop="bucket" label="存储桶" width="140" show-overflow-tooltip />
          <el-table-column prop="sizeInfo" label="大小" width="100" />
          <el-table-column prop="fileUrl" label="访问地址" min-width="240" show-overflow-tooltip />
          <el-table-column prop="createTime" label="上传时间" width="180" />
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="handlePreview(row)" v-if="isImage(row)">预览</el-button>
              <el-button link type="primary" @click="handleDetail(row)">详情</el-button>
              <el-button link type="primary" @click="handleDownload(row)">下载</el-button>
              <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </admin-table>

    <el-dialog v-model="detailVisible" title="文件详情" width="720px">
      <el-descriptions :column="2" border>
        <el-descriptions-item v-for="key in detailKeys" :key="key" :label="detailLabels[key]">
          {{ current[key] ?? '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import * as api from '@/api/dev/file-api'
import useAdminDialog from '@/plugins/use-admin-dialog'
import message from '@/utils/message'
import { syncConfirm, downloadUrl } from '@/utils/utils'

const engineOptions = [
  { label: '本地', value: 'local' },
  { label: '阿里云', value: 'aliyun' },
  { label: '腾讯云', value: 'tencent' },
  { label: 'MinIO', value: 'minio' }
]

const imageSuffixes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp']
const detailKeys = [
  'id',
  'fileId',
  'name',
  'engine',
  'bucket',
  'suffix',
  'sizeInfo',
  'objName',
  'storagePath',
  'fileUrl',
  'createTime'
]
const detailLabels = {
  id: '记录ID',
  fileId: '文件ID',
  name: '文件名',
  engine: '存储引擎',
  bucket: '存储桶',
  suffix: '后缀',
  sizeInfo: '文件大小',
  objName: '对象名',
  storagePath: '存储路径',
  fileUrl: '访问地址',
  createTime: '上传时间'
}

const adminDialog = useAdminDialog()
const detailVisible = ref(false)
const current = reactive({})

let $table
function onTableInit(table) {
  $table = table
}

function engineLabel(engine) {
  return engineOptions.find(item => item.value === engine)?.label || engine || '-'
}
function isImage(row) {
  return imageSuffixes.includes(String(row.suffix || '').toLowerCase())
}

function handleUpload() {
  adminDialog({
    component: import('./modules/upload-form.vue'),
    props: {
      onSuccess: () => $table.getTable()
    },
    dialogProps: { title: '上传文件', width: '600px' }
  })
}

async function handleDetail(row) {
  const response = await api.getFileDetail(row.id)
  Object.assign(current, response.data || row)
  detailVisible.value = true
}

function handlePreview(row) {
  window.open(row.fileUrl, '_blank')
}

async function handleDownload(row) {
  const blob = await api.downloadFile(row.id)
  const objectUrl = URL.createObjectURL(blob)
  downloadUrl(objectUrl, row.name)
  // 延迟释放，避免部分浏览器下载尚未开始就失效
  setTimeout(() => URL.revokeObjectURL(objectUrl), 0)
}

function handleDelete(row) {
  syncConfirm(`是否确认删除文件"${row.name}"吗?`, () => api.deleteFile([{ id: row.id }]))
    .then(() => {
      message.success('删除成功')
      $table.getTable()
    })
    .catch(() => {})
}
</script>
