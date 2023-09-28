export default {
  required: {
    trigger: 'change',
    required: true,
    message: '必填项，必须填写/选择该项！'
  },
  checkPassword(postData, key, postForm) {
    return {
      validator: function (rule, value, callback) {
        if (value == '') {
          callback()
          return false
        }
        if (postData[key] != '') {
          if (postData[key] != value) {
            callback(new Error('两次密码不一致'))
            return false
          } else {
            postForm.clearValidate(key)
          }
        }
        callback()
      },
      trigger: 'change'
    }
  },

  ip(type = 'ip') {
    var reg = /^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/ //ip
    var msg = '请输入正确的' + type

    return {
      validator: function (rule, value, callback) {
        if (value == '') {
          callback()
          return false
        }
        if (type == '子网掩码' && value.split('.')[0] && value.split('.')[0] != 255) {
          callback(new Error('子网掩码首位必须为255'))
          return false
        }
        if (!reg.test(value)) {
          callback(new Error(msg))
          return false
        }
        callback()
      }
    }
  },

  mac() {
    var reg = /^[A-F\d]{2}-[A-F\d]{2}-[A-F\d]{2}-[A-F\d]{2}-[A-F\d]{2}-[A-F\d]{2}$/
    var msg = '请输入正确的MAC'
    return {
      validator: (rule, value, callback) => {
        if (value == '') {
          callback()
          return false
        }
        if (!reg.test(value.toUpperCase())) {
          callback(new Error(msg))
          return false
        }
        callback()
      }
    }
  },
  name() {
    var reg = /^[a-zA-Z0-9\u4e00-\u9fa5]+$/ //数字 字母 中杠 #号 中文
    var msg = '只能包含数字 字母 中文'
    return {
      trigger: 'blur',
      validator: (rule, value, callback) => {
        if (value == '') {
          callback()
          return false
        }
        if (!reg.test(value)) {
          callback(new Error(msg))
          return false
        }
        callback()
      }
    }
  },
  int(option) {
    var min = 0
    var max = Infinity
    if (option) {
      min = option.min || 0
      max = option.max || Infinity
    }
    var msg = '请填写正确的整数'
    var reg = /^-?[1-9]\d*$/
    return {
      trigger: 'blur',
      validator: (rule, value, callback) => {
        if (value == '') {
          callback()
          return false
        }
        if (isNaN(value) || !reg.test(value)) {
          callback(new Error(msg))
          return false
        }
        if (Number(value) > max) {
          callback(new Error('数值过大'))
          return false
        }
        if (Number(value) < min) {
          callback(new Error('数值太小'))
          return false
        }
        callback()
      }
    }
  },
  decimal(option) {
    var n = 0,
      m = ''
    if (option) {
      n = option.min || 0
      m = option.max || ''
    }
    var reg = new RegExp(`^([1-9]\\d*|0)(\\.\\d{${n},${m}})?$`)
    var msg = '请填写正确的小数格式'
    return {
      trigger: 'blur',
      validator: (rule, value, callback) => {
        if (value == '') {
          callback()
          return false
        }
        if (!reg.test(value)) {
          callback(new Error(msg))
          return false
        }
        callback()
      }
    }
  },
  length({ min, max }) {
    var isMaxUndefined = max === undefined
    var isMinUndefined = min === undefined
    min = min || 0
    max = max || 999
    var msg = `长度不能小于${min}大于${max}个字符`
    if (isMaxUndefined) {
      msg = `长度不能小于${min}个字符`
    }

    if (isMinUndefined) {
      msg = `长度不能大于${max}个字符`
    }

    return {
      min: min,
      max: max,
      message: msg,
      trigger: 'blur'
    }
  }
}
