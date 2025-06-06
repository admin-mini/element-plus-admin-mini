<template>
  <div class="app-container">
    <h1>{{ notice.noticeTitle }}</h1>
    <div v-html="notice.noticeContent"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getPlatNotice } from './api'
let noticeId = new URL(location.href).searchParams.get('noticeId')
const notice = ref('')
getPlatNotice(noticeId).then((res) => {
  notice.value = res.data
})
</script>

<style lang="scss">
.app-container {
  padding: 20px;
  p,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    padding-bottom: 1em;
  }
}
</style>
