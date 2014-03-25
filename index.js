var InterfaceManager = require( './lib/interfacemanager' )
  , ProxyFactory = require( './lib/proxyfactory' )
  , ModelProxy = require( './lib/modelproxy' );

var ifManager = new InterfaceManager( './interface.json' );

ProxyFactory.use( ifManager );

ModelProxy.use( ProxyFactory );

module.exports = ModelProxy;

/*
var m = new ModelProxy('Search.*');
m.getItems({q: 'jackjones'})
.getItems({q: '冲锋衣'})
.getItems({q: 'iphone'})
.getItems({q: '春装'})
.getItems({q: '连衣裙'})
.getItems({q: '婚纱'})
.getItems({q: 'jackjones'})
.getItems({q: 'jackjones'})
 .done(function(data) {
    console.log( arguments );
    this.getItems({q: '冲锋衣'})
     .done( function(data1) {
        console.log( 'hello' );
        console.log(data1);
     } ).done( function(data) {
        console.log( data, 'nothing');
     });

 } );
*/

var m = new ModelProxy( 'Search.*' );
m.suggest( {q: 'jackjones' } )
    .done( function( data ) {
        console.log(data);
    }, function( err ) {
        console.log( 'this is an error' );
    } );

/*
m.getCart({q:'kkk'})
 .done( function( data ) {
    console.log( data );
 } );*/

