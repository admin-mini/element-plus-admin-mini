import { getDicts } from '@/api/system/dict/data'
import { nextTick, ref } from 'vue'

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
    dataScopeOptions: [
      { value: '1', label: '全部数据权限' },
      { value: '2', label: '自定数据权限' },
      { value: '3', label: '本部门数据权限' },
      { value: '4', label: '本部门及以下数据权限' },
      { value: '5', label: '仅本人数据权限' }
    ],
    listClassOptions: [
      { value: 'default', label: '默认' },
      { value: 'primary', label: '主要' },
      { value: 'success', label: '成功' },
      { value: 'info', label: '信息' },
      { value: 'warning', label: '警告' },
      { value: 'danger', label: '危险' }
    ],
    isShow: [
      { value: 1, label: '已上架', listClass: 'success' },
      { value: 0, label: '已下架', listClass: 'info' }
    ],
    isBest: [
      { value: 1, label: '已推荐', listClass: 'success' },
      { value: 0, label: '未推荐', listClass: 'info' }
    ],
    delivery_time: [
      { value: 'am', label: 'AM' },
      { value: 'pm', label: 'PM' }
    ],
    order_status: [
      { value: 0, label: '代付款' },
      { value: 1, label: '代发货' },
      { value: 3, label: '取消订单' },
      { value: 4, label: '订单关闭' },
      { value: 6, label: '配送中' },
      { value: 8, label: '待提货' },
      { value: 99, label: '已完成' }
    ],
    order_pay_method: [
      { value: 'off_line', label: '货到付款' },
      { value: 'wechat_mini_app', label: '微信' }
    ],
    order_cancel_type: [
      { value: 1, label: '超时未支付' },
      { value: 2, label: '未发货时退款关闭' },
      { value: 4, label: '买家取消' },
      { value: 16, label: '到货后未提货' }
    ],
    order_delivery_status: [
      { value: 1, label: '待发出' },
      { value: 2, label: '已发出' },
      { value: 4, label: '拒绝接收' },
      { value: 9, label: '已接收' },
      { value: 6, label: '部分接收', listClass: 'default' }
    ],
    order_refund_type: [
      { value: 1, label: '仅退款' },
      { value: 2, label: '退货退款' }
    ],
    order_refund_reason: [
      { value: 3, label: '协商一致退款' },
      { value: 4, label: '商品描述不符' },
      { value: 5, label: '材质描述不符' },
      { value: 6, label: '质量有问题' },
      { value: 7, label: '商品有瑕疵' },
      { value: 8, label: '少件（含质量或数量）' }
    ],
    order_pack_status: [
      { value: 0, label: '待备货' },
      { value: 1, label: '备货中' },
      { value: 6, label: '已备货' },
      { value: 9, label: '已合单' }
    ],
    shortage_refund_status: [
      { value: 0, label: '无退款' },
      { value: 1, label: '需要退款' },
      { value: 4, label: '拒绝退款' },
      { value: 9, label: '已通过' }
    ],
    pay_refund_status: [
      { value: 0, label: '未退款' },
      { value: 4, label: '退款已取消' },
      { value: 9, label: '退款成功' },
      { value: 7, label: '退款失败' }
    ],
    refund_status: [
      { value: 0, label: '未退货' },
      { value: 1, label: '等待处理' },
      { value: 4, label: '拒绝退款' },
      { value: 5, label: '仅退款' },
      { value: 6, label: '退货退款' }
    ],
    order_refund_type: [
      { value: 1, label: '仅退款' },
      { value: 2, label: '退货退款' },
      { value: 3, label: '仅退货' }
    ]
    // order_refund_reason: [
    //   { value: 3, label: '协商一致退款' },
    //   { value: 4, label: '商品描述不符' },
    //   { value: 5, label: '材质描述不符' },
    //   { value: 6, label: '质量有问题' },
    //   { value: 7, label: '商品有瑕疵' },
    //   { value: 8, label: '少件（含质量或数量）' }
    // ]
  },

  {
    get(target, prop) {
      // if (prop != '__v_isRef' && prop != '__v_raw' && !target[prop]) {
      //   //动态加载
      //   getDict([prop])
      // }
      if ((typeof prop === 'string' && prop.startsWith('__v_')) || typeof prop === 'symbol') {
        return target[prop]
      }
      if (!target[prop]) {
        //动态加载
        target[prop] = makeDict([])
        getDict([prop], false)
      }

      return target[prop]
    }
  }
)
const pendding = {}
export function getDict(keys, filter = true) {
  return new Promise((resolve) => {
    // if (filter) {
    //   keys = keys.filter((key) => {
    //     return !dict.value[key]
    //   })
    // }
    let promiseArr = []
    keys.map((key) => {
      if (pendding[key]) {
        promiseArr.push(pendding[key])
        return false
      }
      pendding[key] = getDicts(key)
        .then((res) => {
          res.data.map((item) => {
            item.label = item.dictLabel
            if (res.dictValueType === 'n') {
              item.value = Number(item.dictValue)
            } else {
              item.value = String(item.dictValue)
            }
          })
          dict.value[key] = makeDict(res.data)
          pendding[key] = Promise.resolve() //设置为已加载
        })
        .catch(() => {
          delete pendding[key]
        })
      promiseArr.push(pendding[key])
      return pendding[key]
    })
    //用promise.all返回
    Promise.all(promiseArr).finally(() => {
      resolve(dict)
    })
  })
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
