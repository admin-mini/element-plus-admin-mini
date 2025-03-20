 ![logo](./logo.jpg)

 # 更新日志：
  ### 0.0.3 20250320
- 更新adminDialog 以及应用方式
- 更新adminTable 以及应用方式
- 新增admin-grid
- 新增admin-space
- 新增filter-table
- 新增dict-input组件
- 新增标签页功能
- 更新登陆页样式
- 更新整体布局
- 更新$formatter.dict (可自动渲染成el-tag)
  ### 0.0.2 20240725
 - 大面积升级依赖
 - 调整全局布局样式
 - 调整bread位置到layout层

 ### 0.0.1 20240122
 - 大面积升级依赖
 - 移除node-sass 曾导致项目无法安装问题

# ✨简介


 element-plus-admin-mini 完全免费、可商用。

 基于Vue3+vite+element-plus+js。
 
 提炼了大量项目使用频率最高的功能；

[中文文档](http://admin-mini.gitee.io/element-plus-admin-mini-docs/)

[预览](http://admin-mini.gitee.io/element-plus-admin-mini/)

如果需要了解项目细节，可以阅读我在掘金的专栏 
[admin-mini 手摸手](https://juejin.cn/column/7287965561035489299)

# 🏆特性
- 动态开发环境切换：（开发、测试、生产、mock）轻松切换
- admin-table:封装和扩展性之间找到的最佳平衡的列表插件
- admin-dialog：**函数化导入vue文件** 到弹出层，业务代码极为清晰
- auto-route:自动化路由
- 内置$dict字典：项目全局可用
- 极简权限：提供基础权限校验


# 🚀快速开始

**必要环境**

nodejs16+

推荐使用nvm来切换新老项目[下载nvm-windows](https://github.com/coreybutler/nvm-windows/releases)

## 下载

```bash
  git clone https://github.com/zjpzjp/element-plus-admin-mini.git
```
gitee镜像
```bash
  git clone https://github.com/zjpzjp/element-plus-admin-mini.git
```

## 安装

```bash
  cd element-plus/admin-mini
  npm i  #或 yarn
  npm run dev
```





**为什么使用JS而不是TS？**
- 快速上手，适用于小型团队
- 保持js的灵活性以及纯净
- 普通的CURD项目TS并无优势，反而增加工作量


