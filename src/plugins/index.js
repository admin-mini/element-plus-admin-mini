const modules = import.meta.glob('./*.js', { eager: true })

export default {
  install(app) {
    for (let key in modules) {
      let plugin = modules[key].default
      plugin._context = app._context
      app.use(plugin)
    }
  }
}
