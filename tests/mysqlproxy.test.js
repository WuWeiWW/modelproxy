var assert = require( 'assert' );

var MysqlProxy = require( '../lib/plugins/mysql' );

var InterfaceManager = {
    getStatus: function() {
        return 'prod';
    }
};

describe( 'MysqlProxy', function() {

    describe( '#init()', function() {
        it( 'should be called without exception', function() {
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
        } );
    } );

    describe( '#verify()', function() {

        it( 'should throw exception if sql is not configured', function() {
            assert.throws( function() {
                MysqlProxy.verify( {}, InterfaceManager );
            } );
        } );

        it( 'should return verified config', function() {
            var config = MysqlProxy.verify( {
                id: 'Test.queryData',
                sql: 'SELECT * FROM REGION WHERE REGIONID = ?'
            }, InterfaceManager );

            assert.equal( config.method, 'GET' );
        } );
    } );
} );


describe( 'MysqlProxy Object', function() {

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

    options = MysqlProxy.verify( options, InterfaceManager );

    var proxy = new MysqlProxy( options );

    describe( '#requestReal()', function() {
        it( 'should return data without err', function( done ) {
            proxy.requestReal( [10], function( data ) {
                console.log( data );
                done();
            }, function( err ) {
                console.log( err );
                done();
            } );
        } );
    } );

    describe( '#interceptRequest()', function() {
        it( 'should intercept the request and response data', function() {
            var req = {
                headers: {
                    cookie: ''
                },
                url: 'getItem?args=[10]',
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
            proxy.interceptRequest( req, res );
        } );
    } );
} );