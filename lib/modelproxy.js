/** 
 * ModelProxy
 * As named, this class is provided to model the proxy.
 * @author ShanFan
 * @created 24-3-2014
 **/

// Dependencies
var ProxyFactory = require( './proxyfactory' );

var logger = console;

/**
 * ModelProxy Constructor
 * @param {Object|Array|String} profile. This profile describes what the model looks
 * like. eg:
 * profile = {
 *    getItems: 'Search.getItems',
 *    getCart: 'Cart.getCart'
 * }
 * profile = ['Search.getItems', 'Cart.getCart']
 * profile = 'Search.getItems'
 * profile = 'Search.*'
 */
function ModelProxy( profile ) {
    if ( !profile ) return;

    if ( typeof profile === 'string' ) {

        // Get ids via prefix pattern like 'packageName.*'
        if ( /^(\w+\.)+\*$/.test( profile ) ) {
            profile = ProxyFactory
                .getInterfaceIdsByPrefix( profile.replace( /\*$/, '' ) );

        } else {
            profile = [ profile ];
        }
    }
    if ( profile instanceof Array ) {
        var prof = {}, methodName;
        for ( var i = profile.length - 1; i >= 0; i-- ) {
            methodName = profile[ i ];
            methodName = methodName
                            .substring( methodName.lastIndexOf( '.' ) + 1 );
            if ( !prof[ methodName ] ) {
                prof[ methodName ] = profile[ i ];

            // The method name is duplicated, so the full interface id is set
            // as the method name.
            } else {
                methodName = profile[ i ].replace( /\./g, '_' );
                prof[ methodName ] = profile[ i ]; 
            }
        }
        profile = prof;
    }
    
    // Construct the model following the profile
    for ( var method in profile ) {
        this[ method ] = ( function( methodName, interfaceId ) {
            var proxy = ProxyFactory.create( interfaceId );
            return function( params ) {
                params = params || {};

                if ( !this._queue ) {
                    this._queue = [];
                }
                // Push this method call into request queue. Once the done method
                // is called, all requests in this queue will be sent.
                this._queue.push( {
                    params: params,
                    proxy: proxy
                } );
                return this;
            };
        } )( method, profile[ method ] );
    }
}

ModelProxy.prototype = {
    done: function( f, ef ) {
        if ( typeof f !== 'function' ) return;

        // No request pushed in _queue, so callback directly and return.
        if ( !this._queue ) {
            f.apply( this );
            return;
        }

        // Send requests parallel
        this._sendRequests( this._queue, f, ef );

        // Clear queue
        this._queue = null;
        return this;
    },
    withCookie: function( cookie ) {
        this._cookies = cookie;
        return this;
    },
    _sendRequests: function( queue, callback, errCallback ) {
        // The final data array
        var args = [], setcookies = [], self = this;

        // Count the number of callback;
        var cnt = queue.length;

        // Send each request
        for ( var i = 0; i < queue.length; i++ ) {
            ( function( reqObj, k, cookie ) {
                
                reqObj.proxy.request( reqObj.params, function( data, setcookie ) {
                    // fill data for callback
                    args[ k ] = data;

                    // concat setcookie for cookie rewriting
                    setcookies = setcookies.concat( setcookie );
                    args.push( setcookies );

                    try {
                        // push the set-cookies as the last parameter for the callback function.
                        --cnt || callback.apply( self, args.push( setcookies ) && args );
                    } catch ( e ) {
                        errCallback = errCallback || self._errCallback;
                        if ( typeof errCallback === 'function' ) {
                            errCallback( e );
                        } else {
                            logger.error( e );
                        }
                    }

                }, function( err ) {
                    errCallback = errCallback || self._errCallback;
                    if ( typeof errCallback === 'function' ) {
                        errCallback( err );
                        
                    } else {
                        logger.error( 'Error occured when sending request ='
                            , reqObj.params, '\nCaused by:\n', err );
                    }
                }, cookie ); // request with cookie.

            } )( queue[i], i, self._cookies );
        }
        // clear cookie of this request.
        self._cookies = undefined;
    },
    error: function( f ) {
        this._errCallback = f;
    },
    fail: function( f ) {
        this._errCallback = f;
    }
};

/**
 * ModelProxy.init
 * @param {String} path The path refers to the interface configuration file
 * @param {Object} variables The varibale object which is used to parse the 
 *      reference of variable in interface configuration file.
 */
ModelProxy.init = function( path, variables ) {
    // if ( typeof path === 'string' ) {
    //     ProxyFactory.use( new InterfaceManager( path, {} ) );
    // } else {
    //     var globalConf = path;
    //     try {
    //         path = globalConf.modelproxy.path;
    //     } catch ( e ) {
    //         throw new Error( 'ModelProxy can not be initialized because the path of interface is not configured' );
    //     }
    ProxyFactory.init( path, variables );
    // }
    // if (typeof callback === 'function' ) {
    //     callback( null, true );
    // }
};

ModelProxy.create = function( profile ) {
    return new this( profile );
};

ModelProxy.Interceptor = function( req, res ) {
    ProxyFactory.interceptRequest( req, res );
};

ModelProxy.setLogger = function( l ) {
    logger = l;
    ProxyFactory.setLogger( l );
};

module.exports = ModelProxy;
