import { useSystemStore } from '@/stores'
import { useSystemSetting } from '@/stores/setting'

import dict from '@/utils/dict'

export default function hasPermission(userPermission) {
  const systemStore = useSystemStore()
  if (!systemStore.isLogin) {
    return false
  }
  if (!useSystemSetting().setting.openPermission) {
    //是否开启权限
    return true
  }
  //所有权限
  if (systemStore.state.permissions[0] == '*:*:*') {
    return true
  }

  userPermission = userPermission.map((item) => item.toString())
  return userPermission.includes(systemStore.state.permissions.toString())
}
