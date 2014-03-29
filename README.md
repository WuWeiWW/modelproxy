# midway-modelproxy
===
# 简介
淘系的技术大背景下，必须依赖Java提供稳定的后端接口服务。在这样环境下，Node Server在实际应用中的一个主要作用即是代理(Proxy)功能。
由于淘宝业务复杂，后端接口方式多种多样(MTop, Modulet, HSF...)。然而在使用Node开发web应用时，我们希望有一种统一方式访问这些代理资源的基础框架，为开发者屏蔽接口访问差异，同时提供友好简洁的数据接口使用方式。于是就有了 midway-modelproxy 这个构件。使用midway-modelproxy，开发者的单一编码工作量不会明显的减少，但是可以提供如下好处：

1. 所有接口访问方式统一，不同的开发者对于接口访问代码编写方式统一，含义清晰，降低维护难度。
2. 框架内部采用工厂+单例模式，实现接口一次配置多次复用。并且开发者可以随意定制组装自己的业务Model(依赖注入)。
3. 可以非常方便地实现线上，日常，预发环境的切换。
4. 支持不同的mock引擎（目前一期只支持mockjs），提供mock数据非常方便。
5. 使用接口配置文件，对接口的依赖描述做统一的管理，避免散落在各个代码之中。
6. 接口配置文件本身是结构化的描述文档，可以使用midway-if(开发中)构件，自动生成文档。也可使用他做相关自动化接口测试，使整个开发过程形成一个闭环。

# 使用说明
---
使用ModelProxy之前，您需要在工程根目录下创建名为interface.json的配置文件。该文件定义了工程项目中所需要使用到的接口集合
(详细配置说明见后文)。定义之后，您可以在代码中按照需要引入不同的接口，创建与业务相关的Model对象。

# 快速开始
---
### 安装

```sh
tnpm install midway-modelproxy
```

### 用例一 (接口文件配置->引入接口配置文件->使用model)
* 第一步 配置接口文件（接口文件默认放置在项目根目录下，命名为：interface_sample.json）

```json
{
    "title": "pad淘宝项目数据接口集合定义",
    "version": "1.0.0",
    "engine": "mockjs",
    "rulebase": "./interfaceRules/",
    "status": "online",
    "interfaces": [ {
        "name": "主搜索接口",
        "id": "Search.getItems",
        "urls": {
            "online": "http://s.m.taobao.com/client/search.do"
        }
    } ]
}
```

* 第二步 在代码中引入ModelProxy模块，并且初始化引入接口配置文件

```js
// 引入模块
var ModelProxy = require( 'modelproxy' ); 

// 初始化引入接口配置文件
ModelProxy.init( './interface_sample.json' );
```

* 第三步 使用ModelProxy

```js
// 创建model
var searchModel = new ModelProxy( {
    searchItems: 'Search.getItems'  // 自定义方法名: 配置文件中的定义的接口ID
} );
// 或者这样创建: var searchModel = new ModelProxy( 'Search.getItems' ); 此时getItems 会作为方法名

// 使用model, 注意: 调用方法所需要的参数即为实际接口所需要的参数。
searchModel.searchItems( { keyword: 'iphone6' } )
    // !注意 必须调用 done 方法指定回调函数，来取得上面异步调用searchItems获得的数据!
    .done( function( data ) {
        console.log( data );
    } )
    .error( function( err ) {
        console.log( err );
    } );
```

### 用例二 (model多接口配置及合并请求)
* 配置

```json
{   // 头部配置省略...
    "interfaces": [ {
        "name": "主搜索搜索接口",
        "id": "Search.getItems",
        "urls": {
            "online": "http://s.m.taobao.com/client/search.do"
        }
    }, {
        "name": "热词推荐接口",
        "id": "Search.suggest",
        "urls": {
            "online": "http://suggest.taobao.com/sug"
        }
    }, {
        "name": "导航获取接口",
        "id": "Search.getNav",
        "urls": {
            "online": "http://s.m.taobao.com/client/search.do"
        }
    } ]
}
```

* 代码

