import ajax from '../ajax.js'

// 用户中心接口：后端 Swagger 中参数均声明为 in: query，统一通过 query 方式提交
const postQuery = (url, data = {}) => ajax.post(`/sys/userCenter/${url}`, null, { params: data })

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
