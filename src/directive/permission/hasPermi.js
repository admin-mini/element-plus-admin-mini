/**
 * v-hasPermi 操作权限处理
 * Copyright (c) 2019 ruoyi
 */

import { checkPermi } from '@/utils/permission'

export default {
  mounted(el, binding, vnode) {
    if (!checkPermi(value)) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  }
}
