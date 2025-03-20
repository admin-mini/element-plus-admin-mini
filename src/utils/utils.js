import { dayjs, ElMessageBox } from 'element-plus'
/**
 *
 * @param {string} url 要下载的地址
 * @param {string} filename 文件名
 */
export function downloadUrl(url, filename) {
  let eleLink = document.createElement('a')
  eleLink.style.display = 'none'
  if (filename) {
    eleLink.download = filename
  }
  // 字符内容转变成blob地址
  // URL.createObjectURL(blob)会创建URL对象，返回一个下载文件的地址
  eleLink.href = url
  // 触发点击
  document.body.appendChild(eleLink)
  eleLink.click()
  // 然后移除
  document.body.removeChild(eleLink)
}
/**
 *
 * @param {*} res 请求返回体
 * @param {string} fileName 文件名
 */
export function downloadFile(res, fileName = '') {
  let blob = new Blob([res.data], {
    type: 'application/xlsx;charset=utf-8' /*application/xlsx // 这里写要下载的文件格式;charset=utf-8*/
  })
  // 获取后端返回的文件名 --> 后端配合response.setHeader("Content-disposition", "attachment; filename=xxxx.xlsx") 设置的文件名
  // 注意: 有时候axios返回的res.headers里面可能不包含content-disposition字段
  //这是因为默认情况下，header只会暴露Cache-Control、Content-Language、Content-Type、Expires、Last-Modified、Pragma这6个字段
  // 此时需要后端设置response.setHeader("Access-Control-Expose-Headers", "Content-Disposition")将content-disposition字段暴露出去
  if (res.headers['content-disposition']) {
    fileName = res.headers['content-disposition'].split('=')[1]
    fileName = decodeURI(fileName)
  }

  let eleLink = document.createElement('a')
  // eleLink.download = '模板.xlsx' // 这里写的是下载文件的名称
  eleLink.download = fileName // 这里是后端返回的文件名称
  eleLink.style.display = 'none'
  // 字符内容转变成blob地址
  // URL.createObjectURL(blob)会创建URL对象，返回一个下载文件的地址
  eleLink.href = URL.createObjectURL(blob)
  // 触发点击
  document.body.appendChild(eleLink)
  eleLink.click()
  // 释放URL对象
  URL.revokeObjectURL(eleLink.href)
  // 然后移除
  document.body.removeChild(eleLink)
}

/**
 * @param {string} name url中的key
 * @returns {string|null} 返回null或string
 */
export function getUrlParams(name) {
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i') //定义正则表达式
  var r = window.location.search.substr(1).match(reg)
  if (r != null) return unescape(r[2])
  return null
}

/**
 * 函数去抖
 * @param {function} func
 * @param {number} delay
 */
export function debounce(func, delay) {
  var tId
  return function () {
    var context = this
    var arg = arguments
    if (tId) clearTimeout(tId)
    tId = setTimeout(function () {
      func.apply(context, arg)
    }, delay)
  }
}

/**
 * 函数节流
 * @param {function} func
 * @param {number} delay
 */
export function throttle(func, delay) {
  var timer = null
  var startTime = Date.now()
  return function () {
    var curTime = Date.now()
    var remaining = delay - (curTime - startTime)
    var context = this
    var args = arguments
    clearTimeout(timer)
    if (remaining <= 0) {
      func.apply(context, args)
      startTime = Date.now()
    } else {
      timer = setTimeout(func, remaining)
    }
  }
}

/**
 * 格式化秒 到小时
 */
export function formatDuration(seconds) {
  let duration = dayjs.duration(seconds, 'seconds')
  let result = ''
  if (duration.hours()) {
    result += duration.hours() + '小时'
  }
  if (duration.minutes()) {
    result += duration.minutes() + '分钟'
  }
  if (duration.seconds()) {
    result += duration.seconds() + '秒'
  }
  return result
}
/**
 *
 * @param {string|number} timestamp -10位或13位时间戳
 * @param {string} format -自定义格式 @see https://day.js.org/docs/zh-CN/parse/string-format
 */
