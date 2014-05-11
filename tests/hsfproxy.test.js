var assert = require( 'assert' );
var java = require( 'js-to-java' );
var HsfProxy = require( '../lib/plugins/hsf' );

describe( 'HsfProxy', function() {

    describe( '#init()', function() {
        it( 'should be called without exception', function() {
            HsfProxy.init( {
                status: 'prod',
                hsf: {
                    "configServers": {
                        "prod": "commonconfig.config-host.taobao.com",
                        "daily": "10.232.16.8",          
                        "prep": "172.23.226.84"
                    }
                }
            } );
        } );
    } );

    describe( '#verify()', function() {
        var InterfaceManager = {
            getStatus: function() {
                return 'daily';
            }
        };

        it( 'should throw exception if service in config is null', function() {
            assert.throws( function() {
                HsfProxy.verify( {}, InterfaceManager );
            } );
        } );

        it( 'should throw exception if version is null', function() {
            assert.throws( function() {
                HsfProxy.verify( {
                    // "version": "1.0.0.170",
                    "type": "hsf",
                    "id": "UserData.append",
                    "service": "com.taobao.item.service.ItemQueryService",
                    "methodName": "queryItemForDetail",
                    "method": "POST"
                }, InterfaceManager );
            } );
        } );

        it( 'should return verified config', function() {
            var config = HsfProxy.verify( {
                    "version": "1.0.0.170",
                    "type": "hsf",
                    "id": "UserData.append",
                    "service": "com.taobao.item.service.ItemQueryService",
                    "methodName": "queryItemForDetail",
                    "method": "POST"
            }, InterfaceManager );
            assert.equal( config.dataType, 'json' );

        } );
    } );
} );

describe( 'HsfProxy Object', function() {
    var opt1 = {
        "version": "1.0.0.170",
        "type": "hsf",
        "id": "UserData.append",
        "service": "com.taobao.item.service.ItemQueryService",
        "methodName": "queryItemForDetail",
        "method": "GET"
    };

    var hsfProxy = new HsfProxy( opt1 );
    var args = [];
    args.push(java.long(1500006995808));

    describe( '#requestReal()', function() {
        it( 'should return data without err', function( done ) {
            hsfProxy.request( args, function( data ) {
                assert.equal( typeof data, 'object' );
                done();
            }, function( err ) {
                console.Error( 'ERROR:\n', err );
            } );
        } );
    } );

    describe( '#interceptRequest()', function() {
        it( 'should intercept the request and response data', function( done ) {
            var req = {
                headers: {
                    cookie: ''
                },
                url: 'getItem?args=' + JSON.stringify( args ),
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
                }          
            };
            hsfProxy.interceptRequest( req, res );
        } );
    } );
} );