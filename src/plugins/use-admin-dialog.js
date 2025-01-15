import { render, getCurrentInstance, onBeforeUnmount, createVNode, h } from 'vue'
import { ElDialog, useGlobalComponentSettings } from 'element-plus'
const Dialog = {
  setup(props, context) {
    // this is meant to fix global methods like `ElMessage(opts)`, this way we can inject current locale
    // into the component as default injection value.
    // refer to: https://github.com/element-plus/element-plus/issues/2610#issuecomment-887965266
    useGlobalComponentSettings() //解决弹出组件无法获取全局配置问题
    return () => {
      return h('div', null, context.slots)
    }
  }
}
import 'element-plus/es/components/dialog/style/css'
export default function useAdminDialog() {
  const vm = getCurrentInstance()

  return async function (vnode, opts) {
    if (vnode.component) {
      opts = vnode.dialogProps
      let props = vnode.props

      if (vnode.component instanceof Promise) {
        vnode = await vnode.component
        vnode = createVNode(vnode.default, props)
      }
    }
    console.log(vnode)
    onBeforeUnmount(() => {
      close()
    }, vm)

    let dom = document.createElement('div')
    let dialogVnode = createVNode(
      ElDialog,
      {
        onClosed: () => {
          render(null, dom) //触发内部onUnmounted
          dom.remove()
        },
        modelValue: true,
        closeOnClickModal: false,
        closeOnPressEscape: false,
        alignCenter: true,
        ...opts
      },
      { default: () => vnode }
    )
    const wrapperVnode = createVNode(Dialog, null, { default: () => dialogVnode })
    wrapperVnode.appContext = useAdminDialog._context
    vnode.props = vnode.props || []
    let _success = vnode.props.onSuccess || function () {}
    let _end = vnode.props.onEnd || function () {}
    vnode.props.onSuccess = function (...arr) {
      _success && _success(...arr)
      close()
    }
    vnode.props.onEnd = function (...arr) {
      _end && _end(...arr)
      close()
    }
    function close() {
      dialogVnode.component.props.modelValue = false
    }
    render(wrapperVnode, dom)
    document.body.appendChild(dom)
  }
}
useAdminDialog.install = function (app) {
  useAdminDialog._context = app._context
  // app.config.globalProperties.useAdminDialog = useAdminDialog
}
