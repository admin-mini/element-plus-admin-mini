import axios from 'axios'
import { ElLoading, ElMessage } from 'element-plus'
import { useSystemStore } from '@/stores/index'
import { blobValidate, tansParams } from '@/utils/utils'
import { saveAs } from 'file-saver'
import errorCode from '@/utils/errorCode'
import SETTING from '@/utils/setting'

let systemStore

const request = axios.create()

// 添加请求拦截器
request.interceptors.request.use(
  function (config) {
    config.baseURL = SETTING.apiUrl

    systemStore = useSystemStore()
    // config.headers['Authorization'] = systemStore.state.token
    config.headers['Authorization'] = 'Bearer ' + systemStore.state.token // 让每个请求携带自定义token 请根据实际情况自行修改
    // get请求映射params参数
    if (config.method === 'get' && config.params) {
      let url = config.url + '?' + tansParams(config.params)
      url = url.slice(0, -1)
      config.params = {}
      config.url = url
    }
    return config
  },
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error)
  }
)
// 添加响应拦截器
request.interceptors.response.use(
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
    if (response.data.code == 401) {
      ElMessage.info('登陆超时')
      systemStore.logout()
      return Promise.reject('timeout')
    }
    // if (response.data.code == 3) {
    //   ElMessage({
    //     message: '无权限！',
    //     type: 'warning',
    //     duration: 5 * 1000
    //   })
    // }
    response.data.code = response.data.code == 0 ? 200 : response.data.code
    if (response.data.code != 200) {
      ElMessage.error(response.data.msg)
      return Promise.reject('error')
    }
    return response.data
  },
  function (error) {
    console.log(error)
    if (error.status != 200) {
      ElMessage.error(error.message)
    }
    // console.warn('请求错误', error) // for debug

    // Message({
    //   message: error.message,
    //   type: 'error',
    //   duration: 5 * 1000,
    // });
    return Promise.reject(error)
  }
)

// 通用下载方法
let downloadLoadingInstance // 加载实例
export function download(url, params, filename, config) {
  downloadLoadingInstance = ElLoading.service({
    text: '正在下载数据，请稍候',
    background: 'rgba(0, 0, 0, 0.7)'
  })
  return request
    .post(url, params, {
      transformRequest: [
        (params) => {
          return tansParams(params)
        }
      ],
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      responseType: 'blob',
      ...config
    })
    .then(async (data) => {
      const isBlob = blobValidate(data)
      if (isBlob) {
        const blob = new Blob([data])
        saveAs(blob, filename)
      } else {
        const resText = await data.text()
        const rspObj = JSON.parse(resText)
        const errMsg = errorCode[rspObj.code] || rspObj.msg || errorCode['default']
        ElMessage.error(errMsg)
      }
      downloadLoadingInstance.close()
    })
    .catch((r) => {
      console.error(r)
      ElMessage.error('下载文件出现错误，请联系管理员！')
      downloadLoadingInstance.close()
    })
}
export function uploadFile(data) {
  return request.post('/common/upload', data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
export default request
