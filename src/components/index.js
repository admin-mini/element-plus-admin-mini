const modules = import.meta.glob('./*.vue', { eager: true })
const jsxModules = import.meta.glob('./*.jsx', { eager: true })

export default {
  install(app) {
    for (let key in modules) {
      let componentName = key.match(/\.\/(.*)\.vue/)[1]
      app.component(componentName, modules[key].default)
    }
    for (let key in jsxModules) {
      let componentName = key.match(/\.\/(.*)\.jsx/)[1]
      app.component(componentName, jsxModules[key].default)
    }
  }
}
