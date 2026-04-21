import { ElMessage, ElMessageBox } from 'element-plus'

//构建消息提示试题
const message={};
const messageBase = (msg, type = 'info',showClose=false) => {
  ElMessage({ message: msg, type, showClose })
}

// 动态构建常用方法：success, error, warning, info
const types = ['success', 'error', 'warning', 'info']
types.forEach(type => {
  message[type] = (msg,showClose) => messageBase(msg, type,showClose)
})

// 请求组合确认框
message.syncConfirm = (content = '确认执行此操作吗？', req, title = '提示') => {
  return new Promise((resolve, reject) => {
    ElMessageBox.confirm(content, title, {
      type: 'warning',
      beforeClose: (action, instance, done) => {
        if (action === 'confirm') {
          instance.confirmButtonLoading = true
          req()
            .then((res) => {
              console.log("res",res);
                resolve(res)
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


export default message;
