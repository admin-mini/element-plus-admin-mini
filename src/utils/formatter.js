import { formatDate, formatDateFull } from './utils'
export default {
  dict(_dict) {
    return function (data, colData) {
      if (!_dict) {
        return ''
      }
      return _dict.getLabel(data[colData.property])
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
