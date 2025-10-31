import axios from 'axios'
import { ElMessage } from 'element-plus'
import SETTING from '@/utils/setting'
import { useSystemStore } from '@/stores/index'
const ajax = axios.create({
  baseURL: SETTING.apiUrl
})
// 添加请求拦截器
ajax.interceptors.request.use(
  function (config) {
    let systemStore = useSystemStore()
    config.headers['Authorization'] = 'Bearer ' + systemStore.state.assessToken
    return config
  },
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error)
  }
)
// 添加响应拦截器
ajax.interceptors.response.use(
  async function (response) {
    let systemStore = useSystemStore()
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

    if (response.data.code == SETTING.timeoutCode) {
      ElMessage.info('登陆超时')
      systemStore.logout()
      return Promise.reject('登陆超时')
    }
    if (response.data.code == SETTING.noAuthCode) {
      ElMessage({
        message: '无权限！',
        type: 'warning',
        duration: 5 * 1000
      })
      return Promise.reject('无权限')
    }
    if (response.data.code != SETTING.successCode) {
      ElMessage.error(response.data.msg)
      return Promise.reject('error')
    }
    return Promise.resolve(response.data)
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
