<template>
  <div class="admin-view">
    <admin-table :api="api.getFilePage" @init="init">
      <template #search>
        <el-form :inline="true" :model="$table.query" @submit.prevent="$table.search">
          <admin-grid :cols="4" :x-gap="20">
            <el-form-item label="存储引擎">
              <el-input v-model="$table.query.engine" clearable />
            </el-form-item>
            <el-form-item label="文件名">
              <el-input v-model="$table.query.name" clearable />
            </el-form-item>
            <template #last>
              <el-button native-type="submit" type="primary" icon="Search">搜索</el-button>
            </template>
          </admin-grid>
        </el-form>
      </template>
      <template #table>
        <el-table :data="$table.data" v-loading="$table.loading">
          <el-table-column prop="name" label="文件名称" min-width="220" show-overflow-tooltip />
          <el-table-column prop="suffix" label="后缀" width="90" />
          <el-table-column prop="engine" label="存储引擎" width="120" />
          <el-table-column prop="bucket" label="存储桶" width="140" />
          <el-table-column prop="sizeInfo" label="大小" width="100" />
          <el-table-column prop="fileUrl" label="访问地址" min-width="240" show-overflow-tooltip />
          <el-table-column prop="createTime" label="上传时间" width="180" />
          <el-table-column label="操作" width="120">
            <template #default="{row}">
              <el-button link type="primary" @click="detail(row)">详情</el-button>
              <el-button link type="danger" @click="remove(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </admin-table>
    <el-dialog v-model="visible" title="文件详情" width="680px">
      <el-descriptions :column="2" border>
        <el-descriptions-item v-for="key in keys" :key="key" :label="labels[key]">{{current[key]||'-'}}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>
<script setup>

  import { reactive, ref } from 'vue';
  import { ElMessage,ElMessageBox } from 'element-plus';
  import * as api from '@/api/dev/file-api'
  let $table;
  const visible=ref(false);
  const current=reactive({});
  const keys=['fileId','name','engine','bucket','sizeInfo','objName','storagePath','fileUrl','createTime'];
  const labels={fileId:'文件ID',name:'文件名',engine:'存储引擎',bucket:'存储桶',sizeInfo:'文件大小',objName:'对象名',storagePath:'存储路径',fileUrl:'文件地址',createTime:'创建时间'}
  function init(t){$table=t} async function detail(row){Object.assign(current,(await api.getFileDetail(row.fileId||row.id)).data||row);
  visible.value=true} function remove(row){ElMessageBox.confirm('确定删除该文件吗？','提示').then(async()=>{await api.deleteFile([{id:row.fileId||row.id}]);
  ElMessage.success('删除成功');
  $table.getTable()}).catch(()=>{})}
  </script>
