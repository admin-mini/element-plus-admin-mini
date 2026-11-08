<template>
  <div class="admin-view">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="操作日志" name="operate" />
      <el-tab-pane label="登录日志" name="login" />
    </el-tabs>

    <log-panel :key="activeTab" :type="activeTab" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import LogPanel from './modules/log-panel.vue'

const activeTab = ref('operate')
</script>
