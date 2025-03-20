import axios from 'axios'
import { ElMessage } from 'element-plus'
import dict from '@/utils/dict'
import { useSystemStore } from '@/stores/index'

let systemStore

const ajax = axios.create({
  baseURL: dict.SETTING.API_URL
})
// 添加请求拦截器
ajax.interceptors.request.use(
  function (config) {
    systemStore = useSystemStore()
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
    // 二进制数据则直接返回
    if (
      response.request.responseType === 'blob' ||
      response.request.responseType === 'arraybuffer'
    ) {
      return response.data
    }
    if (response.data.code == 2) {
      ElMessage.info('登陆超时')
      systemStore.logout()
      return Promise.reject('登陆超时')
    }
    if (response.data.code == 3) {
      ElMessage({
        message: '无权限！',
        type: 'warning',
        duration: 5 * 1000
      })
      return Promise.reject('无权限')
    }
    if (response.data.code != 0) {
      ElMessage.error(response.data.msg)
      return Promise.reject('error')
    }
    return response.data
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
