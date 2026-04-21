import baseRequest from '../base-request.js'

const request=(url,data,method)=>{
   return baseRequest("/dev/dict/"+url,data,method);
}

// 获取字典分页
export const getDictPage=(data)=> {
    return request('page', {params:data})
};
// 获取字典列表
export const getDictList=(data)=> {
		return request('list', data)
	};
// 获取字典树
export const getDictTree=(data)=> {
    return request('tree', data)
};
// 编辑字典
export const dcitAdd=(data)=> {
		return request( 'add', data,"post")
};
// 编辑字典
export const dcitEdit=(data)=> {
		return request( 'edit', data,"post")
};
// 删除字典
export const dictDelete=(data)=> {
		return request('delete', data,"post")
	};
// 获取字典详情
export const getDictDetail=(id)=> {
    return request('detail', {params:{id}})
}

