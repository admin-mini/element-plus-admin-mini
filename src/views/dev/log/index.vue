<template>
  <div class="admin-view">
    <admin-table :api="api.getLogPage" @init="init">
      <template #search>
        <el-form :inline="true" :model="$table.query" @submit.prevent="$table.search">
          <admin-grid :cols="4" :x-gap="20">
            <el-form-item label="日志标题">
              <el-input v-model="$table.query.title" clearable />
            </el-form-item>
            <el-form-item label="操作人">
              <el-input v-model="$table.query.username" clearable />
            </el-form-item>
            <el-form-item label="日志分类">
              <el-input v-model="$table.query.category" clearable />
            </el-form-item>
            <template #last>
              <el-button native-type="submit" type="primary" icon="Search">搜索</el-button>
            </template>
          </admin-grid>
        </el-form>
      </template>
      <template #table>
        <el-table :data="$table.data" v-loading="$table.loading">
          <el-table-column prop="title" label="日志标题" min-width="180" show-overflow-tooltip />
          <el-table-column prop="category" label="分类" width="120" />
          <el-table-column prop="operationType" label="操作类型" width="120" />
          <el-table-column prop="reqMethod" label="请求方式" width="100" />
          <el-table-column prop="reqUrl" label="请求地址" min-width="220" show-overflow-tooltip />
          <el-table-column prop="operatorUserName" label="操作人" width="120" />
          <el-table-column prop="duration" label="耗时(ms)" width="100" />
          <el-table-column prop="exeStatus" label="状态" width="100" />
          <el-table-column prop="createTime" label="时间" width="180" />
          <el-table-column label="操作" width="110">
            <template #default="{row}">
              <el-button link type="primary" @click="detail(row)">详情</el-button>
              <el-button link type="danger" @click="remove(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </admin-table>
    <el-dialog v-model="visible" title="日志详情" width="800px">
      <el-descriptions :column="2" border>
        <el-descriptions-item v-for="key in keys" :key="key" :label="key">{{current[key]||'-'}}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>
<script setup>

  import { reactive,ref } from 'vue';
  import {ElMessage,ElMessageBox} from 'element-plus';
  import * as api from '@/api/dev/log-api'
  let $table;
  const visible=ref(false);
  const current=reactive({});
  const keys=['title','category','modular','operationType','reqMethod','reqUrl','reqParams','operatorUserName','operatorIp','operatorOs','exeStatus','exeMessage','resultData','createTime']
  function init(t){$table=t}async function detail(row){Object.assign(current,(await api.getLogDetail(row.id)).data||row);
  visible.value=true}function remove(row){ElMessageBox.confirm('确定删除该日志吗？','提示').then(async()=>{await api.deleteLog([{id:row.id}]);
  ElMessage.success('删除成功');
  $table.getTable()}).catch(()=>{})}
  </script>
