
    //修改当前用户密码
    export const userUpdateMyPassword = (query) => {
        return ajax.post('/user/updateMyPassword', query);
    };
    

    //添加
    export const userAdd = (query) => {
        return ajax.post('/user/add', query);
    };
    

    //编辑
    export const userUpdate = (query) => {
        return ajax.post('/user/update', query);
    };
    

    //修改密码
    export const userUpdatePassword = (query) => {
        return ajax.post('/user/updatePassword', query);
    };
    

    //删除
    export const userDelete = (query) => {
        return ajax.post('/user/delete', query);
    };
    

    //登录
    export const userLogin = (query) => {
        return ajax.post('/user/login', query);
    };
    

    //列表
    export const userGetList = (query) => {
        return ajax.get('/user/getList', {params: query});
    };
    
    //获取列表
    export const roleGetList = (query) => {
        return ajax.get('/role/getList', {params: query});
    };
    

    //获取权限列表
    export const permissionGetList = (query) => {
        return ajax.get('/permission/getList', {params: query});
    };
    
    //检测文件是否存在
    export const checkExist = (query) => {
        return ajax.get('/checkExist', {params: query});
    };
    

    //上传分包
    export const upload = (query) => {
        return ajax.post('/upload', query);
    };
    