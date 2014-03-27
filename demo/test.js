var app = require( 'connect' )();

var ModelProxy = require( '../index' );
ModelProxy.init( '../interface_sample.json' );




app.use( '/model/', ModelProxy.Interceptor );

app.listen( 3000 );