import { reactive } from 'vue'

const SETTING = reactive({
  openPermission: true, //是否开启权限
  apiUrl: '/api/', //API具体路径
  useTag: true
})
SETTING.formatUrl = function (url, defaultUrl) {
  if (!url) {
    return defaultUrl || url
  }
  //如何url前缀包含域名了，就不处理
  if (url.indexOf('http') == 0) {
    return url
  }
  if (url.startsWith('/')) {
    url = url.substring(1)
  }
  return SETTING.apiUrl + url
}

//生产环境使用/index.html引用的setting.js
if (!import.meta.env.DEV && window.ADMIN_SETTING) {
  Object.assign(SETTING, window.ADMIN_SETTING)
}
export default SETTING
