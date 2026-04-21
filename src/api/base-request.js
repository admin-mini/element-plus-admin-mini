import ajax from './ajax.js'

// 请求适配器，适用于各种请求自动组合调用
export const baseRequest = (url, data = {}, method = 'get') => {
  let params = method=='get'?{params:data}:data;
    return ajax[method](url,params);
}

export default baseRequest
