## midway-modelproxy

淘系的技术大背景下，必须依赖Java提供稳定的后端接口服务。在这样环境下，Node Server在实际应用中的一个主要作用即是代理(Proxy)功能。
由于淘宝业务复杂，后端接口方式多种多样(MTop, Modulet, HSF...)。然而在使用Node开发web应用时，我们希望有一种统一方式访问这些代理资源的基础框架，为开发者屏蔽接口访问差异，同时提供友好简洁的数据接口使用方式。于是就有了 midway-modelproxy 这个构件。使用midway-modelproxy，开发者的单一编码工作量不会明显的减少，但是可以提供如下好处：
* 1.所有接口访问方式统一，不同的开发者对于接口访问代码编写方式统一，含义清晰，降低维护难度。
* 2.采用框架内部工厂+单例模式，实现接口一次配置多次复用。并且开发者可以随意定制组装自己的业务Model。
* 3.可以非常方便地实现线上，日常，预发环境的切换。
* 4.支持不同的mock引擎（目前一期只支持mockjs），提供mock数据非常方便。
* 5.使用接口配置文件，对接口的依赖描述做统一的管理，避免散落在各个代码之中。
* 6.接口配置文件本身具有明确的语义，可以使用midway-if(开发中)构件，自动生成文档，做相关自动化接口测试。使整个开发过程形成一个闭环。

## 快速开始

### 用例一 (接口配置->使用model)
* 1.配置接口文件（接口文件默认放置在项目根目录下，命名为：interface.json）

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
    }
}
```

* 2.在代码中引入ModelProxy模块

```js
var ModelProxy = require( 'modelproxy' ); 
```

* 3.创建并使用ModelProxy

```js
// 创建model
var model = new ModelProxy( {
    // 方法名   :  配置文件中的接口ID
    searchItems: 'Search.getItems'
} );
// 使用model, 注意调用方法所需要的参数即为实际接口所需要的参数。
model.searchItems( {keyword: 'iphone6'} )
    .done( function( data ) {
        console.log( data );
    } );
```




### 用例二
* 1.配置接口文件（接口文件默认放置在项目根目录下，命名为：interface.json）

```
{
    "title": "pad淘宝数据接口定义",
    "version": "1.0.0",
    "engine": "mockjs",
    "rulebase": "./interfaceRules/",
    "interfaces": [ {
        "name": "搜索接口",
        "id": "Search.getItems",
        "urls": {
            "online": "http://s.m.taobao.com/client/search.do"
        }
    }, {
        "name": "热词推荐接口",
        "id": "Search.suggest",
        "urls": {
            "online": "http://suggest.taobao.com/sug"
        },
        "status": "mock"
    }, {
        "name": "导航获取接口",
        "id": "Search.getNav",
        "urls": {
            "online": "http://s.m.taobao.com/client/search.do"
        }
    } ]
}
```

