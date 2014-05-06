var assert = require( 'assert' );

var ProxyFactory = require( '../lib-cov/proxyfactory' );
var InterfaceManager = require( '../lib-cov/interfacemanager' );

var ifmgr = new InterfaceManager( '../tests/interface_test.json' );
var cookie = 
describe( 'ProxyFactory', function() {

  it( 'can only use object of InterfaceManager to initial the factory', function() {
    assert.throws( function() {
      ProxyFactory.use( {} );
    }, function( err ) {
      return err.toString()
        .indexOf( 'Proxy can only use instance of InterfacefManager' ) !== -1
    } );
  } );
  ProxyFactory.use( ifmgr );

  describe( '#getInterfaceIdsByPrefix()', function() {
    it( 'should return an id array', function() {
      assert.equal( ProxyFactory.getInterfaceIdsByPrefix( 'Search.' ).length, 3 );
    } );
  } );

  describe( '#create()', function() {
    it( 'should throw exception when the interface id is invalid', function() {
      assert.throws( function() {
        ProxyFactory.create( 'Search.getItems' );
      }, function( err ) {
        return err.toString()
          .indexOf( 'Invalid interface id: Search.getItems' ) !== -1;
      } );
    } );
  } );

  describe( '#Interceptor()', function() {
    it( 'should intercept the request which interface id is matched', function( done ) {
      var req = {
        headers: {
          cookie: ''
        },
        url: '/Search.suggest?q=a',
        on: function( eventName, callback ) {
          if ( eventName === 'data' ) {
            callback( 'mock chunk' );
          } else if ( eventName === 'end' ) {
            callback();
          }
        }
      };
      var res = {
        headers: {

        },
        end: function( data ) {
          assert.notEqual( data.length,  0 );
          done();
        },
        setHeader: function( key, value ) {
          this.headers[key] = value;
        },
        on: function( eventName, callback ) {
          if ( eventName === 'data' ) {
            callback( 'mock chunk' );
          } else if ( eventName === 'end' ) {
            callback();
          }
        }
      };
      ProxyFactory.Interceptor( req, res );
    } );

    it( 'should response 404 when the interface id is not matched', function() {
      var req = {
        headers: {
          cookie: ''
        },
        url: '/Search.what?q=a'
      };
      var res = {
        headers: {

        },
        end: function( data ) {
          assert.strictEqual( this.statusCode,  404 );
        },
        setHeader: function( key, value ) {
          this.headers[key] = value;
        }
      };
      ProxyFactory.Interceptor( req, res );
    } );

    it( 'should response 404 when the interface id is matched but the intercepted field is configurated as false'
      , function() {
      var req = {
        headers: {
          cookie: ''
        },
        url: '/D.getNav?q=c'
      };
      var res = {
        headers: {

        },
        end: function( data ) {
          assert.strictEqual( this.statusCode,  404 );
        },
        setHeader: function( key, value ) {
          this.headers[key] = value;
        }
      };
      ProxyFactory.Interceptor( req, res );
    } );

    it( 'should response client interfaces', function( done ) {
      var req = {
        headers: {
          cookie: ''
        },
        url: '/$interfaces',
        on: function( eventName, callback ) {
          if ( eventName === 'data' ) {
            callback( 'mock chunk' );
          } else if ( eventName === 'end' ) {
            callback();
          }
        }
      };
      var res = {
        end:  function( data ) {
          assert.notEqual( data.length, 0 );
          done();
        }
      };
      ProxyFactory.Interceptor( req, res );
    } )

  } );

} );

var Proxy = ProxyFactory;