export function formatDate(timestamp, format) {
  format = format || 'YYYY-MM-DD'
  if (timestamp) {
    return dayjs(timestamp, timestamp.toString().length == 10 ? 'X' : 'x').format(format)
  }
  return '--'
}
/**
 *
 * @param {string|number} timestamp
 */
export function formatDateFull(timestamp) {
  if (timestamp) {
    return dayjs(timestamp, timestamp.toString().length == 10 ? 'X' : 'x').format(
      'YYYY-MM-DD HH:mm:ss'
    )
  }
  return '--'
}
/**
 * 一维数组转tree结构
 * @param {array} data 一维数组对象
 */
export function arrToTree(data, id, parentId, children) {
  let config = {
    id: id || 'id',
    parentId: parentId || 'parentId',
    childrenList: children || 'children'
  }

  var childrenListMap = {}
  var nodeIds = {}
  var tree = []

  for (let d of data) {
    let parentId = d[config.parentId]
    if (childrenListMap[parentId] == null) {
      childrenListMap[parentId] = []
    }
    nodeIds[d[config.id]] = d
    childrenListMap[parentId].push(d)
  }

  for (let d of data) {
    let parentId = d[config.parentId]
    if (nodeIds[parentId] == null) {
      tree.push(d)
    }
  }

  for (let t of tree) {
    adaptToChildrenList(t)
  }

  function adaptToChildrenList(o) {
    if (childrenListMap[o[config.id]] !== null) {
      o[config.childrenList] = childrenListMap[o[config.id]]
    }
    if (o[config.childrenList]) {
      for (let c of o[config.childrenList]) {
        adaptToChildrenList(c)
      }
    }
  }
  return tree
}

/**
 *
 * @param {array} tree 树
 * @param {string} chilField children字段名称 默认children
 * @returns array
 */
export function tree2arr(tree, chilField = 'children') {
  let treeRes = []

  function tree2arr(res) {
    res.forEach((item) => {
      if (!item[chilField] || !item[chilField].length) {
        treeRes.push(item)
      } else {
        treeRes.push(item)
        tree2arr(item[chilField])
      }
    })
  }
  tree2arr(tree)
  return treeRes
}

/**
 * 参数处理
 * @param {*} params  参数
 */
export function tansParams(params) {
  let result = ''
  for (const propName of Object.keys(params)) {
    const value = params[propName]
    var part = encodeURIComponent(propName) + '='
    if (value !== null && value !== '' && typeof value !== 'undefined') {
      if (typeof value === 'object') {
        for (const key of Object.keys(value)) {
          if (value[key] !== null && value[key] !== '' && typeof value[key] !== 'undefined') {
            let params = propName + '[' + key + ']'
            var subPart = encodeURIComponent(params) + '='
            result += subPart + encodeURIComponent(value[key]) + '&'
          }
        }
      } else {
        result += part + encodeURIComponent(value) + '&'
      }
    }
  }
  return result
}

// 验证是否为blob格式
export function blobValidate(data) {
  return data.type !== 'application/json'
}

export function syncConfirm(tip, req) {
  return new Promise((resolve, reject) => {
    ElMessageBox.confirm(tip, '提示', {
      type: 'warning',
      beforeClose: (action, instance, done) => {
        if (action === 'confirm') {
          instance.confirmButtonLoading = true
          req()
            .then((res) => {
              if (res.code == 200) {
                resolve()
              } else {
                reject()
                ElMessage.error(res.msg)
              }
            })
            .finally(() => {
              instance.confirmButtonLoading = false
              done()
            })
            .catch(() => {
              reject()
            })
        } else {
          done()
          reject()
        }
      }
    }).catch(() => {
      reject()
    })
  })
}

/**
 * 验证表单并scrollToField
 * @param {Object} formRef 表单实例
 * @returns {Promise} 返回Promise对象
 */
export async function checkRules(formRef) {
  try {
    await formRef.value.validate()
    return Promise.resolve()
  } catch (err) {
    let firstError = Object.values(err)[0]
    formRef.value.scrollToField(firstError[0].field)
    ElMessage.warning(
      formRef.value.fields.find((item) => item.prop == firstError[0].field).label +
        firstError[0].message
    )
    return Promise.reject()
  }
}

/**
 * 判断path是否为外链
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}
