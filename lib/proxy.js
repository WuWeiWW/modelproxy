var Status = {
	MOCK: 'mockUrl',
	DAILY: 'dailyUrl',
	PREP: 'prepUrl',
	ONLINE: 'url',
	URL: 'url'
};

var CURR_STATUS = Status.DAILY;

var http = require( 'http' ),
	url = require( 'url' ),
	querystring = require( 'querystring' );

function Proxy( options ) {
	this._opt = options || {};

	var currUrl = this._opt[ CURR_STATUS ] || this._opt.mockUrl || '';
	// todo: need to warn user if the url is not configurated, and the mock url is enabled instead.

	var urlObj = url.parse( currUrl );

	this._opt.hostname = urlObj.hostname;
	this._opt.port = urlObj.port;
	this._opt.path = urlObj.path;
	this._opt.method = (this._opt.method || 'GET').toUpperCase();
}

Proxy.prototype = {
	_queryStringify: function( params, cookie, signed ) {
		if ( !params || typeof params === 'string' ) {
			return params || '';
		} else if ( params instanceof Array ) {
			return params.join( '&' );
		}
		var qs = [], val;
		for ( var i in params ) {
			val = typeof params[i] === 'object' 
				? JSON.stringify( params[ i ] )
				: params[ i ];
			qs.push( i + '=' + val );
		}

		return qs.join( '&' );
	},
	request: function( params, cookie, signed ) {
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
				typeof self._callback === 'function'
					? self._callback( data )
					: console.error( 'No callback function for request = ', self._opt );
			} );
		} );

		self._opt.method === 'POST' || req.write( querystring );
		req.on( 'error', function( e ) {
			typeof self._errCallback === 'function'
				? self._errCallback( e )
				: console.error( e );
		} );
		req.end();
	},
	done: function( callback ) {
		this._callback = callback;
	},
	error: function( errCallback ) {
		this._errCallback = errCallback;
	}
};

Proxy.Status = Status;

Proxy.setStatus = function( status ) {
	CURR_STATUS = {'url': true, 'dailyUrl': false, 'prepUrl', 'mockUrl': true}
				[ status ] ? status : Status.DAILY;
};

module.exports = Proxy;

