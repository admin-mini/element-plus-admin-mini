let dict = {
  SETTING: {
    OPEN_PERMISSION: false, //是否开启权限
    API_URL: '/api/', //API具体路径
    IMG_URL: '/picTemp/',
    AREA_CODE: 131000
  },
  userType: [
    { value: '1', label: '管理员', color: 'success' },
    { value: '2', label: '操作员', color: 'danger' },
    { value: '3', label: '录入员', color: 'warning' }
  ]
}
//生产环境使用/index.html引用的setting.js
if (!import.meta.env.DEV && window.ADMIN_SETTING) {
  Object.assign(dict.SETTING, window.ADMIN_SETTING)
}
for (let key in dict) {
  if (key != 'SETTING') {
    makeDict(dict[key])
  }
}
export function makeDict(obj, labelKey = 'label', valueKey = 'value') {
  return Object.defineProperties(obj, {
    valueKey: {
      value: valueKey
    },
    labelKey: {
      value: labelKey
    },
    get: {
      value: get
    },
    getLabel: {
      value: getLabel
    }
  })
}
function get(val) {
  if (Array.isArray(val)) {
    val = val.map((item) => item.toString())
    return this.filter((item) => {
      return val.includes(item[this.valueKey].toString())
    })
  }
  return (
    this.find((item) => {
      return item[this.valueKey] == val
    }) || {}
  )
}
function getLabel(val) {
  if (Array.isArray(val)) {
    return this.get(val).map((item) => {
      return item[this.labelKey]
    })
  }
  return this.get(val)[this.labelKey]
}
export default dict
