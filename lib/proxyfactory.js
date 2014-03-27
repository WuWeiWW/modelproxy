/** 
 * ProxyFactory, Proxy
 * This class is provided to create proxy objects following the configuration
 * @author ShanFan
 * @created 24-3-2014
 */

// Dependencies
var fs = require( 'fs' )
  , http = require( 'http' )
  , url = require( 'url' )
  , querystring = require( 'querystring' )
  , iconv = require( 'iconv-lite' )
  , BufferHelper = require( 'bufferhelper' );

var InterfacefManager = require( './interfacemanager' );

// Instance of InterfaceManager, will be intialized when the proxy.use() is called.
var interfaceManager;

var STATUS_MOCK = 'mock';
var ENCODING_RAW = 'raw';

// Current Proxy Status
var CurrentStatus;

// Proxy constructor
function Proxy( options ) {
    this._opt = options || {};
    this._urls = this._opt.urls || {};
    if ( options.status === STATUS_MOCK ) {
        return;
    }
    var currUrl = this._urls[ options.status || CurrentStatus ];
    // todo: need to warn user if the url is not configurated, and the mock url is enabled instead.

    var urlObj = url.parse( currUrl );
    this._opt.hostname = urlObj.hostname;
    this._opt.port = urlObj.port || 80;
    this._opt.path = urlObj.path;
    this._opt.method = (this._opt.method || 'GET').toUpperCase();
}

/**
 * use
 * @param {InterfaceManager} ifmgr
 * @throws errors
 */
Proxy.use = function( ifmgr ) {
    // console.log( ifmgr.constructor === InterfacefManager, 'kkk'  );
    if ( ifmgr instanceof InterfacefManager ) {
        interfaceManager = ifmgr;
    } else {
        throw new Error( 'Proxy can only use instance of InterfacefManager!' );
    }
    // this._interfaceManager = interfaceManager = new InterfacefManager( path );
    this._engineName = interfaceManager.getEngine();
    CurrentStatus = interfaceManager.getStatus();
    return this;
};

Proxy.getMockEngine = function() {
    if ( this._mockEngine ) {
        return this._mockEngine;
    }
    return this._mockEngine = require( this._engineName );
};

Proxy.getInterfaceIdsByPrefix = function( pattern ) {
    return interfaceManager.getInterfaceIdsByPrefix( pattern );
};

// @throws errors
Proxy.getRule = function( interfaceId ) {
    return interfaceManager.getRule( interfaceId );
};

// {Object} An object map to store created proxies. The key is interface id
// and the value is the proxy instance. 
Proxy.objects = {};

// Proxy factory
// @throws errors
Proxy.create = function( interfaceId ) {
    if ( !!this.objects[ interfaceId ] ) {
        return this.objects[ interfaceId ];
    }
    var opt = interfaceManager.getProfile( interfaceId );
    if ( !opt ) {
        throw new Error( 'Invalid interface id:' + interfaceId );
    }
    return this.objects[ interfaceId ] = new this( opt );
};

Proxy.prototype = {
    request: function( params, callback, errCallback ) {
        if ( typeof callback !== 'function' ) {
            console.error( 'No callback function for request = ', this._opt );
            return;
        }
        if ( (this._opt.status || CurrentStatus) === STATUS_MOCK ) {
            this._mockRequest( params, callback, errCallback );
            return;
        }
        var self = this;
        var options = {
            hostname: self._opt.hostname,
            port: self._opt.port,
            path: self._opt.path,
            method: self._opt.method
        };
        var querystring = self._queryStringify( params );
        if ( self._opt.method === 'POST' ) {
            options.headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': querystring.length
            }
        } else if ( self._opt.method === 'GET' ) {
            options.path += '?' + querystring;
        }
        var req = http.request( options, function( res ) {
            var bufferHelper = new BufferHelper();
            //res.setEncoding( 'utf8' );
            res.on( 'data', function( chunk ) {
                bufferHelper.concat( chunk );
            } );
            res.on( 'end', function() {
                var buffer = bufferHelper.toBuffer();
                callback( self._opt.encoding !== ENCODING_RAW
                    ? iconv.fromEncoding( buffer, self._opt.encoding ) 
                    : buffer );

            } );
        } );

        self._opt.method === 'POST' || req.write( querystring );
        req.on( 'error', function( e ) {
            typeof errCallback === 'function'
                ? errCallback( e )
                : console.error( e );
        } );

        req.setTimeout( self._opt.timeout, function() {
            var e = new Error( 'timeout' );
            typeof errCallback === 'function'
                ? errCallback( e )
                : console.error( e );
        } );

        req.end();
    },
    getOption: function( name ) {
        return this._opt[ name ];
    },
    _queryStringify: function( params ) {
        if ( !params || typeof params === 'string' ) {
            return params || '';
        } else if ( params instanceof Array ) {
            return params.join( '&' );
        }
        var qs = [], val;
        for ( var i in params ) {
            if ( i === '__signed__' || i === '__cookie__' ) {
                continue;
            }
            val = typeof params[i] === 'object' 
                ? JSON.stringify( params[ i ] )
                : params[ i ];
            qs.push( i + '=' + val );
        }
        // todo: need to handle the case of the request with cookie
        return qs.join( '&' );
    },
    _mockRequest: function( params, callback, errCallback ) {
        try {
            var engine = Proxy.getMockEngine();
            if ( !this._rule ) {
                this._rule = Proxy.getRule( this._opt.id );
            }
            callback( !this._opt.isRuleStatic
                    ? engine.mock( this._rule.response )
                    : this._rule.response );
        } catch ( e ) {
            if ( typeof errCallback === 'function' ) {
                errCallback( e );
            } else {
                console.log( e );
            }
        }
    }
};

var ProxyFactory = Proxy;

ProxyFactory.Interceptor = function( req, res ) {
    var interfaceId = req.url.split( /\?|\// )[1]
      , qs = req.url.replace( '/' + interfaceId + '?', '' )
      , params = querystring.parse( qs )
      , proxy;
    
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

    proxy.request( params, function( data ) {
        res.setHeader( "Content-Type", "application/json;charset=UTF-8" );
        res.end( typeof data  === 'string' ? data : JSON.stringify( data ) );
    }, function( err ) {
        res.statusCode = 500;
        console.log( err );
        res.end( err.toString() );
    } );
};

module.exports = ProxyFactory;

