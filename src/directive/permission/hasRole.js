/**
 * v-hasRole 角色权限处理
 * Copyright (c) 2019 ruoyi
 */

import { checkRole } from '@/utils/permission'

export default {
  mounted(el, binding, vnode) {
    const { value } = binding
    if (!checkRole(value)) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  }
}
