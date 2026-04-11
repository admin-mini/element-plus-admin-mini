const modules = import.meta.glob([
  './*.vue', 
  './**/index.vue'
], { eager: true })
const jsxModules = import.meta.glob('./*.jsx', { eager: true })

export default {
  install(app) {
    console.log("modules",modules);
    for (let key in modules) {
      let componentName = key.match(/\.\/(.*)\.vue/)[1]
      console.log(componentName);
      if(componentName.includes("/")){
        componentName=componentName.split('/')[0];
      }
      app.component(componentName, modules[key].default)
    }
    for (let key in jsxModules) {
      let componentName = key.match(/\.\/(.*)\.jsx/)[1]
      app.component(componentName, jsxModules[key].default)
    }
  }
}
