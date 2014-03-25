# midway-modelproxy

淘系的技术大背景下，必须依赖Java提供稳定的后端接口服务。在这样环境下，Node Server在实际应用中的一个主要作用即是代理(Proxy)功能。
由于淘宝业务复杂，后端接口方式多种多样(MTop, Modulet, HSF...)。然而在使用Node开发web应用时，我们希望有一种统一方式访问这些代理资源的基础框架，为开发者屏蔽接口访问差异，同时提供友好简洁的数据接口使用方式。于是就有了 midway-modelproxy 这个构件。使用midway-modelproxy，开发者的单一编码工作量不会明显的减少，但是可以提供如下好处：

* 1.所有接口访问方式统一，不同的开发者对于接口访问代码编写方式统一，含义清晰，降低维护难度。
* 2.框架内部内部工厂+单例模式，实现接口一次配置多次复用。并且开发者可以随意定制组装自己的业务Model。
* 3.可以非常方便地实现线上，日常，预发环境的切换。
* 4.支持不同的mock引擎（目前一期只支持mockjs），提供mock数据非常方便。
* 5.使用接口配置文件，对接口的依赖描述做统一的管理，避免散落在各个代码之中。
* 6.接口配置文件本身具有明确的语义，可以使用midway-if(开发中)构件，自动生成文档，做相关自动化接口测试。使整个开发过程形成一个闭环。

# 快速开始

### 安装

```sh
tnpm install midway-modelproxy
```

### 用例一 接口配置->使用model
* 第一步 配置接口文件（接口文件默认放置在项目根目录下，命名为：interface.json）

```
{
    "title": "pad淘宝数据接口定义",
    "version": "1.0.0",
    "engine": "mockjs",
    "rulebase": "./interfaceRules/",
    "interfaces": [ {
        "name": "主搜索接口",
        "id": "Search.getItems",
        "urls": {
            "online": "http://s.m.taobao.com/client/search.do"
        }
    } ]
}
```

* 第二步 使用ModelProxy

```js
// 引入模块
var ModelProxy = require( 'modelproxy' ); 

// 创建model
var model = new ModelProxy( {
    searchItems: 'Search.getItems'  // 自定义方法名: 配置文件中的定义的接口ID
} );
// 或者这样创建: var model = new ModelProxy( 'Search.getItems' ); 此时getItems 会作为为方法名

// 使用model, 注意: 调用方法所需要的参数即为实际接口所需要的参数。
model.searchItems( { keyword: 'iphone6' } )
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
// 引入模块
var ModelProxy = require( 'modelproxy' ); 

// 创建model
var model = new ModelProxy( 'Search.*' );
// 更多创建方式，请参考后文API

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
    } )

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
// 引入模块
var ModelProxy = require( 'modelproxy' ); 

// 创建model
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



