var assert = require( 'assert' );

var ProxyFactory = require( '../lib/proxyfactory' );
var InterfaceManager = require( '../lib/interfacemanager' );

var ifmgr = new InterfaceManager( './interface_test.json' );

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

	describe( '#getMockEngine()', function() {
		it( 'should renturn engine object specified by the field of engine in interface configuration'
			, function() {
				assert( typeof ProxyFactory.getMockEngine().mock === 'function' );
			} );
	} );

	describe( '#getInterfaceIdsByPrefix()', function() {
		it( 'should return an id array', function() {
			assert.equal( ProxyFactory.getInterfaceIdsByPrefix( 'Search.' ).length, 3 );
		} );
	} );

	describe( '#getRule()', function() {
		it( 'should return a rule object of this interface', function() {
			assert( typeof ProxyFactory.getRule( 'Search.list' ) === 'object' );
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
} );

var Proxy = ProxyFactory;

describe( 'Proxy', function() {
	it( 'should construct a new Proxy object', function() {
		var p = new Proxy( {
			id: 'Search.getItems',
			urls: {
				online: 'http://www.modelproxy.com'
			},
			status: 'online'
		} );
		assert( p instanceof Proxy );
		console.log( p._opt );
	} );

	it( 'should throw error when no url is available', function() {
		assert.throws( function() {
			var p = new Proxy( {
				id: 'Search.getItems',
				status: 'online'
			} );
		}, function( err ) {
			return err.toString()
				.indexOf( 'No url can be proxied!' ) !== -1;
		} );

		assert.throws( function() {
			var p = new Proxy( {
				id: 'Search.getItems',
				urls: {
					online: 'http://www.modelproxy.com'
				}
			} );
		}, function( err ) {
			return err.toString()
				.indexOf( 'No url can be proxied!' ) !== -1;
		} );
	} );

	describe( '#getOption()', function() {
		it( 'should return status of this proxy', function() {
			var p = new Proxy( {
				id: 'Search.getItems',
				status: 'online',
				urls: {
					online: 'http://www.modelproxy.com'
				}
			} );
			assert.strictEqual( p.getOption( 'id' ), 'Search.getItems' );
		} );
	} );

	describe( '#_queryStringify()', function() {
		var p = new Proxy( {
			id: 'Search.getItems',
			status: 'online',
			urls: {
				online: 'http://www.modelproxy.com'
			}
		} );

		it( 'should return empty string if the params is null undefined', function() {
			assert.strictEqual( p._queryStringify( null ), '' );
			assert.strictEqual( p._queryStringify( undefined ), '' );
		} );

		it( 'should return the params itself if the type of params is string', function() {
			assert.strictEqual( p._queryStringify( 'a=b&c=d' ), 'a=b&c=d');
		} );

		it( 'should return the joined string with & if the params is instance of Array', function() {
			assert.strictEqual( p._queryStringify( [ 'a=b', 'c=d' ] ), 'a=b&c=d' );
			assert.strictEqual( p._queryStringify( [] ), '' );
		} );

		it( 'should return the joined string with & if the params is a key-value object', function() {
			assert.strictEqual( p._queryStringify( {a:'b', c:'d'} ), 'a=b&c=d' );
			assert.strictEqual( p._queryStringify( {} ), '' );
			assert.strictEqual( p._queryStringify( {a:'b', c:{d:'f'}} ), 'a=b&c={"d":"f"}' );
			assert.strictEqual( p._queryStringify( {a:'b', c:['d','e']} ), 'a=b&c=["d","e"]' );
		} );
	} );
	
	describe( '#request()', function() {
		var p = ProxyFactory.create( 'Search.suggest' );
		it( 'should get result from the remote', function( done ) {
			p.request( {q: 'i'}, function( result ) {
				done();
			} );
		} );

		it( 'should get the result from mock', function( done ) {
			ProxyFactory.create( 'Search.getNav' )
				.request( {q: 'i'}, function( result ) {
					assert.strictEqual( result, 'This is a mock text' );
					done();
				} );
		} );

		it( 'should get the result from mockerr', function( done ) {
			new Proxy( {
		        'name': '导航获取接口',
		        'id': 'Search.getNav',
		        'urls': {
		            'online': 'http://s.m.taobao.com/client/search.do'
		        },
		        'status': 'mockerr',
		        'isRuleStatic': true
		    } ).request( null, function( result ) {
		    	assert.strictEqual( result, 'This is a mock error' );
				done();
		    } );
		} );

		it( 'should get the mocked result by mockEngine', function( done ) {
			ProxyFactory.create( 'Search.list' )
				.request( {q: 'i'}, function( result ) {
					assert.strictEqual( typeof result, 'object' );
					done();
				} );
		} );

		it( 'should get a buffer if the encoding of the result is  set as raw', function( done ) {
			new Proxy( {
		        'name': '热词推荐接口',
		        'id': 'Search.suggest',
		        'urls': {
		            'online': 'http://suggest.taobao.com/sug'
		        },
		        'encoding': 'raw',
		        'status': 'online'
			} ).request( {q: 'i'}, function( result ) {
		    	assert( typeof result === 'object' );
				done();
		    } );

		} );

		it( 'should get a json if the data type of the result is set as json', function( done ) {
			new Proxy( {
		        'name': '热词推荐接口',
		        'id': 'Search.suggest',
		        'urls': {
		            'online': 'http://suggest.taobao.com/sug'
		        },
		        'dataType': 'json',
		        'status': 'online'
			} ).request( {q: 'i'}, function( result ) {
		    	assert( typeof result === 'object' );
				done();
		    } );
		} );

		it( 'should get a string if the data type of the result is set as text', function( done ) {
			new Proxy( {
		        'name': '热词推荐接口',
		        'id': 'Search.suggest',
		        'urls': {
		            'online': 'http://suggest.taobao.com/sug'
		        },
		        'dataType': 'text',
		        'status': 'online'
			} ).request( {q: 'i'}, function( result ) {
		    	assert( typeof result === 'string' );
				done();
		    } );
		} );

		it( 'should get nothing if the request is cookie needed but no cookie is set for this request',
			function( done ) {

			new Proxy( {
		        "name": "我的购物车",
		        "id": "Cart.getMyCart",
		        "urls": {
		            "online": "http://cart.taobao.com/json/asyncGetMyCart.do"
		        },
		        "status": "online",
		        "encoding": "gbk"
		    } ).request( {q: 'i'}, function( result ) {
		    	assert( result.length > 0 );
				done();
		    }, function( err ) {
		    	console.log( err );
		    }, 'ali_ab=42.120.74.193.1395041649126.7; l=c%E6%B5%8B%E8%AF%95%E8%B4%A6%E5%8F%B7135::1395387929931::11; cna=KcVJCxpk1XkCAX136Nv5aaC4; _tb_token_=DcE1K7Gbq9n; x=e%3D1%26p%3D*%26s%3D0%26c%3D0%26f%3D0%26g%3D0%26t%3D0%26__ll%3D-1%26_ato%3D0; whl=-1%260%260%260; ck1=; v=0; lzstat_uv=16278696413116954092|2511607@2511780@2738597@3258521@878758@2735853@2735859@2735862@2735864@2341454@2868200@2898598; lzstat_ss=3744453007_0_1396468901_2868200|970990289_0_1396468901_2898598; uc3=nk2=AKigXc46EgNui%2FwL&id2=Vy%2BbYvqj0fGT&vt3=F8dHqR%2F5HOhOUWkAFIo%3D&lg2=UtASsssmOIJ0bQ%3D%3D; existShop=MTM5NjU5NDUyMQ%3D%3D; lgc=c%5Cu6D4B%5Cu8BD5%5Cu8D26%5Cu53F7135; tracknick=c%5Cu6D4B%5Cu8BD5%5Cu8D26%5Cu53F7135; sg=555; cookie2=1c5db2f359099faff00e14d7f39e16f2; cookie1=UUxBLFbuDPkhSHSYeC7F1IB368UVRx1GOHIZHXB4328%3D; unb=434568395; t=e8bd0dbbf4bdb8f3704a1974b8a166b5; publishItemObj=Ng%3D%3D; _cc_=U%2BGCWk%2F7og%3D%3D; tg=0; _l_g_=Ug%3D%3D; _nk_=c%5Cu6D4B%5Cu8BD5%5Cu8D26%5Cu53F7135; cookie17=Vy%2BbYvqj0fGT; mt=ci=3_1&cyk=0_0; uc1=lltime=1396594274&cookie14=UoLVYyeHbIuxfA%3D%3D&existShop=true&cookie16=UtASsssmPlP%2Ff1IHDsDaPRu%2BPw%3D%3D&cookie21=Vq8l%2BKCLivp9vpJZLq%2FllQ%3D%3D&tag=4&cookie15=VT5L2FSpMGV7TQ%3D%3D' );
			

			new Proxy( {
		        "name": "我的购物车",
		        "id": "Cart.getMyCart",
		        "urls": {
		            "online": "http://cart.taobao.com/json/asyncGetMyCart.do"
		        },
		        "status": "online",
		        "encoding": "gbk"
		    } ).request( {q: 'i'}, function( result ) {
		    	console.log( result );
		    	assert( result === '' );
				done();
		    }, function( err ) {
		    	console.log( err );
		    } );

		} );
	} );
} );







