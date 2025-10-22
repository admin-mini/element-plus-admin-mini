import { useMediaQuery } from '@vueuse/core'
import { reactive, watch } from 'vue'

const SETTING = reactive({
  openPermission: true, //是否开启权限
  apiUrl: '/api/', //API具体路径
  useTag: true,//是否开启标签
  useBreadcrumb: true,//是否开启面包屑
  successCode: 0,//成功状态码
  errorCode: 1,//失败状态码
  timeoutCode: 2,//超时状态码
  noAuthCode: 3,//未授权状态码
  useOauth2: true,//是否启用双token校验
})
const isSmallScreen = useMediaQuery('(max-width: 1024px)')
//记录手动配置的SETTING.useTag/useBreadcrumb数据
const useTag = SETTING.useTag;
const useBreadcrumb = SETTING.useBreadcrumb;
watch(isSmallScreen, (val) => {
  if (val) {
    SETTING.useTag = false;
    SETTING.useBreadcrumb = false;
  } else {
    SETTING.useTag = useTag;
    SETTING.useBreadcrumb = useBreadcrumb;
  }
}, { immediate: true })
SETTING.formatUrl = function (url) {
  //如何url前缀包含域名了，就不处理
  if (url.indexOf('http') == 0) {
    return url
  }
  return SETTING.apiUrl + url
}

//生产环境使用/index.html引用的setting.js
if (!import.meta.env.DEV && window.ADMIN_SETTING) {
  Object.assign(SETTING, window.ADMIN_SETTING)
}
export default SETTING
