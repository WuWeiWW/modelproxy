// var util = require( 'util' );
// var ProxyBase = require( '../proxy' );
// var hsf = require( 'hsf' );
// var java = require('js-to-java');

// /**
//  * create a new hsfClient
//  * @param  {Object} options global config
//  *  - {String} configSvr              configServer的host地址，默认为日常环境
//  *  - {Number} connectTimeout         此client下全局的建立连接超时时间，默认为3秒
//  *  - {Number} responseTimeout        此client下全局的响应超时时间，默认为3秒
//  *  - {Number} routeInterval          此client下全局的向configSvr重新请求服务端地址、更新地址列表的间隔时间，默认为1分钟
//  *  - {Boolean} snapshot              是否使用快照功能，使用快照则在启动的时候如果无法连接到config server，则读取本地缓存的服务者地址。
//  *  - {String|Stream|function} logger 记录日志的路径或者Stream或者方法用于日志的写入
//  *  - {Boolean} logOff                关闭日志
//  *  - {Boolean} keepAlive             设置此client下生成的所有consumer是否与服务端维持长连接，默认为true
//  *  - {Boolean} noDelay               设置此client下生成的所有consumer是否关闭nagle算法，默认为true
//  * @return {HsfClient}
//  * @public
//  */
// var client = hsf.createClient( {} );

// /**
//  * 创建一个consumer，可以同时创建多个consumer来调用多个HSF服务
//  * @param  {string} interface   服务接口名
//  * @param  {string} version     服务版本号
//  * @param  {object} options
//  *  - group                     服务分组，默认为hsf分组，一般不需要更改
//  *  - routeInterval             此consumer的重新请求服务端地址、更新地址列表的间隔时间
//  *  - connectTimeout            此consumer的建立连接超时时间
//  *  - responseTimeout           此consumer的响应超时时间
//  *  - id                        interface:version，在不传这两个参数的时候可以用id来替代
//  *  - keepAlive                 此consumer是否与服务器维持长连接
//  *  - noDelay                   此consumer是否关闭nagle算法
//  * @return {Consumer}
//  * @public
//  */
// function HsfProxy( options ) {
//     this._opt = options,
//     this._consumer = client.createConsumer( options.interface, options.version );
// }

// // Inherits ProxyBase
// util.inherits( HsfProxy, ProxyBase );

// // @override request function
// HsfProxy.prototype.request = function( params, callback, errCallback ) {
//     this._consumer.invoke( this._opt.method, params, function( err, data ) {
//         if ( err ) {
//             errCallback( err );
//             return;
//         }
//         callback( data );
//     } );
// };

// // @override interceptRequest
// HsfProxy.prototype.interceptRequest = function( req, res ) {

// };

// var uicDataService = client.createConsumer(
//     'com.taobao.uic.common.service.userdata.UicDataService'
//     , '1.0.0.daily' );

// var args = [];
// args.push(java.Long(123));
// args.push('data-info-userdata');
// args.push('gongyangyu');
// args.push('langneng');



// uicDataService.invoke('insertData', args, function(err, data) {
//     console.log( err );
//     console.log( data );
// });



// // // test 
// // var proxy = new HsfProxy( {
// //     interface: 'com.taobao.uic.common.service.userinfo.UicDeliverAddressService',
// //     method: 'insertDeliverAddr',
// //     version: '1.0.0.daily'
// // } );

// // var baseDeliverAddressDO = {
// //   $class: 'com.taobao.uic.common.domain.BaseDeliverAddressDO',
// //   $: {
// //     id: 13254,
// //     idLong: {
// //       $class: 'long',
// //       $: 13254
// //     },
// //     fullName: 'gongyangyu',
// //     phone: '123456789',
// //     mobile: '123456789',
// //     address: 'chuangyedasha',
// //     postCode: '310018',
// //     userId: {
// //       $class: 'long',
// //       $: 24567
// //     },
// //     status: 1,
// //     city: 'hangzhou',
// //     province: 'zhejiang',
// //     area: 'xihu',
// //     devisionCode: 'abcde',
// //     'addressDetail': 'huaxinlu99hao'
// //   }
// // };

// /*
// var args = [baseDeliverAddressDO, 'gongyangyutest'];
// proxy.request( baseDeliverAddressDO, function( data ) {
//     console.log( data );
// }, function( err ) {
//     console.log( err );
// } );*/

// module.exports = HsfProxy;

// module.epxorts = function() {
    
// }
