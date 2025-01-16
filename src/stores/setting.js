import { defineStore } from 'pinia'
import { computed, ref, toValue } from 'vue'

export const useSystemSetting = defineStore('setting', () => {
  // state
  const setting = ref({
    openPermission: true, //是否开启权限
    apiUrl: '/api/', //API具体路径
    useTag: true
  })
  //生产环境使用/index.html引用的setting.js
  if (!import.meta.env.DEV && window.ADMIN_SETTING) {
    Object.assign(setting.value, window.ADMIN_SETTING)
  }
  return {
    setting
  }
})
