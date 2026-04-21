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

/** 获取登录用户信息（获取的为当前租户的，每个租户的登录状态单独存储，只是用统一的account登录 */
export const getLoginUser=()=> {
     return baseRequest("/auth/user/getLoginUser")
}
