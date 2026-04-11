import { useSystemStore } from '@/stores'
import SETTING from './setting'

/**
 * 
 * @param {用户权限标识} userPermission 
 * @param {验证规则，默认or 支持and} rule 
 * @returns 
 */
export default function hasPermission(userPermission, rule = 'or') {
  const systemStore = useSystemStore()
  if (!systemStore.isLogin) {
    return false
  }
  if (!SETTING.openPermission) {
    //未开启权限验证，直接范湖true
    return true
  }
  if (systemStore.isSuperAdmin) {
    return true
  }
  //没写入权限则直接返回false
  if(!userPermission) return false;
  // 获取用户实际拥有的权限数组
  const userHavePermissions = systemStore.state?.permissions || []
  //无权限直接返回false
  if( userHavePermissions.length==0){
    return false;
  }
  //如果是数组则验证rule
  if (Array.isArray(userPermission)) {
    
    if(rule=='or'){
      return userPermission.some(permission => 
        userHavePermissions.includes(permission)
      )
    }else{ //否则为and模式
      return userPermission.every(permission => 
            userHavePermissions.includes(permission)
          )
    }
	}

  return userHavePermissions.includes(userPermission)
}
