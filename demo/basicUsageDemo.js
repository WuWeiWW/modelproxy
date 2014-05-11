var app = require( 'express' )();
var ModelProxy = require( '../index' );

// 初始化modelproxy接口文件
ModelProxy.init( require('path').resolve( __dirname, './interface_demo.json' ) );

// 配置拦截器，浏览器端可通过访问 127.0.0.1/model/[interfaceId]
app.use( '/model/', ModelProxy.Interceptor );

app.get( '/index', function( req, res ) {
    res.sendfile( 'modelproxy-client.html' );
} );

app.get( '/getCombinedData', function( req, res ) {
    var searchModel = ModelProxy.create( 'Search.*' );
    searchModel.list( { q: 'ihpone6' } )
        .list( { q: '冲锋衣' } )
        .suggest( { q: 'i' } )
        .getNav( { q: '滑板' } )
        .done( function( data1, data2, data3, data4 ) {
            res.send( {
            	"list_ihpone6": data1,
            	"list_冲锋衣": data2,
            	"suggest_i": data3,
            	"getNav_滑板": data4
            } );
        } ).error( function( err ) {
            console.log( err );
            res.send( 500, err );
        } );
} );

// 带cookie的代理请求与回写
app.get( '/getMycart', function( req, res ) {
    var cookie = req.headers.cookie;
    console.log( 'request cookie:\n', cookie );
    var cart = ModelProxy.create( 'Cart.*' );
    cart.getMyCart()
        .withCookie( cookie )
        .done( function( data , setCookies ) {
            console.log( 'response cookie:\n', setCookies );
            res.setHeader( 'Set-Cookie', setCookies );
            res.send( data );
        }, function( err ) {
            console.log( err );
            res.send( 500, err );
        } );
} );

// 配置资源路由
app.get( '/modelproxy-client.js', function( req, res ) {
	res.sendfile( './modelproxy-client.js' );
} );

app.listen( 3000 );

console.log( 'port: 3000' );

// // test for mtop
// var cookie = "cna=KcVJCxpk1XkCAX136Nv5aaC4; lzstat_uv=16278696413116954092|2511607@2511780@2738597@3258521@878758@2735853@2735859@2735862@2735864@2341454@2868200@2898598@1296239@2225939@3152682@1813784; miid=3882702882102873773; ali_ab=42.120.74.193.1395041649126.7; x=e%3D1%26p%3D*%26s%3D0%26c%3D0%26f%3D0%26g%3D0%26t%3D0%26__ll%3D-1%26_ato%3D0; _m_h5_tk=d1face5477e6a7dd68644c52acc1d355_1399655481799; _m_h5_tk_enc=fb8e386599443928f906b968f4b588d2; ck1=; v=0; existShop=MTM5OTczMjk0Mg%3D%3D; lgc=nodejs; tracknick=nodejs; sg=s25; t=e8bd0dbbf4bdb8f3704a1974b8a166b5; _cc_=VT5L2FSpdA%3D%3D; tg=0; _l_g_=Ug%3D%3D; _nk_=nodejs; mt=cp=0&ci=0_1&cyk=0_0; l=nodejs::1399736543757::11; uc1=lltime=1399709312&cookie14=UoLVbEPaioJdeA%3D%3D&existShop=false&cookie16=W5iHLLyFPlMGbLDwA%2BdvAGZqLg%3D%3D&cookie21=UtASsssme%2BBq&tag=2&cookie15=V32FPkk%2Fw0dUvg%3D%3D";
// var detail = ModelProxy.create( 'Detail.*' );
// detail.getTaobaoDyn( {"itemNumId": "37194529489"} )
//     .withCookie( cookie )
//     .done( function( data ) {
//         console.log( data );
//     } ).fail( function( err ) {
//         console.log( err );
//     } );
