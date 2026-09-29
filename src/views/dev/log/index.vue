<template>
  <div class="admin-view">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="操作日志" name="op" />
      <el-tab-pane label="访问日志" name="vis" />
    </el-tabs>

    <log-panel :key="activeTab" :type="activeTab" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import LogPanel from './modules/log-panel.vue'

const activeTab = ref('op')
</script>
