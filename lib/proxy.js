var Status = {
    MOCK: 'ruleFile',
    DAILY: 'dailyUrl',
    PREP: 'prepUrl',
    ONLINE: 'online',
    URL: 'online',
    _curr_status: 'ruleFile'
};

// var CURR_STATUS = Status.DAILY;

// var interfaceFilePath = './interface.json';

// Dependencies
var fs = require( 'fs' ),
    http = require( 'http' ),
    url = require( 'url' ),
    querystring = require( 'querystring' );

var InterfacefManager = require( './interfacemanager' );

// Instance of InterfaceManager, will be intialized when the proxy.init() is called.
var interfaceManager;

// Proxy constructor
function Proxy( options ) {
    this._opt = options || {};
    this._urls = this._opt.urls || {};

    var currUrl = this._urls[ Status._curr_status ] 
            || this._urls[ Status.ONLINE ];
    // todo: need to warn user if the url is not configurated, and the mock url is enabled instead.
    var urlObj = url.parse( currUrl );
    this._opt.hostname = urlObj.hostname;
    this._opt.port = urlObj.port;
    this._opt.path = urlObj.path;
    this._opt.method = (this._opt.method || 'GET').toUpperCase();
    console.info( 'Proxy is created:', this._opt );
}

Proxy.STATUS_ONLINE = Status.ONLINE;
Proxy.STATUS_MOCK   = Status.MOCK;
Proxy.STATUS_DAILY  = Status.DAILY;
Proxy.STATUS_PREP   = Status.PREP;

Proxy.setStatus = function( status ) {
    this._curr_status = status;
};

// @throws errors
Proxy.init = function( path ) {
    this._interfaceManager = interfaceManager = new InterfacefManager( path );
    this._engineName = interfaceManager.getEngine();
};

Proxy.getMockEngine = function() {
    if ( this._mockEngine ) {
        return this._mockEngine;
    }
    return this._mockEngine = require( this._engineName );
};

// @throws errors
Proxy.getRule = function( interfaceId ) {
    return this._interfaceManager.getRule( interfaceId );
};

// {Object} An object map to store created proxy. The key is interface id
// and the value is the proxy instance. 
Proxy.objects = {};

Proxy.create = function( interfaceId ) {
    if ( !!this.objects[ interfaceId ] ) {
        return this.objects[ interfaceId ];
    }
    var opt = this._interfaceManager.getProfile( interfaceId );
    if ( !opt ) {
        throw new Error( 'Invalid interface id:' + interfaceId );
    }
    return this.objects[ interfaceId ] = new this( opt );
};

Proxy.prototype = {
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

        return qs.join( '&' );
    },
    request: function( params, callback, errCallback ) {
        if ( typeof callback !== 'function' ) {
            console.error( 'No callback function for request = ', options );
            return;
        }
        if ( Status._curr_status === Status.MOCK ) {
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
            var data = [];
            res.setEncoding( 'utf8' );
            res.on( 'data', function( chunk ) {
                data.push( chunk.toString( 'utf8' ) );
            } );
            res.on( 'end', function() {
                callback( data.join() );
            } );
        } );

        self._opt.method === 'POST' || req.write( querystring );
        req.on( 'error', function( e ) {
            typeof errCallback === 'function'
                ? errCallback( e )
                : console.error( e );
        } );
        req.end();
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

// test
Proxy.init( '../interface.json' );
var p = Proxy.create( 'Search.getItems' );
p.request( {q:'jackjones'}, function( data ) {
    console.log( data );
} );
module.exports = Proxy;

