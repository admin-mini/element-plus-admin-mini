//apifox 对应目录右键-》导出apifox格式
const fs = require('fs')
let json = fs.readFileSync(__dirname + '/sms.apifox.json', 'utf-8')
let data = JSON.parse(json)
let result = []
data.apiCollection[0].items.map((dir) => {
  let list = dir.items
  if (list) {
    result.push(`/*****${dir.name}*****/`)
  } else {
    list = [dir]
  }

  list.map((api) => {
    if (api.api.method == 'get') {
      result.push(createGet(api))
    } else {
      result.push(createPost(api))
    }
  })
})
fs.writeFileSync(__dirname + '/result.js', result.join('\n'))
function createGet(item) {
  return `
      //${item.name}
      export const ${transformCameCase(item.api.path)} = (query) => {
          return ajax.get('${item.api.path}', {params: query});
      };
      `
}
function createPost(item) {
  return `
      //${item.name}
      export const ${transformCameCase(item.api.path)} = (query) => {
          return ajax.post('${item.api.path}', query);
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
