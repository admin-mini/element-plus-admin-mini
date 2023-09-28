import { render, h, getCurrentInstance, onBeforeUnmount } from 'vue'
import { ElDialog } from 'element-plus'
import 'element-plus/es/components/dialog/style/css'
export default function useAdminDialog() {
  const vm = getCurrentInstance()

  return function (vnode, opts) {
    onBeforeUnmount(() => {
      close()
    }, vm)
    vnode.appContext = vm.appContext

    let dom = document.createElement('div')
    let dialogVnode = h(
      ElDialog,
      {
        onClosed: () => {
          dom.remove()
        },
        modelValue: true,
        closeOnClickModal: false,
        alignCenter: true,
        ...opts
      },
      { default: () => vnode }
    )
    dialogVnode.appContext = vm.appContext
    let _success = vnode.props.onSuccess || function () {}
    let _end = vnode.props.onEnd || function () {}
    vnode.props.onSuccess = function (...arr) {
      _success(...arr)
      close()
    }
    vnode.props.onEnd = function (...arr) {
      _end(...arr)
      close()
    }
    function close() {
      dialogVnode.component.props.modelValue = false
    }
    render(dialogVnode, dom)
    document.body.appendChild(dom)
  }
}
useAdminDialog.install = function (app) {
  void app
  // app.config.globalProperties.useAdminDialog = useAdminDialog
}
