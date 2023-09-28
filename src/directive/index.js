import hasPermission from '@/utils/permission'
export default {
  install(app) {
    app.config.globalProperties.$p = hasPermission
    app.directive('p', (el, binding) => {
      computePermission(el, binding)
    })
  }
}
function computePermission(el, options) {
  let domPermissionList = options.value
  if (!hasPermission(domPermissionList)) {
    el.remove()
  }
}
