import dict from './dict'
import formatter from './formatter'
import { checkPermi } from './permission'
import rules from './rules'
import SETTING from './setting'
import * as utils from './utils'
export default {
  install(app) {
    app.config.globalProperties.$dict = dict
    app.config.globalProperties.$rules = rules
    app.config.globalProperties.$utils = utils
    app.config.globalProperties.$formatter = formatter
    app.config.globalProperties.$p = checkPermi
    app.config.globalProperties.$setting = SETTING
  }
}