```js
var ModelProxy = require( 'modelproxy' ); 

ModelProxy.init( './interface_sample.json' );

// 更多创建方式，请参考后文API
var model = new ModelProxy( 'Search.*' );

// 调用自动生成的不同方法
model.getItems( { keyword: 'iphone6' } )
    .done( function( data ) {
        console.log( data );
    } );

model.suggest( { q: '女' } )
    .done( function( data ) {
        console.log( data );
    } )
    .error( function( err ) {
        console.log( err );
    } );

// 合并请求
model.suggest( { q: '女' } )
    .getItems( { keyword: 'iphone6' } )
    .getNav( { key: '流行服装' } )
    .done( function( data1, data2, data3 ) {
        // 参数顺序与方法调用顺序一致
        console.log( data1, data2, data3 );
    } );
```

### 用例三 (Model混合配置及依赖调用)

* 配置

```json
{   // 头部配置省略...
    "interfaces": [ {
        "name": "用户信息查询接口",
        "id": "Session.getUser",
        "urls": {
            "online": "http://taobao.com/getUser.do"
        }
    }, {
        "name": "订单获取接口",
        "id": "Order.getOrder",
        "urls": {
            "online": "http://taobao.com/getOrder"
        }
    } ]
}
```

* 代码

``` js
var ModelProxy = require( 'modelproxy' ); 

var model = new ModelProxy( {
    getUser: 'Session.getUser',
    getMyOrderList: 'Order.getOrder'
} );
// 先获得用户id，然后再根据id号获得订单列表
model.getUser( { sid: 'fdkaldjfgsakls0322yf8' } )
    .done( function( data ) {
        var uid = data.uid
        this.getMyOrderList( { id: uid } )
            .done( function( data ) {
                console.log( data );
            } );
    } );
```

### 用例四 (配置mock代理)
* 第一步 在相关接口配置段落中启用mock

```json
{
    "title": "pad淘宝数据接口定义",
    "version": "1.0.0",
    "engine": "mockjs",                <-- 指定mock引擎
    "rulebase": "./interfaceRules/",   <-- 指定存放相关mock规则文件的目录
    "interfaces": [ {
        "name": "主搜索接口",
        "id": "Search.getItems",
        "ruleFile": "Search.getItems.rule.json",  <-- 指定数据mock规则文件名，如果不配置，则将默认设置为 id + '.rule.json'
        "urls": {
            "online": "http://s.m.taobao.com/client/search.do",
            "prep": "http://s.m.taobao.com/client/search.do",
            "daily": "http://daily.taobao.net/client/search.do"
        },
        status: 'mock'                     <-- 启用mock状态

    } ]
}
```

