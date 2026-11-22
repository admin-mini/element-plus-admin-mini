import { useMediaQuery } from '@vueuse/core'
import { reactive, watch } from 'vue'

const SETTING = reactive({
  openPermission: true, //是否开启权限
  apiUrl: '/api/', //API具体路径
  useTag: true,//是否开启标签
  useBreadcrumb: true,//是否开启面包屑
  successCode: 200,//成功状态码
  errorCode: 500,//失败状态码
  timeoutCode: 401,//超时状态码
  noAuthCode: 403,//未授权状态码
  useOauth2: true,//是否启用双token校验
  sm2PublicKey:"0401d4a6ef9c904b04b0722330d479bc5905143a85de0048167c398b6571f2b1281a59633cd10937781413b4cd35a64235896ce5d6f0231b06d11d7bf868c1c93d",
  // WebSocket 配置
  websocketEnable: true, //总开关，false 时不建立连接
  websocketUrl: '', //完整连接地址，留空按环境自动推导
  websocketDevPort: 8098, //开发环境自动推导端口
  websocketClient: 'web', //客户端标识 web/app/pad/desktop
  websocketReconnect: true, //断线自动重连
  websocketReconnectDelay: 3000, //首次重连间隔（毫秒）
  websocketReconnectMaxDelay: 30000, //重连间隔上限（毫秒）
  websocketMaxRetry: 0, //最大重连次数，0 表示无限
  websocketRequestTimeout: 10000 //request 请求超时（毫秒）
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
