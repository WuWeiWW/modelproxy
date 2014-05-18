var assert = require( 'assert' );

var MysqlProxy = require( '../lib/plugins/mysql' );

var opt =  {
    api: 'com.taobao.detail.getTaobaoDyn',
    v: '1.0',
    dataType: 'json',
    status: 'prod',
    engine: 'river-mock'
};

MysqlProxy.init( {
    mysql: {
        pools: {
            test: {
                host: '115.28.48.117',
                port: 3306,
                user: 'zyz',
                database: 'test',
                password: 'passw0rd'
            }
        },
        defaultPool: 'test'
    }
} );

var options = {
    id: 'Test.queryData',
    sql: 'SELECT * FROM REGION WHERE REGIONID = ?'
};

options = MysqlProxy.verify( options );

var proxy = new MysqlProxy( options );

proxy.requestReal( [10], function( data ) {
    console.log( data );
}, function( err ) {
    console.log( err );
} );


// describe( 'MtopProxy', function() {

//     describe( '#init()', function() {
//         it( 'should be called without exception', function() {
//             MtopProxy.init( {
//                 mtop: {
//                     "urls": {
//                         "prod": "http://api.m.taobao.com/rest/h5ApiUpdate.do",
//                         "prep": "http://api.wapa.taobao.com/rest/h5ApiUpdate.do",
//                         "daily": "http://api.waptest.taobao.com/rest/h5ApiUpdate.do"
//                     },
//                     "tokenName": "_m_h5_tk",
//                     "appKeys": {              
//                         "prod": 12574478,
//                         "prep": 12574478,                
//                         "daily": 4272                 
//                     }
//                 },
//                 status: "prod"
//             } );
//         } );
//     } );

//     describe( '#verify()', function() {
//         var InterfaceManager = {
//             getStatus: function() {
//                 return 'daily';
//             }
//         };

//         it( 'should throw exception if api is not configured', function() {
//             assert.throws( function() {
//                 MtopProxy.verify( {}, InterfaceManager );
//             } );
//         } );

//         it( 'should return verified config', function() {
//             var config = MtopProxy.verify( {
//                 api: 'com.taobao.detail.getTaobaoDyn',
//                 v: '1.0',
//                 dataType: 'json',
//                 status: 'prod',
//                 engine: 'river-mock'
//             }, InterfaceManager );

//             assert.equal( config.dataType, 'json' );
//         } );
//     } );
// } );

// describe( 'MtopProxy Object', function() {
//     var opt = {
//         api: 'com.taobao.detail.getTaobaoDyn',
//         v: '1.0',
//         dataType: 'json',
//         status: 'prod',
//         engine: 'river-mock'
//     };
//     opt = MtopProxy.verify( opt );
//     var mtopProxy = new MtopProxy( opt );

//     describe( '#requestReal()', function() {
//         it( 'should return data without err', function( done ) {
//             mtopProxy.requestReal( 
//                 {"itemNumId": "37194529489"}
//                 , function( data ) {
//                     console.log( data );
//                     done();
//                 }, function( err ) {
//                     console.log( err );
//                     done();
//                 }, cookie );
//         } );
//     } );

//     describe( '#interceptRequest()', function() {
//         it( 'should intercept the request and response data', function() {
//             var req = {
//                 headers: {
//                     cookie: cookie
//                 },
//                 url: 'getItem?itemNumId=37194529489',
//                 on: function( eventName, callback ) {
//                     if ( eventName === 'data' ) {
//                         callback( 'mock chunk' );
//                     } else if ( eventName === 'end' ) {
//                         callback();
//                     }
//                 }
//             };
//             var res = {
//                 headers: {},
//                 end: function( data ) {
//                     console.log( data );
//                     assert.notEqual( data.length,  0 );
//                     done();
//                 },
//                 setHeader: function( name, value ) {

//                 }
//             };
//             mtopProxy.interceptRequest( req, res );
//         } );
//     } );
// } );