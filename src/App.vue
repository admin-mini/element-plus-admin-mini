<script setup>
import { useSystemStore } from '@/stores/index'
const systemStore = useSystemStore()

console.log(systemStore);

//每次刷新时都请求一下个人信息
if(systemStore.isLogin){
  systemStore.getUserInfo();
}

</script>

<template>
  <RouterView />
</template>

<style></style>
