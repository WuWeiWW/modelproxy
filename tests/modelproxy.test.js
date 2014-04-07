var assert = require( 'assert' );

var ModelProxy = require( '../lib/modelproxy' );

describe( 'ModelProxy', function() {
  describe( '#init()', function() {
    it( 'throws exception when the path of the interface is not right', function() {
      assert.throws( function() {
        ModelProxy.init( 'error/path/interface_test.json' );
      }, function( err ) {
        return err.toString().indexOf( 'no such file or directory' ) !== -1;
      } );
    } );
  } );
  ModelProxy.init( './interface_test.json' );
  describe( '#create()', function() {
    it( 'should return an object with methods specified by the profile', function() {
      var m = ModelProxy.create( 'Search.suggest' );
      assert( typeof m.suggest === 'function' );

      m = ModelProxy.create( [ 'Search.suggest', 'Cart.getMyCart' ] );
      assert( typeof m.suggest === 'function' );
      assert( typeof m.getMyCart === 'function' );

      m = ModelProxy.create( {
        suggest: 'Search.suggest',
        getCart: 'Cart.getMyCart'
      } );
      assert( typeof m.suggest === 'function' );
      assert( typeof m.getCart === 'function' );

      m = ModelProxy.create( 'Search.*' );
      assert( typeof m.list === 'function' );
      assert( typeof m.suggest === 'function' );
      assert( typeof m.getNav === 'function' );
    } );

    it('should throw exception if the specified interface id does not exist', function() {
      assert.throws( function() {
        var m = ModelProxy.create( 'Search.getItems' );
      }, function( err ) {
        return err.toString().indexOf( 'Invalid interface id' ) !== -1;
      } );
      assert.throws( function() {
        var m = ModelProxy.create( ['Search.getItems'] );
      }, function( err ) {
        return err.toString().indexOf( 'Invalid interface id' ) !== -1;
      } );

      assert.throws( function() {
        var m = ModelProxy.create( {
          getItems: 'Search.getItems',
          getMyCart: 'Cart.getMyCart'
        } );
      }, function( err ) {
        return err.toString().indexOf( 'Invalid interface id' ) !== -1;
      } );
    } );
  } );

} );

describe( 'modelProxy', function() {

  describe( '#method()', function() {
    var m = ModelProxy.create( 'Search.suggest' );
    it( 'should return itself', function() {
      var m = ModelProxy.create( 'Search.suggest' );
      assert( m.suggest( { q: 'i'} ) === m );
    } );
  } );

  describe( '#done()', function() {
    var m = ModelProxy.create( 'Search.*' );
    it( 'should send all requests pushed before done and fetch the corresponding data into the callback'
      , function( done ) {
      m.suggest( {q: 'i'} )
        .list( {q: 'i'} )
        .done( function( data1, data2 ) {
          assert( typeof data1 === 'object' );
          assert( typeof data2 === 'object' );
          done();
        } );
    } );

    it( 'should catch error when the request has error', function( done ) {
      var m = ModelProxy.create( 'Cart.*' );
      m.getMyCart()
       .withCookie( 'a=b' )
       .done( function( data ) {

       }, function( err ) {
        assert( err instanceof Error ); 
        done();
       } );
    } );
  } );

  describe( '#withCookie()', function() {
    it( 'should be called to set cookie before request the interface which is cookie needed'
      , function( done ) {
      var m = ModelProxy.create( 'Cart.*' );
      m.getMyCart()
       .withCookie('ali_ab=42.120.74.193.1395041649126.7; l=c%E6%B5%8B%E8%AF%95%E8%B4%A6%E5%8F%B7135::1395387929931::11; cna=KcVJCxpk1XkCAX136Nv5aaC4; _tb_token_=DcE1K7Gbq9n; x=e%3D1%26p%3D*%26s%3D0%26c%3D0%26f%3D0%26g%3D0%26t%3D0%26__ll%3D-1%26_ato%3D0; whl=-1%260%260%260; ck1=; v=0; lzstat_uv=16278696413116954092|2511607@2511780@2738597@3258521@878758@2735853@2735859@2735862@2735864@2341454@2868200@2898598; lzstat_ss=3744453007_0_1396468901_2868200|970990289_0_1396468901_2898598; uc3=nk2=AKigXc46EgNui%2FwL&id2=Vy%2BbYvqj0fGT&vt3=F8dHqR%2F5HOhOUWkAFIo%3D&lg2=UtASsssmOIJ0bQ%3D%3D; existShop=MTM5NjU5NDUyMQ%3D%3D; lgc=c%5Cu6D4B%5Cu8BD5%5Cu8D26%5Cu53F7135; tracknick=c%5Cu6D4B%5Cu8BD5%5Cu8D26%5Cu53F7135; sg=555; cookie2=1c5db2f359099faff00e14d7f39e16f2; cookie1=UUxBLFbuDPkhSHSYeC7F1IB368UVRx1GOHIZHXB4328%3D; unb=434568395; t=e8bd0dbbf4bdb8f3704a1974b8a166b5; publishItemObj=Ng%3D%3D; _cc_=U%2BGCWk%2F7og%3D%3D; tg=0; _l_g_=Ug%3D%3D; _nk_=c%5Cu6D4B%5Cu8BD5%5Cu8D26%5Cu53F7135; cookie17=Vy%2BbYvqj0fGT; mt=ci=3_1&cyk=0_0; uc1=lltime=1396594274&cookie14=UoLVYyeHbIuxfA%3D%3D&existShop=true&cookie16=UtASsssmPlP%2Ff1IHDsDaPRu%2BPw%3D%3D&cookie21=Vq8l%2BKCLivp9vpJZLq%2FllQ%3D%3D&tag=4&cookie15=VT5L2FSpMGV7TQ%3D%3D')
       .done( function( data ) {
        done();
       } );
    } );
  } );

} );