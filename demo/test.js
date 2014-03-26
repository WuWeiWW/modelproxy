var InterfaceManager = require( '../lib/interfacemanager' )
  , ProxyFactory = require( '../lib/proxyfactory' )
  , ModelProxy = require( '../lib/modelproxy' );

var ifManager = new InterfaceManager( '../interface.json' );

ProxyFactory.use( ifManager );

ModelProxy.use( ProxyFactory );


var connect = require( 'connect' );
var app = connect();

// var model = ModelProxy.create( 'Search.*' );

/*
app.use(function( req, res ) {
	model.getItems( {
		q: 'jackjones'
	} )
	.done( function( data ) {
		res.write( data );
		res.end();
	} );

} );*/

app.use( '/model/', ModelProxy.Interceptor );

app.listen( 3000 );