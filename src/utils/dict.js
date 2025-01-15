import { getDicts } from '@/api/system/dict/data'
import { ref } from 'vue'

let dict = ref({
  //固定key
  // useType:[{value:1,label:'管理员'}]
})
export function getDict(keys) {
  keys = keys.filter((key) => {
    return !dict.value[key]
  })
  //用promise.all返回
  return Promise.all(
    keys.map((key) => {
      return getDicts(key).then((res) => {
        res.data.data.map((item) => {
          item.label = item.dictLabel
          item.value = item.dictValue
        })
        dict.value[key] = makeDict(res.data.data)
      })
    })
  )
}

for (let key in dict.value) {
  makeDict(dict.value[key])
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
export default dict.value
