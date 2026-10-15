import baseRequest from '../base-request.js'

const request=(url,data,method)=>{
   return baseRequest("/auth/account/"+url,data,method);
}

/**
 * 获取登录验证码
 */
export const getLoginPicCaptcha=()=> {
   return request("getPicCaptcha")
}

/**
 * 使用账号密码登录
 *
 * @loginParams 登录信息{username,passowrd,validCode,validCodeReqId,device,deviceId}
 */
export const login=( loginParams)=> {
  return request("login",loginParams,"post")
}

/**
 * 手机验证码登录
 *
 * @loginParams {phone, validCode, validCodeReqId, device, deviceId}
 */
export const loginByPhone=( loginParams)=> {
  return request("loginByPhone",loginParams,"post")
}

/**
 * 获取手机登录短信验证码
 * @params {phone, validCode, validCodeReqId}（图片验证码及其请求号）
 */
export const getPhoneLoginValidCode=(params)=> {
  return request("getPhoneLoginValidCode",params)
}

/**
 * 账号注册获取手机验证码
 * @params {phone, validCode, validCodeReqId}
 */
export const getPhoneRegValidCode=(params)=> {
  return request("getPhoneRegValidCode",params)
}

/**
 * 获取找回密码手机验证码
 * @params {phone, validCode, validCodeReqId}（图片验证码及其请求号）
 */
export const getPhoneFindPasswordValidCode=(params)=> {
  return request("getPhoneFindPasswordValidCode",params)
}

/**
 * 通过手机验证码重置密码（找回密码）
 * @params {phone, validCode, validCodeReqId, newPassword}（newPassword 已 smCrypto 加密传输）
 */
export const phoneFindPassword=(params)=> {
  return request("phoneFindPassword",params,"post")
}

/**
 * 账号注册
 *
 * @registerParams {name, username, phone, email, password, validCode, validCodeReqId}
 */
export const register=( registerParams)=> {
  return request("register",registerParams,"post")
}

/** 获取登录用户信息（获取的为当前租户的，每个租户的登录状态单独存储，只是用统一的account登录 */
export const getLoginUser=()=> {
     return baseRequest("/auth/user/getLoginUser")
}

/**
 * 切换租户（登录成功后可用）
 * 返回结果与登录接口一致：{ token, tenantId, username, name }
 *
 * @param switchParams { tenantId }
 */
export const switchTenant=(switchParams)=> {
  return baseRequest("/auth/user/switchTenant",switchParams,"post")
}
