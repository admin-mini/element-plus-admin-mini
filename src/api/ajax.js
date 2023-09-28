import axios from 'axios'
import { ElMessage } from 'element-plus'
import dict from '@/utils/dict'
import { useSystemStore } from '@/stores/index'

const systemStore = useSystemStore()

const ajax = axios.create({
  baseURL: dict.SETTING.API_URL
})
// 添加请求拦截器
ajax.interceptors.request.use(
  function (config) {
    config.headers['Authorization'] = systemStore.state.token
    return config
  },
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error)
  }
)
// 添加响应拦截器
ajax.interceptors.response.use(
  function (response) {
    if (response.headers.authorization) {
      systemStore.setToken(response.headers.authorization)
    }
    if (response.data.code == 2) {
      ElMessage.info('登陆超时')
      systemStore.logout()
    }
    if (response.data.code == 3) {
      ElMessage({
        message: '无权限！',
        type: 'warning',
        duration: 5 * 1000
      })
    }
    return response
  },
  function (error) {
    console.warn('请求错误', error) // for debug
    // Message({
    //   message: error.message,
    //   type: 'error',
    //   duration: 5 * 1000,
    // });
    return Promise.reject(error)
  }
)

export default ajax
