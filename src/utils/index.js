import dict from './dict'
import formatter from './formatter'
import rules from './rules'
// import hasPermission from './permission'

import * as utils from './utils'
export default {
  install(app) {
    app.config.globalProperties.$dict = dict
    app.config.globalProperties.$rules = rules
    app.config.globalProperties.$utils = utils
    app.config.globalProperties.$formatter = formatter
    // app.config.globalProperties.$hasPermission = hasPermission
  }
}
