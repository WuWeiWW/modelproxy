## v0.4.0-alpha
* hsfproxy功能实现
* hsfproxy拦截器实现
* hsfproxy浏览器端调用实现

## v0.3.2-beta
* 修复request interceptor getHeader的bug
* 重构InterfaceManager，采用Class方式对外提供方法。

## v0.3.2-alpha
* 增强statusCode不为200的报错内容

## v0.3.1
* 增强处理StatusCode 不为200的情况
* 增强错误提示，每次请求代理失败，需要明确对应的interface id以及请求的url，以方便错误定位

## v0.3.0
* 修复querystring 与version参数拼接的bug。
* 修复done内方法异常捕获error变量未定义的bug。

## v0.3.0-beta1
* 修复interface Rule路径读取bug。

## v0.3.0-beta
* Proxy 插件化实现。

## v0.3.0-alpha-2
* 升级river-mock。

## v0.3.0-alpha
* proxy底层采用继承方式重构。
* 支持捕获customized code异常。

## v0.2.8
* 支持interface配置文件变量引用。
* 重载ModelProxy.init( path, variables )。variables参数为开发者传入的用于解析interface配置文件中出现的变量的变量对象。