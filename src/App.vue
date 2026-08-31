<script setup>
import zhCn from 'element-plus/es/locale/lang/zh-cn'
const config = {
  showClose: true,
  offset: 100
}
</script>

<template>
  <el-config-provider :message="config" :locale="zhCn">
    <RouterView />
  </el-config-provider>
</template>

<style></style>
