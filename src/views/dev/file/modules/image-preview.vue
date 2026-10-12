<template>
  <admin-dialog-content>
    <el-image :src="src" fit="contain" class="preview-image" :preview-src-list="[src]" :initial-index="0" />
  </admin-dialog-content>
</template>

<script setup>
defineProps({
  // 图片访问地址
  src: { type: String, default: '' }
})
</script>

<style scoped lang="scss">
.preview-image {
  display: block;
  width: 100%;
  max-height: 70vh;
}
</style>