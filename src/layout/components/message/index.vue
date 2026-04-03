<template>
  <div class="message-component">
      <el-badge :value="unreadMessageNum" :max="99" :hidden="unreadMessageNum === 0">
        <el-button link type="default" size="large" @click="openMessageList"><el-icon class="icon-btn"><BellFilled /></el-icon></el-button>
      </el-badge>
  </div>
</template>

<script setup name="DevUserMessage">
import { ref, onMounted} from 'vue'
import useAdminDialog from '@/plugins/use-admin-dialog';

const adminDialog = useAdminDialog()

//请自行安装
//import { EventSourcePolyfill } from 'event-source-polyfill'

const unreadMessageNum = ref(3) // 初始模拟未读数

// --- SSE 连接逻辑 (保留框架，逻辑同你提供的代码) ---
const createSseConnect = () => {
  // 注意：此处 URL 仅为演示占位，实际开发需替换回 sysConfig.API_URL
  console.log('SSE 连接初始化...')
  // 如果你有真实环境，取消下面代码的注释并配置 tool 和 config
  /*
  const url = '/api/dev/message/createSseConnect'
  const source = new EventSourcePolyfill(url, {
    headers: { 'Authorization': 'your-token' },
    heartbeatTimeout: 300000
  })
  source.addEventListener('message', (e) => {
    const result = JSON.parse(e.data)
    if (result.code === 200) unreadMessageNum.value = result.data
  })
  */
}

//打开消息里诶包
const openMessageList=()=>{
    adminDialog(
          {
              component: import('./message-list.vue'),//调起组件
              props: {
                  onSuccess: (eventData) => {
                      
                  }
              },
              dialogType:  'drawer',
              dialogProps: { title: '消息列表', width: "400px" }
          }
      )
}

onMounted(() => {
  createSseConnect()
})
</script>

<style lang="scss" scoped>
.message-component {
  display: inline-block;
  cursor: pointer;
  .icon-btn {
    color: var(--el-text-color-primary); // 默认使用 Element 的主题色
    transition: transform 0.3s;
    &:hover {
      transform: scale(1.1);
    }
  }
}

</style>