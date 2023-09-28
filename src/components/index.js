const modules = import.meta.glob('./*.vue', { eager: true })

export default {
  install(app) {
    for (let key in modules) {
      let componentName = key.match(/\.\/(.*)\.vue/)[1]
      app.component(componentName, modules[key].default)
    }
  }
}
