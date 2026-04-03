<template>
  <div class="error-page-container">
    <el-result
      status="warning"
      title="404"
      sub-title="对不起，您访问的页面不存在。"
    >
      <template #extra>
        <el-space size="large">
          <el-button type="primary" @click="gohome">返回首页</el-button>
          <el-button @click="goback">返回上一页</el-button>
        </el-space>
      </template>
    </el-result>
  </div>
</template>

<script setup>
const gohome = () => {
  location.href = '/'
}
const goback = () => {
  window.history.back()
}
</script>

<style></style>
