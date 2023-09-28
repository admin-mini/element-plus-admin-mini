//根据yapi的catId（分类ID）生成api
const fs = require('fs')
const axios = require('axios').default
const dirPath = './makeapi/'
const token = 'a13153f184433ca72b043564c68f16383e7dfdabd846c48a8f59695b56b31165'
let fileStr = ''
axios
  .get(`http://api.websir.top:5500/api/interface/getCatMenu?project_id=396&token=${token}`)
  .then(async (res) => {
    if (res.data.errcode == 0) {
      for (let item of res.data.data) {
        fileStr += await make(item)
      }
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true })
      }
      fs.writeFileSync(dirPath + '/api.js', fileStr)
      console.log(dirPath + '/api.js')
    }
  })
function make(cat) {
  return new Promise((resolve) => {
    axios
      .get(`http://api.websir.top:5500/api/interface/list_cat?token=${token}&catid=${cat._id}`)
      .then((res) => {
        if (res.data.errcode == 0) {
          let list = res.data.data.list
          resolve(
            list
              .map((item) => {
                if (item.method == 'POST') {
                  return createPost(item)
                } else {
                  return createGet(item)
                }
              })
              .join('\n')
          )
        }
      })
  })
}
function createGet(item) {
  return `
    //${item.title}
    export const ${transformCameCase(item.path)} = (query) => {
        return ajax.get('${item.path}', {params: query});
    };
    `
}
function createPost(item) {
  return `
    //${item.title}
    export const ${transformCameCase(item.path)} = (query) => {
        return ajax.post('${item.path}', query);
    };
    `
}

function transformCameCase(str) {
  let arr = str.split('/')
  return arr
    .map((item, index) => {
      if (index == 1) {
        return item
      }
      if (!item[0]) {
        return ''
      }
      return item[0].toUpperCase() + item.slice(1)
    })
    .join('')
}
