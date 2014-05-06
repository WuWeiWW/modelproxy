## v0.4.1
* 暂时移除对hsf-protocol-cpp的依赖，以适应aone开发机部署环境。

## v0.4.0
* 收藏夹试点项目压测通过，版本已稳定。

## v0.4.0-alpha6
* 修改hsf timeout参数单位以及group默认值

## v0.4.0-alpha5
* 支持keepAliveMsecs参数配置，以适应不同部署场景下由于该参数设置不当而发生频繁的socket ECONNRESET错误

## v0.4.0-alpha4
* http请求失败的错误提示中增加rid，方便定位。

## v0.4.0-alpha3
* 增加http maxSockets配置文件
* 增加 http proxy callback 标记，避免重复callback。
* 修改错误提示中interface id显示成url的错误。
* http proxy 每次请求增加 rid 以标识唯一性

## v0.4.0-alpha2
* 修复hsf插件加载的bug
* 修复cookie专递失效的bug

## v0.4.0-alpha1
* 修复http timeout引起的socket hang up的bug

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