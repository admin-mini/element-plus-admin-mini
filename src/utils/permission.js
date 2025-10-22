import { useSystemStore } from '@/stores'
import SETTING from './setting'


export default function hasPermission(userPermission) {
  const systemStore = useSystemStore()
  if (!systemStore.isLogin) {
    return false
  }
  if (!SETTING.openPermission) {
    //是否开启权限
    return true
  }
  if (systemStore.isSuperAdmin) {
    return true
  }

  userPermission = userPermission.map((item) => item.toString())
  return userPermission.includes(systemStore.state.utype.toString())
}
