<script setup>
import { watch } from 'vue'
import { useSystemStore } from '@/stores/index'
import SETTING from '@/utils/setting'
import wsClient from '@/utils/websocket'

const systemStore = useSystemStore()

//每次刷新时都请求一下个人信息
if(systemStore.isLogin){
  systemStore.getUserInfo();
}

/**
 * WebSocket 全局连接入口：
 * token 写入（登录成功/切换租户）建连，token 清空（退出登录）断开。
 * immediate 保证刷新页面恢复会话后也能自动连上。
 */
watch(
  () => systemStore.state.token,
  (token) => {
    if (!SETTING.websocketEnable) return
    if (token) {
      wsClient.connect(token)
    } else {
      wsClient.disconnect()
    }
  },
  { immediate: true }
)
</script>

<template>
  <RouterView />
</template>

<style></style>
