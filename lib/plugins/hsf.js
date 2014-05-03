var util = require( 'util' );
var ProxyBase = require( '../proxy' );
var Constant = require( '../constant' );
var hsf = require( 'hsf' );
var qs = require( 'querystring' );

// hsf client reference
var client;

// The options object which will be initialized when the init function is called.
var hsfOptions; 

// HsfProxy Constructor
function HsfProxy( options ) {
    this._opt = options;
    // @See Readme.md about the hsf interface configuration
    var opt = {
        group: options.group || 'hsf',
        connectTimeout: options.connectTimeout || 3 ,
        responseTimeout: options.responseTimeout || 3,
        keepAlive: options.keepAlive,
        noDelay: options.noDelay
    };
    if ( this._opt.status === Constant.STATUS_MOCK 
        || this._opt.status === Constant.STATUS_MOCK_ERR ) {
        return;
    }
    client = client ? client : hsf.createClient( hsfOptions );
    this._consumer = client.createConsumer( options.service, options.version, opt );
}

// Inherits ProxyBase
util.inherits( HsfProxy, ProxyBase );

// @override request function
HsfProxy.prototype.requestReal = function( params, callback, errCallback ) {
    this._consumer.invoke( this._opt.methodName, params, function( err, data ) {
        if ( err ) {
            errCallback( err );
            return;
        }
        callback( data );
    } );
};

// @override interceptRequest
HsfProxy.prototype.interceptRequest = function( req, res ) {
    
    var self = this, args, buf = [], size = 0;
    var queryObj = qs.parse( req.url.split( '?' )[1] || '' );
    if ( self._opt.method === Constant.GET ) {
        // This args field in queryObj should be promised by requester.
        args = queryObj.args ? JSON.parse( queryObj.args ) : null ;
    }
    
    req.on( 'data', function( chunck ) {
        buf.push( chunck );
        size += chunck.length;
    } );

    req.on( 'end', function() {
        if ( self._opt.method === Constant.POST ) {
            postData = Buffer.concat( buf, size );
            args = qs.parse( postData.toString() ).args;
            args = args ? JSON.parse( args ) : null;
        }
        if ( self._opt.status === Constant.STATUS_MOCK
            || self._opt.status === Constant.STATUS_MOCK_ERR ) {
            self.requestMock( args, function( data ) {
                res.end( typeof data  === 'string' ? data : JSON.stringify( data ) );
            }, function( e ) {
                res.statusCode = 500;
                res.end( 'Error occurred when mocking data' );
            } );
            return;
        }
        self._consumer.invoke( self._opt.methodName, args, function( err , data ) {
            if ( err ) {
                res.statusCode = 500;
                res.end( err + '' );
                return;
            }
            res.end( typeof data === 'string' ? data : JSON.stringify( data ) );
        } );
    } );
};

HsfProxy.init = function( config ) {
    var hsfConfig = config.hsf || {};
    // @See Readme.md about the hsf configuration
    hsfOptions = {
        configSvr: ( hsfConfig.configServers || {} )[ config.status ],
        connectTimeout: hsfConfig.connectTimeout || 3,
        responseTimeout: hsfConfig.responseTimeout || 3,
        routeInterval: hsfConfig.routeInterval || 60,
        snapshot: hsfConfig.snapshot || false,
        logOff: hsfConfig.logOff || false,
        keepAlive: hsfConfig.keepAlive || true,
        noDelay: hsfConfig.noDelay || true
    };
};

HsfProxy.verify = function( prof, InterfaceManager ) {
    prof.method = prof.method || Constant.GET;
    prof.intercepted = prof.intercepted || true;
    prof.dataType = prof.dataType || Constant.JSON;
    prof.status = prof.status || InterfaceManager.getStatus();
    return prof;
};

module.exports = HsfProxy;