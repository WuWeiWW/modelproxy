var assert = require( 'assert' );

var MtopProxy = require( '../lib/plugins/mtop' );
var HttpProxy = require( '../lib/plugins/http' );

var cookie = "lzstat_uv=16278696413116954092|2511607@2511780@2738597@3258521@878758@2735853@2735859@2735862@2735864@2341454@2868200@2898598@1296239@2225939@3152682@1813784; miid=3882702882102873773; ali_ab=42.120.74.193.1395041649126.7; x=e%3D1%26p%3D*%26s%3D0%26c%3D0%26f%3D0%26g%3D0%26t%3D0%26__ll%3D-1%26_ato%3D0; ck1=; l=%E5%96%84%E7%B9%81::1399872955105::11; mt=cp=0&np=&ci=0_1&cyk=0_0; tg=0; linezing_session=9pX2paimn7UeYMA9YL73AJlw_13998769768870Xjg_1; supportWebp=false; v=0; cna=wjR/C+c2gEUCASp4SsmMsEpX; wud=wud; ockeqeudmj=v0XiUfo%3D; _w_tb_nick=nodejs; imewweoriw=i06Edez7IjVmKr6W0%2BWgAdUZ6KGbhnQHntBjD5BLCGw%3D; WAPFDFDTGFG=%2B4dRjM5djSecKyo4JwyfmJ2Wk7iKyBzh%2Fy4CWxd3Im0%3D; _w_app_lg=1; _w_al_f=1; lgc=nodejs; tracknick=nodejs; sg=s25; t=e8bd0dbbf4bdb8f3704a1974b8a166b5; _cc_=UtASsssmfA%3D%3D; _l_g_=Ug%3D%3D; _nk_=nodejs; _m_h5_tk=d4432171afe6aada57c3b16e35c12353_1399900940460; _m_h5_tk_enc=df9d0d2ab7e4a7d0c7773489de9e88ea; uc1=cookie14=UoLVbEzBoXGxNg%3D%3D&cookie21=WqG3DMC9FxUx&cookie15=UtASsssmOIJ0bQ%3D%3D";

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