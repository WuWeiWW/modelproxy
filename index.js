var InterfaceManager = require( './lib/interfacemanager' )
  , ProxyFactory = require( './lib/proxyfactory' )
  , ModelProxy = require( './lib/modelproxy' );

var ifManager = new InterfaceManager( './interface.json' );

ProxyFactory.use( ifManager );

ModelProxy.use( ProxyFactory );

module.exports = ModelProxy;