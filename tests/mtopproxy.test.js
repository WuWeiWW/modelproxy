var assert = require( 'assert' );

var MtopProxy = require( '../lib/plugins/mtop' );
var HttpProxy = require( '../lib/plugins/http' );

var cookie = "lzstat_uv=16278696413116954092|2511607@2511780@2738597@3258521@878758@2735853@2735859@2735862@2735864@2341454@2868200@2898598@1296239@2225939@3152682@1813784; miid=3882702882102873773; linezing_session=9pX2paimn7UeYMA9YL73AJlw_13998769768870Xjg_1; supportWebp=false; wud=wud; ockeqeudmj=v0XiUfo%3D; _w_tb_nick=nodejs; imewweoriw=i06Edez7IjVmKr6W0%2BWgAdUZ6KGbhnQHntBjD5BLCGw%3D; WAPFDFDTGFG=%2B4dRjM5djSecKyo4JwyfmJ2Wk7iKyBzh%2Fy4CWxd3Im0%3D; _w_app_lg=1; _w_al_f=1; cna=KcVJCxpk1XkCAX136Nv5aaC4; ali_ab=42.120.74.193.1395041649126.7; ck1=; v=0; x=e%3D1%26p%3D*%26s%3D0%26c%3D0%26f%3D0%26g%3D0%26t%3D0%26__ll%3D-1%26_ato%3D0; whl=-1%260%260%261399998030001; l=nodejs::1400403060985::11; existShop=MTQwMDQ3MDE0OA%3D%3D; lgc=nodejs; tracknick=nodejs; sg=s25; mt=cp=0&np=&ci=0_1&cyk=0_0; _cc_=U%2BGCWk%2F7og%3D%3D; tg=0; _l_g_=Ug%3D%3D; lzstat_ss=1488891860_4_1399994985_1296239|921485505_4_1399994985_2225939|278005458_0_1400020487_2511607|2625932748_0_1400498947_2738597; t=e8bd0dbbf4bdb8f3704a1974b8a166b5; _nk_=nodejs; _m_h5_tk=4f2fd5788308da3101bd8d14c94d7622_1400474489214; _m_h5_tk_enc=99261251f9ddaa57980e63a6a0e9ee69; uc1=lltime=1400470071&cookie14=UoW3v0zGsRz9Qg%3D%3D&existShop=false&cookie16=W5iHLLyFPlMGbLDwA%2BdvAGZqLg%3D%3D&cookie21=WqG3DMC9FxUx&tag=2&cookie15=UIHiLt3xD8xYTw%3D%3D";

HttpProxy.init( {
    status: 'prod'
} );

var opt =  {
    api: 'com.taobao.detail.getTaobaoDyn',
    v: '1.0',
    dataType: 'json',
    status: 'prod',
    engine: 'river-mock'
};

describe( 'MtopProxy', function() {

    describe( '#init()', function() {
        it( 'should be called without exception', function() {
            MtopProxy.init( {
                mtop: {
                    "urls": {
                        "prod": "http://api.m.taobao.com/rest/h5ApiUpdate.do",
                        "prep": "http://api.wapa.taobao.com/rest/h5ApiUpdate.do",
                        "daily": "http://api.waptest.taobao.com/rest/h5ApiUpdate.do"
                    },
                    "tokenName": "_m_h5_tk",
                    "appKeys": {              
                        "prod": 12574478,
                        "prep": 12574478,                
                        "daily": 4272                 
                    }
                },
                status: "prod"
            } );
        } );
    } );

    describe( '#verify()', function() {
        var InterfaceManager = {
            getStatus: function() {
                return 'daily';
            }
        };

        it( 'should throw exception if api is not configured', function() {
            assert.throws( function() {
                MtopProxy.verify( {}, InterfaceManager );
            } );
        } );

        it( 'should return verified config', function() {
            var config = MtopProxy.verify( {
                api: 'com.taobao.detail.getTaobaoDyn',
                v: '1.0',
                dataType: 'json',
                status: 'prod',
                engine: 'river-mock'
            }, InterfaceManager );

            assert.equal( config.dataType, 'json' );
        } );
    } );
} );

describe( 'MtopProxy Object', function() {
    var opt = {
        id: 'Detail.getTaobaoDyn',
        api: 'com.taobao.detail.getTaobaoDyn',
        v: '1.0',
        dataType: 'json',
        status: 'prod',
        engine: 'river-mock'
    };
    opt = MtopProxy.verify( opt );
    var mtopProxy = new MtopProxy( opt );

    describe( '#requestReal()', function() {
        it( 'should return data without err', function( done ) {
            mtopProxy.request( 
                {"itemNumId": "37194529489"}
                , function( data ) {
                    console.log( data );
                    done();
                }, function( err ) {
                    console.log( err );
                    done();
                }, cookie );
        } );
    } );

    describe( '#interceptRequest()', function() {
        it( 'should intercept the request and response data', function() {
            var req = {
                headers: {
                    cookie: cookie
                },
                url: 'getItem?itemNumId=37194529489',
                on: function( eventName, callback ) {
                    if ( eventName === 'data' ) {
                        callback( 'mock chunk' );
                    } else if ( eventName === 'end' ) {
                        callback();
                    }
                }
            };
            var res = {
                headers: {},
                end: function( data ) {
                    console.log( '' );
                    console.log( data );
                    assert.notEqual( data.length,  0 );
                    done();
                },
                setHeader: function( name, value ) {

                }
            };
            mtopProxy.interceptRequest( req, res );
        } );
    } );
} );