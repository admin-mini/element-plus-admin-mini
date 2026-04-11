import { getDictTree } from '@/api/dev/dict-api'
import { nextTick, ref } from 'vue'
import tool from '@/utils/tool'

let dict = ref({})
window.dict = dict
dict.value = new Proxy(
  {
    //固定key
    userType: [
      { value: '00', label: '管理员' },
      { value: '01', label: '普通用户' }
    ],
    dictValueType: [
      { value: 'n', label: '数字类型' },
      { value: 's', label: '字符串类型' }
    ],
  },

  {
    get(target, prop) {
      if ((typeof prop === 'string' && prop.startsWith('__v_')) || typeof prop === 'symbol') {
        return target[prop]
      }
      if (!target[prop]) {
        target[prop] = makeDict([])
        getDict([prop], false)
      }
      return target[prop]
    }
  }
)

var isRefreshDict = false
let refreshPromise = null

// 刷新并缓存字典树
export const refreshDict = async () => {
  if (refreshPromise) return refreshPromise

  refreshPromise = getDictTree().then((resp) => {
    tool.data.set('DICT_DATA_TREE', resp.data)
    isRefreshDict = true
    return resp.data
  }).finally(() => {
    refreshPromise = null // 请求完成后重置，允许后续手动重新刷新
  })

  return refreshPromise
}

// 异步获取具体某个类型的字典数据
export const getDictTreeObj = async (dictType) => {
  // Bug fix 1: 先刷新，再从缓存读取，避免变量先用后声明
  if (!isRefreshDict) {
    await refreshDict()
  }

  const dictTree = tool.data.get('DICT_DATA_TREE') // Bug fix 2: 移至刷新之后声明
  if (!dictTree) return null

  console.log('dictTree', dictTree)
  const tree = dictTree.find(item => item.dictValue === dictType)
  return tree || null
}

const pendding = {}
export function getDict(keys) {
  const promiseArr = keys.map(async (key) => {
    if (pendding[key]) return pendding[key]

    pendding[key] = (async () => {
      try {
        const dictTree = await getDictTreeObj(key)

        // Bug fix 3: 原来 catch 块里引用了未定义的 e，改为直接 return
        if (dictTree == null || dictTree.children == null || dictTree.children.length == 0) {
          console.warn(`字典 [${key}] 数据为空或不存在`)
          return []
        }

        const formattedData = dictTree.children.map((item) => {
          const label = item.dictLabel
          const rawVal = item.dictValue
          const value = dictTree.valueType === 'n' ? Number(rawVal) : String(rawVal)
          const color = item.color

          return { label, value, color }
        })

        dict.value[key] = makeDict(formattedData)
      } catch (e) {
        console.error(`加载字典 [${key}] 失败:`, e)
      } finally {
        // Bug fix 4: 请求结束后清除 pendding，允许失败后重试
        delete pendding[key]
      }
    })()

    return pendding[key]
  })

  return Promise.all(promiseArr).then(() => dict.value)
}

for (let key in dict.value) {
  makeDict(dict.value[key])
}

export function makeDict(obj, labelKey = 'label', valueKey = 'value', colorKey = 'color') {
  return Object.defineProperties(obj, {
    valueKey: {
      value: valueKey
    },
    labelKey: {
      value: labelKey
    },
    colorKey: {
      value: colorKey
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
    }) || null
  )
}

function getLabel(val) {
  if (!val) return val
  if (Array.isArray(val)) {
    return this.get(val).map((item) => {
      return item[this.labelKey]
    })
  }
  return this.get(val)[this.labelKey]
}

export default dict.value