import axios from 'axios'
import SETTING from './setting'
const request = axios.create()
import packageJson from '../package.json'
let token = ''
try {
  let storage = JSON.parse(sessionStorage.getItem(packageJson.name))
  token = storage.token
} catch (err) {
  console.warn(err)
}

request.interceptors.request.use(
  function (config) {
    config.baseURL = SETTING.apiUrl
    config.headers['Authorization'] = 'Bearer ' + token
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
    if (response.data.code != 200) {
      alert(response.data.msg)
      return Promise.reject('error')
    }
    return response.data
  },
  function (error) {
    alert(error.message)
    return Promise.reject(error)
  }
)

export function getPlatNotice(noticeId) {
  return request({
    url: `/system/notice/${noticeId}`,
    method: 'get'
  })
}