* 第二步 添加接口对应的规则文件到ruleBase(./interfaceRules/)指定的文件夹。mock数据规则请参考 [http://mockjs.com]。
启动程序后，ModelProxy即返回相关mock数据。


### 用例五 (使用ModelProxy拦截请求)

```js
var app = require( 'connect' )();
var ModelProxy = require( 'modelproxy' );
ModelProxy.init( './interface_sample.json' );

// 指定需要拦截的路径
app.use( '/model', ModelProxy.Interceptor );

// 此时可直接通过浏览器访问 /model/[interfaceid] 调用相关接口
``` 

# 配置文件详解
---

``` js
{
    "title": "pad淘宝项目数据接口集合定义",       // [必填] 接口文档标题
    "version": "1.0.0",                      // [必填] 版本号
    "engine": "mockjs",                      // [选填] mock 引擎，目前只支持mockjs。不需要mock数据时可以不配置
    "rulebase": "./interfaceRules/",         // [选填] mock规则文件夹路径。不需要mock数据时可以不配置
    "status": "online",                      // [必填] 全局代理状态，取值只能是 interface.urls中出现过的键值或者mock
    "interfaces": [ {
        "name": "获取购物车信息",               // [选填] 接口名称 生成文档有用
        "desc": "接口负责人: 善繁",             // [选填] 接口描述 生成文档有用
        "version": "0.0.1",                  // [选填] 接口版本号 发送请求时会带上版本号字段
        "id": "cart.getCart",                // [必填，全局唯一] 接口ID，必须由英文单词+点号组成
        "urls": {                            // url集合 [如果ruleFile不存在, 则必须有一个地址存在]
          "online": "http://url1",           // 线上地址
          "prep": "http://url2",             // 预发地址
          "daily": "http://url3",            // 日常地址
        },
        "ruleFile": "cart.getCart.rule.json",// [选填] 对应的数据规则文件，当Proxy Mock状态开启时回返回mock数据，
                                             // 不配置时默认为id + ".rule.json"。
        "isRuleStatic": true,                // [选填] 数据规则文件是否为静态，即在开启mock状态时，程序会将ruleFile
                                             // 按照静态文件读取, 而非解析该规则文件生成数据，默认为false
        "status": "online",                  // [选填] 当前代理状态，可以是urls中的某个键值(online, prep, daily)或者mock
                                             // 如果不填，则代理状态依照全局设置的代理状态
        "method": "post",                    // [选填] 请求方式，取值post|get 默认get
        "dataType": "json",                  // [选填] 返回的数据格式, 取值 json|text, 默认为json
        "isCookieNeeded": true,              // [选填] 是否需要传递cookie 默认false
        "encoding": "utf8"                   // [选填] 代理的数据源编码类型。取值可以是常用编码类型'utf8', 'gbk', 
                                             // 'gb2312' 或者 'raw' 如果设置为raw则直接返回2进制buffer，默认为utf8。
                                             //  注意，不论数据源原来为何种编码，代理之后皆以utf8编码输出。
        "signed": false,                     // [选填] 是否需要签名，默认false
        "timeout": 5000,                     // [选填] 延时设置，默认10000
        "intercepted": true                  // [选填] 是否拦截请求，默认为true
        // format         // 未完待续
        // filter...      // 未完待续
    }, {
        ...
    } ],
    combo: {
        // 未完待续
    }
}
```

# API
---
### ModelProxy 对象创建方式

* 直接new

```js
var model = new ModelProxy( profile );

```

* 工厂创建

```js
var model = ModelProxy.create( profile );
```

### 创建ModelProxy对象时指定的 profile 相关形式
* 接口ID  生成的对象会取ID最后'.'号后面的单词作为方法名

```js
ModelProxy.create( 'Search.getItem' );
```

* 键值JSON对象   自定义方法名: 接口ID

```js
ModelProxy.create( {
    getName: 'Session.getUserName',
    getMyCarts: 'Cart.getCarts'
} );
```

* 数组形式 取最后 . 号后面的单词作为方法名
下例中生成的方法调用名依次为: Cart_getItem, getItem, suggest, getName

```js
ModelProxy.create( [ 'Cart.getItem', 'Search.getItem', 'Search.suggest', 'Session.User.getName' ] );

```

* 前缀形式 (推荐使用)

```js
ModelProxy.create( 'Search.*' );
```


### ModelProxy对象方法

* .method( params )
method为创建model时动态生成，参数 params{Object}, 为请求接口所需要的参数键值对。

* .done( callback, errCallback )
接口调用完成函数，callback函数的参数与done之前调用的方法请求结果保持一致. callback函数中的 this 指向ModelProxy对象本身，方便做进一步调用。errCallback 即出错回调函数（可能会被调用多次）。

* .error( errCallback )
指定全局调用出错处理函数， errCallback 的参数为Error对象。


# Mock 功能相关说明
---
### rule.json 文件
当mock状态开启时，mock引擎会读取与接口定义相对应的rule.json规则文件，生成相应的数据。该文件应该位于interface.json配置文件中
ruleBase字段所指定的文件夹中。 (建议该文件夹与interface配置文件同级)


### rule.json 文件样式

```js
{
    "request": { // 请求参数列表
        "参数名1": "规则一",      // 具体规则取决于采用何种引擎
        "参数名2": "规则二",
        ...
    },
    "response": 响应内容规则      // 响应内容规则取决于采用何种引擎
}

```

## [附] 中途岛整体架构图及modelproxy所处位置
![](http://work.taobao.net/attachments/download/2929/Midway.png)





