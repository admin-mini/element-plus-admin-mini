import { h } from 'vue'
import { formatDate, formatDateFull } from './utils'
import { ElTag } from 'element-plus'
export default {
  // dict(_dict) {
  //   return function (data, colData) {
  //     if (!_dict) {
  //       return ''
  //     }
  //     return _dict.getLabel(data[colData.property])
  //   }
  // },
  dict(_dict) {
    return function (data, colData) {
      if (!_dict) {
        return ''
      }
      let item = _dict.get(data[colData.property])
      if (!item) {
        return ''
      }
      if (item.listClass) {
        return h(ElTag, { type: item.listClass }, () => item.label)
      } else {
        return item.label
      }
    }
  },
  date(isFull, format) {
    format = format || null
    return function (data, colData) {
      if (isFull) {
        return formatDateFull(data[colData.property])
      } else {
        return formatDate(data[colData.property], format)
      }
    }
  }
}
