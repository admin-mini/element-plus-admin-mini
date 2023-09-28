import { useSystemStore } from '@/stores'
import dict from '@/utils/dict'

export default function hasPermission(userPermission) {
  const systemStore = useSystemStore()
  if (!systemStore.isLogin) {
    return false
  }
  if (!dict.SETTING.OPEN_PERMISSION) {
    //是否开启权限
    return true
  }
  if (systemStore.isSuperAdmin) {
    return true
  }

  userPermission = userPermission.map((item) => item.toString())
  return userPermission.includes(systemStore.state.utype.toString())
}
