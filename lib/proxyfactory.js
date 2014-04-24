/** 
 * ProxyFactory, Proxy
 * This class is provided to create proxy objects following the configuration
 * @author ShanFan
 * @created 24-3-2014
 */

// Dependencies
var HttpProxy = require( './proxy/http' );
var HsfProxy = require( './proxy/hsf' );
var TmsProxy = require( './proxy/tms' );

var logger = console;

var InterfacefManager = require( './interfacemanager' );

// Instance of InterfaceManager, will be intialized when the proxy.use() is called.
var interfaceManager;

var ProxyFactory = {

    // {Object} An object map to store created proxies. The key is interface id
    // and the value is the proxy instance. 
    objects: {},

    /**
     * use
     * @param {InterfaceManager} ifmgr
     * @throws errors
     */
    use: function( ifmgr ) {
        if ( ifmgr instanceof InterfacefManager ) {
            interfaceManager = ifmgr;
        } else {
            throw new Error( 'Proxy can only use instance of InterfacefManager!' );
        }
        return this;
    },

    // getInterfaceIdsByPrefix
    getInterfaceIdsByPrefix: function( pattern ) {
        return interfaceManager.getInterfaceIdsByPrefix( pattern );
    },

    // Proxy factory
    // @throws errors
    create: function( interfaceId ) {
        if ( !!this.objects[ interfaceId ] ) {
            return this.objects[ interfaceId ];
        }
        var opt = interfaceManager.getProfile( interfaceId );
        if ( !opt ) {
            throw new Error( 'Invalid interface id: ' + interfaceId );
        }
        return this.objects[ interfaceId ] = new HttpProxy( opt );
    },

    // setLogger
    setLogger: function( l ) {
        logger = l;
    },

    // Interceptor
    Interceptor: function( req, res ) {
        var interfaceId = req.url.split( /\?|\// )[ 1 ];
        if ( interfaceId === '$interfaces' ) {
            var interfaces = interfaceManager.getClientInterfaces();
            res.end( this.clientInterfaces 
                ? this.clientInterfaces 
                : this.clientInterfaces = JSON.stringify( interfaces ) );

            return;
        }

        try {
            proxy = this.create( interfaceId );
            if ( proxy.getOption( 'intercepted' ) === false ) {
                throw new Error( 'This url is not intercepted by proxy.' );
            }
        } catch ( e ) {
            res.statusCode = 404;
            res.end( 'Invalid url: ' + req.url + '\n' + e );
            return;
        }
        proxy.interceptRequest( req, res );
    }
}

module.exports = ProxyFactory;
