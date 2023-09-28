
      //用户列表
      export const userList = (query) => {
          return ajax.get('/user/list', {params: query});
      };
      

      //登陆
      export const userLogin = (query) => {
          return ajax.post('/user/login', query);
      };
      

      //用户新增
      export const userAdd = (query) => {
          return ajax.post('/user/add', query);
      };
      

      //用户编辑
      export const userEdit = (query) => {
          return ajax.post('/user/edit', query);
      };
      