var assert = require( 'assert' );

var InterfaceManager = require( '../lib/interfacemanager' );

describe( 'InterfaceManager', function() {
  it( 'can not be initalized by error path', function() {
    assert.throws( function() {
      InterfaceManager.init( 'error/path' );
    }, function( err ) {
      return err.toString()
          .indexOf( 'Fail to load interface profiles.Error' ) !== -1;
    } );

  } );
} );

describe( 'interfaceManager', function() {
  require( '../lib/proxyfactory' ).init( '../tests/interface_test.json' );

  describe( '#_addProfile()', function() {
    it( 'can not be added without id', function() {
      assert.equal( InterfaceManager._addProfile( {
        urls: {
          online: 'http://url1'
        }
      } ), false );
    } );

    it( 'can not be added when the interface id does not match ^((\\w+\\.)*\\w+)$', function() {
      assert.equal( InterfaceManager._addProfile( {
        id: 'Abc-methodName',
        urls: {
          online: 'http://url1'
        }
      } ), false );

      assert.equal( InterfaceManager._addProfile( {
        id: 'Abc.methodName.',
        urls: {
          online: 'http://url1'
        }
      } ), false );

      assert.equal( InterfaceManager._addProfile( {
        id: 'Abc.methodName',
        urls: {
          online: 'http://url1'
        }
      } ), true );
    } );

    it( 'can not add duplicated interface id', function() {
      assert.equal( InterfaceManager._addProfile( {
        id: 'Abc.methodName',
        urls: {
          online: 'htpp://url1'
        }
      } ), false );

      assert.equal( InterfaceManager._addProfile( {
        id: 'Abc.method1',
        urls: {
          online: 'htpp://url1'
        }
      } ), true );
    } );

    it( 'must have at least one url in urls or its rulefile is available', function() {
      InterfaceManager._rulebase = '.';

      // assert.equal( InterfaceManager._addProfile( {
      //   id: 'Abc.method2',
      //   urls: {}
      // } ), false );

      // assert.equal( InterfaceManager._addProfile( {
      //   id: 'Abc.method2',
      //   ruleFile: 'unavailable.rule.json'
      // } ), false );
    } );
  } );
  
  describe( '#getInterfaceIdsByPrefix()', function() {
    it( 'should have nothing matched when the prefix is not proper', function() {
      assert.equal( InterfaceManager.getInterfaceIdsByPrefix( 'Prefix' ).length, 0 );
    } );
    // it ( 'should return an array of interface when the prefix is right', function() {
    //   assert.notEqual( InterfaceManager.getInterfaceIdsByPrefix( 'Search.' ).length, 0 );
    // } );
  } );

  describe( '#isProfileExisted()', function() {
    it( 'should return false when the interface id does not exist', function() {
      assert.equal( InterfaceManager.isProfileExisted( 'Search.getItem' ), false );
    } );
    // it( 'should return true when the interface id exists', function() {
    //   assert.equal( InterfaceManager.isProfileExisted( 'Search.getNav' ), true );
    // } );
  } );

  describe( '#getProfile()', function() {
    it( 'should return undefined if the given id is not existed', function() {
       assert.strictEqual( InterfaceManager.getProfile( 'Search.item' ), undefined );
    } );

    // it( 'should renturn the profile if the given interface id is existed', function() {
    //   assert.equal( typeof InterfaceManager.getProfile( 'Cart.getMyCart' ), 'object' );
    // } );
  } );

  describe( '#getEngine()', function() {
    it( 'should return mockjs', function() {
       assert.strictEqual( InterfaceManager.getEngine(), 'mockjs' );
    } );
  } );

  describe( '#getStatus()', function() {
    it( 'should return online', function() {
      assert.strictEqual( InterfaceManager.getStatus(), 'online' );
    } );
  } );

  // it( 'clientInterfaces should be initalized after the object of interfaceManager is created', function() {
  //   var clientInterfaces = InterfaceManager.getClientInterfaces();
  //   console.log( clientInterfaces );
  //   assert.notEqual( clientInterfaces, null );
  //   var cnt = 0;
  //   for ( var i in clientInterfaces ) cnt++;
  //   assert.equal( cnt, 7 );
  // } );

} );