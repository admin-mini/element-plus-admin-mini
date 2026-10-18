import ajax from '../ajax.js'

// 用户中心接口：后端 Swagger 中参数均声明为 in: query，统一通过 query 方式提交
const postQuery = (url, data = {}) => ajax.post(`/sys/userCenter/${url}`, null, { params: data })

/**
 * 获取当前登录用户个人资料
 * @returns {Promise<{code,msg,data}>} data 含 id、name、nickname、phone、gender、birthday、email、avatar 等
 */
export function getProfile() {
  return ajax.get('/sys/userCenter/getProfile')
}

/**
 * 编辑个人信息
 * @param {Object} data { id, name, phone, nickname, gender, birthday, email, signature }
 * id 必填，name 必填，其余可选
 */
export function updateUserInfo(data) {
  return postQuery('updateUserInfo', data)
}

/**
 * 修改用户头像（文件上传，multipart/form-data）
 * @param {File} file 图片文件
 */
export function updateAvatar(file) {
  const formData = new FormData()
  formData.append('file', file)
  return ajax.post('/sys/userCenter/updateAvatar', formData)
}

/**
 * 修改用户头像（base64 上传）
 * @param {string} avatar 头像 base64 字符串
 */
export function updateAvatarBase64(avatar) {
  return postQuery('updateAvatarBase64', { avatar })
}

/**
 * 通过验证旧密码修改用户密码
 * @param {Object} data { password: 旧密码, newPassword: 新密码 }
 */
export function updatePassword(data) {
  return postQuery('updatePassword', data)
}

/**
 * 获取当前用户的租户列表
 * @returns {Promise<{code,msg,data}>} data 含 current（当前租户）与 tenants（我的所有租户）
 */
export function getTenants() {
  return ajax.get('/sys/userCenter/tenants')
}

// 账户中心接口：与 userCenter 一致，后端 Swagger 中参数均声明为 in: query，统一通过 query 方式提交
const postAccountQuery = (url, data = {}) => ajax.post(`/sys/accountCenter/${url}`, null, { params: data })

/**
 * 获取账户中心图片验证码（绑定手机号 / 手机号改密等场景的前置校验）
 * @returns {Promise<{code,msg,data}>} data 含 image（图片 base64）与 validCodeReqId（请求号）
 */
export function getAccountPicCaptcha() {
  return ajax.get('/sys/accountCenter/getPicCaptcha')
}

/**
 * 获取当前登录账户详情（账号中心）
 * @returns {Promise<{code,msg,data}>} data 含 id、username（账号）、name、nickname、phone（后端已脱敏）、email 等
 */
export function getAccountDetail() {
  return ajax.get('/sys/accountCenter/detail')
}

/**
 * 通过旧密码修改密码
 * @param {Object} data { password: 旧密码, newPassword: 新密码 }（两者均由 smCrypto 加密后传输）
 */
export function updatePwdByOld(data) {
  return postAccountQuery('updatePwdByOld', data)
}

/**
 * 获取绑定新手机号的短信验证码（发送至待绑定的新手机号）
 * @param {Object} data { phone: 新手机号, validCode: 图片验证码, validCodeReqId: 图片验证码请求号 }
 * @returns {Promise<{code,msg,data}>} data 为短信验证码请求号（用于后续 bindPhone）
 */
export function getBindPhoneValidCode(data) {
  return ajax.get('/sys/accountCenter/bindPhoneGetValidCode', { params: data })
}

/**
 * 绑定新手机号
 * @param {Object} data { phone: 新手机号, validCode: 短信验证码, validCodeReqId: 短信验证码请求号 }
 */
export function bindPhone(data) {
  return postAccountQuery('bindPhone', data)
}

/**
 * 获取修改密码的短信验证码（发送至当前已绑定的手机号，接口不含 phone 参数）
 * @param {Object} data { validCode: 图片验证码, validCodeReqId: 图片验证码请求号 }
 * @returns {Promise<{code,msg,data}>} data 为短信验证码请求号（用于后续 updatePwdByPhone）
 */
export function getUpdatePwdPhoneValidCode(data) {
  return ajax.get('/sys/accountCenter/updatePwdGetPhoneValidCode', { params: data })
}

/**
 * 通过手机验证码修改密码
 * @param {Object} data { validCode: 短信验证码, validCodeReqId: 短信验证码请求号, newPassword: 新密码（smCrypto 加密） }
 */
export function updatePwdByPhone(data) {
  return postAccountQuery('updatePwdByPhone', data)
}
