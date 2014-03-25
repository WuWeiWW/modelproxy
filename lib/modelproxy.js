// Dependency
var ProxyFactory;

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
            profile = ProxyFactory.getInterfaceIdsByPrefix( profile.replace( /\*$/, '' ) );
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
            return function( params, cookies, signed ) {
                params = params || {};
                params.__cookies__  = cookies;
                params.__signed__ = signed; 
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
        // this._addMethod( method, profile[ method ] );
    }
}

ModelProxy.prototype = {
    done: function( f ) {
        if ( typeof f !== 'function' ) return;

        // No request pushed in _queue, so callback directly and return.
        if ( !this._queue ) {
            f.apply( this );
            return;
        }
        // Send requests parallel
        this._sendRequestsParallel( this._queue, f );

        // Clear queue
        this._queue = null;
        return this;
    },
    _sendRequestsParallel: function( queue, callback ) {
        // The final data array
        var args = [], self = this;

        // Count the number of callback;
        var cnt = queue.length;

        // send each request
        for ( var i = 0; i < queue.length; i++ ) {
            ( function( reqObj, k ) {
                reqObj.proxy.request( reqObj.params, function( data ) {
                    args[ k ] = data;
                    --cnt || callback.apply( self, args );
                }, function( err ) {
                    if ( typeof self._errCallback === 'function' ) {
                        self._errCallback( err );

                    } else {
                        console.error( 'Error occured when sending request ='
                            , reqObj.params, '\nCaused by:\n', err );
                    }
                } );
            } )( queue[i], i );
        }
    },
    error: function( f ) {
        this._errCallback = f;
    }
};

ModelProxy.use = function( proxyFactory ) {
    ProxyFactory = proxyFactory;
};

module.exports = ModelProxy;
