# 安装npm环境
## 安装npm
从https://nodejs.org/en/download/下载并安装

## 淘宝镜像
```
npm install -g cnpm --registry=https://registry.npm.taobao.org
```

# 安装vue
```
# 最新稳定版
$ npm install vue
```
# 编译
```
npm install 或 cnpm install
```


# 中科金项目补充说明

## 接口补充

### 发起菜单定义，需要添加类别定义，并在接口返回

### 发起菜单，增加移除，添加接口

### 发起菜单，增加“常用”字段、点击次数字段

### 发起菜单，增加通过“是否常用”查询条件返回结果集

### 批量提交接口，可以提交的直接提交走，未成功提交的，在返回结果中返回未提交的待办信息，并标识未成功提交的原因
