/**
 * Proxy Base Class
 */

// Constant
var Constant = require( './constant' );

function Proxy( options ) {
    this._opt = options || {};
}

Proxy.prototype = {

    request: function( params, callback, errCallback, cookie ) {
        if ( this._opt.status === Constant.STATUS_MOCK 
                || this._opt.status === Constant.STATUS_MOCK_ERR ) {
            this.requestMock( params, callback, errCallback, cookie );
            return;
        }
        this.requestReal( params, callback, errCallback, cookie );
    },

    // should be overridden
    requestReal: function( params, callback, errCallback, cookie ) {
        callback( 'Hello ModelProxy!' );
    },

    requestMock: function( params, callback, errCallback, cookie ) {
        try {
            if ( this._opt.isRuleStatic ) {
                callback( this._opt.status === Constant.STATUS_MOCK
                    ? this._opt.rule.response
                    : this._opt.rule.responseError );
                return;
            }
            var engine = getMockEngine( this._opt.engine );
            var data = engine.mock( this._opt.rule
                , this._opt.status === Constant.STATUS_MOCK 
                    ? Constant.RESPONSE : Constant.RESPONSE_ERROR );
            callback( data );
        } catch ( e ) {
            var self = this;
            setTimeout( function() {
                errCallback( 'Mock error. Interface id = '
                    + self._opt.id + ', rule file path = '
                    + self._opt.ruleFile + ', Caused by: ' + e );
            }, 1 );
        }
    },
    getOption: function( name ) {
        return this._opt[ name ];
    },
    // should be overridden
    interceptRequest: function( req, res ) {
        res.end( 'Hello ModelProxy!' );
    }
};

function getMockEngine( name ) {
    var engine = require( name );
    return {
        mock: function( rule, responseType ) {
            if ( name === 'river-mock' ) {
                return engine.spec2mock( rule, responseType );

            } else if ( name === 'mockjs' ) {
                return engine.mock( rule[responseType] );
            }
        }
    }
}

module.exports = Proxy;