import { createApp, h, render } from 'vue'
import { createPinia } from 'pinia'
import plugins from '@/plugins'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'normalize.css'
import '@/style/el.scss'
import '@/style/admin.scss'
import adminComponent from './components/index'
import adminUtils from './utils/index'
import directive from './directive/index.js'
import { useTagView } from './stores/tag-view'

const app = createApp(App)
app.config.globalProperties.$env = import.meta.env
app.use(createPinia())
app.use(directive)
app.use(plugins)
app.use(ElementPlus, {
  locale: zhCn
})
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(adminUtils)
app.use(adminComponent)

app.use(router)
app.mount('#app')
useTagView()
if (import.meta.env.DEV) {
  import('./Debug.vue').then((res) => {
    let p = document.createElement('div')
    let vnode = h(res.default)
    vnode.appContext = app._context
    render(vnode, p)
    document.body.appendChild(p)
  })
}
